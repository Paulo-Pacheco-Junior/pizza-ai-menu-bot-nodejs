import { Router, Request, Response } from "express";
import { prisma } from "../prisma/client";

const router = Router();

router.get("/", (req: Request, res: Response) => {
  res.json({ message: "Olá, pizza bot está funcionando!" });
});

router.get("/messages", async (_req: Request, res: Response) => {
  const messages = await prisma.message.findMany({
    orderBy: { timestamp: "asc" },
  });
  res.json(messages);
});

export default router;
