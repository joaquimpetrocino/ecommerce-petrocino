import { NextResponse, NextRequest } from "next/server";
import { Model } from "@/lib/models/model";
import connectDB from "@/lib/db";

export async function GET(req: NextRequest) {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const brandId = searchParams.get("brandId");

    let query: any = { active: true };
    if (brandId) query.brandId = brandId;

    const models = await Model.find(query).sort({ name: 1 }).lean();
    return NextResponse.json(models.map((m: any) => ({ ...m, id: m.id })));
}
