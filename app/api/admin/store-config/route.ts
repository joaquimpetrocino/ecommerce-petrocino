import { NextRequest, NextResponse } from "next/server";
import { getStoreConfig, updateStoreConfig } from "@/lib/admin/store-config";
import { auth } from "@/auth";

export async function GET(req: NextRequest) {
    const session = await auth();
    if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const config = await getStoreConfig();
    return NextResponse.json(config);
}

export async function PUT(req: NextRequest) {
    const session = await auth();
    if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const updatedConfig = await updateStoreConfig(body);
        return NextResponse.json(updatedConfig);
    } catch (error) {
        return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
}
