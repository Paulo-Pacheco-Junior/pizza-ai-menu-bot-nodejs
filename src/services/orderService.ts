import { prisma } from "../prisma/client";

export class OrderService {
  /**
   * Obtém ou cria um pedido PENDING ativo para a sessionId
   */
  async getOrCreateCart(sessionId: string) {
    let order = await prisma.order.findFirst({
      where: {
        sessionId,
        status: "PENDING",
      },
      include: {
        items: {
          include: {
            menuItem: true,
          },
        },
      },
    });

    if (!order) {
      order = await prisma.order.create({
        data: {
          sessionId,
          status: "PENDING",
          subtotal: 0,
          deliveryFee: 0,
          total: 0,
        },
        include: {
          items: {
            include: {
              menuItem: true,
            },
          },
        },
      });
    }

    return order;
  }

  async addItemToCart(
    sessionId: string,
    menuItemId: number,
    quantity: number = 1,
    size?: string,
    flavorHalf1?: string,
    flavorHalf2?: string,
    notes?: string
  ) {
    const order = await this.getOrCreateCart(sessionId);
    const menuItem = await prisma.menuItem.findUnique({
      where: { id: menuItemId },
    });

    if (!menuItem) {
      throw new Error("Item do cardápio não encontrado.");
    }
    if (!Number.isFinite(menuItem.price) || menuItem.price <= 0) {
      throw new Error("O item não pode ser adicionado porque ainda não tem preço cadastrado.");
    }

    // Calcular preço (ex: tamanho Grande +20%, Broto -20%, Família +20%, ou preço base)
    let multiplier = 1.0;
    if (size) {
      const s = size.toLowerCase();
      if (s.includes("broto")) multiplier = 0.8;
      if (s.includes("grande")) multiplier = 1.2;
      if (s.includes("família") || s.includes("familia")) multiplier = 1.4;
    }

    const unitPrice = Number((menuItem.price * multiplier).toFixed(2));
    const totalPrice = Number((unitPrice * quantity).toFixed(2));

    await prisma.orderItem.create({
      data: {
        orderId: order.id,
        menuItemId,
        quantity,
        size,
        flavorHalf1,
        flavorHalf2,
        notes,
        unitPrice,
        totalPrice,
      },
    });

    return this.recalculateOrderTotals(order.id);
  }

  async removeItemFromCart(sessionId: string, orderItemId: string) {
    const order = await this.getOrCreateCart(sessionId);
    await prisma.orderItem.deleteMany({
      where: {
        id: orderItemId,
        orderId: order.id,
      },
    });

    return this.recalculateOrderTotals(order.id);
  }

  async recalculateOrderTotals(orderId: string) {
    const items = await prisma.orderItem.findMany({
      where: { orderId },
    });

    const subtotal = items.reduce((acc, item) => acc + item.totalPrice, 0);
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    const deliveryFee = order?.deliveryFee ?? 0;
    const total = subtotal + deliveryFee;

    return prisma.order.update({
      where: { id: orderId },
      data: {
        subtotal: Number(subtotal.toFixed(2)),
        total: Number(total.toFixed(2)),
      },
      include: {
        items: {
          include: {
            menuItem: true,
          },
        },
      },
    });
  }

  async updateDeliveryDetails(
    sessionId: string,
    data: {
      customerName?: string;
      customerPhone?: string;
      address?: string;
      deliveryFee?: number;
      paymentMethod?: string;
      changeFor?: number;
    }
  ) {
    const order = await this.getOrCreateCart(sessionId);

    const updateData: any = {};
    if (data.customerName !== undefined) updateData.customerName = data.customerName;
    if (data.customerPhone !== undefined) updateData.customerPhone = data.customerPhone;
    if (data.address !== undefined) updateData.address = data.address;
    if (data.paymentMethod !== undefined) updateData.paymentMethod = data.paymentMethod;
    if (data.changeFor !== undefined) updateData.changeFor = data.changeFor;

    if (data.deliveryFee !== undefined) {
      updateData.deliveryFee = data.deliveryFee;
      updateData.total = order.subtotal + data.deliveryFee;
    }

    return prisma.order.update({
      where: { id: order.id },
      data: updateData,
      include: {
        items: {
          include: {
            menuItem: true,
          },
        },
      },
    });
  }

  async finalizeOrder(sessionId: string) {
    const order = await this.getOrCreateCart(sessionId);
    if (order.items.length === 0) {
      throw new Error("O carrinho está vazio.");
    }

    return prisma.order.update({
      where: { id: order.id },
      data: { status: "CONFIRMED" },
      include: {
        items: {
          include: {
            menuItem: true,
          },
        },
      },
    });
  }
}

export const orderService = new OrderService();
