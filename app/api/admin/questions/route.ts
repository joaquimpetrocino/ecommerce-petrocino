import { NextRequest, NextResponse } from "next/server";
import { getCachedQuestionsByModule, updateQuestion, deleteQuestion } from "@/lib/admin/product-questions";
import { invalidateDashboardCache } from "@/lib/admin/dashboard-stats";
import { auth } from "@/auth";

export async function GET(req: NextRequest) {
    const session = await auth();
    if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const questions = await getCachedQuestionsByModule();
    return NextResponse.json(questions);
}

export async function PUT(req: NextRequest) {
    const session = await auth();
    if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { id, answer, status } = body;

        if (!id) {
            return NextResponse.json({ error: "ID required" }, { status: 400 });
        }

        const updates: any = {};
        if (status) updates.status = status;
        if (answer) {
            updates.answer = answer;
            updates.answeredAt = Date.now();
            updates.status = "approved"; // Responder aprova automaticamente
        }

        const updatedQuestion = await updateQuestion(id, updates);

        // Invalidate cache
        await invalidateDashboardCache("questions");

        return NextResponse.json(updatedQuestion);
    } catch (error) {
        return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
}

export async function DELETE(req: NextRequest) {
    const session = await auth();
    if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
        return NextResponse.json({ error: "ID required" }, { status: 400 });
    }

    const success = await deleteQuestion(id);

    // Invalidate cache
    await invalidateDashboardCache("questions");

    return NextResponse.json({ success });
}
