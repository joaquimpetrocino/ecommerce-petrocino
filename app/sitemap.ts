import { MetadataRoute } from "next";
import connectDB from "@/lib/db";
import { Product as ProductModel } from "@/lib/models/product";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://leaguesports.com.br";

    // Rotas estáticas
    const staticRoutes = [
        "",
        "/produtos",
        "/contato",
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: "daily" as const,
        priority: 0.8,
    }));

    // Buscar produtos para rotas dinâmicas
    let productRoutes: MetadataRoute.Sitemap = [];

    try {
        await connectDB();
        const products = await ProductModel.find({ active: true }).select("slug updatedAt").lean();

        productRoutes = products.map((product) => ({
            url: `${baseUrl}/produto/${product.slug}`,
            lastModified: new Date(product.updatedAt || Date.now()),
            changeFrequency: "weekly" as const,
            priority: 0.9,
        }));
    } catch (error) {
        console.error("Failed to generate product sitemap:", error);
    }

    return [...staticRoutes, ...productRoutes];
}
