"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Eye, Trash } from "lucide-react";
import { toast } from "sonner";
import { Order, OrderStatus } from "@/types";
import { OrderStatusBadge } from "@/components/admin/order-status-badge";
import { formatPrice } from "@/lib/utils";

const statusTabs: { value: OrderStatus | "todos"; label: string }[] = [
    { value: "todos", label: "Todos" },
    { value: "pendente", label: "Pendentes" },
    { value: "confirmado", label: "Confirmados" },
    { value: "enviado", label: "Enviados" },
    { value: "entregue", label: "Entregues" },
    { value: "cancelado", label: "Cancelados" },
];

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
    const [activeTab, setActiveTab] = useState<OrderStatus | "todos">("todos");
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/admin/orders");
            if (res.ok) {
                const data = await res.json();
                setOrders(data);
                setFilteredOrders(data);
            }
        } catch (error) {
            console.error("Erro ao buscar pedidos:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    useEffect(() => {
        let result = orders;

        // Filter by status
        if (activeTab !== "todos") {
            result = result.filter((o) => o.status === activeTab);
        }

        // Filter by search
        if (searchTerm) {
            const lowerQuery = searchTerm.toLowerCase();
            result = result.filter((o) =>
                o.orderId.toLowerCase().includes(lowerQuery) ||
                o.customerData.name.toLowerCase().includes(lowerQuery) ||
                o.customerData.phone.toLowerCase().includes(lowerQuery)
            );
        }

        setFilteredOrders(result);
    }, [activeTab, searchTerm, orders]);

    const handleDelete = async (e: React.MouseEvent, id: string) => {
        e.preventDefault();
        if (!confirm("Tem certeza que deseja excluir este pedido?")) return;

        try {
            const res = await fetch(`/api/admin/orders/${id}`, {
                method: "DELETE",
            });
            if (res.ok) {
                fetchOrders(); // Reload list
            } else {
                toast.error("Erro ao excluir pedido");
            }
        } catch (error) {
            console.error("Erro ao excluir:", error);
            toast.error("Erro ao excluir pedido");
        }
    };

    const formatDate = (timestamp: any) => {
        if (!timestamp) return "N/A";
        try {
            const date = new Date(timestamp);
            if (isNaN(date.getTime())) return "N/A";

            return new Intl.DateTimeFormat("pt-BR", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            }).format(date);
        } catch (e) {
            return "N/A";
        }
    };

    if (loading) {
        return <div className="p-8 text-center text-neutral-500">Carregando pedidos...</div>;
    }

    return (
        <div>
            {/* Header */}
            <div className="mb-8">
                <h1 className="font-heading font-bold text-neutral-900 text-4xl uppercase tracking-tight">
                    Pedidos
                </h1>
                <p className="text-neutral-600 font-body mt-1">
                    {orders.length} {orders.length === 1 ? "pedido" : "pedidos"} no total
                </p>
            </div>

            {/* Barra de Filtros */}
            <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-sm flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1">
                    <input
                        type="text"
                        placeholder="Buscar por ID, Nome ou Telefone..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-4 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm font-body focus:border-primary outline-none transition-all"
                    />
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                    <select
                        value={activeTab}
                        onChange={(e) => setActiveTab(e.target.value as any)}
                        className="w-full sm:w-auto min-w-[200px] px-4 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm font-body focus:border-primary outline-none transition-all"
                    >
                        {statusTabs.map(tab => (
                            <option key={tab.value} value={tab.value}>
                                Status: {tab.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-neutral-50 border-b border-neutral-200">
                            <tr>
                                <th className="text-left px-6 py-4 font-heading font-bold text-neutral-900 uppercase tracking-wide text-sm">
                                    ID Pedido
                                </th>
                                <th className="text-left px-6 py-4 font-heading font-bold text-neutral-900 uppercase tracking-wide text-sm">
                                    Cliente
                                </th>
                                <th className="text-left px-6 py-4 font-heading font-bold text-neutral-900 uppercase tracking-wide text-sm">
                                    Total
                                </th>
                                <th className="text-left px-6 py-4 font-heading font-bold text-neutral-900 uppercase tracking-wide text-sm">
                                    Status
                                </th>
                                <th className="text-left px-6 py-4 font-heading font-bold text-neutral-900 uppercase tracking-wide text-sm">
                                    Data
                                </th>
                                <th className="text-right px-6 py-4 font-heading font-bold text-neutral-900 uppercase tracking-wide text-sm">
                                    Ações
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredOrders.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-neutral-500 font-body">
                                        Nenhum pedido encontrado
                                    </td>
                                </tr>
                            ) : (
                                filteredOrders.map((order) => (
                                    <tr
                                        key={order.id}
                                        className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors"
                                    >
                                        <td className="px-6 py-4">
                                            <p className="font-heading font-bold text-primary">{order.orderId}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="font-body font-semibold text-neutral-900">
                                                {order.customerData.name}
                                            </p>
                                            <p className="text-sm text-neutral-500 font-body">
                                                {order.customerData.phone}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="font-heading font-bold text-accent text-lg">
                                                {formatPrice(order.total)}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <OrderStatusBadge status={order.status} />
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm text-neutral-600 font-body">
                                                {formatDate(order.createdAt)}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link href={`/admin/pedidos/${order.id}`}>
                                                    <button className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors" title="Ver Detalhes">
                                                        <Eye className="w-5 h-5" />
                                                    </button>
                                                </Link>
                                                <button
                                                    onClick={(e) => handleDelete(e, order.id)}
                                                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Excluir"
                                                >
                                                    <Trash className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
