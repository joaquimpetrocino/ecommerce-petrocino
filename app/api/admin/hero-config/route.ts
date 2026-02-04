import { NextRequest, NextResponse } from "next/server";
import { getStoreConfig, updateStoreConfig } from "@/lib/admin/store-config";
import { auth } from "@/auth";

export async function POST(req: NextRequest) {
    const session = await auth();
    if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { hero } = body;

        const config = await getStoreConfig();
        const updatedHero = { ...config.hero, ...hero };

        const updatedConfig = await updateStoreConfig({ hero: updatedHero });
        return NextResponse.json(updatedConfig);
    } catch (error) {
        return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
}
