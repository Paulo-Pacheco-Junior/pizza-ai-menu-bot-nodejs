import { Request, Response } from "express";
import { prisma } from "../prisma/client";

export async function checkStoreStatus(req: Request, res: Response) {
  try {
    // Horário de funcionamento: 18:30 às 23:59
    const now = new Date();
    // Ajustar para horário local se necessário (ex: America/Sao_Paulo)
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const currentTimeInMinutes = hours * 60 + minutes;

    const openingTime = 18 * 60 + 30; // 18:30
    const closingTime = 23 * 60 + 59; // 23:59

    const isOpen = currentTimeInMinutes >= openingTime && currentTimeInMinutes <= closingTime;

    return res.json({
      isOpen,
      currentHour: `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`,
      message: isOpen
        ? "A pizzaria está aberta! Faça seu pedido."
        : "Nosso forno acende às 18:30! Você pode consultar nosso cardápio agora e voltar para pedir à noite.",
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
