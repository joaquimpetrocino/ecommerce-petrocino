import { Model } from "@/lib/models/model";
import connectDB from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const module = searchParams.get("module") || "sports";
    const brandId = searchParams.get("brandId");

    const query: any = { module, active: true };
    if (brandId) query.brandId = brandId;

    const models = await Model.find(query).sort({ name: 1 }).lean();
    return NextResponse.json(models.map((m: any) => ({ ...m, id: m.id })));
}

export async function POST(req: NextRequest) {
    try {
        await connectDB();
        const body = await req.json();

        const newModel = await Model.create({
            id: `model-${Date.now()}`,
            ...body
        });

        return NextResponse.json(newModel, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: "Failed to create model" }, { status: 400 });
    }
}
