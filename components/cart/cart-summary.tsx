"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/lib/utils";
import { OrderItem, CustomerData } from "@/types";
import { MessageCircle } from "lucide-react";

interface CartSummaryProps {
    items: OrderItem[];
    total: number;
}

export function CartSummary({ items, total }: CartSummaryProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [customerData, setCustomerData] = useState<CustomerData>({
        name: "",
        phone: "",
        address: "",
    });

    const handleCheckout = async () => {
        if (!customerData.name || !customerData.phone) {
            alert("Por favor, preencha nome e telefone.");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch("/api/checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    items,
                    total,
                    customerData,
                }),
            });

            const data = await response.json();

            if (data.success) {
                // Redirecionar para WhatsApp
                window.location.href = data.whatsappLink;
            } else {
                alert("Erro ao processar pedido. Tente novamente.");
            }
        } catch (error) {
            console.error("Erro no checkout:", error);
            alert("Erro ao processar pedido. Tente novamente.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-xl border border-neutral-200 shadow-lg p-6 space-y-6 sticky top-24">
            <h2 className="font-heading font-bold text-2xl text-neutral-900 uppercase tracking-tight">
                Resumo do Pedido
            </h2>

            {/* Items */}
            <div className="space-y-3 border-t border-neutral-200 pt-4">
                {items.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm font-body">
                        <span className="text-neutral-600">
                            {item.quantity}x {item.productName} ({item.variantSize})
                        </span>
                        <span className="font-semibold text-neutral-900">
                            {formatPrice(item.quantity * item.unitPrice)}
                        </span>
                    </div>
                ))}
            </div>

            {/* Total */}
            <div className="border-t border-neutral-200 pt-4">
                <div className="flex justify-between items-center">
                    <span className="font-heading font-bold text-xl text-neutral-900 uppercase">
                        Total
                    </span>
                    <span className="font-heading font-bold text-3xl text-accent">
                        {formatPrice(total)}
                    </span>
                </div>
            </div>

            {/* Form */}
            <div className="space-y-4 border-t border-neutral-200 pt-6">
                <h3 className="font-heading font-bold text-neutral-900 uppercase tracking-wide text-sm">
                    Dados para Contato
                </h3>

                <div>
                    <label className="block text-sm font-body font-medium text-neutral-700 mb-2">
                        Nome completo *
                    </label>
                    <input
                        type="text"
                        placeholder="Seu nome completo"
                        className="w-full px-4 py-3 border border-neutral-300 rounded-lg font-body focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                        value={customerData.name}
                        onChange={(e) =>
                            setCustomerData({ ...customerData, name: e.target.value })
                        }
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-body font-medium text-neutral-700 mb-2">
                        WhatsApp *
                    </label>
                    <input
                        type="tel"
                        placeholder="(11) 99999-9999"
                        className="w-full px-4 py-3 border border-neutral-300 rounded-lg font-body focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                        value={customerData.phone}
                        onChange={(e) =>
                            setCustomerData({ ...customerData, phone: e.target.value })
                        }
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-body font-medium text-neutral-700 mb-2">
                        Endereço (opcional)
                    </label>
                    <input
                        type="text"
                        placeholder="Rua, número, bairro, cidade"
                        className="w-full px-4 py-3 border border-neutral-300 rounded-lg font-body focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all"
                        value={customerData.address}
                        onChange={(e) =>
                            setCustomerData({ ...customerData, address: e.target.value })
                        }
                    />
                </div>
            </div>

            {/* Checkout Button */}
            <button
                onClick={handleCheckout}
                disabled={loading || items.length === 0}
                className="w-full bg-accent hover:bg-accent-dark disabled:bg-neutral-300 text-white px-8 py-4 rounded-lg font-heading font-bold text-lg uppercase tracking-wide transition-all hover:scale-105 hover:shadow-xl disabled:hover:scale-100 disabled:hover:shadow-none cursor-pointer disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
                {loading ? (
                    "Processando..."
                ) : (
                    <>
                        <MessageCircle className="w-6 h-6" />
                        Finalizar via WhatsApp
                    </>
                )}
            </button>

            <p className="text-xs text-center text-neutral-500 font-body">
                Você será redirecionado para o WhatsApp para confirmar o pedido
            </p>
        </div>
    );
}
