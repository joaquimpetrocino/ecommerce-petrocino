import { unstable_cache } from "next/cache";
import { revalidateTag, revalidatePath } from "next/cache";
import { getProductsByModule } from "./products";
import { getCategoriesByModule } from "./categories";
import { getQuestionsByModule } from "./product-questions";
import { getActiveSectionsByModule } from "./home-sections";

// Função interna que busca os dados
async function fetchStats(currentModule: string) {
    const [products, categories, questions, sections] = await Promise.all([
        getProductsByModule(currentModule as any),
        getCategoriesByModule(currentModule as any),
        getQuestionsByModule(currentModule as any),
        getActiveSectionsByModule(currentModule as any)
    ]);

    return {
        totalProducts: products.length,
        totalCategories: categories.length,
        pendingQuestions: questions.filter(q => q.status === "pending").length,
        activeSections: sections.length
    };
}

// Wrapper com cache
export async function getCachedDashboardStats(currentModule: string) {
    return unstable_cache(
        () => fetchStats(currentModule),
        ["dashboard-stats", currentModule],
        {
            tags: ["dashboard-stats", "stats"],
            revalidate: 3600 // 1 hora de fallback
        }
    )();
}

/**
 * Invalida o cache do dashboard.
 * Nota: revalidatePath é usado como fallback caso revalidateTag exija múltiplos argumentos neste ambiente.
 */
export async function invalidateDashboardCache(scope: "products" | "categories" | "questions" | "all" = "all") {
    // Invalidação por Path (Super robusta no Next.js)
    revalidatePath("/admin", "layout");
    revalidatePath("/api/admin", "layout");

    // Invalidação por Tag (Opcional, mas boa prática)
    try {
        // Se o ambiente exigir 2 argumentos, passamos 'page' como padrão
        if (scope === "products" || scope === "all") (revalidateTag as any)("products", "page");
        if (scope === "categories" || scope === "all") (revalidateTag as any)("categories", "page");
        if (scope === "questions" || scope === "all") (revalidateTag as any)("questions", "page");
        (revalidateTag as any)("dashboard-stats", "page");
    } catch (e) {
        console.warn("revalidateTag failed, falling back to revalidatePath only");
    }
}
