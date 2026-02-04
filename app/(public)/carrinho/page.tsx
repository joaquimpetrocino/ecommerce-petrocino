"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getCart, updateCartItem, removeFromCart } from "@/lib/cart";
import { CartItem } from "@/components/cart/cart-item";
import { CartSummary } from "@/components/cart/cart-summary";
import { OrderItem, Product } from "@/types";
import { ShoppingBag, ArrowLeft } from "lucide-react";

export default function CartPage() {
    const [cartItems, setCartItems] = useState<
        Array<{
            productId: string;
            variantSize: string;
            quantity: number;
            customName?: string;
            customNumber?: string;
        }>
    >([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch real products
        fetch("/api/products")
            .then(res => res.json())
            .then(data => {
                setProducts(data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Error fetching products", err);
                setLoading(false);
            });

        const cart = getCart();
        setCartItems(cart.items);
    }, []);

    const handleUpdateQuantity = (
        productId: string,
        variantSize: string,
        newQuantity: number,
        customName?: string,
        customNumber?: string
    ) => {
        updateCartItem(productId, variantSize, newQuantity, customName, customNumber);
        const cart = getCart();
        setCartItems(cart.items);
        window.dispatchEvent(new Event("cart-updated"));
    };

    const handleRemoveItem = (
        productId: string,
        variantSize: string,
        customName?: string,
        customNumber?: string
    ) => {
        removeFromCart(productId, variantSize, customName, customNumber);
        const cart = getCart();
        setCartItems(cart.items);
        window.dispatchEvent(new Event("cart-updated"));
    };

    // Converter itens do carrinho para OrderItems
    const orderItems: OrderItem[] = cartItems
        .map((item) => {
            const product = products.find((p) => p.id === item.productId);
            if (!product) return null;

            const hasCustomization = !!(item.customName || item.customNumber);
            const unitPrice = product.price + (hasCustomization ? (product.customizationPrice || 0) : 0);

            const orderItem: OrderItem = {
                productName: product.name,
                variantSize: item.variantSize,
                quantity: item.quantity,
                unitPrice: unitPrice,
                customName: item.customName,
                customNumber: item.customNumber
            };
            return orderItem;
        })
        .filter((item): item is OrderItem => item !== null);

    const total = orderItems.reduce(
        (sum, item) => sum + item.quantity * item.unitPrice,
        0
    );

    if (loading) {
        return (
            <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-2">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-neutral-500 font-body">Carregando carrinho...</p>
                </div>
            </div>
        );
    }

    if (cartItems.length === 0) {
        return (
            <div className="min-h-screen bg-neutral-50 py-16">
                <div className="container mx-auto px-4 md:px-6 lg:px-8">
                    <div className="max-w-2xl mx-auto text-center">
                        <div className="w-32 h-32 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <ShoppingBag className="w-16 h-16 text-neutral-400" />
                        </div>
                        <h1 className="font-heading font-bold text-neutral-900 text-4xl uppercase tracking-tight mb-4">
                            Seu Carrinho está <span className="text-accent">Vazio</span>
                        </h1>
                        <p className="text-neutral-600 font-body text-lg mb-8">
                            Adicione produtos ao carrinho para continuar comprando
                        </p>
                        <Link href="/produtos">
                            <button className="bg-primary hover:bg-primary-dark text-white px-8 py-4 rounded-lg font-body font-semibold text-lg transition-all hover:scale-105 hover:shadow-xl cursor-pointer inline-flex items-center gap-2">
                                <ShoppingBag className="w-5 h-5" />
                                Ver Produtos
                            </button>
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-neutral-50 py-8">
            <div className="container mx-auto px-4 md:px-6 lg:px-8">
                {/* Back Button */}
                <Link
                    href="/produtos"
                    className="inline-flex items-center gap-2 text-neutral-600 hover:text-primary font-body font-medium transition-colors mb-6"
                >
                    <ArrowLeft className="w-5 h-5" />
                    Continuar Comprando
                </Link>

                {/* Header */}
                <div className="mb-8">
                    <h1 className="font-heading font-bold text-neutral-900 text-5xl md:text-6xl uppercase tracking-tight mb-3">
                        Seu <span className="text-primary">Carrinho</span>
                    </h1>
                    <p className="text-neutral-600 font-body text-lg">
                        {cartItems.length} {cartItems.length === 1 ? "item" : "itens"} no carrinho
                    </p>
                </div>

                <div className="grid gap-8 lg:grid-cols-3">
                    {/* Cart Items */}
                    <div className="lg:col-span-2 space-y-4">
                        {cartItems.map((item) => {
                            const product = products.find((p) => p.id === item.productId);

                            if (!product) {
                                return (
                                    <div key={`${item.productId}-${item.variantSize}-${item.customName || ''}-${item.customNumber || ''}`} className="flex items-center justify-between p-4 border border-neutral-200 rounded-xl bg-neutral-50">
                                        <div className="flex items-center gap-4">
                                            <div className="w-16 h-16 bg-neutral-100 rounded-lg flex items-center justify-center shrink-0">
                                                <ShoppingBag className="w-6 h-6 text-neutral-300" />
                                            </div>
                                            <div>
                                                <p className="font-body font-medium text-neutral-500">Produto indisponível ou removido</p>
                                                <p className="text-xs text-neutral-400">Pode pertencer a outro catálogo.</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleRemoveItem(
                                                item.productId,
                                                item.variantSize,
                                                item.customName,
                                                item.customNumber
                                            )}
                                            className="text-red-500 hover:text-red-600 text-sm font-semibold p-2 hover:bg-red-50 rounded-lg transition-colors"
                                        >
                                            Remover
                                        </button>
                                    </div>
                                );
                            }

                            return (
                                <CartItem
                                    key={`${item.productId}-${item.variantSize}-${item.customName || ''}-${item.customNumber || ''}`}
                                    product={product}
                                    variantSize={item.variantSize}
                                    quantity={item.quantity}
                                    customName={item.customName}
                                    customNumber={item.customNumber}
                                    onUpdateQuantity={(newQuantity) =>
                                        handleUpdateQuantity(
                                            item.productId,
                                            item.variantSize,
                                            newQuantity,
                                            item.customName,
                                            item.customNumber
                                        )
                                    }
                                    onRemove={() =>
                                        handleRemoveItem(
                                            item.productId,
                                            item.variantSize,
                                            item.customName,
                                            item.customNumber
                                        )
                                    }
                                />
                            );
                        })}
                    </div>

                    {/* Cart Summary */}
                    <div className="lg:col-span-1">
                        <CartSummary items={orderItems} total={total} />
                    </div>
                </div>
            </div>
        </div>
    );
}
