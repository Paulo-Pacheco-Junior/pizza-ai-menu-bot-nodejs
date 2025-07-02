import { Request, Response } from "express";
import { prisma } from "../prisma/client";

export async function getMessages(_req: Request, res: Response) {
  const messages = await prisma.message.findMany({
    orderBy: { timestamp: "asc" },
  });
  res.json(messages);
}
