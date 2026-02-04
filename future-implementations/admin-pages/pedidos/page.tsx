"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Eye } from "lucide-react";
import { Order, OrderStatus } from "@/types";
import { getAllOrders, searchOrders } from "@/lib/admin/orders";
import { OrderStatusBadge } from "@/components/admin/order-status-badge";
import { formatPrice } from "@/lib/utils";

const statusTabs: { value: OrderStatus | "todos"; label: string }[] = [
    { value: "todos", label: "Todos" },
    { value: "pendente", label: "Pendentes" },
    { value: "confirmado", label: "Confirmados" },
    { value: "enviado", label: "Enviados" },
    { value: "entregue", label: "Entregues" },
];

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
    const [activeTab, setActiveTab] = useState<OrderStatus | "todos">("todos");
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        const allOrders = getAllOrders();
        setOrders(allOrders);
        setFilteredOrders(allOrders);
    }, []);

    useEffect(() => {
        let result = orders;

        // Filter by status
        if (activeTab !== "todos") {
            result = result.filter((o) => o.status === activeTab);
        }

        // Filter by search
        if (searchTerm) {
            result = searchOrders(searchTerm).filter((o) =>
                activeTab === "todos" ? true : o.status === activeTab
            );
        }

        setFilteredOrders(result);
    }, [activeTab, searchTerm, orders]);

    const formatDate = (timestamp: number) => {
        return new Intl.DateTimeFormat("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        }).format(timestamp);
    };

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

            {/* Tabs */}
            <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
                {statusTabs.map((tab) => (
                    <button
                        key={tab.value}
                        onClick={() => setActiveTab(tab.value)}
                        className={`px-6 py-3 rounded-lg font-body font-semibold whitespace-nowrap transition-all ${activeTab === tab.value
                                ? "bg-primary text-white shadow-md"
                                : "bg-white text-neutral-700 hover:bg-neutral-100 border border-neutral-200"
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Search */}
            <div className="mb-6">
                <input
                    type="text"
                    placeholder="Buscar por ID ou nome do cliente..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full max-w-md px-4 py-3 border border-neutral-300 rounded-lg font-body focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                />
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
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
                                        <div className="flex items-center justify-end">
                                            <Link href={`/admin/pedidos/${order.id}`}>
                                                <button className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors">
                                                    <Eye className="w-5 h-5" />
                                                </button>
                                            </Link>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
