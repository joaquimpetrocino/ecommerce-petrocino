"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronDown } from "lucide-react";

interface Brand {
    id: string;
    name: string;
    slug: string; // Assuming slug exists or we use ID
}

export function BrandFilter() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const currentBrand = searchParams.get("brand") || "";

    const [brands, setBrands] = useState<Brand[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/brands")
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setBrands(data);
                }
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    const handleBrandChange = (brandId: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (brandId) {
            params.set("brand", brandId);
            // Reset model when brand changes? Maybe.
            params.delete("model");
        } else {
            params.delete("brand");
            params.delete("model");
        }
        router.push(`/produtos?${params.toString()}`);
    };

    const [isOpen, setIsOpen] = useState(true);

    if (loading) return <div className="animate-pulse h-10 bg-neutral-100 rounded-lg"></div>;
    if (brands.length === 0) return null;

    return (
        <div className="space-y-4 border-t border-neutral-100 pt-6">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between group"
            >
                <h3 className="font-heading font-bold text-neutral-900 uppercase tracking-wider text-xs flex items-center gap-2">
                    <span className="w-1 h-4 bg-primary rounded-full"></span>
                    Marcas
                </h3>
                <div className="flex items-center gap-2">
                    {currentBrand && (
                        <span
                            onClick={(e) => {
                                e.stopPropagation();
                                handleBrandChange("");
                            }}
                            className="text-[10px] uppercase font-bold text-neutral-400 hover:text-red-500 transition-colors z-10"
                        >
                            Limpar
                        </span>
                    )}
                    <ChevronDown className={`w-4 h-4 text-neutral-400 group-hover:text-primary transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
                </div>
            </button>

            {isOpen && (
                <div className="space-y-1 max-h-48 overflow-y-auto pr-2 custom-scrollbar animate-in slide-in-from-top-2 duration-200">
                    {brands.map((brand) => (
                        <button
                            key={brand.id}
                            onClick={() => handleBrandChange(brand.id)}
                            className={`
                                w-full flex items-center justify-between px-3 py-2 rounded-lg font-body text-sm font-medium transition-all
                                ${currentBrand === brand.id
                                    ? "bg-primary/5 text-primary border-r-2 border-primary"
                                    : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
                                }
                            `}
                        >
                            <span>{brand.name}</span>
                            {currentBrand === brand.id && (
                                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
