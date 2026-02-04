import { NextResponse } from "next/server";
import { getCategoriesByModule } from "@/lib/admin/categories";
import { getStoreConfig } from "@/lib/admin/store-config";

// API pública para obter categorias do módulo ativo
export async function GET(req: any) {
    const { searchParams } = new URL(req.url);
    const parentId = searchParams.get("parentId");

    const categories = await getCategoriesByModule("unified");

    let filtered = categories.filter((cat) => cat.active);

    if (parentId === "null") {
        filtered = filtered.filter(cat => !cat.parentId);
    } else if (parentId) {
        filtered = filtered.filter(cat => cat.parentId === parentId);
    }

    return NextResponse.json(filtered);
}
