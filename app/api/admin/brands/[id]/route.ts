import { Brand } from "@/lib/models/brand";
import connectDB from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        await connectDB();
        const { id } = await params;
        const body = await req.json();

        const updated = await Brand.findOneAndUpdate({ id }, body, { new: true });
        if (!updated) return NextResponse.json({ error: "Brand not found" }, { status: 404 });

        return NextResponse.json(updated);
    } catch (error) {
        return NextResponse.json({ error: "Failed to update brand" }, { status: 400 });
    }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        await connectDB();
        const { id } = await params;
        await Brand.deleteOne({ id });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete brand" }, { status: 400 });
    }
}
