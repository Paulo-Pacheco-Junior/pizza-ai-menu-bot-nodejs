import { GoogleGenerativeAI } from "@google/generative-ai";
import { prisma } from "../prisma/client";
import { pizzaAssistantPrompt } from "./pizzaAssistantPrompt";

export interface OrderState {
  hasPizza: boolean;
  hasBeverage: boolean;
  hasDessert: boolean;
}

export function createChat(apiKey: string) {
  const genAI = new GoogleGenerativeAI(apiKey);

  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    systemInstruction: pizzaAssistantPrompt,
  });

  return model.startChat({
    history: [],
    generationConfig: { maxOutputTokens: 1000 },
  });
}

export async function handleCustomResponse(
  content: string,
  state?: OrderState
): Promise<string | null> {
  const lower = content.toLowerCase();

  const pizzas = await prisma.menuItem.findMany({ where: { type: "pizza" } });
  const bebidas = await prisma.menuItem.findMany({ where: { type: "bebida" } });
  const sobremesas = await prisma.menuItem.findMany({
    where: { type: "sobremesa" },
  });

  const bebidaNames = bebidas.map((b) => b.name.toLowerCase());
  const sobremesaNames = sobremesas.map((s) => s.name.toLowerCase());

  const recusaRegex = /(não quero|nao quero|não|nao|sem|dispenso)/;

  const recusaBebida =
    bebidaNames.some((name) => lower.includes(name)) && recusaRegex.test(lower);

  const recusaSobremesa =
    sobremesaNames.some((name) => lower.includes(name)) &&
    recusaRegex.test(lower);

  const pizzaNames = pizzas.map((p) => p.name.toLowerCase());

  const mencionouPizza = pizzaNames.some((name) => lower.includes(name));
  const mencionouBebida = bebidaNames.some((name) => lower.includes(name));
  const mencionouSobremesa = sobremesaNames.some((name) =>
    lower.includes(name)
  );

  if (state) {
    if (mencionouPizza) state.hasPizza = true;
    if (mencionouBebida && !recusaBebida) state.hasBeverage = true;
    if (mencionouSobremesa && !recusaSobremesa) state.hasDessert = true;
  }

  const pizzaAccepted = state?.hasPizza ?? false;
  const beverageAccepted = state?.hasBeverage ?? false;
  const dessertAccepted = state?.hasDessert ?? false;

  if (recusaBebida) {
    const alternativas = bebidas
      .map((b) => b.name)
      .filter((n) => !lower.includes(n.toLowerCase()));

    if (alternativas.length > 0) {
      return `Sem problemas! Talvez prefira ${alternativas.join(", ")}. O que acha?`;
    }
  }

  if (recusaSobremesa) {
    const alternativas = sobremesas
      .map((s) => s.name)
      .filter((n) => !lower.includes(n.toLowerCase()));

    if (alternativas.length > 0) {
      return `Entendo! Quem sabe então ${alternativas.join(", ")}? É deliciosa!`;
    }
  }

  if (lower.includes("sabores") || lower.includes("cardápio")) {
    const lista = pizzas.map((p) => p.name).join(", ");
    return pizzaAccepted
      ? `Temos: ${lista}.`
      : `Temos: ${lista}. Posso te recomendar a Calabresa, que é uma das mais pedidas?`;
  }

  if (
    (lower.includes("não quero") || lower.includes("nao quero")) && !pizzaAccepted
  ) {
    return `Entendo! Mas que tal experimentar nossa Quatro Queijos especial? É cremosa, feita com queijos selecionados e está saindo quentinha do forno!`;
  }

  if (pizzaAccepted && !beverageAccepted) {  
    if (!mencionouBebida) {
      return `Deseja adicionar uma bebida gelada para acompanhar? Temos ${bebidas
        .map((b) => b.name)
        .join(", ")}.`;
    }
  }

  if (beverageAccepted && !dessertAccepted) {
    if (!mencionouSobremesa) {
      return `Para finalizar, posso te oferecer uma sobremesa? Temos ${sobremesas
        .map((s) => s.name)
        .join(", ")}. Nosso brownie com calda de chocolate é irresistível!`;
    }
  }

  if (!pizzaAccepted && mencionouPizza && !mencionouBebida) {
    return `Ótima escolha! Deseja adicionar uma bebida gelada para acompanhar? Temos ${bebidas
      .map((b) => b.name)
      .join(", ")}.`;
  }

  if (!dessertAccepted && mencionouBebida && !mencionouSobremesa) {
    return `Perfeito! Para finalizar, posso te oferecer uma sobremesa? Temos ${sobremesas
      .map((s) => s.name)
      .join(", ")}. Nosso brownie com calda de chocolate é irresistível!`;
  }

  if (mencionouSobremesa) {
    return "Excelente escolha! Já posso finalizar seu pedido?";
  }

  return null;
}
