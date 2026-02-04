import { NextRequest, NextResponse } from "next/server";
import { updateLeague, deleteLeague } from "@/lib/admin/categories";
import { auth } from "@/auth";

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
        const updated = await updateLeague(id, body);

        if (!updated) {
            return NextResponse.json({ error: "League not found" }, { status: 404 });
        }

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
    const success = await deleteLeague(id);

    if (!success) {
        return NextResponse.json({ error: "League not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
}
