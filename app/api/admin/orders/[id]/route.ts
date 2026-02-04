import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { updateOrderStatus } from "@/lib/admin/orders";

async function checkAuth() {
    const sessionCookie = (await cookies()).get("admin_session");
    return !!sessionCookie;
}

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    if (!(await checkAuth())) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { id } = await params;
        const body = await req.json();
        const { status, notes } = body;

        const updated = updateOrderStatus(id, status, notes);

        if (!updated) {
            return NextResponse.json({ error: "Order not found" }, { status: 404 });
        }

        return NextResponse.json(updated);
    } catch (error) {
        return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
}
