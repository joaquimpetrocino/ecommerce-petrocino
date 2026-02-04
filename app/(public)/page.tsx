import Link from "next/link";
import { ProductGrid } from "@/components/product/product-grid";
import { ChevronRight, Sparkles } from "lucide-react";
import type { HomeSection } from "@/lib/admin/home-sections";
import type { Product } from "@/types";

async function getHomeData(): Promise<{ sections: HomeSection[], hero: any }> {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/home-sections`, {
            cache: "no-store",
        });
        if (!res.ok) return { sections: [], hero: null };
        return res.json();
    } catch {
        return { sections: [], hero: null };
    }
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

export default async function HomePage() {
    const { sections, hero } = await getHomeData();
    const products = await getProducts();

    return (
        <div className="min-h-screen bg-neutral-50">
            {/* Hero Section - Dinâmica */}
            <section className="relative overflow-hidden">
                <div
                    className="absolute inset-0 bg-cover bg-center transition-all duration-700"
                    style={{
                        backgroundImage: `url('${hero?.bannerUrl || "https://images.unsplash.com/photo-1522778119026-d647f0596c20?q=80&w=2000"}')`,
                    }}
                ></div>

                <div className="absolute inset-0 bg-linear-to-br from-neutral-900/95 via-neutral-900/90 to-neutral-800/90"></div>

                <div className="container mx-auto px-4 md:px-6 lg:px-8 py-24 md:py-36 relative z-10">
                    <div className="max-w-4xl">
                        <div className="inline-flex items-center gap-2 bg-accent/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6 border border-accent/30">
                            <Sparkles className="w-4 h-4 text-accent" />
                            <span className="text-sm font-body font-semibold text-accent">{hero?.badge || "Loja Oficial"}</span>
                        </div>

                        <h1 className="font-heading font-bold text-6xl md:text-8xl uppercase tracking-tight mb-6 leading-[0.9] text-white">
                            {hero?.title || "Sua Paixão, Nosso Jogo"}
                        </h1>

                        <p className="text-xl md:text-2xl text-neutral-300 font-body mb-10 leading-relaxed max-w-2xl">
                            {hero?.subtitle || "Os melhores artigos esportivos de futebol."}
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <Link
                                href="/produtos"
                                className="inline-flex items-center justify-center gap-2 bg-accent text-white px-10 py-5 rounded-xl font-heading font-bold uppercase tracking-wide hover:bg-accent/90 transition-all shadow-2xl hover:shadow-accent/50 group text-lg"
                            >
                                Ver Produtos
                                <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="absolute bottom-0 left-0 right-0 h-24 bg-linear-to-t from-neutral-50 to-transparent"></div>
            </section>

            {/* Seções Dinâmicas do Admin */}
            {sections.map((section, index) => {
                // Produtos da seção
                const sectionProducts = section.productIds
                    ? products.filter((p) => section.productIds?.includes(p.id))
                    : [];

                // Seção de Produtos (Featured ou Category)
                if (section.type === "featured" || section.type === "category") {
                    return (
                        <section
                            key={section.id}
                            className={`py-16 md:py-24 ${index % 2 === 0 ? "bg-white" : "bg-neutral-50"}`}
                        >
                            <div className="container mx-auto px-4 md:px-6 lg:px-8">
                                <div className="flex items-center justify-between mb-12">
                                    <div>
                                        <h2 className="font-heading font-bold text-4xl md:text-5xl uppercase tracking-tight text-neutral-900 mb-2">
                                            {section.title.split(" ").map((word, i) =>
                                                i === section.title.split(" ").length - 1 ? (
                                                    <span key={i} className="text-accent">
                                                        {word}
                                                    </span>
                                                ) : (
                                                    <span key={i}>{word} </span>
                                                )
                                            )}
                                        </h2>
                                        {section.description && (
                                            <p className="text-neutral-600 font-body text-lg">
                                                {section.description}
                                            </p>
                                        )}
                                    </div>
                                    <Link
                                        href="/produtos"
                                        className="hidden md:inline-flex items-center gap-2 text-accent font-heading font-semibold uppercase hover:gap-3 transition-all"
                                    >
                                        Ver Todos
                                        <ChevronRight className="w-5 h-5" />
                                    </Link>
                                </div>

                                {sectionProducts.length > 0 ? (
                                    <ProductGrid products={sectionProducts} />
                                ) : (
                                    <div className="text-center py-12 bg-neutral-100 rounded-xl">
                                        <p className="text-neutral-600 font-body">
                                            Nenhum produto configurado para esta seção
                                        </p>
                                    </div>
                                )}

                                <div className="text-center mt-12 md:hidden">
                                    <Link
                                        href="/produtos"
                                        className="inline-flex items-center gap-2 bg-accent text-white px-8 py-4 rounded-lg font-heading font-bold uppercase tracking-wide hover:bg-accent/90 transition-all"
                                    >
                                        Ver Todos os Produtos
                                        <ChevronRight className="w-5 h-5" />
                                    </Link>
                                </div>
                            </div>
                        </section>
                    );
                }

                // Seção CTA - Com foto de fundo
                if (section.type === "cta") {
                    return (
                        <section
                            key={section.id}
                            className="relative py-20 md:py-28 overflow-hidden"
                        >
                            {/* Imagem de fundo de futebol */}
                            <div
                                className="absolute inset-0 bg-cover bg-center"
                                style={{
                                    backgroundImage: `url('${section.backgroundImage || "https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=2000"}')`,
                                }}
                            ></div>

                            {/* Overlay escuro para legibilidade */}
                            <div className="absolute inset-0 bg-linear-to-r from-neutral-900/95 via-neutral-900/90 to-neutral-900/95"></div>

                            <div className="container mx-auto px-4 md:px-6 lg:px-8 relative z-10">
                                <div className="max-w-3xl mx-auto text-center">
                                    <h2 className="font-heading font-bold text-4xl md:text-6xl uppercase tracking-tight mb-4 leading-tight text-white">
                                        {section.title.split(" ").slice(0, -1).join(" ")}{" "}
                                        <span className="text-accent">
                                            {section.title.split(" ").slice(-1)}
                                        </span>
                                    </h2>

                                    {section.description && (
                                        <p className="text-lg md:text-xl text-neutral-300 font-body mb-8 leading-relaxed">
                                            {section.description}
                                        </p>
                                    )}

                                    <Link
                                        href={section.ctaLink || `/produtos?category=${section.categorySlug}`}
                                        className="inline-flex items-center gap-2 bg-accent text-white px-10 py-4 rounded-lg font-heading font-bold uppercase tracking-wide hover:bg-accent/90 transition-all shadow-xl hover:shadow-2xl group"
                                    >
                                        {section.buttonText || "Ver Produtos"}
                                        <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                </div>
                            </div>
                        </section>
                    );
                }

                return null;
            })}

            {/* Fallback: Se não houver seções, mostra mensagem */}
            {sections.length === 0 && (
                <section className="py-20 bg-white">
                    <div className="container mx-auto px-4 md:px-6 lg:px-8 text-center">
                        <p className="text-neutral-600 font-body text-lg">
                            Configure as seções da home no painel administrativo
                        </p>
                        <Link
                            href="/admin/home"
                            className="inline-flex items-center gap-2 mt-6 bg-accent text-white px-8 py-4 rounded-lg font-heading font-bold uppercase"
                        >
                            Ir para Admin
                            <ChevronRight className="w-5 h-5" />
                        </Link>
                    </div>
                </section>
            )}
        </div>
    );
}
