import { Server, Socket } from "socket.io";
import { Sender } from "@prisma/client";
import { getMessagesBySessionId, saveMessage } from "@/services/messageService";
import { handleCustomResponse } from "../services/chatService";
import { sessionManager } from "../services/sessionManager";
import { idempotencyService } from "../services/idempotencyService";

interface MessagePayload {
  messageId?: string;
  content: string;
  sessionId?: string;
}

const RESPONSE_TIMEOUT_MS = 20_000;

async function withTimeout<T>(
  operation: Promise<T>,
  timeoutMessage: string,
  timeoutMs = RESPONSE_TIMEOUT_MS
): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout>;

  const timeout = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(
      () => reject(new Error(timeoutMessage)),
      timeoutMs
    );
  });

  try {
    return await Promise.race([operation, timeout]);
  } finally {
    clearTimeout(timeoutId!);
  }
}

// Tipagem correta para Socket.IO ACK: callback(error, data)
type MessageAck = (error: Error | null, response?: string) => void;

export function setupSocket(io: Server, geminiApiKey: string) {
  io.on("connection", async (socket: Socket) => {
    const handshakeSessionId =
      (socket.handshake.auth?.sessionId as string) || socket.id;

    // Hidrata o cliente com o histórico prévio da sessão caso exista
    if (handshakeSessionId) {
      const history = await getMessagesBySessionId(handshakeSessionId);
      if (history.length > 0) {
        socket.emit("history", history);
      }
    }

    socket.on(
      "message",
      async (data: string | MessagePayload, ack?: MessageAck) => {
        const reply = (msg: string) => {
          if (typeof ack === "function") {
            // ACK nativo do Socket.IO: (error, data)
            ack(null, msg);
          } else {
            // Fallback para clientes legados sem ACK
            socket.emit("response", msg);
          }
        };

        const replyError = (err: Error) => {
          if (typeof ack === "function") {
            ack(err);
          } else {
            socket.emit("response", "Desculpe, houve um erro. Tente novamente.");
          }
        };

        let content = "";
        let currentSessionId = handshakeSessionId;
        let messageId: string | undefined;

        if (typeof data === "string") {
          content = data;
        } else if (data && typeof data === "object") {
          content = data.content;
          messageId = data.messageId;
          if (data.sessionId) {
            currentSessionId = data.sessionId;
          }
        }

        if (!content || typeof content !== "string" || content.trim().length === 0) {
          return reply("Mensagem inválida.");
        }

        // 1. IDEMPOTÊNCIA: Se já foi respondida recentemente, devolve a mesma resposta
        if (messageId && idempotencyService.isProcessed(messageId)) {
          return reply(idempotencyService.getResponse(messageId)!);
        }

        // 2. DEDUPLICAÇÃO EM VOO: Se já está sendo processada, ignora reenvio duplicado
        if (messageId && !idempotencyService.startProcessing(messageId)) {
          return;
        }

        const session = sessionManager.getOrCreateSession(currentSessionId, geminiApiKey);

        void saveMessage(content, Sender.user, currentSessionId).catch((error) => {
          console.error("[MessageService] Falha ao salvar mensagem:", error);
        });

        try {
          const customResponse = await withTimeout(
            handleCustomResponse(content, session.orderState),
            "O processamento do seu pedido demorou mais que o esperado. Por favor, tente novamente."
          );

          let botResponse: string;
          if (customResponse) {
            botResponse = customResponse;
          } else {
            const result = await withTimeout(
              session.chat.sendMessage(content),
              "O atendimento demorou para responder. Por favor, tente novamente."
            );
            botResponse = result.response.text();
          }

          if (messageId) {
            idempotencyService.finishProcessing(messageId, botResponse);
          }

          void saveMessage(botResponse, Sender.bot, currentSessionId).catch((error) => {
            console.error("[MessageService] Falha ao salvar resposta:", error);
          });

          reply(botResponse);
        } catch (error) {
          if (messageId) {
            idempotencyService.cancelProcessing(messageId);
          }
          console.error("[Gemini] Erro ao gerar resposta:", error);
          replyError(new Error("Falha ao gerar resposta do assistente."));
        }
      }
    );
  });
}
