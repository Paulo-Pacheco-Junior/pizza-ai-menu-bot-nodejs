import { Request, Response } from "express";
import { prisma } from "../prisma/client";

export async function getMenu(_req: Request, res: Response) {
  try {
    const menuItems = await prisma.menuItem.findMany({
      orderBy: [{ type: "asc" }, { name: "asc" }],
    });

    return res.json(menuItems);
  } catch (error: any) {
    console.error("[MenuController] Erro ao buscar cardápio:", error);
    return res.status(500).json({ error: "Não foi possível carregar o cardápio." });
  }
}
