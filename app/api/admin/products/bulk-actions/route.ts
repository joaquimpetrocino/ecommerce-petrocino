
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import connectDB from "@/lib/db";
import { Product as ProductModel } from "@/lib/models/product";
import { invalidateDashboardCache } from "@/lib/admin/dashboard-stats";

export async function POST(req: NextRequest) {
    const session = await auth();
    if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { action, ids } = await req.json();

        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return NextResponse.json({ error: "No items selected" }, { status: 400 });
        }

        await connectDB();
        let count = 0;
        switch (action) {
            case "delete":
                const delRes = await ProductModel.deleteMany({ id: { $in: ids } });
                count = delRes.deletedCount || 0;
                break;

            case "activate":
                const actRes = await ProductModel.updateMany(
                    { id: { $in: ids } },
                    { $set: { active: true } }
                );
                count = actRes.modifiedCount || 0;
                break;

            case "deactivate":
                const deactRes = await ProductModel.updateMany(
                    { id: { $in: ids } },
                    { $set: { active: false } }
                );
                count = deactRes.modifiedCount || 0;
                break;

            default:
                return NextResponse.json({ error: "Invalid action" }, { status: 400 });
        }

        // Invalida o cache apenas uma vez após a operação em lote
        await invalidateDashboardCache("products");

        return NextResponse.json({
            success: true,
            count
        });

    } catch (error) {
        console.error("BULK_ACTION_ERROR:", error);
        return NextResponse.json({ error: "Failed to process bulk action" }, { status: 500 });
    }
}
