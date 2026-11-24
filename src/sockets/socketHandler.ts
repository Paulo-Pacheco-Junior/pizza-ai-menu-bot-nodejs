import { Server, Socket } from "socket.io";
import { Sender } from "@prisma/client";
import { saveMessage } from "@/services/messageService";
import { handleCustomResponse } from "../services/chatService";
import { sessionManager } from "../services/sessionManager";

interface MessagePayload {
  content: string;
  sessionId?: string;
}

export function setupSocket(io: Server, geminiApiKey: string) {
  io.on("connection", (socket: Socket) => {
    const handshakeSessionId =
      (socket.handshake.auth?.sessionId as string) ||
      socket.id;

    socket.on("message", async (data: string | MessagePayload) => {
      let content = "";
      let currentSessionId = handshakeSessionId;

      if (typeof data === "string") {
        content = data;
      } else if (data && typeof data === "object") {
        content = data.content;
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

      const session = sessionManager.getOrCreateSession(currentSessionId, geminiApiKey);

      await saveMessage(content, Sender.user, currentSessionId);

      let botResponse = "Desculpe, não entendi. Pode repetir?";

      try {
        const customResponse = await handleCustomResponse(content, session.orderState);

        if (customResponse) {
          botResponse = customResponse;
        } else {
          const sendMessage = await session.chat.sendMessage(content);
          botResponse = sendMessage.response.text();
        }
      } catch (error) {
        console.error("[Gemini] Erro ao gerar resposta:", error);
        botResponse =
          "Desculpe, houve um erro ao gerar a resposta. Tente novamente.";
      }

      await saveMessage(botResponse, Sender.bot, currentSessionId);

      socket.emit("response", botResponse);
    });
  });
}
