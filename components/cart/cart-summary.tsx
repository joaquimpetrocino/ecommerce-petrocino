"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/lib/utils";
import { OrderItem, CustomerData } from "@/types";
import { MessageCircle } from "lucide-react";
import { clearCart } from "@/lib/cart";
import { toast } from "sonner";

interface CartSummaryProps {
    items: OrderItem[];
    total: number;
}

export function CartSummary({ items, total }: CartSummaryProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [cepLoading, setCepLoading] = useState(false);
    const [customerData, setCustomerData] = useState<CustomerData & { cep?: string; number?: string; complement?: string }>({
        name: "",
        phone: "",
        address: "",
        cep: "",
        number: "",
        complement: "",
        paymentMethod: "",
        installments: "1",
    });

    const formatPhone = (value: string) => {
        const numbers = value.replace(/\D/g, "");
        if (numbers.length <= 11) {
            return numbers
                .replace(/^(\d{2})(\d)/g, "($1) $2")
                .replace(/(\d{5})(\d)/, "$1-$2")
                .substring(0, 15);
        }
        return value.substring(0, 15);
    };

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const formatted = formatPhone(e.target.value);
        setCustomerData({ ...customerData, phone: formatted });
    };

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/[^a-zA-Z\sÀ-ÿ]/g, "");
        setCustomerData({ ...customerData, name: value });
    };

    const handleCEPChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const cep = e.target.value.replace(/\D/g, "").substring(0, 8);
        setCustomerData({ ...customerData, cep });

        if (cep.length === 8) {
            setCepLoading(true);
            try {
                const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
                const data = await res.json();
                if (!data.erro) {
                    setCustomerData(prev => ({
                        ...prev,
                        cep,
                        address: `${data.logradouro}, ${data.bairro}, ${data.localidade} - ${data.uf}`
                    }));
                }
            } catch (error) {
                console.error("Erro ao buscar CEP:", error);
            } finally {
                setCepLoading(false);
            }
        }
    };

    const handleCheckout = async () => {
        if (!customerData.name || !customerData.phone) {
            toast.error("Por favor, preencha nome e telefone.");
            return;
        }

        setLoading(true);

        // Preparar endereço completo
        const fullAddress = customerData.cep
            ? `${customerData.address}, Nº ${customerData.number || 'S/N'}${customerData.complement ? ` - ${customerData.complement}` : ''} (CEP: ${customerData.cep})`
            : customerData.address;

        try {
            const response = await fetch("/api/checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    items,
                    total,
                    customerData: {
                        ...customerData,
                        address: fullAddress
                    },
                }),
            });

            const data = await response.json();

            if (data.success) {
                // Limpar carrinho local
                clearCart();
                window.dispatchEvent(new Event("cart-updated"));

                toast.success("Pedido gerado com sucesso!");

                // Redirecionar para WhatsApp em nova aba
                window.open(data.whatsappLink, '_blank');

                // Redirecionar usuário para página de sucesso ou home após um delay para não travar a abertura da aba
                setTimeout(() => {
                    router.push("/");
                }, 1000);
            } else {
                toast.error("Erro ao processar pedido. Tente novamente.");
            }
        } catch (error) {
            console.error("Erro no checkout:", error);
            toast.error("Erro ao processar pedido. Tente novamente.");
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
                    <div key={index} className="flex flex-col text-sm font-body border-b border-neutral-100 last:border-0 pb-2 last:pb-0">
                        <div className="flex justify-between">
                            <span className="text-neutral-600">
                                {item.quantity}x {item.productName} ({item.variantSize})
                            </span>
                            <span className="font-semibold text-neutral-900">
                                {formatPrice(item.quantity * (item.unitPrice - (item.customizationPrice || 0)))}
                            </span>
                        </div>
                        {item.customizationPrice && item.customizationPrice > 0 && (
                            <div className="flex justify-between text-xs text-neutral-500 pl-4 mt-1">
                                <span>+ Personalização</span>
                                <span>{formatPrice(item.quantity * item.customizationPrice)}</span>
                            </div>
                        )}
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
                        placeholder="Somente letras"
                        className="w-full px-4 py-3 border border-neutral-300 rounded-lg font-body focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                        value={customerData.name}
                        onChange={handleNameChange}
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
                        onChange={handlePhoneChange}
                        required
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-body font-medium text-neutral-700 mb-2">
                            CEP
                        </label>
                        <input
                            type="text"
                            placeholder="00000-000"
                            className="w-full px-4 py-3 border border-neutral-300 rounded-lg font-body focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all"
                            value={customerData.cep}
                            onChange={handleCEPChange}
                            maxLength={9}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-body font-medium text-neutral-700 mb-2">
                            Número
                        </label>
                        <input
                            type="text"
                            placeholder="123"
                            className="w-full px-4 py-3 border border-neutral-300 rounded-lg font-body focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all"
                            value={customerData.number}
                            onChange={(e) => setCustomerData({ ...customerData, number: e.target.value })}
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-body font-medium text-neutral-700 mb-2">
                        Endereço
                    </label>
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Rua, bairro, cidade (preenchido via CEP)"
                            readOnly={!!customerData.cep && customerData.cep.length === 8}
                            className={`w-full px-4 py-3 border border-neutral-300 rounded-lg font-body outline-none transition-all ${cepLoading ? 'opacity-50 cursor-wait' : ''}`}
                            value={customerData.address}
                            onChange={(e) => setCustomerData({ ...customerData, address: e.target.value })}
                        />
                        {cepLoading && (
                            <div className="absolute right-3 top-3.5">
                                <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
                            </div>
                        )}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-body font-medium text-neutral-700 mb-2">
                        Complemento
                    </label>
                    <input
                        type="text"
                        placeholder="Apt, Bloco, etc"
                        className="w-full px-4 py-3 border border-neutral-300 rounded-lg font-body focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all"
                        value={customerData.complement}
                        onChange={(e) => setCustomerData({ ...customerData, complement: e.target.value })}
                    />
                </div>

                {/* Pagamento */}
                <div className="space-y-4 pt-2">
                    <label className="block text-sm font-body font-bold text-neutral-900 uppercase tracking-wide">
                        Forma de Pagamento
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                        {[
                            { id: "pix", label: "PIX" },
                            { id: "debit", label: "Débito" },
                            { id: "credit", label: "Crédito" }
                        ].map(method => (
                            <button
                                key={method.id}
                                type="button"
                                onClick={() => setCustomerData({ ...customerData, paymentMethod: method.id })}
                                className={`px-4 py-3 rounded-lg border font-heading font-bold text-xs uppercase transition-all
                                    ${customerData.paymentMethod === method.id
                                        ? "bg-primary border-primary text-white shadow-md scale-[1.02]"
                                        : "bg-white border-neutral-200 text-neutral-500 hover:border-neutral-300"}`}
                            >
                                {method.label}
                            </button>
                        ))}
                    </div>

                    {customerData.paymentMethod === "credit" && (
                        <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                            <label className="block text-xs font-body font-bold text-neutral-500 mb-2 uppercase">
                                Parcelas (Cartão de Crédito)
                            </label>
                            <select
                                value={customerData.installments}
                                onChange={(e) => setCustomerData({ ...customerData, installments: e.target.value })}
                                className="w-full px-4 py-3 border border-neutral-300 rounded-lg font-body focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                            >
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(n => (
                                    <option key={n} value={n}>
                                        {n === 1 ? "À vista" : `${n}x sem juros`}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>
            </div>

            {/* Checkout Button */}
            {(() => {
                const isNameValid = customerData.name.trim().length >= 3;
                const isPhoneValid = customerData.phone.replace(/\D/g, "").length >= 10;
                const isCepValid = (customerData.cep || "").replace(/\D/g, "").length === 8;
                const isAddressValid = (customerData.address || "").trim().length > 5;
                const isPaymentValid = !!customerData.paymentMethod;
                const isFormValid = isNameValid && isPhoneValid && isCepValid && isAddressValid && isPaymentValid;

                return (
                    <button
                        onClick={handleCheckout}
                        disabled={loading || items.length === 0 || !isFormValid}
                        className={`w-full text-white px-8 py-4 rounded-lg font-heading font-bold text-lg uppercase tracking-wide transition-all flex items-center justify-center gap-2
                            ${loading || items.length === 0 || !isFormValid
                                ? 'bg-neutral-300 cursor-not-allowed'
                                : 'bg-primary hover:bg-primary-dark hover:scale-105 hover:shadow-xl cursor-pointer'
                            }`}
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
                );
            })()}


            <p className="text-xs text-center text-neutral-500 font-body">
                Você será redirecionado para o WhatsApp para confirmar o pedido
            </p>
        </div >
    );
}
