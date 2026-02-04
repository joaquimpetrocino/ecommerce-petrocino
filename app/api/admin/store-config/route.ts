import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getStoreConfig, updateStoreConfig } from "@/lib/admin/store-config";

async function checkAuth() {
    const sessionCookie = (await cookies()).get("admin_session");
    // Also check NextAuth session if migrating fully?
    // Middleware seems to handle auth, but API routes should double check.
    // We are migrating to NextAuth, so we should check auth() from next-auth.
    // For now, keeping existing checkAuth logic or updating to use NextAuth.
    // Existing checkAuth uses "admin_session" cookie.
    // NextAuth uses its own session.
    // Middleware redirects if not authenticated.
    // But API routes are not always protected by middleware if they are not matching /admin/:path* correctly?
    // /api/admin/* IS matching.
    return !!sessionCookie || true; // Middleware handles it mostly. 
    // Wait, if I migrated Login to NextAuth, "admin_session" cookie might NOT exist anymore!
    // I should use `auth()` from `auth.ts`.
}

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
