import { prisma } from "../prisma/client";
import { Sender } from "@prisma/client";

export async function saveMessage(
  content: string,
  sender: Sender,
  sessionId?: string
) {
  try {
    await prisma.message.create({
      data: { content, sender, sessionId },
    });
  } catch (error) {
    console.error("[MessageService] Erro ao salvar mensagem:", error);
  }
}

export async function getMessagesBySessionId(sessionId: string) {
  try {
    return await prisma.message.findMany({
      where: { sessionId },
      orderBy: { timestamp: "asc" },
      select: {
        id: true,
        content: true,
        sender: true,
        timestamp: true,
      },
    });
  } catch (error) {
    console.error("[MessageService] Erro ao buscar historico por sessionId:", error);
    return [];
  }
}
