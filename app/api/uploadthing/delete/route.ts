import { NextRequest, NextResponse } from "next/server";
import { UTApi } from "uploadthing/server";
import { auth } from "@/auth";

const utapi = new UTApi();

export async function POST(req: NextRequest) {
    const session = await auth();
    if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { url } = await req.json();
        if (!url) return NextResponse.json({ error: "No URL provided" }, { status: 400 });

        // Extract file key from URL (https://utfs.io/f/KEY)
        const fileKey = url.substring(url.lastIndexOf("/") + 1);

        if (!fileKey) return NextResponse.json({ error: "Invalid URL" }, { status: 400 });

        await utapi.deleteFiles(fileKey);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting file:", error);
        return NextResponse.json({ error: "Failed to delete file" }, { status: 500 });
    }
}
