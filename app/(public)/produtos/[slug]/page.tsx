import { notFound } from "next/navigation";
import { ProductDetails } from "@/components/product/product-details";
import { Product } from "@/types";

interface ProductPageProps {
    params: Promise<{
        slug: string;
    }>;
}

// Buscar produto por slug
async function getProduct(slug: string): Promise<Product | null> {
    try {
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
        // Infelizmente a API atual de products não filtra por Slug?
        // Vamos buscar todos e filtrar. Idealmente, criar endpoint /api/products/[slug]
        // Mas como MVP, vamos buscar e filtrar.
        const res = await fetch(`${baseUrl}/api/products`, { cache: 'no-store' });
        if (!res.ok) return null;

        const products: Product[] = await res.json();
        return products.find(p => p.slug === slug) || null;
    } catch (error) {
        console.error("Error fetching product:", error);
        return null;
    }
}

// Buscar produtos para recomendações
async function getRecommendations(currentProduct: Product) {
    try {
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
        const res = await fetch(`${baseUrl}/api/products`, { cache: 'no-store' }); // Re-fetch ou usar cache shared se configurado
        if (!res.ok) return { related: [], complementary: [] };

        const allProducts: Product[] = await res.json();

        // Logica cross-sell
        let complementary = [];
        if (currentProduct.category === "chuteiras") {
            complementary = allProducts.filter((p) => p.category === "acessorios").slice(0, 4);
        } else if (currentProduct.category === "camisas") {
            complementary = allProducts.filter((p) => p.category === "chuteiras" || p.category === "acessorios").slice(0, 4);
        } else {
            complementary = allProducts.filter((p) => p.category === "camisas").slice(0, 4);
        }

        // Logica relacionados
        const related = allProducts
            .filter((p) =>
                p.id !== currentProduct.id &&
                (p.category === currentProduct.category || p.league === currentProduct.league)
            )
            .slice(0, 4);

        return { related, complementary };

    } catch (error) {
        return { related: [], complementary: [] };
    }
}

export default async function ProductPage({ params }: ProductPageProps) {
    const { slug } = await params;
    const product = await getProduct(slug);

    if (!product) {
        notFound();
    }

    const { related, complementary } = await getRecommendations(product);

    return (
        <ProductDetails
            product={product}
            relatedProducts={related}
            complementaryProducts={complementary}
        />
    );
}
