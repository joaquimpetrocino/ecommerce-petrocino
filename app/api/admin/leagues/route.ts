import { NextRequest, NextResponse } from "next/server";
import { getAllLeagues, createLeague, getLeaguesByModule } from "@/lib/admin/categories";
import { auth } from "@/auth";

export async function GET(req: NextRequest) {
    const session = await auth();
    if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const module = searchParams.get("module") as any;

    let leagues = module
        ? await getLeaguesByModule(module)
        : await getAllLeagues();

    return NextResponse.json(leagues);
}

export async function POST(req: NextRequest) {
    const session = await auth();
    if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const data = await req.json();
        const league = await createLeague(data);
        return NextResponse.json(league, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }
}
