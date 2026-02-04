import { Model } from "@/lib/models/model";
import connectDB from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        await connectDB();
        const { id } = await params;
        const body = await req.json();

        const updated = await Model.findOneAndUpdate({ id }, body, { new: true });
        if (!updated) return NextResponse.json({ error: "Model not found" }, { status: 404 });

        return NextResponse.json(updated);
    } catch (error) {
        return NextResponse.json({ error: "Failed to update model" }, { status: 400 });
    }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    return PUT(req, { params });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        await connectDB();
        const { id } = await params;
        await Model.deleteOne({ id });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete model" }, { status: 400 });
    }
}
