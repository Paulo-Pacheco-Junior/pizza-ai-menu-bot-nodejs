import { GoogleGenerativeAI } from "@google/generative-ai";
import { prisma } from "../prisma/client";

export function createChat(apiKey: string) {
  const genAI = new GoogleGenerativeAI(apiKey);

  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    systemInstruction: "Você é um atendente de pizzaria simpático e eficiente.",
  });

  return model.startChat({
    history: [],
    generationConfig: { maxOutputTokens: 1000 },
  });
}

export async function handleCustomResponse(
  content: string
): Promise<string | null> {
  const lowerCaseResponse = content.toLowerCase();

  if (lowerCaseResponse.includes("sabores")) {
    const pizzas = await prisma.menuItem.findMany({ where: { type: "pizza" } });
    return `Temos: ${pizzas
      .map((p) => p.name)
      .join(", ")}. Posso te recomendar a Calabresa?`;
  }

  if (lowerCaseResponse.includes("calabresa")) {
    return "Ótima escolha! Deseja adicionar uma bebida gelada para acompanhar? Temos refrigerantes e sucos.";
  }

  if (lowerCaseResponse.includes("coca")) {
    return "Perfeito! Para finalizar, posso te oferecer uma sobremesa? Nosso brownie com calda de chocolate é irresistível!";
  }

  return null;
}
