import connectDB from "@/lib/db";
import { StoreConfig as StoreConfigModel } from "@/lib/models/store-config";
import { unstable_noStore as noStore, revalidatePath } from "next/cache";

// Configuração da loja e sistema de módulos
export type StoreModule = "sports" | "automotive";

export interface HeroConfig {
    title: string;
    subtitle: string;
    bannerUrl: string;
    badge: string;
}

export interface ModuleSettings {
    storeName: string;
    storeEmail: string;
    storePhone: string;
    storeAddress: string;
    storeCEP?: string;
    storeNumber?: string;
    storeComplement?: string;
    logoUrl?: string;
    whatsappNumber: string;
}

export interface StoreConfig {
    id: string;
    module: StoreModule;
    // Computed properties for the active module (legacy support + ease of use)
    storeName: string;
    storeEmail: string;
    storePhone: string;
    storeAddress: string;
    storeCEP?: string;
    storeNumber?: string;
    storeComplement?: string;
    logoUrl?: string;
    whatsappNumber: string;

    enableWhatsApp: boolean;
    updatedAt: number;

    // Full settings
    settings: {
        sports: ModuleSettings;
        automotive: ModuleSettings;
    };

    // Configurações de Hero por módulo
    hero: {
        sports: HeroConfig;
        automotive: HeroConfig;
    };
}

// Obter configuração atual
export async function getStoreConfig(): Promise<StoreConfig> {
    noStore(); // Disable cache for dynamic config
    await connectDB();
    const config = await StoreConfigModel.findOne().lean();

    if (!config) {
        // Se não existir, criar padrão (ou lançar erro, mas melhor ser robusto)
        // Por simplificação forçamos erro ou retornamos dummy se o banco estiver vazio na migration
        throw new Error("Store config not found");
    }

    // Hydrate top-level fields based on active module
    const activeModule = config.module as StoreModule;
    const settings = config.settings || { sports: {}, automotive: {} };
    const activeSettings = settings[activeModule] || {};

    return {
        ...config,
        settings, // Ensure settings exists
        storeName: activeSettings.storeName || "",
        storeEmail: activeSettings.storeEmail || "",
        storePhone: activeSettings.storePhone || "",
        storeAddress: activeSettings.storeAddress || "",
        storeCEP: activeSettings.storeCEP || "",
        storeNumber: activeSettings.storeNumber || "",
        storeComplement: activeSettings.storeComplement || "",
        logoUrl: activeSettings.logoUrl,
        whatsappNumber: activeSettings.whatsappNumber || "",
    } as unknown as StoreConfig;
}

// Obter módulo ativo
export async function getActiveModule(): Promise<StoreModule> {
    const config = await getStoreConfig();
    return config.module;
}

// Atualizar configuração
export async function updateStoreConfig(updates: Partial<StoreConfig>): Promise<StoreConfig> {
    await connectDB();

    // Se estivermos atualizando apenas 'module', não precisamos mexer nos settings
    // Se estivermos enviando 'settings', salvamos direto.

    // O backend simplesmente salva o que vier, assumindo que vem no formato certo do schema (settings nested)
    // O frontend será responsável por enviar { settings: ... }

    const config = await StoreConfigModel.findOneAndUpdate(
        {},
        { ...updates, updatedAt: Date.now() },
        { new: true }
    ).lean();

    if (!config) throw new Error("Failed to update config");

    revalidatePath("/admin", "layout");
    revalidatePath("/api/admin", "layout");
    revalidatePath("/", "layout"); // Revalidate home as well

    return getStoreConfig(); // Return hydrated config
}

// Alternar módulo
export async function switchModule(module: StoreModule): Promise<StoreConfig> {
    return updateStoreConfig({ module });
}

// Helper: Obter nome do módulo em português
export function getModuleName(module: StoreModule): string {
    return module === "sports" ? "Artigos Esportivos" : "Peças Automotivas";
}
