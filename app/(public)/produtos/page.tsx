import { Suspense } from "react";
import { ProductGrid } from "@/components/product/product-grid";
import { ProductFiltersSidebar } from "@/components/product/product-filters-sidebar";
import type { Product } from "@/types";

interface ProductsPageProps {
    searchParams: Promise<{
        category?: string;
        subcategory?: string;
        league?: string;
        brand?: string;
        model?: string;
        q?: string;
    }>;
}

async function getProducts(): Promise<Product[]> {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/products`, {
            cache: "no-store",
        });
        if (!res.ok) return [];
        return res.json();
    } catch {
        return [];
    }
}

async function getCategories(): Promise<any[]> {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/categories`, {
            cache: "no-store",
        });
        if (!res.ok) return [];
        return res.json();
    } catch {
        return [];
    }
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
    const params = await searchParams;
    const { category, subcategory, league, brand, model, q } = params;

    const [products, allCategories] = await Promise.all([
        getProducts(),
        getCategories()
    ]);

    // Filtrar produtos
    const filteredProducts = products.filter((product: Product) => {
        // Validação da Categoria e Subcategoria
        let matchesCategory = true;
        if (subcategory) {
            // Se subcategoria selecionada, o produto deve estar nela
            matchesCategory = product.category === subcategory;
        } else if (category) {
            // Se apenas a categoria pai selecionada, mostrar produtos da pai + todas as filhas
            const parent = allCategories.find(c => c.slug === category);
            const childrenSlugs = parent ? allCategories.filter(c => c.parentId === parent.id).map(c => c.slug) : [];
            matchesCategory = product.category === category || childrenSlugs.includes(product.category);
        }

        const matchesLeague = !league || product.league === league;
        const matchesBrand = !brand || product.brandId === brand;
        const matchesModel = !model || product.modelId === model;

        const matchesSearch = !q ||
            product.name.toLowerCase().includes(q.toLowerCase()) ||
            product.description.toLowerCase().includes(q.toLowerCase());

        return matchesCategory && matchesLeague && matchesBrand && matchesModel && matchesSearch;
    });

    return (
        <div className="min-h-screen bg-neutral-50 py-8">
            <div className="container mx-auto px-4 md:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-10">
                    <h1 className="font-heading font-bold text-neutral-900 text-5xl md:text-6xl uppercase tracking-tight mb-3">
                        Nossos <span className="text-primary">Produtos</span>
                    </h1>
                    <p className="text-neutral-600 font-body text-lg">
                        Encontre os melhores produtos para o seu jogo
                    </p>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar Filters - Responsive */}
                    <ProductFiltersSidebar />

                    {/* Main Content */}
                    <main className="flex-1">
                        {/* Results Count */}
                        <div className="mb-6 flex items-center justify-between">
                            <p className="text-neutral-600 font-body">
                                <span className="font-semibold text-neutral-900">{filteredProducts.length}</span>{" "}
                                {filteredProducts.length === 1 ? "produto encontrado" : "produtos encontrados"}
                            </p>
                        </div>

                        {/* Products Grid - Force 2 cols on mobile */}
                        {filteredProducts.length > 0 ? (
                            <ProductGrid products={filteredProducts} />
                        ) : (
                            <div className="text-center py-20 bg-white rounded-xl border border-neutral-200 border-dashed">
                                <div className="max-w-md mx-auto">
                                    <div className="w-20 h-20 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4 text-4xl">
                                        🔍
                                    </div>
                                    <h3 className="font-heading font-bold text-neutral-900 text-2xl uppercase mb-2">
                                        Nenhum produto encontrado
                                    </h3>
                                    <p className="text-neutral-600 font-body">
                                        Tente ajustar os filtros para ver mais resultados
                                    </p>
                                </div>
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
}
