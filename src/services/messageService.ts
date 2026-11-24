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
