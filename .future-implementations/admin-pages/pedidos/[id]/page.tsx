"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Package, User, Phone, MapPin, Clock, FileText, MessageSquare } from "lucide-react";
import { Order, OrderStatus } from "@/types";
import { getOrderById } from "@/lib/admin/orders";
import { OrderStatusBadge } from "@/components/admin/order-status-badge";
import { formatPrice } from "@/lib/utils";
import { generateWhatsAppLink } from "@/lib/whatsapp";

const statusOptions: { value: OrderStatus; label: string }[] = [
    { value: "pendente", label: "Pendente" },
    { value: "confirmado", label: "Confirmado" },
    { value: "enviado", label: "Enviado" },
    { value: "entregue", label: "Entregue" },
    { value: "cancelado", label: "Cancelado" },
];

export default function OrderDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const [order, setOrder] = useState<Order | null>(null);
    const [selectedStatus, setSelectedStatus] = useState<OrderStatus>("pendente");
    const [notes, setNotes] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const foundOrder = getOrderById(params.id as string);
        if (foundOrder) {
            setOrder(foundOrder);
            setSelectedStatus(foundOrder.status);
            setNotes(foundOrder.notes || "");
        } else {
            alert("Pedido não encontrado");
            router.push("/admin/pedidos");
        }
    }, [params.id, router]);

    const handleUpdateStatus = async () => {
        if (!order) return;

        setLoading(true);
        try {
            const res = await fetch(`/api/admin/orders/${order.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: selectedStatus, notes }),
            });

            if (res.ok) {
                const updated = await res.json();
                setOrder(updated);
                alert("Status atualizado com sucesso!");
            } else {
                alert("Erro ao atualizar status");
            }
        } catch (error) {
            console.error("Erro ao atualizar status:", error);
            alert("Erro ao atualizar status");
        } finally {
            setLoading(false);
        }
    };

    const handleResendWhatsApp = () => {
        if (!order) return;
        const link = generateWhatsAppLink(order);
        window.open(link, "_blank");
    };

    const formatDate = (timestamp: number) => {
        return new Intl.DateTimeFormat("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        }).format(timestamp);
    };

    if (!order) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="text-neutral-600 font-body">Carregando pedido...</p>
            </div>
        );
    }

    return (
        <div>
            {/* Header */}
            <div className="mb-8">
                <h1 className="font-heading font-bold text-neutral-900 text-4xl uppercase tracking-tight">
                    Pedido #{order.orderId}
                </h1>
                <p className="text-neutral-600 font-body mt-1">
                    Criado em {formatDate(order.createdAt)}
                </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Left Column - Order Info */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Customer Info */}
                    <div className="bg-white rounded-xl border border-neutral-200 p-6">
                        <h2 className="font-heading font-bold text-neutral-900 text-xl uppercase tracking-tight mb-4 flex items-center gap-2">
                            <User className="w-5 h-5" />
                            Informações do Cliente
                        </h2>
                        <div className="space-y-3">
                            <div className="flex items-start gap-3">
                                <User className="w-5 h-5 text-neutral-500 mt-0.5" />
                                <div>
                                    <p className="text-sm text-neutral-500 font-body">Nome</p>
                                    <p className="font-body font-semibold text-neutral-900">
                                        {order.customerData.name}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <Phone className="w-5 h-5 text-neutral-500 mt-0.5" />
                                <div>
                                    <p className="text-sm text-neutral-500 font-body">Telefone</p>
                                    <p className="font-body font-semibold text-neutral-900">
                                        {order.customerData.phone}
                                    </p>
                                </div>
                            </div>
                            {order.customerData.address && (
                                <div className="flex items-start gap-3">
                                    <MapPin className="w-5 h-5 text-neutral-500 mt-0.5" />
                                    <div>
                                        <p className="text-sm text-neutral-500 font-body">Endereço</p>
                                        <p className="font-body font-semibold text-neutral-900">
                                            {order.customerData.address}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Order Items */}
                    <div className="bg-white rounded-xl border border-neutral-200 p-6">
                        <h2 className="font-heading font-bold text-neutral-900 text-xl uppercase tracking-tight mb-4 flex items-center gap-2">
                            <Package className="w-5 h-5" />
                            Itens do Pedido
                        </h2>
                        <div className="space-y-4">
                            {order.items.map((item, index) => (
                                <div
                                    key={index}
                                    className="flex items-center justify-between pb-4 border-b border-neutral-100 last:border-0 last:pb-0"
                                >
                                    <div>
                                        <p className="font-body font-semibold text-neutral-900">
                                            {item.productName}
                                        </p>
                                        <p className="text-sm text-neutral-500 font-body">
                                            Tamanho: {item.variantSize} • Qtd: {item.quantity}
                                        </p>
                                    </div>
                                    <p className="font-heading font-bold text-accent text-lg">
                                        {formatPrice(item.unitPrice * item.quantity)}
                                    </p>
                                </div>
                            ))}
                            <div className="flex items-center justify-between pt-4 border-t-2 border-neutral-200">
                                <p className="font-heading font-bold text-neutral-900 text-xl uppercase">
                                    Total
                                </p>
                                <p className="font-heading font-bold text-accent text-2xl">
                                    {formatPrice(order.total)}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column - Actions */}
                <div className="space-y-6">
                    {/* Status Update */}
                    <div className="bg-white rounded-xl border border-neutral-200 p-6">
                        <h2 className="font-heading font-bold text-neutral-900 text-xl uppercase tracking-tight mb-4">
                            Status do Pedido
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <p className="text-sm text-neutral-500 font-body mb-2">Status Atual</p>
                                <OrderStatusBadge status={order.status} />
                            </div>
                            <div>
                                <label className="block text-sm font-body font-medium text-neutral-700 mb-2">
                                    Atualizar Status
                                </label>
                                <select
                                    value={selectedStatus}
                                    onChange={(e) => setSelectedStatus(e.target.value as OrderStatus)}
                                    className="w-full px-4 py-3 border border-neutral-300 rounded-lg font-body focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                >
                                    {statusOptions.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-body font-medium text-neutral-700 mb-2">
                                    Notas Internas
                                </label>
                                <textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    rows={4}
                                    className="w-full px-4 py-3 border border-neutral-300 rounded-lg font-body focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                    placeholder="Adicione observações sobre o pedido..."
                                />
                            </div>
                            <button
                                onClick={handleUpdateStatus}
                                disabled={loading}
                                className="w-full bg-accent hover:bg-accent-dark disabled:bg-neutral-300 text-white px-6 py-3 rounded-lg font-body font-semibold transition-all hover:scale-105 hover:shadow-lg disabled:hover:scale-100 disabled:hover:shadow-none cursor-pointer disabled:cursor-not-allowed"
                            >
                                {loading ? "Salvando..." : "Salvar Alterações"}
                            </button>
                        </div>
                    </div>

                    {/* WhatsApp */}
                    <div className="bg-white rounded-xl border border-neutral-200 p-6">
                        <h2 className="font-heading font-bold text-neutral-900 text-xl uppercase tracking-tight mb-4">
                            Ações Rápidas
                        </h2>
                        <button
                            onClick={handleResendWhatsApp}
                            className="w-full bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-body font-semibold transition-all hover:scale-105 hover:shadow-lg cursor-pointer flex items-center justify-center gap-2"
                        >
                            <MessageSquare className="w-5 h-5" />
                            Reenviar WhatsApp
                        </button>
                    </div>

                    {/* Timeline */}
                    <div className="bg-white rounded-xl border border-neutral-200 p-6">
                        <h2 className="font-heading font-bold text-neutral-900 text-xl uppercase tracking-tight mb-4 flex items-center gap-2">
                            <Clock className="w-5 h-5" />
                            Timeline
                        </h2>
                        <div className="space-y-3">
                            <div className="flex items-start gap-3">
                                <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                                <div>
                                    <p className="text-sm font-body font-semibold text-neutral-900">
                                        Pedido Criado
                                    </p>
                                    <p className="text-xs text-neutral-500 font-body">
                                        {formatDate(order.createdAt)}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="w-2 h-2 bg-accent rounded-full mt-2"></div>
                                <div>
                                    <p className="text-sm font-body font-semibold text-neutral-900">
                                        Última Atualização
                                    </p>
                                    <p className="text-xs text-neutral-500 font-body">
                                        {formatDate(order.updatedAt)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
