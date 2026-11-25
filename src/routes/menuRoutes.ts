import { Router, Request, Response } from "express";
import { getMenu } from "../controllers/menuController";

const router = Router();

router.get("/menu", (req: Request, res: Response) => {
  getMenu(req, res);
});

export default router;
