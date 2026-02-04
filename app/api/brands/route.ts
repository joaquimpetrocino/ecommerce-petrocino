import { NextResponse } from "next/server";
import { Brand } from "@/lib/models/brand";
import connectDB from "@/lib/db";

export async function GET() {
    await connectDB();
    const query: any = { active: true };

    const brands = await Brand.find(query).sort({ name: 1 }).lean();
    return NextResponse.json(brands.map((b: any) => ({ ...b, id: b.id })));
}
