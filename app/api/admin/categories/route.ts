import { NextRequest, NextResponse } from "next/server";
import { getAllCategories, createCategory, getCachedCategoriesByModule } from "@/lib/admin/categories";
import { invalidateDashboardCache } from "@/lib/admin/dashboard-stats";
import { auth } from "@/auth";

export async function GET(req: NextRequest) {
    const session = await auth();
    if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const module = searchParams.get("module") as any;

    let categories = module
        ? await getCachedCategoriesByModule(module)
        : await getAllCategories();

    return NextResponse.json(categories);
}

export async function POST(req: NextRequest) {
    const session = await auth();
    if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const data = await req.json();
        const category = await createCategory(data);

        // Invalidate cache
        await invalidateDashboardCache("categories");

        return NextResponse.json(category, { status: 201 });
    } catch (error) {
        console.error("ERRO_CRIAR_CATEGORIA:", error);
        return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }
}
