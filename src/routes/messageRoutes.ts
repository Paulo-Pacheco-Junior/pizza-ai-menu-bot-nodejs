import { getMessages } from "@/controllers/messageController";
import { Router, Request, Response } from "express";

const router = Router();

router.get("/", (req: Request, res: Response) => {
  res.json({ message: "Olá, pizza bot está funcionando!" });
});

router.get("/messages", getMessages);

export default router;
