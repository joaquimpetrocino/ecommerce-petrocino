import { NextRequest, NextResponse } from "next/server";
import { getApprovedQuestionsByProduct, createQuestion } from "@/lib/admin/product-questions";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");

    if (!productId) {
        return NextResponse.json({ error: "Product ID required" }, { status: 400 });
    }

    const questions = await getApprovedQuestionsByProduct(productId);
    return NextResponse.json(questions);
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { productId, productName, productImage, userName, userEmail, question, honeypot } = body;

        // Anti-spam básico: Honeypot
        if (honeypot) {
            // Se o honeypot estiver preenchido, é um bot. Finja sucesso.
            return NextResponse.json({ success: true }, { status: 201 });
        }

        // Validação básica
        if (!productId || !userName || !userEmail || !question) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const newQuestion = await createQuestion({
            productId,
            productName,
            productImage,
            userName,
            userEmail,
            question
        });

        return NextResponse.json(newQuestion, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
}
