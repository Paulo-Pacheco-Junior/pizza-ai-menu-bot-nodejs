import { Request, Response } from "express";
import { orderService } from "../services/orderService";

function getSessionId(req: Request): string | undefined {
  const sessionId = req.get("X-Session-Id");
  return sessionId?.trim() || undefined;
}

export class OrderController {
  async getCart(req: Request, res: Response) {
    const sessionId = getSessionId(req);
    if (!sessionId) {
      return res.status(400).json({ error: "sessionId é obrigatório." });
    }

    try {
      const cart = await orderService.getOrCreateCart(sessionId);
      return res.json(cart);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  async addItem(req: Request, res: Response) {
    try {
      const sessionId = getSessionId(req);
      if (!sessionId) {
        return res.status(400).json({ error: "sessionId é obrigatório." });
      }

      const { menuItemId, quantity, size, flavorHalf1, flavorHalf2, notes } = req.body;
      
      const updatedOrder = await orderService.addItemToCart(
        sessionId,
        Number(menuItemId),
        quantity ? Number(quantity) : 1,
        size,
        flavorHalf1,
        flavorHalf2,
        notes
      );
      return res.json(updatedOrder);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  async removeItem(req: Request, res: Response) {
    try {
      const sessionId = getSessionId(req);
      if (!sessionId) {
        return res.status(400).json({ error: "sessionId é obrigatório." });
      }

      const { orderItemId } = req.body;
      const updatedOrder = await orderService.removeItemFromCart(sessionId, orderItemId);
      return res.json(updatedOrder);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  async updateDelivery(req: Request, res: Response) {
    try {
      const sessionId = getSessionId(req);
      if (!sessionId) {
        return res.status(400).json({ error: "sessionId é obrigatório." });
      }

      const { customerName, customerPhone, address, deliveryFee, paymentMethod, changeFor } = req.body;
      const updatedOrder = await orderService.updateDeliveryDetails(sessionId, {
        customerName,
        customerPhone,
        address,
        deliveryFee: deliveryFee !== undefined ? Number(deliveryFee) : undefined,
        paymentMethod,
        changeFor: changeFor !== undefined ? Number(changeFor) : undefined,
      });
      return res.json(updatedOrder);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  async finalize(req: Request, res: Response) {
    try {
      const sessionId = getSessionId(req);
      if (!sessionId) {
        return res.status(400).json({ error: "sessionId é obrigatório." });
      }

      const finalizedOrder = await orderService.finalizeOrder(sessionId);
      return res.json({ message: "Pedido finalizado com sucesso!", order: finalizedOrder });
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }
}

export const orderController = new OrderController();
