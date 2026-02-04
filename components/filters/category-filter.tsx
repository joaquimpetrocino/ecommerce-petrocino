"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronDown } from "lucide-react";

export function CategoryFilter() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const currentCategory = searchParams.get("category") || "";

    const [categories, setCategories] = useState<{ name: string, slug: string }[]>([]);

    useEffect(() => {
        fetch("/api/categories?parentId=null")
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setCategories(data);
            })
            .catch(err => console.error(err));
    }, []);

    const handleCategoryChange = (slug: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (slug) {
            params.set("category", slug);
            params.delete("subcategory");
        } else {
            params.delete("category");
            params.delete("subcategory");
        }
        router.push(`/produtos?${params.toString()}`);
    };

    const [isOpen, setIsOpen] = useState(true);

    if (categories.length === 0) return null;

    return (
        <div className="space-y-4 border-t border-neutral-100 pt-6">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between group"
            >
                <h3 className="font-heading font-bold text-neutral-900 uppercase tracking-wider text-xs flex items-center gap-2">
                    <span className="w-1 h-4 bg-primary rounded-full"></span>
                    Categoria
                </h3>
                <ChevronDown className={`w-4 h-4 text-neutral-400 group-hover:text-primary transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
            </button>

            {isOpen && (
                <div className="space-y-1 animate-in slide-in-from-top-2 duration-200">
                    <button
                        onClick={() => handleCategoryChange("")}
                        className={`
                            w-full flex items-center justify-between px-3 py-2.5 rounded-lg font-body text-sm font-medium transition-all group
                            ${currentCategory === ""
                                ? "bg-primary/5 text-primary border-r-2 border-primary"
                                : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
                            }
                        `}
                    >
                        <span>Todas</span>
                        {currentCategory === "" && <div className="w-1.5 h-1.5 rounded-full bg-primary" />}
                    </button>
                    {categories.map((cat) => (
                        <button
                            key={cat.slug}
                            onClick={() => handleCategoryChange(cat.slug)}
                            className={`
                                w-full flex items-center justify-between px-3 py-2.5 rounded-lg font-body text-sm font-medium transition-all group
                                ${currentCategory === cat.slug
                                    ? "bg-primary/5 text-primary border-r-2 border-primary"
                                    : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
                                }
                            `}
                        >
                            <span className="capitalize">{cat.name}</span>
                            {currentCategory === cat.slug && <div className="w-1.5 h-1.5 rounded-full bg-primary" />}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
