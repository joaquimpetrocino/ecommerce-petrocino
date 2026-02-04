import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSectionById, updateSection, deleteSection } from "@/lib/admin/home-sections";

async function checkAuth() {
    const sessionCookie = (await cookies()).get("admin_session");
    return !!sessionCookie;
}

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    if (!(await checkAuth())) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const section = getSectionById(id);

    if (!section) {
        return NextResponse.json({ error: "Section not found" }, { status: 404 });
    }

    return NextResponse.json(section);
}

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    if (!(await checkAuth())) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const updates = await req.json();
    const section = updateSection(id, updates);

    if (!section) {
        return NextResponse.json({ error: "Section not found" }, { status: 404 });
    }

    return NextResponse.json(section);
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    if (!(await checkAuth())) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const success = deleteSection(id);

    if (!success) {
        return NextResponse.json({ error: "Section not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
}
