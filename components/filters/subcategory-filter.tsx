"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronDown } from "lucide-react";

interface Subcategory {
    id: string;
    name: string;
    slug: string;
}

export function SubcategoryFilter() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const currentCategory = searchParams.get("category"); // slug
    const currentSubcategory = searchParams.get("subcategory") || "";

    const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!currentCategory) {
            setSubcategories([]);
            return;
        }

        setLoading(true);
        fetch(`/api/categories`)
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    // Find the parent category ID based on slug
                    const parent = data.find((c: any) => c.slug === currentCategory);
                    if (parent) {
                        const children = data.filter((c: any) => c.parentId === parent.id);
                        setSubcategories(children);
                    } else {
                        setSubcategories([]);
                    }
                }
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, [currentCategory]);

    const handleSubcategoryChange = (slug: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (slug) {
            params.set("subcategory", slug);
        } else {
            params.delete("subcategory");
        }
        router.push(`/produtos?${params.toString()}`);
    };

    const [isOpen, setIsOpen] = useState(true);

    if (loading) return <div className="animate-pulse h-10 bg-neutral-100 rounded-lg"></div>;
    // Hide if no subcategories or no category selected (optional logic)

    if (subcategories.length === 0) return null;

    return (
        <div className="space-y-4 border-t border-neutral-100 pt-6">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between group"
            >
                <h3 className="font-heading font-bold text-neutral-900 uppercase tracking-wider text-xs flex items-center gap-2">
                    <span className="w-1 h-4 bg-accent rounded-full"></span>
                    Subcategoria
                </h3>
                <div className="flex items-center gap-2">
                    {currentSubcategory && (
                        <span
                            onClick={(e) => {
                                e.stopPropagation();
                                handleSubcategoryChange("");
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
                    {subcategories.map((sub) => (
                        <button
                            key={sub.id}
                            onClick={() => handleSubcategoryChange(sub.slug)}
                            className={`
                                w-full flex items-center justify-between px-3 py-2 rounded-lg font-body text-sm font-medium transition-all
                                ${currentSubcategory === sub.slug
                                    ? "bg-accent/5 text-accent border-r-2 border-accent"
                                    : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
                                }
                            `}
                        >
                            <span className="capitalize">{sub.name}</span>
                            {currentSubcategory === sub.slug && (
                                <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
