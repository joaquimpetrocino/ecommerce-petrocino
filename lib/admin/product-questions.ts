import connectDB from "@/lib/db";
import { ProductQuestion as ProductQuestionModel } from "@/lib/models/question";
import { unstable_cache } from "next/cache";

export interface ProductQuestion {
    id: string;
    productId: string;
    productName: string;
    productImage: string;
    userName: string;
    userEmail: string;
    question: string;
    answer?: string;
    status: "pending" | "approved" | "rejected";
    createdAt: number;
    answeredAt?: number;
}

// Obter todas as perguntas (Admin)
export async function getAllQuestions(): Promise<ProductQuestion[]> {
    await connectDB();
    const questions = await ProductQuestionModel.find().sort({ createdAt: -1 }).lean();
    return questions.map((q: any) => ({ ...q, id: q.id || q._id.toString() })) as unknown as ProductQuestion[];
}

// Removido filtro por módulo

// Versão cacheada para o dashboard
export async function getCachedQuestionsByModule() {
    return unstable_cache(
        async () => getAllQuestions(),
        ["questions-list", "all"],
        { tags: ["questions"] }
    )();
}

// Obter perguntas aprovadas de um produto (Público)
export async function getApprovedQuestionsByProduct(productId: string): Promise<ProductQuestion[]> {
    await connectDB();
    const questions = await ProductQuestionModel.find({
        productId,
        status: "approved"
    }).sort({ answeredAt: -1 }).lean();
    return questions.map((q: any) => ({ ...q, id: q.id || q._id.toString() })) as unknown as ProductQuestion[];
}

// Criar nova pergunta
export async function createQuestion(data: Omit<ProductQuestion, "id" | "status" | "createdAt" | "answer" | "answeredAt">): Promise<ProductQuestion> {
    await connectDB();
    const newQuestion = await ProductQuestionModel.create({
        ...data,
        id: `q-${Date.now()}`,
        status: "pending",
    });
    return newQuestion.toObject() as unknown as ProductQuestion;
}

// Responder/Moderar pergunta
export async function updateQuestion(id: string, updates: Partial<ProductQuestion>): Promise<ProductQuestion | null> {
    await connectDB();
    const question = await ProductQuestionModel.findOneAndUpdate(
        { id },
        updates,
        { new: true }
    ).lean();
    return question as unknown as ProductQuestion;
}

// Rejeitar/Excluir pergunta
export async function deleteQuestion(id: string): Promise<boolean> {
    await connectDB();
    const result = await ProductQuestionModel.deleteOne({ id });
    return result.deletedCount > 0;
}
