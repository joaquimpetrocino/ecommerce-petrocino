import { NextResponse } from "next/server";
import { Brand } from "@/lib/models/brand";
import { getStoreConfig } from "@/lib/admin/store-config";
import connectDB from "@/lib/db";

export async function GET() {
    await connectDB();
    const storeConfig = await getStoreConfig();

    let query: any = { active: true };
    if (storeConfig.module !== "unified") {
        query.$or = [
            { module: storeConfig.module },
            { module: "unified" },
            { module: { $exists: false } }
        ];
    }

    const brands = await Brand.find(query).sort({ name: 1 }).lean();
    return NextResponse.json(brands.map((b: any) => ({ ...b, id: b.id })));
}
