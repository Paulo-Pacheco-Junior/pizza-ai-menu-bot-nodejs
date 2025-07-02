import { GoogleGenerativeAI } from "@google/generative-ai";
import { prisma } from "../prisma/client";

export function createChat(apiKey: string) {
  const genAI = new GoogleGenerativeAI(apiKey);

  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    systemInstruction: `
    Você é um atendente de pizzaria simpático, eficiente e focado em vendas. Siga estas regras:

    1. Você só pode oferecer itens do cardápio: pizzas, bebidas e sobremesas. Nunca mencione lanches, hambúrgueres, promoções, brindes ou cupons.
    2. Sempre incentive o cliente a escolher uma pizza. Se ele estiver indeciso ou recusar, tente uma sugestão persuasiva, mas sem forçar. Após uma recusa clara, respeite.
    3. Se o cliente não pedir bebida, ofereça pelo menos uma opção.
    4. Se o cliente pedir bebida, ofereça uma sobremesa.
    5. Só finalize o pedido se o cliente tiver aceitado pelo menos uma pizza ou bebida.
    6. Seja gentil, direto e objetivo. Use frases curtas e agradáveis, como um atendente real.

   Jamais saia do contexto de venda. Nunca diga que não sabe o que responder. Nunca mencione que é uma IA.
  `.trim(),
  });

  return model.startChat({
    history: [],
    generationConfig: { maxOutputTokens: 1000 },
  });
}

export async function handleCustomResponse(
  content: string
): Promise<string | null> {
  const lower = content.toLowerCase();

  const pizzas = await prisma.menuItem.findMany({ where: { type: "pizza" } });
  const bebidas = await prisma.menuItem.findMany({ where: { type: "bebida" } });
  const sobremesas = await prisma.menuItem.findMany({
    where: { type: "sobremesa" },
  });

  const pizzaNames = pizzas.map((p) => p.name.toLowerCase());
  const bebidaNames = bebidas.map((b) => b.name.toLowerCase());
  const sobremesaNames = sobremesas.map((s) => s.name.toLowerCase());

  const mencionouPizza = pizzaNames.some((name) => lower.includes(name));
  const mencionouBebida = bebidaNames.some((name) => lower.includes(name));
  const mencionouSobremesa = sobremesaNames.some((name) =>
    lower.includes(name)
  );

  if (lower.includes("sabores") || lower.includes("cardápio")) {
    return `Temos: ${pizzas
      .map((p) => p.name)
      .join(
        ", "
      )}. Posso te recomendar a Calabresa, que é uma das mais pedidas?`;
  }

  if (
    lower.includes("não quero") ||
    lower.includes("talvez") ||
    lower.includes("não sei")
  ) {
    return `Entendo! Mas que tal experimentar nossa Quatro Queijos especial? É cremosa, feita com queijos selecionados e está saindo quentinha do forno!`;
  }

  if (mencionouPizza && !mencionouBebida) {
    return `Ótima escolha! Deseja adicionar uma bebida gelada para acompanhar? Temos ${bebidas
      .map((b) => b.name)
      .join(", ")}.`;
  }

  if (mencionouBebida && !mencionouSobremesa) {
    return `Perfeito! Para finalizar, posso te oferecer uma sobremesa? Temos ${sobremesas
      .map((s) => s.name)
      .join(", ")}. Nosso brownie com calda de chocolate é irresistível!`;
  }

  if (mencionouSobremesa) {
    return "Excelente escolha! Já posso finalizar seu pedido?";
  }

  return null;
}
