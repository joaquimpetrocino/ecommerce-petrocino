"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ProductGallery } from "@/components/product/product-gallery";
import { VariantSelector } from "@/components/product/variant-selector";
import { ProductQA } from "@/components/product/product-qa";
import { formatPrice } from "@/lib/utils";
import { addToCart } from "@/lib/cart";
import { toast } from "sonner";
import { ShoppingCart, Check, ArrowLeft, Sparkles } from "lucide-react";
import { Product } from "@/types";
import { ProductGrid } from "@/components/product/product-grid";

interface ProductDetailsProps {
    product: Product;
    relatedProducts: Product[];
    complementaryProducts: Product[];
}

export function ProductDetails({ product, relatedProducts, complementaryProducts }: ProductDetailsProps) {
    const [selectedSize, setSelectedSize] = useState<string>("");

    // Logic color (debounced)
    const [selectedColor, setSelectedColor] = useState<string>("");
    // Visual color (immediate)
    const [visualColor, setVisualColor] = useState<string>("");
    const colorTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const [quantity, setQuantity] = useState(1);
    const [added, setAdded] = useState(false);

    // Customization State
    const [customName, setCustomName] = useState("");
    const [customNumber, setCustomNumber] = useState("");

    const router = useRouter();

    const hasColors = product.colors && product.colors.length > 0;

    // Handle Color Selection with Debounce
    const handleColorSelect = (color: string) => {
        setVisualColor(color);

        if (colorTimeoutRef.current) {
            clearTimeout(colorTimeoutRef.current);
        }

        colorTimeoutRef.current = setTimeout(() => {
            setSelectedColor(color);
        }, 300); // 300ms debounce
    };

    // Filter variants based on selected color (if applicable)
    const availableVariants = product.variants.filter(v => {
        if (hasColors && selectedColor) {
            return v.color === selectedColor;
        }
        return true;
    });

    // Determine available sizes based on selected color
    // If color selected: show sizes for that color
    // If no color selected (but has colors): show all unique sizes (or disable?)
    // Requirement: Mandatory to choose color.
    // Better UX: Show colors. When color selected, show available sizes.

    const selectedVariant = product.variants.find(v => {
        const sizeMatch = v.size === selectedSize;
        const colorMatch = hasColors ? v.color === selectedColor : true;
        return sizeMatch && colorMatch;
    });

    const availableStock = selectedVariant ? selectedVariant.stock : 0;

    // Reset quantity if it exceeds available stock when size changes
    useEffect(() => {
        if (selectedSize && quantity > availableStock) {
            setQuantity(Math.max(1, availableStock));
        }
    }, [selectedSize, availableStock]);

    // Reset size when color changes (optional, but good if sizes differ per color)
    useEffect(() => {
        if (hasColors) {
            setSelectedSize("");
        }
    }, [selectedColor, hasColors]);


    const totalStock = product.variants.reduce((acc, v) => acc + v.stock, 0);
    const isOutOfStock = totalStock === 0;

    // Determine if customization is enabled for this specific variant configuration
    const isCustomizationEnabled = selectedVariant?.allowCustomization ?? false;

    // Calculate final price with customization
    const hasCustomization = (customName.length > 0 || customNumber.length > 0);
    const finalPrice = product.price + (hasCustomization ? (product.customizationPrice || 0) : 0);

    const handleAddToCart = () => {
        if (hasColors && !selectedColor) {
            toast.error("Por favor, selecione uma cor");
            return;
        }

        if (!selectedSize && !isOutOfStock) {
            toast.error("Por favor, selecione um tamanho");
            return;
        }

        addToCart(
            product.id,
            selectedSize,
            quantity,
            hasCustomization ? customName : undefined,
            hasCustomization ? customNumber : undefined,
            hasColors ? selectedColor : undefined
        );

        // Disparar evento customizado
        window.dispatchEvent(new Event("cart-updated"));

        setAdded(true);
        setTimeout(() => setAdded(false), 2000);
    };

    const [allCategories, setAllCategories] = useState<any[]>([]);

    useEffect(() => {
        fetch("/api/categories")
            .then(res => res.json())
            .then(data => setAllCategories(data))
            .catch(err => console.error(err));
    }, []);

    const getCategoryName = (idOrSlug: string) => {
        const cat = allCategories.find(c => c.id === idOrSlug || c.slug === idOrSlug);
        return cat?.name || idOrSlug;
    };

    return (
        <div className="min-h-screen bg-neutral-50 py-8 overflow-x-hidden">
            <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-full">
                {/* Back Button */}
                <button
                    onClick={() => router.back()}
                    className="mb-6 flex items-center gap-2 text-neutral-600 hover:text-primary font-body font-medium transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                    Voltar
                </button>

                <div className="grid gap-6 lg:gap-8 lg:grid-cols-2">
                    {/* Galeria de Imagens */}
                    <div>
                        <ProductGallery images={product.images || []} productName={product.name} />
                    </div>

                    {/* Informações do Produto */}
                    <div className="space-y-6 overflow-hidden">
                        <div>
                            <div className="mb-4 flex flex-wrap gap-2">
                                {isOutOfStock && (
                                    <span className="bg-red-600 text-white px-4 py-1.5 rounded-full text-[11px] uppercase tracking-wider font-body font-bold shadow-sm animate-pulse">
                                        Esgotado
                                    </span>
                                )}
                                {product.categories && product.categories.length > 0 ? (
                                    product.categories.map((cat, idx) => (
                                        <span key={idx} className="bg-primary text-white px-4 py-1.5 rounded-full text-[11px] uppercase tracking-wider font-body font-bold shadow-sm">
                                            {getCategoryName(cat)}
                                        </span>
                                    ))
                                ) : (
                                    <span className="bg-primary text-white px-4 py-1.5 rounded-full text-[11px] uppercase tracking-wider font-body font-bold shadow-sm">
                                        {(product as any).category || "Produto"}
                                    </span>
                                )}
                            </div>
                            <h1 className="mb-4 font-heading font-bold text-neutral-900 text-3xl md:text-5xl uppercase tracking-tight leading-[0.9] break-all sm:wrap-break-word overflow-hidden max-w-full">
                                {product.name}
                            </h1>
                            <div className="flex items-end gap-2">
                                <p className="text-5xl font-heading font-bold text-primary">
                                    {formatPrice(finalPrice)}
                                </p>
                                {hasCustomization && product.customizationPrice && product.customizationPrice > 0 && (
                                    <span className="text-sm text-neutral-500 font-body mb-2">
                                        (inclui {formatPrice(product.customizationPrice)} de personalização)
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="border-t border-neutral-200 pt-6">
                            <h2 className="mb-2 font-heading font-bold text-neutral-900 uppercase tracking-wide text-sm">
                                Descrição
                            </h2>
                            <p className="text-neutral-600 font-body leading-relaxed">
                                {product.description}
                            </p>
                        </div>

                        {/* Cores Disponíveis */}
                        {hasColors && (
                            <div className="border-t border-neutral-200 pt-6">
                                <h2 className="mb-4 font-heading font-bold text-neutral-900 uppercase tracking-wide text-sm flex items-center gap-2">
                                    Cores Disponíveis
                                </h2>
                                <div className="flex flex-wrap gap-3">
                                    {product.colors!.map((color, index) => (
                                        <button
                                            key={index}
                                            onClick={() => handleColorSelect(color.name)}
                                            className={`group flex flex-col items-center gap-2 relative ${visualColor === color.name ? 'ring-2 ring-primary ring-offset-2 rounded-full' : ''}`}
                                            title={color.name}
                                        >
                                            <div
                                                className="w-10 h-10 rounded-full border border-neutral-200 shadow-sm transition-transform group-hover:scale-110"
                                                style={{ backgroundColor: color.hex }}
                                            />

                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Seletor de Variantes */}
                        {!isOutOfStock && (
                            <div className="border-t border-neutral-200 pt-6">
                                {hasColors && !selectedColor ? (
                                    <p className="text-sm text-neutral-500 italic">Selecione uma cor para ver os tamanhos disponíveis.</p>
                                ) : (
                                    <VariantSelector
                                        variants={availableVariants}
                                        onSelect={setSelectedSize}
                                        selectedSize={selectedSize}
                                    />
                                )}
                            </div>
                        )}

                        {/* Customization Inputs */}
                        {!isOutOfStock && isCustomizationEnabled && (
                            <div className="border-t border-neutral-200 pt-6">
                                <h2 className="mb-4 font-heading font-bold text-neutral-900 uppercase tracking-wide text-sm flex items-center gap-2">
                                    Personalize sua Camisa
                                    {product.customizationPrice && product.customizationPrice > 0 && (
                                        <span className="text-primary text-xs normal-case font-body font-medium bg-primary/10 px-2 py-0.5 rounded-full">
                                            + {formatPrice(product.customizationPrice)}
                                        </span>
                                    )}
                                </h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-body font-medium text-neutral-600 mb-1.5">
                                            Nome
                                        </label>
                                        <input
                                            type="text"
                                            value={customName}
                                            onChange={(e) => setCustomName(e.target.value.toUpperCase().slice(0, 12))}
                                            placeholder="SEU NOME"
                                            className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-lg font-heading font-bold uppercase placeholder:font-normal focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-body font-medium text-neutral-600 mb-1.5">
                                            Número
                                        </label>
                                        <input
                                            type="text"
                                            value={customNumber}
                                            onChange={(e) => setCustomNumber(e.target.value.replace(/\D/g, '').slice(0, 2))}
                                            placeholder="10"
                                            className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-lg font-heading font-bold uppercase placeholder:font-normal focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                        />
                                    </div>
                                </div>
                                <p className="text-[11px] text-neutral-400 mt-2 font-body ml-1">
                                    * Personalização adiciona 2 dias ao prazo de entrega.
                                </p>
                            </div>
                        )}

                        {/* Quantidade */}
                        {!isOutOfStock && (
                            <div className="space-y-3">
                                <label className="font-heading font-bold text-neutral-900 uppercase tracking-wide text-sm">
                                    Quantidade:
                                </label>
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        className="w-12 h-12 bg-neutral-100 hover:bg-neutral-200 rounded-lg font-body font-bold text-xl transition-colors"
                                    >
                                        -
                                    </button>
                                    <span className="w-16 text-center font-body font-semibold text-2xl">
                                        {quantity}
                                    </span>
                                    <button
                                        onClick={() => setQuantity(quantity + 1)}
                                        disabled={selectedSize ? quantity >= availableStock : false}
                                        className={`w-12 h-12 rounded-lg font-body font-bold text-xl transition-colors
                                            ${selectedSize && quantity >= availableStock
                                                ? "bg-neutral-50 text-neutral-300 cursor-not-allowed"
                                                : "bg-neutral-100 hover:bg-neutral-200"}`}
                                    >
                                        +
                                    </button>
                                </div>
                                {selectedSize && (
                                    <p className={`text-xs font-body font-medium ${quantity >= availableStock ? 'text-red-500 font-bold' : 'text-neutral-500'}`}>
                                        {availableStock > 0
                                            ? `${availableStock} unidades disponíveis`
                                            : "Produto esgotado neste tamanho"}
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Botões de Ação */}
                        <div className="space-y-3 border-t border-neutral-200 pt-6">
                            {isOutOfStock ? (
                                <button
                                    disabled
                                    className="w-full bg-neutral-200 text-neutral-400 px-8 py-4 rounded-lg font-heading font-bold text-lg uppercase tracking-wide cursor-not-allowed"
                                >
                                    Produto Indisponível
                                </button>
                            ) : (
                                <button
                                    onClick={handleAddToCart}
                                    disabled={!selectedSize || added}
                                    className="w-full bg-primary hover:bg-primary-dark disabled:bg-neutral-300 text-white px-8 py-4 rounded-lg font-heading font-bold text-lg uppercase tracking-wide transition-all hover:scale-105 hover:shadow-xl disabled:hover:scale-100 disabled:hover:shadow-none cursor-pointer disabled:cursor-not-allowed"
                                >
                                    {added ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <Check className="w-6 h-6" />
                                            Adicionado ao Carrinho!
                                        </span>
                                    ) : (
                                        <span className="flex items-center justify-center gap-2">
                                            <ShoppingCart className="w-6 h-6" />
                                            Adicionar ao Carrinho
                                        </span>
                                    )}
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Seção de Perguntas */}
                <div className="mt-16 border-t border-neutral-200 ">
                    <ProductQA
                        productId={product.id}
                        productName={product.name}
                        productImage={product.images?.[0] || ""}
                    />
                </div>

                {/* Related Products */}
                <div className="mt-20">
                    <h2 className="text-3xl font-heading font-bold text-neutral-900 mb-8 uppercase tracking-tight">
                        Produtos Relacionados
                    </h2>
                    <ProductGrid products={relatedProducts} />
                </div>
            </div>
        </div>
    );
}
