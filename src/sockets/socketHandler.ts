import { Server, Socket } from "socket.io";
import { Sender } from "@prisma/client";
import { prisma } from "../prisma/client";

export function setupSocket(io: Server) {
  io.on("connection", (socket: Socket) => {
    console.log(`Cliente conectado: ${socket.id}`);

    socket.on("message", async (content: string) => {
      await prisma.message.create({
        data: { content, sender: Sender.user },
      });

      const response = "testando a implementação do websocket...";

      await prisma.message.create({
        data: { content: response, sender: Sender.bot },
      });

      socket.emit("response", response);
    });

    socket.on("disconnect", () => {
      console.log(`Cliente desconectado: ${socket.id}`);
    });
  });
}
