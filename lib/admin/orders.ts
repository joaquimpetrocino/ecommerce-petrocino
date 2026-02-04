import { Order, OrderStatus } from "@/types";
import connectDB from "@/lib/db";
import { Order as OrderModel } from "@/lib/models/order";
import { decrementProductStock, incrementProductStock } from "./products";
import { revalidatePath, revalidateTag } from "next/cache";

export async function getAllOrders(): Promise<Order[]> {
    await connectDB();
    const orders = await OrderModel.find().sort({ createdAt: -1 }).lean();
    return orders.map((o: any) => ({ ...o, id: o.id || o._id.toString() })) as unknown as Order[];
}

export async function getOrderById(id: string): Promise<Order | undefined> {
    await connectDB();
    // Try to find by our internal ID or MongoDB _id
    let order = await OrderModel.findOne({ id }).lean();

    if (!order && id.length === 24) { // Likely a MongoDB ObjectId
        const { isValidObjectId } = require("mongoose");
        if (isValidObjectId(id)) {
            order = await OrderModel.findById(id).lean();
        }
    }

    if (!order) return undefined;
    return { ...order, id: order.id || (order as any)._id.toString() } as unknown as Order;
}

export async function createOrder(orderData: Order): Promise<Order> {
    await connectDB();
    const newOrder = await OrderModel.create(orderData);
    revalidatePath("/admin/pedidos");
    return newOrder.toObject() as unknown as Order;
}

export async function updateOrderStatus(id: string, status: OrderStatus, notes?: string): Promise<Order | null> {
    await connectDB();

    const order = await OrderModel.findOne({ id });
    if (!order) return null;

    const currentStatus = order.status;

    // Logic for stock deduction when confirming order
    // Deduct if moving from Pending/Canceled -> Confirmed
    if (status === "confirmado" && (currentStatus === "pendente" || currentStatus === "cancelado")) {
        for (const item of order.items) {
            if (item.productId) {
                await decrementProductStock(item.productId, item.variantSize, item.quantity, item.color);
            } else {
                console.warn(`Item sem productId no pedido ${id}: ${item.productName}`);
            }
        }
    }

    // Logic for stock reversion
    // Revert if moving from Confirmed/Shipped/Delivered -> Pending/Canceled
    const wasDeducted = ["confirmado", "enviado", "entregue"].includes(currentStatus);
    const isNowPendingOrCanceled = ["pendente", "cancelado"].includes(status);

    if (wasDeducted && isNowPendingOrCanceled) {
        for (const item of order.items) {
            if (item.productId) {
                await incrementProductStock(item.productId, item.variantSize, item.quantity, item.color);
            }
        }
    }

    const updates: any = { status, updatedAt: Date.now() };
    if (notes !== undefined) updates.notes = notes;

    const updatedOrder = await OrderModel.findOneAndUpdate(
        { id },
        updates,
        { new: true }
    ).lean();

    revalidatePath("/admin/pedidos");
    revalidatePath("/admin/produtos"); // Invalidate products cache as stock changed
    revalidateTag("products"); // Invalidate cache tag for products
    revalidateTag("dashboard-stats"); // Invalidate dashboard stats
    return updatedOrder as unknown as Order;
}

export async function deleteOrder(id: string): Promise<boolean> {
    await connectDB();
    const result = await OrderModel.deleteOne({ id });
    revalidatePath("/admin/pedidos");
    return result.deletedCount > 0;
}

export async function searchOrders(query: string): Promise<Order[]> {
    await connectDB();
    const searchRegex = new RegExp(query, "i");
    const orders = await OrderModel.find({
        $or: [
            { orderId: searchRegex },
            { "customerData.name": searchRegex },
            { "customerData.phone": searchRegex }
        ]
    }).sort({ createdAt: -1 }).lean();

    return orders.map((o: any) => ({ ...o, id: o.id || o._id.toString() })) as unknown as Order[];
}
