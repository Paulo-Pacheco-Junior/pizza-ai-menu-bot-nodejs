import { Server, Socket } from "socket.io";
import { Sender } from "@prisma/client";
import { saveMessage } from "@/services/messageService";
import { createChat, handleCustomResponse, OrderState } from "../services/chatService";

export function setupSocket(io: Server, geminiApiKey: string) {
  const chat = createChat(geminiApiKey);

  io.on("connection", (socket: Socket) => {
    console.log(`[Socket] Cliente conectado: ${socket.id}`);

    const orderState: OrderState = {
      hasPizza: false,
      hasBeverage: false,
      hasDessert: false,
    };

    socket.on("message", async (content: string) => {
      if (
        !content ||
        typeof content !== "string" ||
        content.trim().length === 0
      ) {
        return socket.emit("response", "Mensagem inválida.");
      }

      await saveMessage(content, Sender.user);

      let botResponse = "Desculpe, não entendi. Pode repetir?";

      try {
        const customResponse = await handleCustomResponse(content, orderState);

        if (customResponse) {
          botResponse = customResponse;
        } else {
          const sendMessage = await chat.sendMessage(content);
          botResponse = sendMessage.response.text();
        }
      } catch (error) {
        console.error("[Gemini] Erro ao gerar resposta:", error);
        botResponse =
          "Desculpe, houve um erro ao gerar a resposta. Tente novamente.";
      }

      await saveMessage(botResponse, Sender.bot);

      socket.emit("response", botResponse);
    });

    socket.on("disconnect", () => {
      console.log(`[Socket] Cliente desconectado: ${socket.id}`);
    });
  });
}
