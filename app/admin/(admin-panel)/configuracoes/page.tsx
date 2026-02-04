"use client";

import { useState, useEffect } from "react";
import { Save, Store, Mail, Package } from "lucide-react";
import { UploadDropzone } from "@/lib/uploadthing";
import type { StoreConfig, StoreModule, ModuleSettings, HeroConfig } from "@/lib/admin/store-config";

const defaultModuleSettings: ModuleSettings = {
    storeName: "",
    storeEmail: "",
    storePhone: "",
    storeAddress: "",
    storeCEP: "",
    storeNumber: "",
    storeComplement: "",
    logoUrl: "",
    whatsappNumber: ""
};

export default function SettingsPage() {
    const [fullConfig, setFullConfig] = useState<StoreConfig | null>(null);
    const [visualModule, setVisualModule] = useState<StoreModule>("sports");
    const [loading, setLoading] = useState(true);
    const [saved, setSaved] = useState(false);

    // Carregar configurações ao montar
    useEffect(() => {
        fetch("/api/admin/store-config")
            .then(res => res.json())
            .then((config: StoreConfig) => {
                setFullConfig(config);
                setVisualModule(config.module);
                setLoading(false);
            })
            .catch(err => console.error(err));
    }, []);

    const handleSave = async () => {
        if (saved || !fullConfig) return;

        const res = await fetch("/api/admin/store-config", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                module: visualModule, // Atualiza o módulo ativo
                settings: fullConfig.settings, // Atualiza todos os settings
                enableWhatsApp: fullConfig.enableWhatsApp // Global
            })
        });

        if (res.ok) {
            setSaved(true);
            window.dispatchEvent(new Event("moduleChanged"));
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

    const updateCurrentSettings = (field: keyof ModuleSettings, value: string) => {
        if (!fullConfig) return;

        let formattedValue = value;

        if (field === "storePhone" || field === "whatsappNumber") {
            formattedValue = formatPhone(value);
        }

        const currentSettings = fullConfig.settings[visualModule] || { ...defaultModuleSettings };
        const newSettings = { ...currentSettings, [field]: formattedValue };

        setFullConfig({
            ...fullConfig,
            settings: {
                ...fullConfig.settings,
                [visualModule]: newSettings
            }
        });
    };

    const updateHeroConfig = (field: keyof HeroConfig, value: string) => {
        if (!fullConfig) return;

        const currentHero = fullConfig.hero[visualModule];
        const newHero = { ...currentHero, [field]: value };

        setFullConfig({
            ...fullConfig,
            hero: {
                ...fullConfig.hero,
                [visualModule]: newHero
            }
        });
    };

    if (loading || !fullConfig) return <div>Carregando...</div>;

    const currentSettings = fullConfig.settings[visualModule] || defaultModuleSettings;
    const currentHero = fullConfig.hero[visualModule];
    const getModuleNameDisplay = (mod: string) => mod === "sports" ? "Artigos Esportivos" : "Peças Automotivas";

    return (
        <div className="space-y-6 pb-20">
            <div className="flex items-center justify-between">
                <h1 className="font-heading font-bold text-neutral-900 text-4xl uppercase tracking-tight">
                    Configurações
                </h1>
                <button
                    onClick={handleSave}
                    className="bg-accent hover:bg-accent-dark text-white px-6 py-3 rounded-lg font-heading font-bold uppercase flex items-center gap-2 transition-colors"
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

            {/* Módulo da Loja */}
            <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-neutral-200 flex items-center gap-3">
                    <Package className="w-5 h-5 text-primary" />
                    <h2 className="font-heading font-bold text-neutral-900 text-xl uppercase tracking-tight">
                        Módulo da Loja (Contexto de Edição)
                    </h2>
                </div>
                <div className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-body font-medium text-neutral-700 mb-2">
                            Selecione o Módulo para Configurar e Ativar
                        </label>
                        <select
                            value={visualModule}
                            onChange={(e) => setVisualModule(e.target.value as StoreModule)}
                            className="w-full px-4 py-3 border border-neutral-300 rounded-lg font-body focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                        >
                            <option value="sports">Artigos Esportivos</option>
                            <option value="automotive">Peças Automotivas</option>
                        </select>
                        <p className="text-sm text-neutral-600 font-body mt-2">
                            Editando configurações para: <span className="font-semibold text-primary">{getModuleNameDisplay(visualModule)}</span>
                        </p>
                    </div>
                </div>
            </div>

            {/* Informações da Loja (Específico do Módulo) */}
            <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-neutral-200 flex items-center gap-3">
                    <Store className="w-5 h-5 text-primary" />
                    <h2 className="font-heading font-bold text-neutral-900 text-xl uppercase tracking-tight">
                        Informações da Loja ({getModuleNameDisplay(visualModule)})
                    </h2>
                </div>
                <div className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-body font-medium text-neutral-700 mb-2">
                            Nome da Loja
                        </label>
                        <input
                            type="text"
                            value={currentSettings.storeName || ""}
                            onChange={(e) => {
                                // Validate Name: Allow letters, numbers, spaces, and basic punctuation
                                const value = e.target.value;
                                updateCurrentSettings("storeName", value);
                            }}
                            className="w-full px-4 py-3 border border-neutral-300 rounded-lg font-body focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                            placeholder={visualModule === "sports" ? "Ex: League Sports" : "Ex: Auto Peças League"}
                        />
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <div>
                            <label className="block text-sm font-body font-medium text-neutral-700 mb-2">
                                Email
                            </label>
                            <input
                                type="email"
                                value={currentSettings.storeEmail || ""}
                                onChange={(e) => updateCurrentSettings("storeEmail", e.target.value)}
                                className="w-full px-4 py-3 border border-neutral-300 rounded-lg font-body focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-body font-medium text-neutral-700 mb-2">
                                Telefone
                            </label>
                            <input
                                type="tel"
                                value={currentSettings.storePhone || ""}
                                onChange={(e) => updateCurrentSettings("storePhone", e.target.value)}
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
                                    value={currentSettings.storeCEP || ""}
                                    onChange={(e) => {
                                        const cep = e.target.value.replace(/\D/g, "").substring(0, 8);
                                        updateCurrentSettings("storeCEP", cep);

                                        if (cep.length === 8) {
                                            fetch(`https://viacep.com.br/ws/${cep}/json/`)
                                                .then(res => res.json())
                                                .then(data => {
                                                    if (!data.erro) {
                                                        const address = `${data.logradouro}, ${data.bairro}, ${data.localidade} - ${data.uf}`;
                                                        updateCurrentSettings("storeAddress", address);
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
                                    value={currentSettings.storeNumber || ""}
                                    onChange={(e) => updateCurrentSettings("storeNumber", e.target.value)}
                                    className="w-full px-4 py-3 border border-neutral-300 rounded-lg font-body focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                                    placeholder="123"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-body font-medium text-neutral-500 mb-1">Endereço (Preenchido via CEP)</label>
                            <input
                                type="text"
                                value={currentSettings.storeAddress || ""}
                                onChange={(e) => updateCurrentSettings("storeAddress", e.target.value)}
                                className="w-full px-4 py-3 border border-neutral-300 rounded-lg font-body focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none bg-neutral-50"
                                readOnly
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-body font-medium text-neutral-500 mb-1">Complemento</label>
                            <input
                                type="text"
                                value={currentSettings.storeComplement || ""}
                                onChange={(e) => updateCurrentSettings("storeComplement", e.target.value)}
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
                        Logo da Loja ({getModuleNameDisplay(visualModule)})
                    </h2>
                </div>
                <div className="p-6 space-y-4">
                    {currentSettings.logoUrl ? (
                        <div className="border border-neutral-200 rounded-lg p-6 bg-neutral-50 flex flex-col items-center gap-4">
                            <p className="text-sm font-body font-medium text-neutral-700">Logo Atual</p>
                            <img
                                src={currentSettings.logoUrl}
                                alt="Logo Preview"
                                className="max-h-24 object-contain border border-neutral-200 rounded-lg p-2 bg-white"
                            />
                            <button
                                onClick={() => updateCurrentSettings("logoUrl", "")}
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
                                        updateCurrentSettings("logoUrl", res[0].url);
                                    }
                                }}
                                onUploadError={(error: Error) => {
                                    alert(`Erro no upload: ${error.message}`);
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
                        Banners & Home ({getModuleNameDisplay(visualModule)})
                    </h2>
                </div>
                <div className="p-6 space-y-6">
                    {/* Textos do Hero */}
                    <div className="grid gap-4 md:grid-cols-3">
                        <div>
                            <label className="block text-sm font-body font-medium text-neutral-700 mb-2">Título Principal</label>
                            <input
                                type="text"
                                value={currentHero.title}
                                onChange={(e) => updateHeroConfig("title", e.target.value)}
                                className="w-full px-4 py-2 border border-neutral-300 rounded-lg font-body focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-body font-medium text-neutral-700 mb-2">Subtítulo</label>
                            <input
                                type="text"
                                value={currentHero.subtitle}
                                onChange={(e) => updateHeroConfig("subtitle", e.target.value)}
                                className="w-full px-4 py-2 border border-neutral-300 rounded-lg font-body focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-body font-medium text-neutral-700 mb-2">Badge (Etiqueta)</label>
                            <input
                                type="text"
                                value={currentHero.badge}
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
                            {currentHero.bannerUrl ? (
                                <div className="relative group rounded-lg overflow-hidden h-32 w-full bg-neutral-100 border border-neutral-200">
                                    <img src={currentHero.bannerUrl} alt="Banner" className="w-full h-full object-cover" />
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
                                    onUploadError={(error: Error) => alert(`Erro: ${error.message}`)}
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
                            checked={fullConfig.enableWhatsApp}
                            onChange={(e) =>
                                setFullConfig({ ...fullConfig, enableWhatsApp: e.target.checked })
                            }
                            className="w-5 h-5"
                        />
                    </div>

                    {fullConfig.enableWhatsApp && (
                        <div>
                            <label className="block text-sm font-body font-medium text-neutral-700 mb-2">
                                Número do WhatsApp ({getModuleNameDisplay(visualModule)})
                            </label>
                            <input
                                type="tel"
                                value={currentSettings.whatsappNumber || ""}
                                onChange={(e) => updateCurrentSettings("whatsappNumber", e.target.value)}
                                className="w-full px-4 py-3 border border-neutral-300 rounded-lg font-body focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                                placeholder="(11) 99999-9999"
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
