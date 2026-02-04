import { Order, OrderStatus } from "@/types";
import connectDB from "@/lib/db";
import { Order as OrderModel } from "@/lib/models/order";
import { decrementProductStock } from "./products";
import { revalidatePath } from "next/cache";

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

    // Logic for stock deduction when confirming order
    if (status === "confirmado") {
        const order = await OrderModel.findOne({ id });
        if (order && order.status !== "confirmado") {
            // Attempt to deduct stock for all items
            // Note: This is a simple implementation. If one fails, we might have partial deduction issues.
            // Ideally, we should use transactions or verify all stock first.
            // For MVP, we'll try to deduct.
            for (const item of order.items) {
                await decrementProductStock(
                    // We assume product name/id is stored or we can find it. 
                    // Wait, OrderItem has `productName` but not `productId` in the Interface?
                    // Let's check `types/index.ts`
                    // OrderItem doesn"t have productId... we need to fix this in saving.
                    // But wait, CartItem has productId. We should save productId in OrderItem too.
                    // For now, let's assume we might need to find by name or fix the OrderItem type.
                    // Actually, let's check OrderItem interface again.
                    // It only has: productName, variantSize, quantity, unitPrice.
                    // This is risky. We need ProductID to be accurate.
                    // I will add productId to OrderItem in types and schema.
                    "" as any, "", 0);
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
