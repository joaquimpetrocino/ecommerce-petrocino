import { NextRequest, NextResponse } from "next/server";
import { getAllProducts, createProduct, getCachedProductsByModule } from "@/lib/admin/products";
import { invalidateDashboardCache } from "@/lib/admin/dashboard-stats";
import { auth } from "@/auth";

export async function GET(req: NextRequest) {
    const session = await auth();
    if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Unified: ignore module param and return cached all products
    const products = await getCachedProductsByModule();

    return NextResponse.json(products);
}

export async function POST(req: NextRequest) {
    const session = await auth();
    if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const newProduct = await createProduct(body);

        // Invalidate cache
        await invalidateDashboardCache("products");

        return NextResponse.json(newProduct, { status: 201 });
    } catch (error) {
        console.error("ERRO_CRIAR_PRODUTO:", error);
        return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
}
