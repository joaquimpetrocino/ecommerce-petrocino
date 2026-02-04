"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Package, User, Phone, MapPin, Clock, FileText, MessageSquare, ArrowLeft, CreditCard } from "lucide-react";
import { toast } from "sonner";
import { Order, OrderStatus } from "@/types";
import { OrderStatusBadge } from "@/components/admin/order-status-badge";
import { formatPrice } from "@/lib/utils";
import { generateWhatsAppLink } from "@/lib/whatsapp";

const statusOptions: { value: OrderStatus; label: string }[] = [
    { value: "pendente", label: "Pendente" },
    { value: "confirmado", label: "Confirmado (Baixar Estoque)" },
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
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const res = await fetch(`/api/admin/orders/${params.id}`);
                if (res.ok) {
                    const data = await res.json();
                    setOrder(data);
                    setSelectedStatus(data.status);
                    setNotes(data.notes || "");
                } else {
                    toast.error("Pedido não encontrado");
                    router.push("/admin/pedidos");
                }
            } catch (error) {
                console.error("Erro ao buscar pedido:", error);
                toast.error("Erro ao buscar pedido");
                router.push("/admin/pedidos");
            } finally {
                setLoading(false);
            }
        };

        if (params.id) {
            fetchOrder();
        }
    }, [params.id, router]);

    const handleUpdateStatus = async () => {
        if (!order) return;

        setSaving(true);
        try {
            const res = await fetch(`/api/admin/orders/${order.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: selectedStatus, notes }),
            });

            if (res.ok) {
                const updated = await res.json();
                setOrder(updated);
                toast.success("Status atualizado com sucesso!");
                if (selectedStatus === 'confirmado') {
                    toast.info("Atenção", { description: "Se este pedido ainda não estava confirmado, o estoque dos produtos foi atualizado." });
                }
            } else {
                toast.error("Erro ao atualizar status");
            }
        } catch (error) {
            console.error("Erro ao atualizar status:", error);
            toast.error("Erro ao atualizar status");
        } finally {
            setSaving(false);
        }
    };

    const handleResendWhatsApp = () => {
        if (!order) return;

        // We need to fetch the current template to ensure we use the latest one
        // Alternatively, generateWhatsAppLink handles it client side if we pass the current config?
        // Wait, generateWhatsAppLink needs a template if we want to use the stored one.
        // For simplicity in Admin, we can either fetch config OR (better) just let it use default if we can't easily fetch config here without another API call.
        // Ideally, we should fetch config.
        // Let's rely on default for now or try to fetch config if important.
        // Actually, the previous implementation in checkout/route.ts fetched config server side.
        // Client side, we don't have the config unless we fetch it.
        // Let's assume default template is fine for "Resend" or we implement a fetch.
        // Considering the user emphasized "customizable template", I should probably fetch the template.

        fetch('/api/admin/store-config')
            .then(res => res.json())
            .then(config => {
                const link = generateWhatsAppLink(
                    order.customerData.phone,
                    {
                        orderId: order.orderId,
                        items: order.items,
                        total: order.total,
                        customerData: order.customerData
                    },
                    config.whatsappTemplate
                );
                window.open(link, "_blank");
            })
            .catch(err => {
                console.error("Error fetching config for whatsapp", err);
                const link = generateWhatsAppLink(
                    order.customerData.phone,
                    {
                        orderId: order.orderId,
                        items: order.items,
                        total: order.total,
                        customerData: order.customerData
                    }
                );
                window.open(link, "_blank");
            });
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
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="text-neutral-600 font-body">Carregando pedido...</p>
            </div>
        );
    }

    if (!order) return null;

    return (
        <div>
            {/* Header */}
            <div className="mb-8">
                <button
                    onClick={() => router.back()}
                    className="mb-4 flex items-center gap-2 text-neutral-600 hover:text-primary font-body font-medium transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                    Voltar para Pedidos
                </button>
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

                            {/* Payment Info */}
                            <div className="flex items-start gap-3 pt-3 border-t border-neutral-100 mt-3">
                                <CreditCard className="w-5 h-5 text-neutral-500 mt-0.5" />
                                <div>
                                    <p className="text-sm text-neutral-500 font-body">Pagamento</p>
                                    <p className="font-body font-semibold text-neutral-900 capitalize">
                                        {order.customerData.paymentMethod === 'pix' ? 'PIX' :
                                            order.customerData.paymentMethod === 'debit' ? 'Débito' :
                                                order.customerData.paymentMethod === 'credit' ? 'Crédito' :
                                                    order.customerData.paymentMethod || 'Não informado'}

                                        {order.customerData.installments && order.customerData.paymentMethod === 'credit' && (
                                            <span className="ml-1 text-neutral-500 font-normal">
                                                ({order.customerData.installments}x)
                                            </span>
                                        )}
                                    </p>
                                </div>
                            </div>
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
                                        <div className="text-sm text-neutral-500 font-body">
                                            <span>Tamanho: {item.variantSize} • Qtd: {item.quantity}</span>
                                            {item.customName && (
                                                <span className="block text-xs mt-0.5 text-primary">
                                                    Personalização: {item.customName} {item.customNumber ? `(#${item.customNumber})` : ''}
                                                </span>
                                            )}
                                        </div>
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
                                disabled={saving}
                                className="w-full bg-accent hover:bg-accent-dark disabled:bg-neutral-300 text-white px-6 py-3 rounded-lg font-body font-semibold transition-all hover:scale-105 hover:shadow-lg disabled:hover:scale-100 disabled:hover:shadow-none cursor-pointer disabled:cursor-not-allowed"
                            >
                                {saving ? "Salvando..." : "Salvar Alterações"}
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
                        <p className="text-xs text-neutral-500 mt-3 text-center">
                            Abre o WhatsApp com os dados do pedido preenchidos.
                        </p>
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
