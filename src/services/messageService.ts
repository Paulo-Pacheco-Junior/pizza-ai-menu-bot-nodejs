import { prisma } from "../prisma/client";
import { Sender } from "@prisma/client";

export async function saveMessage(content: string, sender: Sender) {
  try {
    await prisma.message.create({
      data: { content, sender },
    });
  } catch (error) {
    console.error("[MessageService] Erro ao salvar mensagem:", error);
  }
}
