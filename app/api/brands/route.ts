import { NextResponse } from "next/server";
import { Brand } from "@/lib/models/brand";
import { getStoreConfig } from "@/lib/admin/store-config";
import connectDB from "@/lib/db";

export async function GET() {
    await connectDB();
    const storeConfig = await getStoreConfig();
    const brands = await Brand.find({ module: storeConfig.module, active: true }).sort({ name: 1 }).lean();
    return NextResponse.json(brands.map((b: any) => ({ ...b, id: b.id })));
}
