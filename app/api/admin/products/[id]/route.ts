import { NextRequest, NextResponse } from "next/server";
import { updateProduct, deleteProduct, getProductById } from "@/lib/admin/products";
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
    const product = await getProductById(id);

    if (!product) {
        return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(product);
}

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth();
    if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { id } = await params;
        const body = await req.json();
        const updated = await updateProduct(id, body);

        if (!updated) {
            return NextResponse.json({ error: "Product not found" }, { status: 404 });
        }

        // Invalidate cache
        await invalidateDashboardCache("products");

        return NextResponse.json(updated);
    } catch (error) {
        return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
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
    const deleted = await deleteProduct(id);

    if (!deleted) {
        return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Invalidate cache
    await invalidateDashboardCache("products");

    return NextResponse.json({ success: true });
}
