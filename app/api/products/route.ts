import { NextResponse } from "next/server";
import { getProductsByModule } from "@/lib/admin/products";
import { getStoreConfig } from "@/lib/admin/store-config";

// API pública para obter produtos do módulo ativo
export async function GET() {
    const products = await getProductsByModule("unified");

    return NextResponse.json(products);
}
