import { unstable_cache } from "next/cache";
import { revalidateTag, revalidatePath } from "next/cache";
import { getAllProducts } from "./products";
import { getAllCategories } from "./categories";
import { getAllQuestions } from "./product-questions";
import { getAllSections } from "./home-sections";

// Função interna que busca os dados
async function fetchStats(currentModule: string) {
    const [products, categories, questions, sections] = await Promise.all([
        getAllProducts(),
        getAllCategories(),
        getAllQuestions(),
        getAllSections()
    ]);

    // Produtos com baixo estoque (soma de todas as variantes < 5)
    const lowStockProducts = products
        .map(p => ({
            id: p.id,
            name: p.name,
            slug: p.slug,
            stock: p.variants.reduce((acc, v) => acc + v.stock, 0)
        }))
        .filter(p => p.stock < 5)
        .slice(0, 5);

    // Últimas perguntas
    const latestQuestions = questions
        .slice(0, 5)
        .map(q => ({
            id: q.id,
            productName: q.productName,
            userName: q.userName,
            question: q.question,
            status: q.status
        }));

    return {
        totalProducts: products.length,
        totalCategories: categories.length,
        pendingQuestions: questions.filter(q => q.status === "pending").length,
        activeSections: sections.length,
        lowStockProducts,
        latestQuestions
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
        if (scope === "products" || scope === "all") (revalidateTag as any)("products");
        if (scope === "categories" || scope === "all") (revalidateTag as any)("categories");
        if (scope === "questions" || scope === "all") (revalidateTag as any)("questions");
        (revalidateTag as any)("dashboard-stats");
    } catch (e) {
        console.warn("revalidateTag failed, falling back to revalidatePath only");
    }
}
