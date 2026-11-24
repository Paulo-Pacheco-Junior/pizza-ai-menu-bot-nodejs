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

export function setupSocket(io: Server, geminiApiKey: string) {
  io.on("connection", async (socket: Socket) => {
    const handshakeSessionId =
      (socket.handshake.auth?.sessionId as string) ||
      socket.id;

    // Hidrata o cliente com o histórico prévio da sessão caso exista
    if (handshakeSessionId) {
      const history = await getMessagesBySessionId(handshakeSessionId);
      if (history.length > 0) {
        socket.emit("history", history);
      }
    }

    socket.on("message", async (data: string | MessagePayload) => {
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

      if (
        !content ||
        typeof content !== "string" ||
        content.trim().length === 0
      ) {
        return socket.emit("response", "Mensagem inválida.");
      }

      // 1. IDEMPOTÊNCIA: Se já foi respondida recentemente, devolve a mesma resposta
      if (messageId && idempotencyService.isProcessed(messageId)) {
        console.log(`[Idempotência] Reenviando resposta cacheada para messageId: ${messageId}`);
        return socket.emit("response", idempotencyService.getResponse(messageId));
      }

      // 2. DEDUPLICAÇÃO DE VOO: Se já está sendo processada, ignora reenvio duplicado
      if (messageId && !idempotencyService.startProcessing(messageId)) {
        console.log(`[Idempotência] Mensagem ${messageId} já em voo. Ignorando duplicata.`);
        return;
      }

      const session = sessionManager.getOrCreateSession(currentSessionId, geminiApiKey);

      void saveMessage(content, Sender.user, currentSessionId).catch((error) => {
        console.error("[MessageService] Falha ao salvar mensagem:", error);
      });

      let botResponse = "Desculpe, não entendi. Pode repetir?";

      try {
        const customResponse = await withTimeout(
          handleCustomResponse(content, session.orderState),
          "Tempo limite ao consultar o cardápio"
        );

        if (customResponse) {
          botResponse = customResponse;
        } else {
          const sendMessage = await withTimeout(
            session.chat.sendMessage(content),
            "Tempo limite ao consultar o atendimento"
          );
          botResponse = sendMessage.response.text();
        }

        if (messageId) {
          idempotencyService.finishProcessing(messageId, botResponse);
        }
      } catch (error) {
        if (messageId) {
          idempotencyService.cancelProcessing(messageId);
        }
        console.error("[Gemini] Erro ao gerar resposta:", error);
        botResponse =
          "Desculpe, houve um erro ao gerar a resposta. Tente novamente.";
      }

      void saveMessage(botResponse, Sender.bot, currentSessionId).catch((error) => {
        console.error("[MessageService] Falha ao salvar resposta:", error);
      });

      socket.emit("response", botResponse);
    });
  });
}
