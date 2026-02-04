import connectDB from "@/lib/db";
import { StoreConfig as StoreConfigModel } from "@/lib/models/store-config";
import { unstable_noStore as noStore, revalidatePath } from "next/cache";
import { StoreConfig, DEFAULT_WHATSAPP_TEMPLATE } from "@/types";

// Obter configuração atual
export async function getStoreConfig(): Promise<StoreConfig> {
    noStore(); // Disable cache for dynamic config
    await connectDB();
    const config = await StoreConfigModel.findOne().lean();

    if (!config) {
        // Fallback robusto se não houver config no banco
        return {
            id: "default",
            storeName: "Loja Virtual",
            storeEmail: "",
            storePhone: "",
            storeAddress: "",
            storeCEP: "",
            storeNumber: "",
            storeComplement: "",
            logoUrl: "",
            whatsappNumber: "",
            enableWhatsApp: true,
            whatsappTemplate: DEFAULT_WHATSAPP_TEMPLATE,
            updatedAt: Date.now(),
            hero: {
                title: "Bem-vindo",
                subtitle: "Confira nossas ofertas.",
                bannerUrl: "",
                badge: "Loja Oficial"
            }
        };
    }

    return {
        ...config,
        // Garantir valores padrão para strings
        storeName: config.storeName || "Loja Virtual",
        storeEmail: config.storeEmail || "",
        storePhone: config.storePhone || "",
        storeAddress: config.storeAddress || "",
        storeCEP: config.storeCEP || "",
        storeNumber: config.storeNumber || "",
        storeComplement: config.storeComplement || "",
        logoUrl: config.logoUrl || "",
        whatsappNumber: config.whatsappNumber || "",
        whatsappTemplate: config.whatsappTemplate || DEFAULT_WHATSAPP_TEMPLATE,
        hero: config.hero || {
            title: "Bem-vindo",
            subtitle: "Confira nossas ofertas.",
            bannerUrl: "",
            badge: "Loja Oficial"
        }
    } as unknown as StoreConfig;
}

// Atualizar configuração
export async function updateStoreConfig(updates: Partial<StoreConfig>): Promise<StoreConfig> {
    await connectDB();

    const finalUpdates = { ...updates, updatedAt: Date.now() };

    const config = await StoreConfigModel.findOneAndUpdate(
        {},
        finalUpdates,
        { new: true, upsert: true }
    ).lean();

    if (!config) throw new Error("Failed to update config");

    revalidatePath("/admin", "layout");
    revalidatePath("/api/admin", "layout");
    revalidatePath("/", "layout");

    return getStoreConfig();
}

