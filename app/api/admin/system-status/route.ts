import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import connectDB from "@/lib/db";
import mongoose from "mongoose";

export async function GET(req: NextRequest) {
    const session = await auth();
    if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        await connectDB();

        const dbStats = await mongoose.connection.db?.stats();

        // MongoDB Free Tier is typically 512MB
        const mongoLimit = 512 * 1024 * 1024; // 512MB in bytes
        const mongoUsed = dbStats?.storageSize || 0;
        const mongoUsedPercent = (mongoUsed / mongoLimit) * 100;

        // UploadThing limits cannot be fetched via API easily on free tier without using undocumented endpoints or just estimating.
        // We will mock this or leave it as informational text since the user asked to just "inform if X happens".
        // But we can try to find file count from our database (Product images count) as a proxy?
        // Let's just return the Mongo stats for now and static info for others.

        return NextResponse.json({
            mongodb: {
                used: mongoUsed,
                limit: mongoLimit,
                percent: mongoUsedPercent
            },
            uploadthing: {
                limit: "2GB", // Hardcoded info
                warning: "Monitore o painel do UploadThing se tiver muitas imagens."
            },
            vercel: {
                plan: "Hobby",
                limit: "Bandwidth/Functions limits"
            }
        });

    } catch (error) {
        console.error("Error fetching system status:", error);
        return NextResponse.json({ error: "Failed to fetch status" }, { status: 500 });
    }
}
