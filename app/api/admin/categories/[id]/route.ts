import { NextRequest, NextResponse } from "next/server";
import { getCategoryById, updateCategory, deleteCategory } from "@/lib/admin/categories";
import { Category as CategoryModel } from "@/lib/models/category";
import { Product as ProductModel } from "@/lib/models/product";
import { invalidateDashboardCache } from "@/lib/admin/dashboard-stats";
import { auth } from "@/auth";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth();
    if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const category = await getCategoryById(id);

    if (!category) {
        return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    return NextResponse.json(category);
}

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth();
    if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const updates = await req.json();
    const category = await updateCategory(id, updates);

    if (!category) {
        return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    // Invalidate cache
    await invalidateDashboardCache("categories");

    return NextResponse.json(category);
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth();
    if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Validar se existem produtos ou subcategorias
    const category = await getCategoryById(id);
    if (!category) {
        return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    // 1. Verificar Subcategorias
    const hasChildren = await CategoryModel.exists({ parentId: id });
    if (hasChildren) {
        return NextResponse.json({
            error: "Não é possível excluir esta categoria pois ela possui subcategorias vinculadas. Exclua as subcategorias primeiro."
        }, { status: 400 });
    }

    // 2. Verificar Produtos
    // Assumindo que o produto salva o 'slug' da categoria no campo 'category'
    const hasProducts = await ProductModel.exists({ category: category.slug });
    if (hasProducts) {
        return NextResponse.json({
            error: "Não é possível excluir esta categoria pois existem produtos vinculados a ela."
        }, { status: 400 });
    }

    const success = await deleteCategory(id);

    if (!success) {
        return NextResponse.json({ error: "Erro ao excluir categoria" }, { status: 500 });
    }

    // Invalidate cache
    await invalidateDashboardCache("categories");

    return NextResponse.json({ success: true });
}
