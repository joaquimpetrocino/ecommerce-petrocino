"use client";

import { useState, useEffect } from "react";
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
    const [quantity, setQuantity] = useState(1);
    const [added, setAdded] = useState(false);

    // Customization State
    const [customName, setCustomName] = useState("");
    const [customNumber, setCustomNumber] = useState("");

    // Estoque Dinâmico
    const selectedVariant = product.variants.find(v => v.size === selectedSize);
    const availableStock = selectedVariant ? selectedVariant.stock : 0;

    const router = useRouter();

    // Reset quantity if it exceeds available stock when size changes
    useEffect(() => {
        if (selectedSize && quantity > availableStock) {
            setQuantity(Math.max(1, availableStock));
        }
    }, [selectedSize, availableStock]);


    const totalStock = product.variants.reduce((acc, v) => acc + v.stock, 0);
    const isOutOfStock = totalStock === 0;

    // Calculate final price with customization
    const hasCustomization = (customName.length > 0 || customNumber.length > 0);
    const finalPrice = product.price + (hasCustomization ? (product.customizationPrice || 0) : 0);

    const handleAddToCart = () => {
        if (!selectedSize && !isOutOfStock) {
            toast.error("Por favor, selecione um tamanho");
            return;
        }

        addToCart(
            product.id,
            selectedSize,
            quantity,
            hasCustomization ? customName : undefined,
            hasCustomization ? customNumber : undefined
        );

        // Disparar evento customizado
        window.dispatchEvent(new Event("cart-updated"));

        setAdded(true);
        setTimeout(() => setAdded(false), 2000);
    };

    return (
        <div className="min-h-screen bg-neutral-50 py-8">
            <div className="container mx-auto px-4 md:px-6 lg:px-8">
                {/* Back Button */}
                <button
                    onClick={() => router.back()}
                    className="mb-6 flex items-center gap-2 text-neutral-600 hover:text-primary font-body font-medium transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                    Voltar
                </button>

                <div className="grid gap-8 lg:grid-cols-2">
                    {/* Galeria de Imagens */}
                    <div>
                        <ProductGallery images={product.images || []} productName={product.name} />
                    </div>

                    {/* Informações do Produto */}
                    <div className="space-y-6">
                        <div>
                            <div className="mb-4 flex flex-wrap gap-2">
                                {isOutOfStock && (
                                    <span className="bg-red-600 text-white px-4 py-1.5 rounded-full text-[11px] uppercase tracking-wider font-body font-bold shadow-sm animate-pulse">
                                        Esgotado
                                    </span>
                                )}
                                <span className="bg-primary text-white px-4 py-1.5 rounded-full text-[11px] uppercase tracking-wider font-body font-bold shadow-sm">
                                    {product.category}
                                </span>
                                {product.league && (
                                    <span className="bg-accent text-white px-4 py-1.5 rounded-full text-[11px] uppercase tracking-wider font-body font-bold shadow-sm">
                                        {product.league}
                                    </span>
                                )}
                            </div>
                            <h1 className="mb-4 font-heading font-bold text-neutral-900 text-4xl md:text-5xl uppercase tracking-tight leading-[0.9]">
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
                        {product.colors && product.colors.length > 0 && (
                            <div className="border-t border-neutral-200 pt-6">
                                <h2 className="mb-4 font-heading font-bold text-neutral-900 uppercase tracking-wide text-sm flex items-center gap-2">
                                    Cores Disponíveis
                                </h2>
                                <div className="flex flex-wrap gap-3">
                                    {product.colors.map((color, index) => (
                                        <div
                                            key={index}
                                            className="group flex flex-col items-center gap-2"
                                            title={color.name}
                                        >
                                            <div
                                                className="w-10 h-10 rounded-full border border-neutral-200 shadow-sm transition-transform group-hover:scale-110"
                                                style={{ backgroundColor: color.hex }}
                                            />
                                            <span className="text-[10px] font-body text-neutral-500 uppercase font-medium">
                                                {color.name}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Seletor de Variantes */}
                        {!isOutOfStock && (
                            <div className="border-t border-neutral-200 pt-6">
                                <VariantSelector
                                    variants={product.variants || []}
                                    onSelect={setSelectedSize}
                                />
                            </div>
                        )}

                        {/* Customization Inputs */}
                        {!isOutOfStock && product.allowCustomization && (
                            <div className="border-t border-neutral-200 pt-6">
                                <h2 className="mb-4 font-heading font-bold text-neutral-900 uppercase tracking-wide text-sm flex items-center gap-2">
                                    Personalize sua Camisa
                                    {product.customizationPrice && product.customizationPrice > 0 && (
                                        <span className="text-primary text-xs normal-case font-body font-medium bg-primary/10 px-2 py-0.5 rounded-full">
                                            + {formatPrice(product.customizationPrice)}
                                        </span>
                                    )}
                                </h2>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-body font-medium text-neutral-600 mb-1.5">
                                            Nome (+R$ 0,00)
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
                                            Número (+R$ 0,00)
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

                {/* Seção de Perguntas e Respostas */}
                <ProductQA
                    productId={product.id}
                    productName={product.name}
                    productImage={product.images?.[0] || ""}
                />

                {/* Seção de Conversão Cruzada */}
                {complementaryProducts.length > 0 && (
                    <section className="mt-20 pt-16 border-t border-neutral-200">
                        <div className="mb-10">
                            <div className="inline-flex items-center gap-2 bg-accent/10 px-3 py-1.5 rounded-full mb-3">
                                <Sparkles className="w-4 h-4 text-accent" />
                                <span className="text-xs font-body font-semibold text-accent uppercase">Aumente seu Kit</span>
                            </div>
                            <h2 className="font-heading font-bold text-3xl md:text-4xl uppercase tracking-tight text-neutral-900 mb-2">
                                Quem Comprou Isso, Também{" "}
                                <span className="text-accent">Levou</span>
                            </h2>
                            <p className="text-neutral-600 font-body text-lg">
                                Complete seu kit com produtos complementares
                            </p>
                        </div>
                        <ProductGrid products={complementaryProducts} />
                    </section>
                )}

                {/* Produtos Relacionados */}
                {relatedProducts.length > 0 && (
                    <section className="mt-20 pt-16 border-t border-neutral-200">
                        <div className="mb-10">
                            <h2 className="font-heading font-bold text-3xl md:text-4xl uppercase tracking-tight text-neutral-900 mb-2">
                                Produtos{" "}
                                <span className="text-accent">Relacionados</span>
                            </h2>
                            <p className="text-neutral-600 font-body text-lg">
                                Outras opções que você pode gostar
                            </p>
                        </div>
                        <ProductGrid products={relatedProducts} />
                    </section>
                )}
            </div>
        </div>
    );
}
