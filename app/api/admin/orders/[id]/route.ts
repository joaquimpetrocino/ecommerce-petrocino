import { NextRequest, NextResponse } from "next/server";
import { getOrderById, updateOrderStatus, deleteOrder } from "@/lib/admin/orders";
import { OrderStatus } from "@/types";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const order = await getOrderById(id);
        if (!order) {
            return NextResponse.json(
                { error: "Order not found" },
                { status: 404 }
            );
        }
        return NextResponse.json(order);
    } catch (error) {
        console.error("Error fetching order:", error);
        return NextResponse.json(
            { error: "Failed to fetch order" },
            { status: 500 }
        );
    }
}

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await req.json();
        const { status, notes } = body;

        const updatedOrder = await updateOrderStatus(id, status as OrderStatus, notes);

        if (!updatedOrder) {
            return NextResponse.json(
                { error: "Order not found or update failed" },
                { status: 404 }
            );
        }

        return NextResponse.json(updatedOrder);
    } catch (error) {
        console.error("Error updating order:", error);
        return NextResponse.json(
            { error: "Failed to update order" },
            { status: 500 }
        );
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const success = await deleteOrder(id);
        if (!success) {
            return NextResponse.json(
                { error: "Order not found or delete failed" },
                { status: 404 }
            );
        }
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting order:", error);
        return NextResponse.json(
            { error: "Failed to delete order" },
            { status: 500 }
        );
    }
}
