"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Product } from "@/types";
import { formatPrice } from "@/lib/utils";

interface ProductCardProps {
    product: Product;
}

const categoryLabels: Record<string, string> = {
    // Esportes
    camisas: "Camisa",
    chuteiras: "Chuteira",
    acessorios: "Acessório",
    // Automotivo
    motor: "Motor",
    suspensao: "Suspensão",
    freios: "Freios",
    eletrica: "Elétrica",
    carroceria: "Carroceria"
};

const leagueLabels: Record<string, string> = {
    brasileirao: "Brasileirão",
    champions: "Champions",
    selecoes: "Seleções",
};

const IMAGE_FALLBACK = "/images/placeholder.png";

export function ProductCard({ product }: ProductCardProps) {
    const [imgSrc, setImgSrc] = useState(product.images[0]);

    const totalStock = product.variants.reduce((acc, variant) => acc + variant.stock, 0);
    const isOutOfStock = totalStock === 0;

    return (
        <Link href={`/produtos/${product.slug}`}>
            <div className={`group relative overflow-hidden rounded-xl border border-neutral-200 bg-white transition-all duration-250 hover:shadow-2xl hover:-translate-y-1 cursor-pointer ${isOutOfStock ? "opacity-75 grayscale" : ""}`}>
                {/* Badges */}
                <div className="absolute left-3 top-3 z-10 flex flex-wrap gap-2 pr-12">
                    {isOutOfStock && (
                        <span className="bg-red-600 text-white px-3 py-1 rounded-full text-[10px] uppercase tracking-tighter font-body font-bold shadow-md animate-pulse">
                            Esgotado
                        </span>
                    )}
                    <span className="bg-primary text-white px-3 py-1 rounded-full text-[10px] uppercase tracking-tighter font-body font-bold shadow-md">
                        {categoryLabels[product.category] || product.category}
                    </span>
                    {product.league && (
                        <span className="bg-accent text-white px-3 py-1 rounded-full text-[10px] uppercase tracking-tighter font-body font-bold shadow-md">
                            {leagueLabels[product.league] || product.league}
                        </span>
                    )}
                </div>

                {/* Image */}
                <div className="aspect-square overflow-hidden bg-neutral-100 relative">
                    <Image
                        src={imgSrc || IMAGE_FALLBACK}
                        alt={product.name}
                        width={400}
                        height={400}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                        onError={() => setImgSrc(IMAGE_FALLBACK)}
                    />
                    {isOutOfStock && (
                        <div className="absolute inset-0 bg-neutral-900/10 flex items-center justify-center backdrop-blur-[1px]">
                            {/* Opcional: ícone ou texto extra */}
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="p-5">
                    <h3 className="mb-2 font-body font-semibold text-neutral-900 truncate text-lg group-hover:text-primary transition-colors">
                        {product.name}
                    </h3>
                    <p className="text-xl md:text-2xl font-heading font-bold text-accent truncate" title={formatPrice(product.price)}>
                        {formatPrice(product.price)}
                    </p>
                    <p className="mt-2 text-sm text-neutral-600 font-body">
                        {product.variants.length} {product.variants.length === 1 ? "opção disponível" : "opções disponíveis"}
                    </p>
                </div>

                {/* Hover Indicator */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-accent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
            </div>
        </Link>
    );
}
