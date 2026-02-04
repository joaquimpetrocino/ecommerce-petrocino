"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { Plus, Pencil, Trash2, CheckSquare, Square, Eye, EyeOff, Filter, X } from "lucide-react";
import { Product } from "@/types";
import { formatPrice } from "@/lib/utils";
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
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
    const [isActionLoading, setIsActionLoading] = useState(false);

    // Filtros Adicionais
    const [filterStatus, setFilterStatus] = useState<string>("all");
    const [filterCategory, setFilterCategory] = useState<string>("all");
    const [filterBrand, setFilterBrand] = useState<string>("all");
    const [filterInventory, setFilterInventory] = useState<string>("all");

    // Metadados para filtros
    const [categories, setCategories] = useState<{ id: string, name: string }[]>([]);
    const [brands, setBrands] = useState<{ id: string, name: string }[]>([]);

    // Bulk Selection State
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    // Debounce para o search
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 500);

        return () => clearTimeout(handler);
    }, [searchTerm]);

    const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; ids: string[] }>({
        isOpen: false,
        ids: []
    });

    useEffect(() => {
        fetchProducts();
        fetchMetadata();
    }, []);

    const fetchMetadata = async () => {
        try {
            const [catRes, brandRes] = await Promise.all([
                fetch("/api/admin/categories"),
                fetch("/api/admin/brands")
            ]);
            if (catRes.ok) setCategories(await catRes.json());
            if (brandRes.ok) setBrands(await brandRes.json());
        } catch (error) {
            console.error("Erro ao carregar metadados para filtros:", error);
        }
    };

    const fetchProducts = async () => {
        try {
            const res = await fetch(`/api/admin/products`);
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

    // Bulk Actions Handlers
    const toggleSelectAll = () => {
        if (selectedIds.length === filteredProducts.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(filteredProducts.map(p => p.id));
        }
    };

    const toggleSelect = (id: string) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter(sid => sid !== id));
        } else {
            setSelectedIds([...selectedIds, id]);
        }
    };

    const handleBulkDelete = () => {
        if (selectedIds.length === 0) return;
        setDeleteDialog({ isOpen: true, ids: selectedIds });
    };

    const confirmDelete = async () => {
        if (deleteDialog.ids.length === 0) return;

        setIsActionLoading(true);
        try {
            const res = await fetch("/api/admin/products/bulk-actions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "delete", ids: deleteDialog.ids })
            });

            if (!res.ok) throw new Error("Falha na exclusão em massa");

            setProducts(products.filter((p) => !deleteDialog.ids.includes(p.id)));
            setSelectedIds([]);
            toast.success(`${deleteDialog.ids.length} produto(s) removido(s)!`);
        } catch (error) {
            console.error("Erro ao excluir produtos:", error);
            toast.error("Erro ao excluir alguns produtos.");
        } finally {
            setIsActionLoading(false);
            setDeleteDialog({ isOpen: false, ids: [] });
        }
    };

    const handleBulkToggleActive = async (status: boolean) => {
        if (selectedIds.length === 0) return;

        // Prevenção extra contra cliques duplos
        if (isActionLoading) return;

        setIsActionLoading(true);
        try {
            const action = status ? "activate" : "deactivate";
            const res = await fetch("/api/admin/products/bulk-actions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action, ids: selectedIds })
            });

            if (!res.ok) throw new Error("Falha na atualização em massa");

            // Update local state otimista ou baseado no sucesso
            setProducts(products.map(p =>
                selectedIds.includes(p.id) ? { ...p, active: status } : p
            ));

            toast.success(`Status atualizado para ${selectedIds.length} produtos!`);
            setSelectedIds([]);
        } catch (error) {
            console.error("Erro ao atualizar status:", error);
            toast.error("Erro ao atualizar status.");
        } finally {
            setIsActionLoading(false);
        }
    }

    const filteredProducts = products.filter((p) => {
        const matchesSearch = p.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase());
        const matchesStatus = filterStatus === "all" ? true : (filterStatus === "active" ? p.active : !p.active);
        const matchesCategory = filterCategory === "all" ? true : p.category === filterCategory;
        const matchesBrand = filterBrand === "all" ? true : p.brandId === filterBrand;

        const totalStock = p.variants.reduce((sum, v) => sum + v.stock, 0);
        const matchesInventory = filterInventory === "all" ? true :
            filterInventory === "out" ? totalStock === 0 :
                filterInventory === "low" ? (totalStock > 0 && totalStock <= 10) :
                    totalStock > 0;

        return matchesSearch && matchesStatus && matchesCategory && matchesBrand && matchesInventory;
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="text-neutral-600 font-body">Carregando produtos...</p>
            </div>
        );
    }

    return (
        <div>
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="font-heading font-bold text-neutral-900 text-4xl uppercase tracking-tight">
                        Produtos
                    </h1>
                    <p className="text-neutral-600 font-body mt-1">
                        {products.length} {products.length === 1 ? "produto" : "produtos"} cadastrados
                    </p>
                </div>
                <Link href="/admin/produtos/novo">
                    <button className="w-full md:w-auto bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-lg font-body font-semibold transition-all hover:scale-105 hover:shadow-lg cursor-pointer flex items-center justify-center gap-2">
                        <Plus className="w-5 h-5" />
                        Novo Produto
                    </button>
                </Link>
            </div>

            {/* Filtros Avançados */}
            <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-sm mb-6 space-y-4">
                <div className="flex items-center gap-2 text-primary font-heading font-bold uppercase text-xs tracking-wider mb-2">
                    <Filter className="w-4 h-4" /> Filtros Avançados
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                    {/* Busca por Nome */}
                    <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-neutral-400 ml-1">Buscar Nome</label>
                        <input
                            type="text"
                            placeholder="Ex: Camisa..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-4 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm font-body focus:border-primary outline-none transition-all"
                        />
                    </div>



                    {/* Filtro por Categoria */}
                    <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-neutral-400 ml-1">Categoria</label>
                        <select
                            value={filterCategory}
                            onChange={(e) => setFilterCategory(e.target.value)}
                            className="w-full px-4 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm font-body focus:border-primary outline-none transition-all"
                        >
                            <option value="all">Todas Categorias</option>
                            {categories.map(cat => (
                                <option key={cat.id} value={(cat as any).slug || cat.id}>{cat.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Filtro por Marca */}
                    <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-neutral-400 ml-1">Marca</label>
                        <select
                            value={filterBrand}
                            onChange={(e) => setFilterBrand(e.target.value)}
                            className="w-full px-4 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm font-body focus:border-primary outline-none transition-all"
                        >
                            <option value="all">Todas Marcas</option>
                            {brands.map(brand => (
                                <option key={brand.id} value={brand.id}>{brand.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Filtro por Status */}
                    <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-neutral-400 ml-1">Status</label>
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="w-full px-4 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm font-body focus:border-primary outline-none transition-all"
                        >
                            <option value="all">Todos Status</option>
                            <option value="active">Ativos</option>
                            <option value="inactive">Inativos</option>
                        </select>
                    </div>

                    {/* Filtro por Estoque */}
                    <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-neutral-400 ml-1">Estoque</label>
                        <select
                            value={filterInventory}
                            onChange={(e) => setFilterInventory(e.target.value)}
                            className="w-full px-4 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm font-body focus:border-primary outline-none transition-all"
                        >
                            <option value="all">Todo Estoque</option>
                            <option value="in">Em Estoque</option>
                            <option value="low">Baixo Estoque (≤10)</option>
                            <option value="out">Esgotado</option>
                        </select>
                    </div>
                </div>

                {/* Botão de Limpar Filtros (só aparece se houver filtros ativos) */}
                {(filterStatus !== "all" || filterCategory !== "all" || filterBrand !== "all" || filterInventory !== "all" || searchTerm !== "") && (
                    <div className="flex justify-end pt-2">
                        <button
                            onClick={() => {
                                setFilterStatus("all");
                                setFilterCategory("all");
                                setFilterBrand("all");
                                setFilterInventory("all");
                                setSearchTerm("");
                            }}
                            className="text-xs font-bold text-neutral-400 hover:text-primary transition-colors flex items-center gap-1"
                        >
                            <X className="w-3 h-3" /> Limpar Filtros
                        </button>
                    </div>
                )}
            </div>

            {/* Bulk Actions Toolbar */}
            {selectedIds.length > 0 && (
                <div className="mb-6 p-4 bg-primary/5 border border-primary/20 rounded-lg flex flex-wrap items-center justify-between gap-4 animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-center gap-2">
                        <span className="bg-primary text-white text-xs font-bold px-2 py-1 rounded-full">{selectedIds.length}</span>
                        <span className="text-sm font-medium text-primary-dark">item(s) selecionado(s)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => handleBulkToggleActive(true)}
                            disabled={isActionLoading}
                            className="flex items-center gap-1 px-3 py-2 bg-white border border-neutral-200 text-neutral-700 hover:text-green-600 hover:border-green-200 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Eye className="w-4 h-4" /> Ativar
                        </button>
                        <button
                            onClick={() => handleBulkToggleActive(false)}
                            disabled={isActionLoading}
                            className="flex items-center gap-1 px-3 py-2 bg-white border border-neutral-200 text-neutral-700 hover:text-neutral-900 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <EyeOff className="w-4 h-4" /> Desativar
                        </button>
                        <div className="h-6 w-px bg-neutral-300 mx-2"></div>
                        <button
                            onClick={handleBulkDelete}
                            disabled={isActionLoading}
                            className="flex items-center gap-1 px-3 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Trash2 className="w-4 h-4" /> Excluir
                        </button>
                    </div>
                </div>
            )}



            {/* Table */}
            <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[900px]">
                        <thead className="bg-neutral-50 border-b border-neutral-200">
                            <tr>
                                <th className="w-12 px-6 py-4 text-left">
                                    <button
                                        onClick={toggleSelectAll}
                                        className="text-neutral-400 hover:text-primary transition-colors"
                                    >
                                        {selectedIds.length > 0 && selectedIds.length === filteredProducts.length ? (
                                            <CheckSquare className="w-5 h-5 text-primary" />
                                        ) : (
                                            <Square className="w-5 h-5" />
                                        )}
                                    </button>
                                </th>
                                <th className="text-left px-6 py-4 font-heading font-bold text-neutral-900 uppercase tracking-wide text-sm">
                                    Imagem
                                </th>
                                <th className="text-left px-6 py-4 font-heading font-bold text-neutral-900 uppercase tracking-wide text-sm">
                                    Nome
                                </th>
                                <th className="text-left px-6 py-4 font-heading font-bold text-neutral-900 uppercase tracking-wide text-sm">
                                    Status
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
                                    <td colSpan={8} className="px-6 py-12 text-center text-neutral-500 font-body">
                                        Nenhum produto encontrado
                                    </td>
                                </tr>
                            ) : (
                                filteredProducts.map((product) => {
                                    const totalStock = product.variants.reduce((sum, v) => sum + v.stock, 0);
                                    const isSelected = selectedIds.includes(product.id);

                                    return (
                                        <tr key={product.id} className={`border-b border-neutral-100 hover:bg-neutral-50 transition-colors ${isSelected ? "bg-primary/5" : ""}`}>
                                            <td className="px-6 py-4">
                                                <button
                                                    onClick={() => toggleSelect(product.id)}
                                                    className="text-neutral-400 hover:text-primary transition-colors"
                                                >
                                                    {isSelected ? (
                                                        <CheckSquare className="w-5 h-5 text-primary" />
                                                    ) : (
                                                        <Square className="w-5 h-5" />
                                                    )}
                                                </button>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="w-12 h-12 bg-neutral-100 rounded-lg overflow-hidden relative border border-neutral-200">
                                                    <ProductImage src={product.images?.[0]} alt={product.name} />
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="font-body font-semibold text-neutral-900 line-clamp-1">{product.name}</p>
                                                <p className="text-xs text-neutral-500 font-body">{product.slug}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                {product.active ? (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Ativo
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-neutral-100 text-neutral-600">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-neutral-400"></span> Inativo
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="inline-block bg-neutral-100 text-neutral-700 px-3 py-1 rounded-full text-xs font-body font-medium">
                                                    {product.category}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="font-heading font-bold text-accent">
                                                    {formatPrice(product.price)}
                                                </p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <p className="font-body text-neutral-900 text-sm">{totalStock} unid.</p>
                                                    {totalStock > 0 && totalStock <= 10 && (
                                                        <span className="text-[10px] font-bold text-orange-600 uppercase">Baixo</span>
                                                    )}
                                                    {totalStock === 0 && (
                                                        <span className="text-[10px] font-bold text-red-600 uppercase">Esgotado</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Link href={`/admin/produtos/${product.id}/editar`}>
                                                        <button className="p-2 text-neutral-500 hover:text-primary hover:bg-neutral-100 rounded-lg transition-colors">
                                                            <Pencil className="w-4 h-4" />
                                                        </button>
                                                    </Link>
                                                    <button
                                                        onClick={() => setDeleteDialog({ isOpen: true, ids: [product.id] })}
                                                        className="p-2 text-neutral-500 hover:text-red-600 hover:bg-neutral-100 rounded-lg transition-colors"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
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
                    onClose={() => setDeleteDialog({ isOpen: false, ids: [] })}
                    onConfirm={confirmDelete}
                    title={deleteDialog.ids.length > 1 ? "Excluir Produtos?" : "Excluir Produto?"}
                    description={`Tem certeza que deseja remover ${deleteDialog.ids.length > 1 ? "estes produtos" : "este produto"} definitivamente? Esta ação não pode ser desfeita.`}
                    confirmText="Sim, excluir"
                    cancelText="Cancelar"
                    variant="danger"
                    isLoading={isActionLoading}
                />
            </div>
        </div>
    );
}
