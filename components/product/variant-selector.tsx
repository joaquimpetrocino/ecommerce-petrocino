"use client";

import { useState } from "react";
import { ProductVariant } from "@/types";

interface VariantSelectorProps {
    variants: ProductVariant[];
    onSelect: (size: string) => void;
    selectedSize?: string;
}

export function VariantSelector({ variants, onSelect, selectedSize: externalSelectedSize }: VariantSelectorProps) {
    const [internalSelectedSize, setInternalSelectedSize] = useState<string>("");

    // Use external controlled state if provided, otherwise internal state
    const selectedSize = externalSelectedSize !== undefined ? externalSelectedSize : internalSelectedSize;

    const handleSelect = (size: string) => {
        if (externalSelectedSize === undefined) {
            setInternalSelectedSize(size);
        }
        onSelect(size);
    };

    return (
        <div className="space-y-3">
            <label className="font-heading font-bold text-neutral-900 uppercase tracking-wide text-sm">
                Selecione a variante:
            </label>
            <div className="flex flex-wrap gap-3">
                {variants.map((variant, index) => {
                    const isAvailable = variant.stock > 0;
                    const isSelected = selectedSize === variant.size;

                    return (
                        <button
                            key={`${variant.size}-${index}`}
                            onClick={() => isAvailable && handleSelect(variant.size)}
                            disabled={!isAvailable}
                            className={`min-w-[60px] px-4 py-3 rounded-lg font-body font-semibold transition-all ${isSelected
                                ? "bg-primary text-white ring-2 ring-primary ring-offset-2 shadow-md"
                                : isAvailable
                                    ? "bg-neutral-100 text-neutral-900 hover:bg-neutral-200 hover:shadow-sm"
                                    : "bg-neutral-50 text-neutral-400 cursor-not-allowed line-through"
                                }`}
                        >
                            {variant.size}
                        </button>
                    );
                })}
            </div>
            {selectedSize && (
                <p className="text-sm text-neutral-600 font-body">
                    {variants.find((v) => v.size === selectedSize)?.stock} unidades disponíveis
                </p>
            )}
        </div>
    );
}
