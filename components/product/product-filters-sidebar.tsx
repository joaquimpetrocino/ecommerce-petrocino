"use client";

import { useState } from "react";
import { Filter, X } from "lucide-react";
import { CategoryFilter } from "@/components/filters/category-filter";
import { SubcategoryFilter } from "@/components/filters/subcategory-filter";
import { BrandFilter } from "@/components/filters/brand-filter";
import { ModelFilter } from "@/components/filters/model-filter";
import { SearchInput } from "@/components/ui/search-input";

export function ProductFiltersSidebar() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            {/* Mobile Toggle Button */}
            <div className="lg:hidden mb-6">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-full flex items-center justify-center gap-2 bg-white border border-neutral-300 px-4 py-3 rounded-xl font-heading font-bold uppercase text-neutral-900 shadow-sm active:scale-95 transition-all"
                >
                    <Filter className="w-5 h-5" />
                    {isOpen ? "Ocultar Filtros" : "Filtrar Produtos"}
                </button>
            </div>

            {/* Sidebar Content */}
            <aside className={`
                w-full lg:w-72 shrink-0 space-y-6 
                lg:block
                ${isOpen ? "block animate-in fade-in slide-in-from-top-4 duration-300" : "hidden"}
            `}>
                <div className="bg-white rounded-2xl border border-neutral-200/60 p-6 shadow-xl shadow-neutral-200/40 lg:sticky lg:top-24 ring-1 ring-neutral-200/50">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="font-heading font-bold text-xl text-neutral-900 uppercase tracking-tight flex items-center gap-2">
                            Filtros <span className="text-primary text-2xl">.</span>
                        </h3>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="lg:hidden p-2 text-neutral-400 hover:bg-neutral-100 rounded-full transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="space-y-6">
                        {/* Busca */}
                        <div>
                            <SearchInput />
                        </div>

                        {/* Categoria */}
                        <div className="border-t border-neutral-100 pt-6">
                            <CategoryFilter />
                        </div>

                        {/* Subcategoria */}
                        <div className="border-t border-neutral-100 pt-6">
                            <SubcategoryFilter />
                        </div>

                        {/* Marca */}
                        <div className="border-t border-neutral-100 pt-6">
                            <BrandFilter />
                        </div>

                        {/* Modelo */}
                        <div className="border-t border-neutral-100 pt-6">
                            <ModelFilter />
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
}
