import { Order, OrderStatus } from "@/types";
import { orders as initialOrders } from "@/data/orders";

// Armazenamento em memória (em produção, usar MongoDB)
let ordersStore: Order[] = [...initialOrders];

export function getAllOrders(): Order[] {
    return ordersStore.sort((a, b) => b.createdAt - a.createdAt);
}

export function getOrderById(id: string): Order | undefined {
    return ordersStore.find((o) => o.id === id);
}

export function updateOrderStatus(id: string, status: OrderStatus, notes?: string): Order | null {
    const order = ordersStore.find((o) => o.id === id);
    if (!order) return null;

    order.status = status;
    order.updatedAt = Date.now();
    if (notes !== undefined) order.notes = notes;

    return order;
}

export function getOrdersByStatus(status: OrderStatus): Order[] {
    return ordersStore.filter((o) => o.status === status);
}

export function searchOrders(query: string): Order[] {
    const lowerQuery = query.toLowerCase();
    return ordersStore.filter(
        (o) =>
            o.orderId.toLowerCase().includes(lowerQuery) ||
            o.customerData.name.toLowerCase().includes(lowerQuery)
    );
}
