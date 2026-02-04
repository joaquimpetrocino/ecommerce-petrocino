import { NextResponse } from "next/server";
import { getProductsByModule } from "@/lib/admin/products";
import { getStoreConfig } from "@/lib/admin/store-config";

// API pública para obter produtos do módulo ativo
export async function GET() {
    const storeConfig = await getStoreConfig();
    const products = await getProductsByModule(storeConfig.module);

    return NextResponse.json(products);
}
