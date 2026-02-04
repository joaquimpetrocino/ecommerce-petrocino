import { OrderStatus } from "@/types";

const statusConfig: Record<
    OrderStatus,
    { label: string; color: string }
> = {
    pendente: { label: "Pendente", color: "bg-yellow-100 text-yellow-800 border-yellow-200" },
    confirmado: { label: "Confirmado", color: "bg-blue-100 text-blue-800 border-blue-200" },
    enviado: { label: "Enviado", color: "bg-cyan-100 text-cyan-800 border-cyan-200" },
    entregue: { label: "Entregue", color: "bg-green-100 text-green-800 border-green-200" },
    cancelado: { label: "Cancelado", color: "bg-red-100 text-red-800 border-red-200" },
};

interface OrderStatusBadgeProps {
    status: OrderStatus;
}

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
    const config = statusConfig[status];

    return (
        <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-body font-semibold border ${config.color}`}
        >
            {config.label}
        </span>
    );
}
