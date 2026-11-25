import { Router, Request, Response } from "express";
import { orderController } from "../controllers/orderController";

const router = Router();

router.get("/cart", (req: Request, res: Response) => {
  orderController.getCart(req, res);
});
router.post("/cart/items", (req: Request, res: Response) => {
  orderController.addItem(req, res);
});
router.delete("/cart/items", (req: Request, res: Response) => {
  orderController.removeItem(req, res);
});
router.put("/cart/items/:orderItemId", (req: Request, res: Response) => {
  orderController.updateItemQuantity(req, res);
});
router.put("/cart/delivery", (req: Request, res: Response) => {
  orderController.updateDelivery(req, res);
});
router.post("/cart/finalize", (req: Request, res: Response) => {
  orderController.finalize(req, res);
});

export default router;
