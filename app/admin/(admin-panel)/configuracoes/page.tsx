"use client";

import { useState, useEffect } from "react";
import { Save, Store, Mail, Package } from "lucide-react";
import { UploadDropzone } from "@/lib/uploadthing";
import { toast } from "sonner";
import { StoreConfig, HeroConfig, DEFAULT_WHATSAPP_TEMPLATE, DEFAULT_RECOVERY_TEMPLATE } from "@/types";

export default function SettingsPage() {
    const [config, setConfig] = useState<StoreConfig | null>(null);
    const [loading, setLoading] = useState(true);
    const [saved, setSaved] = useState(false);

    // Carregar configurações ao montar
    useEffect(() => {
        fetch("/api/admin/store-config")
            .then(res => res.json())
            .then((data: StoreConfig) => {
                setConfig(data);
                setLoading(false);
            })
            .catch(err => console.error(err));
    }, []);

    const handleSave = async () => {
        if (saved || !config) return;

        const res = await fetch("/api/admin/store-config", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(config) // Send flat config
        });

        if (res.ok) {
            setSaved(true);
            window.dispatchEvent(new Event("configChanged"));
            setTimeout(() => setSaved(false), 3000);
        }
    };

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

    const updateConfig = (field: keyof StoreConfig, value: any) => {
        if (!config) return;
        let finalValue = value;
        if (field === "storePhone" || field === "whatsappNumber") {
            finalValue = formatPhone(value as string);
        }
        setConfig({ ...config, [field]: finalValue });
    };

    const updateHeroConfig = (field: keyof HeroConfig, value: string) => {
        if (!config) return;
        setConfig({
            ...config,
            hero: { ...config.hero, [field]: value }
        });
    };

    if (loading || !config) return <div>Carregando...</div>;

    return (
        <div className="space-y-6 pb-20">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h1 className="font-heading font-bold text-neutral-900 text-4xl uppercase tracking-tight">
                    Configurações
                </h1>
                <button
                    onClick={handleSave}
                    className="w-full sm:w-auto bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-lg font-heading font-bold uppercase flex items-center justify-center gap-2 transition-colors"
                >
                    <Save className="w-5 h-5" />
                    Salvar Alterações
                </button>
            </div>

            {saved && (
                <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg font-body">
                    ✓ Configurações salvas com sucesso!
                </div>
            )}

            {/* Informações da Loja */}
            <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-neutral-200 flex items-center gap-3">
                    <Store className="w-5 h-5 text-primary" />
                    <h2 className="font-heading font-bold text-neutral-900 text-xl uppercase tracking-tight">
                        Informações da Loja
                    </h2>
                </div>
                <div className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-body font-medium text-neutral-700 mb-2">
                            Nome da Loja
                        </label>
                        <input
                            type="text"
                            value={config.storeName || ""}
                            onChange={(e) => updateConfig("storeName", e.target.value)}
                            className="w-full px-4 py-3 border border-neutral-300 rounded-lg font-body focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                            placeholder="Ex: Minha Loja Virtual"
                        />
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <div>
                            <label className="block text-sm font-body font-medium text-neutral-700 mb-2">
                                Email
                            </label>
                            <input
                                type="email"
                                value={config.storeEmail || ""}
                                onChange={(e) => updateConfig("storeEmail", e.target.value)}
                                className="w-full px-4 py-3 border border-neutral-300 rounded-lg font-body focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-body font-medium text-neutral-700 mb-2">
                                Telefone
                            </label>
                            <input
                                type="tel"
                                value={config.storePhone || ""}
                                onChange={(e) => updateConfig("storePhone", e.target.value)}
                                className="w-full px-4 py-3 border border-neutral-300 rounded-lg font-body focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                                placeholder="(11) 99999-9999"
                            />
                        </div>
                    </div>

                    {/* Address Fields with CEP */}
                    <div className="space-y-4 pt-2 border-t border-neutral-100/50">
                        <label className="block text-sm font-body font-medium text-primary mb-2 uppercase tracking-tight text-xs font-bold">
                            Endereço da Loja
                        </label>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div>
                                <label className="block text-xs font-body font-medium text-neutral-500 mb-1">CEP</label>
                                <input
                                    type="text"
                                    value={config.storeCEP || ""}
                                    onChange={(e) => {
                                        const cep = e.target.value.replace(/\D/g, "").substring(0, 8);
                                        updateConfig("storeCEP", cep);

                                        if (cep.length === 8) {
                                            fetch(`https://viacep.com.br/ws/${cep}/json/`)
                                                .then(res => res.json())
                                                .then(data => {
                                                    if (!data.erro) {
                                                        const address = `${data.logradouro}, ${data.bairro}, ${data.localidade} - ${data.uf}`;
                                                        updateConfig("storeAddress", address);
                                                    }
                                                })
                                                .catch(console.error);
                                        }
                                    }}
                                    className="w-full px-4 py-3 border border-neutral-300 rounded-lg font-body focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                                    placeholder="00000-000"
                                    maxLength={9}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-body font-medium text-neutral-500 mb-1">Número</label>
                                <input
                                    type="text"
                                    value={config.storeNumber || ""}
                                    onChange={(e) => updateConfig("storeNumber", e.target.value)}
                                    className="w-full px-4 py-3 border border-neutral-300 rounded-lg font-body focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                                    placeholder="123"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-body font-medium text-neutral-500 mb-1">Endereço (Preenchido via CEP)</label>
                            <input
                                type="text"
                                value={config.storeAddress || ""}
                                onChange={(e) => updateConfig("storeAddress", e.target.value)}
                                className="w-full px-4 py-3 border border-neutral-300 rounded-lg font-body focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none bg-neutral-50"
                                readOnly
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-body font-medium text-neutral-500 mb-1">Complemento</label>
                            <input
                                type="text"
                                value={config.storeComplement || ""}
                                onChange={(e) => updateConfig("storeComplement", e.target.value)}
                                className="w-full px-4 py-3 border border-neutral-300 rounded-lg font-body focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                                placeholder="Sala 1, Bloco B (Opcional)"
                            />
                        </div>
                    </div>
                </div>
            </div>


            {/* Logo da Loja */}
            <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-neutral-200 flex items-center gap-3">
                    <Store className="w-5 h-5 text-primary" />
                    <h2 className="font-heading font-bold text-neutral-900 text-xl uppercase tracking-tight">
                        Logo da Loja
                    </h2>
                </div>
                <div className="p-6 space-y-4">
                    {config.logoUrl ? (
                        <div className="border border-neutral-200 rounded-lg p-6 bg-neutral-50 flex flex-col items-center gap-4">
                            <p className="text-sm font-body font-medium text-neutral-700">Logo Atual</p>
                            <img
                                src={config.logoUrl}
                                alt="Logo Preview"
                                className="max-h-24 object-contain border border-neutral-200 rounded-lg p-2 bg-white"
                            />
                            <button
                                onClick={() => updateConfig("logoUrl", "")}
                                className="text-white bg-red-600 px-4 py-2 rounded-lg text-sm font-bold uppercase hover:bg-red-700 transition-colors"
                            >
                                Remover Logo
                            </button>
                        </div>
                    ) : (
                        <div>
                            <label className="block text-sm font-body font-medium text-neutral-700 mb-2">
                                Upload da Logo
                            </label>
                            <UploadDropzone
                                endpoint="imageUploader"
                                onClientUploadComplete={(res) => {
                                    if (res && res[0]) {
                                        updateConfig("logoUrl", res[0].url);
                                    }
                                }}
                                onUploadError={(error: Error) => {
                                    toast.error(`Erro no upload: ${error.message}`);
                                }}
                                appearance={{
                                    button: "bg-primary text-white font-bold font-heading uppercase p-2 text-sm",
                                    container: "p-4 border-2 border-dashed border-neutral-200 rounded-lg bg-neutral-50 h-32"
                                }}
                            />
                            <p className="text-xs text-neutral-500 mt-2 text-center">Recomendado: 200x50px, PNG transparente.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Configuração da Home (Hero & Banners) */}
            <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-neutral-200 flex items-center gap-3">
                    <Package className="w-5 h-5 text-accent" />
                    <h2 className="font-heading font-bold text-neutral-900 text-xl uppercase tracking-tight">
                        Banners & Home
                    </h2>
                </div>
                <div className="p-6 space-y-6">
                    {/* Textos do Hero */}
                    <div className="grid gap-4 md:grid-cols-3">
                        <div>
                            <label className="block text-sm font-body font-medium text-neutral-700 mb-2">Título Principal</label>
                            <input
                                type="text"
                                value={config.hero.title}
                                onChange={(e) => updateHeroConfig("title", e.target.value)}
                                className="w-full px-4 py-2 border border-neutral-300 rounded-lg font-body focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-body font-medium text-neutral-700 mb-2">Subtítulo</label>
                            <input
                                type="text"
                                value={config.hero.subtitle}
                                onChange={(e) => updateHeroConfig("subtitle", e.target.value)}
                                className="w-full px-4 py-2 border border-neutral-300 rounded-lg font-body focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-body font-medium text-neutral-700 mb-2">Badge (Etiqueta)</label>
                            <input
                                type="text"
                                value={config.hero.badge}
                                onChange={(e) => updateHeroConfig("badge", e.target.value)}
                                className="w-full px-4 py-2 border border-neutral-300 rounded-lg font-body focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                            />
                        </div>
                    </div>

                    {/* Banner Principal */}
                    <div className="grid gap-4 md:grid-cols-2">
                        <div>
                            <label className="block text-sm font-body font-medium text-neutral-700 mb-2">
                                Banner Principal (Background)
                            </label>
                            {config.hero.bannerUrl ? (
                                <div className="relative group rounded-lg overflow-hidden h-32 w-full bg-neutral-100 border border-neutral-200">
                                    <img src={config.hero.bannerUrl} alt="Banner" className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => updateHeroConfig("bannerUrl", "")}
                                            className="text-white bg-red-600 px-3 py-1 rounded text-xs font-bold uppercase"
                                        >
                                            Remover
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <UploadDropzone
                                    endpoint="imageUploader"
                                    onClientUploadComplete={(res) => {
                                        if (res && res[0]) updateHeroConfig("bannerUrl", res[0].url);
                                    }}
                                    onUploadError={(error: Error) => { toast.error(`Erro: ${error.message}`); }}
                                    appearance={{
                                        button: "bg-primary text-white font-bold font-heading uppercase p-2 text-sm",
                                        container: "p-4 border-2 border-dashed border-neutral-200 rounded-lg bg-neutral-50 h-32"
                                    }}
                                />
                            )}
                        </div>

                    </div>
                </div>
            </div>

            {/* WhatsApp */}
            <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-neutral-200 flex items-center gap-3">
                    <Mail className="w-5 h-5 text-primary" />
                    <h2 className="font-heading font-bold text-neutral-900 text-xl uppercase tracking-tight">
                        Integração WhatsApp
                    </h2>
                </div>
                <div className="p-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-body font-semibold text-neutral-900">
                                Habilitar WhatsApp
                            </p>
                            <p className="text-sm text-neutral-600 font-body">
                                Envie confirmações de pedido via WhatsApp (Global)
                            </p>
                        </div>
                        <input
                            type="checkbox"
                            checked={config.enableWhatsApp}
                            onChange={(e) => updateConfig("enableWhatsApp", e.target.checked)}
                            className="w-5 h-5"
                        />
                    </div>

                    {config.enableWhatsApp && (
                        <div>
                            <label className="block text-sm font-body font-medium text-neutral-700 mb-2">
                                Número do WhatsApp
                            </label>
                            <input
                                type="tel"
                                value={config.whatsappNumber || ""}
                                onChange={(e) => updateConfig("whatsappNumber", e.target.value)}
                                className="w-full px-4 py-3 border border-neutral-300 rounded-lg font-body focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                                placeholder="(11) 99999-9999"
                            />
                        </div>
                    )}

                    {config.enableWhatsApp && (
                        <div className="grid gap-6 md:grid-cols-2">
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="block text-sm font-body font-medium text-neutral-700">
                                    Mensagem de Pedido (Checkout)
                                </label>
                                <button
                                    type="button"
                                    onClick={() => updateConfig("whatsappTemplate", DEFAULT_WHATSAPP_TEMPLATE)}
                                    className="text-xs text-primary hover:text-primary-dark font-body font-bold uppercase"
                                >
                                    Restaurar Padrão
                                </button>
                            </div>
                            <textarea
                                value={config.whatsappTemplate || DEFAULT_WHATSAPP_TEMPLATE}
                                onChange={(e) => updateConfig("whatsappTemplate", e.target.value)}
                                rows={10}
                                className="w-full px-4 py-3 border border-neutral-300 rounded-lg font-body text-sm font-mono focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                            />
                            <p className="text-xs text-neutral-500 mt-2">
                                Variáveis: {"{{orderId}}"}, {"{{customerName}}"}, {"{{customerPhone}}"}, {"{{customerAddress}}"}, {"{{items}}"}, {"{{total}}"}, {"{{paymentMethod}}"}
                            </p>
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="block text-sm font-body font-medium text-neutral-700">
                                    Mensagem de Recuperação (Reenvio)
                                </label>
                                <button
                                    type="button"
                                    onClick={() => updateConfig("whatsappRecoveryTemplate", DEFAULT_RECOVERY_TEMPLATE)}
                                    className="text-xs text-primary hover:text-primary-dark font-body font-bold uppercase"
                                >
                                    Restaurar Padrão
                                </button>
                            </div>
                            <textarea
                                value={config.whatsappRecoveryTemplate || DEFAULT_RECOVERY_TEMPLATE}
                                onChange={(e) => updateConfig("whatsappRecoveryTemplate", e.target.value)}
                                rows={10}
                                className="w-full px-4 py-3 border border-neutral-300 rounded-lg font-body text-sm font-mono focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                                placeholder="Modelo de mensagem para recuperação de pedido..."
                            />
                            <p className="text-xs text-neutral-500 mt-2">
                                Mesmas variáveis disponíveis.
                            </p>
                        </div>
                    </div>
                    )}
                </div>
            </div>
        </div>
    );
}
