import type { Product } from "@/types";
import { Brand } from "@/lib/models/brand";
import { Model } from "@/lib/models/model";
import connectDB from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    await connectDB();
    const brands = await Brand.find({ active: true }).sort({ name: 1 }).lean();
    return NextResponse.json(brands.map((b: any) => ({ ...b, id: b.id })));
}

export async function POST(req: NextRequest) {
    try {
        await connectDB();
        const body = await req.json();

        const newBrand = await Brand.create({
            id: `brand-${Date.now()}`,
            ...body
        });

        return NextResponse.json(newBrand, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: "Failed to create brand" }, { status: 400 });
    }
}
