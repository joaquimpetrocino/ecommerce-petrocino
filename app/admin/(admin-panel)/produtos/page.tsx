"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Product } from "@/types";
import { formatPrice } from "@/lib/utils";
import { StoreModule } from "@/types";
import { toast } from "sonner";
import { AlertDialog } from "@/components/ui/alert-dialog";


function ProductImage({ src, alt }: { src?: string, alt: string }) {
    const [imgSrc, setImgSrc] = useState(src || "/images/placeholder.png");

    useEffect(() => {
        setImgSrc(src || "/images/placeholder.png");
    }, [src]);

    return (
        <Image
            src={imgSrc}
            alt={alt}
            fill
            className="object-cover"
            onError={() => setImgSrc("/images/placeholder.png")}
        />
    );
}

export default function AdminProductsPage() {
    const [currentModule, setCurrentModule] = useState<StoreModule>("sports");
    const [moduleName, setModuleName] = useState("Carregando...");

    useEffect(() => {
        fetch("/api/config")
            .then(res => res.json())
            .then(data => {
                setCurrentModule(data.module);
                setModuleName(data.module === "sports" ? "Artigos Esportivos" : "Peças Automotivas");
            });
    }, []);

    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
    const [isActionLoading, setIsActionLoading] = useState(false);

    // Debounce para o search
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 500);

        return () => clearTimeout(handler);
    }, [searchTerm]);
    const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; id: string | null }>({
        isOpen: false,
        id: null
    });

    useEffect(() => {
        if (moduleName !== "Carregando...") {
            fetchProducts();
        }
    }, [currentModule, moduleName]);

    const fetchProducts = async () => {
        try {
            const res = await fetch(`/api/admin/products?module=${currentModule}`);
            if (res.ok) {
                const data = await res.json();
                setProducts(data);
            }
        } catch (error) {
            console.error("Erro ao carregar produtos:", error);
        } finally {
            setLoading(false);
        }
    };

    const confirmDelete = async () => {
        if (!deleteDialog.id) return;

        setIsActionLoading(true);
        try {
            const res = await fetch(`/api/admin/products/${deleteDialog.id}`, {
                method: "DELETE",
            });

            if (res.ok) {
                setProducts(products.filter((p) => p.id !== deleteDialog.id));
                toast.success("Produto removido com sucesso!");
            } else {
                toast.error("Erro ao tentar excluir o produto. Tente novamente.");
            }
        } catch (error) {
            console.error("Erro ao excluir produto:", error);
            toast.error("Erro de conexão ao tentar excluir.");
        } finally {
            setIsActionLoading(false);
            setDeleteDialog({ isOpen: false, id: null });
        }
    };

    const handleDelete = (id: string) => {
        setDeleteDialog({ isOpen: true, id });
    };

    const filteredProducts = products.filter((p) =>
        p.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="text-neutral-600 font-body">Carregando produtos...</p>
            </div>
        );
    }

    return (
        <div>
            {/* Indicador de Módulo */}

            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="font-heading font-bold text-neutral-900 text-4xl uppercase tracking-tight">
                        Produtos
                    </h1>
                    <p className="text-neutral-600 font-body mt-1">
                        {products.length} {products.length === 1 ? "produto" : "produtos"} cadastrados
                    </p>
                </div>
                <Link href="/admin/produtos/novo">
                    <button className="bg-accent hover:bg-accent-dark text-white px-6 py-3 rounded-lg font-body font-semibold transition-all hover:scale-105 hover:shadow-lg cursor-pointer flex items-center gap-2">
                        <Plus className="w-5 h-5" />
                        Novo Produto
                    </button>
                </Link>
            </div>

            {/* Search */}
            <div className="mb-6">
                <input
                    type="text"
                    placeholder="Buscar por nome..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full max-w-md px-4 py-3 border border-neutral-300 rounded-lg font-body focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                />
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
                <table className="w-full">
                    <thead className="bg-neutral-50 border-b border-neutral-200">
                        <tr>
                            <th className="text-left px-6 py-4 font-heading font-bold text-neutral-900 uppercase tracking-wide text-sm">
                                Imagem
                            </th>
                            <th className="text-left px-6 py-4 font-heading font-bold text-neutral-900 uppercase tracking-wide text-sm">
                                Nome
                            </th>
                            <th className="text-left px-6 py-4 font-heading font-bold text-neutral-900 uppercase tracking-wide text-sm">
                                Categoria
                            </th>
                            <th className="text-left px-6 py-4 font-heading font-bold text-neutral-900 uppercase tracking-wide text-sm">
                                Preço
                            </th>
                            <th className="text-left px-6 py-4 font-heading font-bold text-neutral-900 uppercase tracking-wide text-sm">
                                Estoque
                            </th>
                            <th className="text-right px-6 py-4 font-heading font-bold text-neutral-900 uppercase tracking-wide text-sm">
                                Ações
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredProducts.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-neutral-500 font-body">
                                    Nenhum produto encontrado
                                </td>
                            </tr>
                        ) : (
                            filteredProducts.map((product) => {
                                const totalStock = product.variants.reduce((sum, v) => sum + v.stock, 0);

                                return (
                                    <tr key={product.id} className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="w-16 h-16 bg-neutral-100 rounded-lg overflow-hidden relative">
                                                <ProductImage src={product.images?.[0]} alt={product.name} />
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="font-body font-semibold text-neutral-900">{product.name}</p>
                                            <p className="text-sm text-neutral-500 font-body">{product.slug}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-block bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-body font-medium">
                                                {product.category}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="font-heading font-bold text-accent text-lg">
                                                {formatPrice(product.price)}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="font-body text-neutral-900">{totalStock} unidades</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link href={`/admin/produtos/${product.id}/editar`}>
                                                    <button className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors">
                                                        <Pencil className="w-5 h-5" />
                                                    </button>
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(product.id)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            <AlertDialog
                isOpen={deleteDialog.isOpen}
                onClose={() => setDeleteDialog({ isOpen: false, id: null })}
                onConfirm={confirmDelete}
                title="Excluir Produto?"
                description="Tem certeza que deseja remover este produto definitivamente? Esta ação não pode ser desfeita."
                confirmText="Sim, excluir"
                cancelText="Cancelar"
                variant="danger"
                isLoading={isActionLoading}
            />
        </div>
    );
}
