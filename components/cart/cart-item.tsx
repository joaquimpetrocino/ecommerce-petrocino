"use client";

import Image from "next/image";
import { Trash2, Plus, Minus } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { Product } from "@/types";

interface CartItemProps {
    product: Product;
    variantSize: string;
    quantity: number;
    customName?: string;
    customNumber?: string;
    onUpdateQuantity: (newQuantity: number) => void;
    onRemove: () => void;
}

export function CartItem({
    product,
    variantSize,
    quantity,
    customName,
    customNumber,
    onUpdateQuantity,
    onRemove,
}: CartItemProps) {
    const handleIncrement = () => {
        onUpdateQuantity(quantity + 1);
    };

    const handleDecrement = () => {
        if (quantity > 1) {
            onUpdateQuantity(quantity - 1);
        }
    };

    const hasCustomization = !!(customName || customNumber);
    const customizationPrice = product.customizationPrice || 0;
    const unitPrice = product.price + (hasCustomization ? customizationPrice : 0);
    const itemTotal = unitPrice * quantity;

    return (
        <div className="flex flex-col sm:flex-row gap-4 bg-white rounded-xl border border-neutral-200 p-4 hover:shadow-md transition-shadow">
            {/* Image */}
            <div className="shrink-0 w-full sm:w-24 h-48 sm:h-24 bg-neutral-100 rounded-lg overflow-hidden relative group">
                {product.images[0] ? (
                    <Image
                        src={product.images[0]}
                        alt={product.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 100vw, 96px"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-neutral-400 bg-neutral-200">
                        <span className="text-xs">Sem foto</span>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="flex-1 flex flex-col justify-between gap-4 sm:gap-0">
                <div>
                    <h3 className="font-body font-semibold text-neutral-900 mb-1 line-clamp-2">
                        {product.name}
                    </h3>
                    <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-neutral-600 font-body">
                        <p>
                            Tamanho: <span className="font-semibold text-neutral-900">{variantSize}</span>
                        </p>
                        {hasCustomization && (
                            <div className="flex flex-wrap gap-2 lg:gap-3 bg-neutral-50 px-2 py-0.5 rounded border border-neutral-100">
                                {customName && (
                                    <p>
                                        Nome: <span className="font-bold text-neutral-900 uppercase">{customName}</span>
                                    </p>
                                )}
                                {customNumber && (
                                    <p>
                                        Nº: <span className="font-bold text-neutral-900">{customNumber}</span>
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex flex-row items-center justify-between mt-0 sm:mt-3 border-t sm:border-0 border-neutral-100 pt-3 sm:pt-0">
                    {/* Quantity Controls */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleDecrement}
                            className="w-8 h-8 bg-neutral-100 hover:bg-neutral-200 rounded-lg flex items-center justify-center transition-colors"
                            aria-label="Diminuir quantidade"
                        >
                            <Minus className="w-4 h-4 text-neutral-700" />
                        </button>
                        <span className="w-10 text-center font-body font-semibold text-neutral-900">
                            {quantity}
                        </span>
                        <button
                            onClick={handleIncrement}
                            className="w-8 h-8 bg-neutral-100 hover:bg-neutral-200 rounded-lg flex items-center justify-center transition-colors"
                            aria-label="Aumentar quantidade"
                        >
                            <Plus className="w-4 h-4 text-neutral-700" />
                        </button>
                    </div>

                    {/* Price & Remove (Mobile optimized) */}
                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <p className="font-heading font-bold text-xl text-accent">
                                {formatPrice(itemTotal)}
                            </p>
                            <div className="flex flex-col items-end">
                                <p className="text-xs text-neutral-500 font-body hidden sm:block">
                                    {formatPrice(unitPrice)} cada
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={onRemove}
                            className="shrink-0 w-10 h-10 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg flex items-center justify-center transition-colors sm:hidden"
                            aria-label="Remover item"
                        >
                            <Trash2 className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Remove Button (Desktop) */}
            <button
                onClick={onRemove}
                className="hidden sm:flex shrink-0 w-10 h-10 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg items-center justify-center transition-colors self-center"
                aria-label="Remover item"
            >
                <Trash2 className="w-5 h-5" />
            </button>
        </div>
    );
}
