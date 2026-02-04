"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LayoutDashboard, Package, ShoppingBag, LogOut, Tags, Settings, Home, MessageCircle, Hash, HelpCircle, X, ClipboardList } from "lucide-react";
import { signOut } from "next-auth/react";

const navItems = [
    {
        href: "/admin",
        label: "Dashboard",
        icon: LayoutDashboard,
    },
    {
        href: "/admin/home",
        label: "Home",
        icon: Home,
    },
    {
        href: "/admin/pedidos",
        label: "Pedidos",
        icon: ClipboardList,
    },
    {
        href: "/admin/produtos",
        label: "Produtos",
        icon: Package,
    },
    {
        href: "/admin/perguntas",
        label: "Perguntas",
        icon: MessageCircle,
    },
    {
        href: "/admin/categorias",
        label: "Categorias",
        icon: Tags,
    },
    {
        href: "/admin/subcategorias",
        label: "Subcategorias",
        icon: Hash,
    },
    {
        href: "/admin/marcas",
        label: "Marcas",
        icon: Tags,
    },
    {
        href: "/admin/modelos",
        label: "Modelos",
        icon: ShoppingBag,
    },
    {
        href: "/admin/ajuda",
        label: "Ajuda & Status",
        icon: HelpCircle,
    },
    {
        href: "/admin/configuracoes",
        label: "Configurações",
        icon: Settings,
    },
];

interface SidebarProps {
    isOpen?: boolean;
    onClose?: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
    const pathname = usePathname();
    const router = useRouter();
    const [storeName, setStoreName] = useState("Carregando...");

    useEffect(() => {
        const fetchConfig = () => {
            fetch("/api/config")
                .then(res => res.json())
                .then(data => {
                    setStoreName(data.storeName || "Loja Virtual");
                })
                .catch(() => setStoreName("Loja Virtual"));
        };

        fetchConfig();
    }, []);

    const handleLogout = async () => {
        await signOut({ callbackUrl: "/admin/login" });
    };

    return (
        <aside
            className={`
                fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-neutral-200 h-screen flex flex-col transition-transform duration-300 ease-in-out
                lg:translate-x-0 lg:fixed lg:z-40
                ${isOpen ? "translate-x-0 shadow-xl" : "-translate-x-full"}
            `}
        >
            {/* Logo */}
            <div className="p-6 border-b border-neutral-200 relative">
                {/* Close Button Mobile */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-1 text-neutral-400 hover:text-red-500 lg:hidden"
                >
                    <X className="w-5 h-5" />
                </button>

                <Link href="/admin" className="block">
                    <div className="text-3xl font-heading font-bold text-primary uppercase tracking-tighter truncate">
                        {storeName}
                    </div>
                    <p className="text-xs text-neutral-600 font-body mt-1">Painel Admin</p>
                </Link>

                {/* Botão Voltar para Loja */}
                <Link
                    href="/"
                    className="mt-4 flex items-center gap-2 text-sm font-body text-neutral-600 hover:text-primary transition-colors"
                >
                    <Home className="w-4 h-4" />
                    Voltar para Loja
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => onClose?.()} // Close sidebar on nav click (mobile)
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg font-body font-medium transition-all ${isActive
                                ? "bg-primary text-white shadow-md"
                                : "text-neutral-700 hover:bg-neutral-100"
                                }`}
                        >
                            <Icon className="w-5 h-5" />
                            {item.label}
                        </Link>
                    );
                })}
            </nav>

            {/* Logout Button */}
            <div className="p-4 border-t border-neutral-200">
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg font-body font-medium text-red-600 hover:bg-red-50 transition-all"
                >
                    <LogOut className="w-5 h-5" />
                    Sair
                </button>
            </div>
        </aside >
    );
}
