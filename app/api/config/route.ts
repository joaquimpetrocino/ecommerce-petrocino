import { NextResponse } from "next/server";
import { getStoreConfig } from "@/lib/admin/store-config";

export async function GET() {
    const storeConfig = await getStoreConfig();

    // Retornar apenas dados necessários para o layout público
    return NextResponse.json({
        storeName: storeConfig.module === "sports" ? "LeagueSports" : "AutoParts Online",
        module: storeConfig.module,
        logoUrl: storeConfig.logoUrl,
        whatsappNumber: storeConfig.whatsappNumber,
        enableWhatsApp: storeConfig.enableWhatsApp
    });
}
