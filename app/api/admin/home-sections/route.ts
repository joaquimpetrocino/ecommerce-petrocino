import { NextRequest, NextResponse } from "next/server";
import { getAllSections, createSection, reorderSections } from "@/lib/admin/home-sections";
import { auth } from "@/auth";

export async function GET(req: NextRequest) {
    const session = await auth();
    if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const sections = await getAllSections();

    return NextResponse.json(sections);
}

export async function POST(req: NextRequest) {
    const session = await auth();
    if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const data = await req.json();

        // Se for uma requisição de reordenação
        if (data.action === "reorder" && data.sectionIds) {
            const success = await reorderSections(data.sectionIds);
            return NextResponse.json({ success });
        }

        // Caso contrário, criar nova seção
        const section = await createSection(data);
        return NextResponse.json(section, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }
}
