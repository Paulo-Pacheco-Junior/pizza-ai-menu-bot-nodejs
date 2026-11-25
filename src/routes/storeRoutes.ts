import { Router, Request, Response } from "express";
import { checkStoreStatus } from "../controllers/storeController";

const router = Router();

router.get("/store/status", (req: Request, res: Response) => {
  checkStoreStatus(req, res);
});

export default router;
