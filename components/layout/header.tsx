"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useEffect, useState } from "react";
import { getCartItemCount } from "@/lib/cart";
import { splitStoreName, capitalizeFirstLetter } from "@/lib/utils";

interface Category {
    id: string;
    name: string;
    slug: string;
    showInNavbar: boolean;
}

export function Header() {
    const [cartCount, setCartCount] = useState(0);
    const [scrolled, setScrolled] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);
    const [storeInfo, setStoreInfo] = useState<{
        storeName: string;
        logoUrl?: string;
    }>({
        storeName: "LeagueSports" // Valor inicial seguro
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Atualizar contagem do carrinho
        const updateCount = () => {
            setCartCount(getCartItemCount());
        };

        const loadData = async () => {
            try {
                const [categoriesRes, configRes] = await Promise.all([
                    fetch("/api/categories"),
                    fetch("/api/config")
                ]);

                if (categoriesRes.ok) {
                    const data = await categoriesRes.json();
                    const navbarCategories = data.filter((cat: Category) => cat.showInNavbar).slice(0, 3);
                    setCategories(navbarCategories);
                }

                if (configRes.ok) {
                    const data = await configRes.json();
                    setStoreInfo(data);
                }
            } catch (err) {
                console.error("Erro ao carregar dados do header:", err);
            } finally {
                setIsLoading(false);
            }
        };

        updateCount();
        loadData();

        // Listener para mudanças no localStorage
        window.addEventListener("storage", updateCount);
        window.addEventListener("cart-updated", updateCount);

        // Listener para scroll (adicionar sombra)
        const handleScroll = () => {
            setScrolled(window.scrollY > 10);
        };

        window.addEventListener("scroll", handleScroll);

        return () => {
            window.removeEventListener("storage", updateCount);
            window.removeEventListener("cart-updated", updateCount);
            window.removeEventListener("scroll", handleScroll);
        };
    }, []);

    // Separar o nome para o estilo da logo (Ex: League Sports -> League e Sports)
    const { first, second } = splitStoreName(storeInfo.storeName);

    return (
        <header
            className={`sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b transition-shadow duration-300 ${scrolled ? "shadow-md border-neutral-200" : "border-neutral-100"
                }`}
        >
            <div className="container mx-auto flex h-20 items-center justify-between px-4 md:px-6 lg:px-8">
                {/* Logo Dinâmica */}
                <Link href="/" className="flex items-center gap-3 group">
                    {isLoading ? (
                        <div className="h-8 w-48 bg-neutral-200 animate-pulse rounded" />
                    ) : storeInfo.logoUrl ? (
                        <div className="relative h-14 md:h-20 w-auto max-w-[150px] md:max-w-none">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={storeInfo.logoUrl}
                                alt={storeInfo.storeName}
                                className="h-full w-auto object-contain"
                            />
                        </div>
                    ) : (
                        <div className="text-3xl md:text-4xl font-heading font-bold text-primary uppercase tracking-tighter transition-colors">
                            {first}{second && <span className="text-accent">{second}</span>}
                        </div>
                    )}
                </Link>

                {/* Navigation */}
                <nav className="hidden md:flex items-center gap-8">
                    {isLoading ? (
                        <>
                            <div className="h-5 w-16 bg-neutral-200 animate-pulse rounded" />
                            <div className="h-5 w-20 bg-neutral-200 animate-pulse rounded" />
                            <div className="h-5 w-24 bg-neutral-200 animate-pulse rounded" />
                            <div className="h-5 w-16 bg-neutral-200 animate-pulse rounded" />
                        </>
                    ) : (
                        <>
                            <Link
                                href="/"
                                className="font-body font-medium text-neutral-900 hover:text-primary transition-colors"
                            >
                                Início
                            </Link>
                            <Link
                                href="/produtos"
                                className="font-body font-medium text-neutral-900 hover:text-primary transition-colors"
                            >
                                Produtos
                            </Link>
                            {categories.map((category) => (
                                <Link
                                    key={category.id}
                                    href={`/produtos?category=${category.slug}`}
                                    className="font-body font-medium text-neutral-900 hover:text-primary transition-colors"
                                >
                                    {capitalizeFirstLetter(category.name)}
                                </Link>
                            ))}
                        </>
                    )}
                </nav>

                {/* Cart Button */}
                <Link
                    href="/carrinho"
                    className="relative flex items-center gap-3 rounded-lg bg-primary px-6 py-3 font-body font-semibold text-white hover:bg-primary-dark transition-all hover:scale-105 hover:shadow-lg cursor-pointer"
                >
                    <ShoppingCart className="h-5 w-5" />
                    <span className="hidden sm:inline">Carrinho</span>
                    {cartCount > 0 && (
                        <span className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-accent text-xs font-bold text-white shadow-md animate-pulse">
                            {cartCount}
                        </span>
                    )}
                </Link>
            </div>
        </header>
    );
}
