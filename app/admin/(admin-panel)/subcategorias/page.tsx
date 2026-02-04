"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Edit, Trash2, Check, X, Info, ArrowLeft, Filter, Square, CheckSquare, Eye, EyeOff } from "lucide-react";
import type { Category } from "@/lib/admin/categories";
import { toast } from "sonner";
import { AlertDialog } from "@/components/ui/alert-dialog";
import { Modal } from "@/components/ui/modal";
import { MultiSelectSearch } from "@/components/admin/multi-select-search";

export default function SubcategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [subcategories, setSubcategories] = useState<Category[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isActionLoading, setIsActionLoading] = useState(false);
    const [parentFilter, setParentFilter] = useState<string>("all");
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    // Alert Dialog state
    const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; id: string | null; ids?: string[] }>({
        isOpen: false,
        id: null,
        ids: []
    });

    const [formData, setFormData] = useState({
        name: "",
        slug: "",
        description: "",
        active: true,
        showInNavbar: true,
        parentId: "",
        parentIds: [] as string[],
    });

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const res = await fetch(`/api/admin/categories`);
            const data = await res.json();
            const parents = data.filter((c: Category) => !c.parentId);
            const subs = data.filter((c: Category) => c.parentId);
            setCategories(parents);
            setSubcategories(subs);
        } catch (error) {
            console.error("Erro ao carregar categorias:", error);
            toast.error("Erro ao carregar dados.");
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.parentIds.length === 0) {
            toast.error("Você deve selecionar pelo menos uma categoria pai.");
            return;
        }

        setIsLoading(true);

        const payload = {
            ...formData,
            parentId: formData.parentIds[0], // Legacy support
            parentIds: formData.parentIds
        };

        try {
            if (editingId) {
                await fetch(`/api/admin/categories/${editingId}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                });
                toast.success("Subcategoria atualizada com sucesso!");
            } else {
                await fetch("/api/admin/categories", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                });
                toast.success("Subcategoria criada com sucesso!");
            }

            setShowForm(false);
            setEditingId(null);
            setFormData({ name: "", slug: "", description: "", active: true, showInNavbar: true, parentId: "", parentIds: [] });
            fetchCategories();
        } catch (error) {
            toast.error("Ocorreu um erro ao salvar a subcategoria.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleEdit = (item: Category) => {
        setEditingId(item.id);
        setFormData({
            name: item.name,
            slug: item.slug,
            description: item.description || "",
            active: item.active,
            showInNavbar: item.showInNavbar,
            parentId: item.parentId || "",
            parentIds: item.parentIds || (item.parentId ? [item.parentId] : []),
        });
        setShowForm(true);
    };

    const toggleSelectAll = () => {
        if (selectedIds.length === filteredSubcategories.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(filteredSubcategories.map(s => s.id));
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
        setDeleteDialog({ isOpen: true, id: null, ids: selectedIds });
    };

    const handleBulkToggleActive = async (status: boolean) => {
        if (selectedIds.length === 0) return;

        setIsActionLoading(true);
        try {
            await Promise.all(selectedIds.map(id =>
                fetch(`/api/admin/categories/${id}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ active: status })
                })
            ));

            setSubcategories(subcategories.map(s =>
                selectedIds.includes(s.id) ? { ...s, active: status } : s
            ));

            toast.success(`Status atualizado para ${selectedIds.length} subcategorias!`);
            setSelectedIds([]);
        } catch (error) {
            console.error("Erro ao atualizar status:", error);
            toast.error("Erro ao atualizar status.");
        } finally {
            setIsActionLoading(false);
        }
    };

    const confirmDelete = async () => {
        setIsLoading(true);
        try {
            if (deleteDialog.ids && deleteDialog.ids.length > 0) {
                await Promise.all(deleteDialog.ids.map(id =>
                    fetch(`/api/admin/categories/${id}`, { method: "DELETE" })
                ));
                setSubcategories(subcategories.filter(s => !deleteDialog.ids!.includes(s.id)));
                toast.success(`${deleteDialog.ids.length} subcategorias excluídas!`);
                setSelectedIds([]);
            } else if (deleteDialog.id) {
                const res = await fetch(`/api/admin/categories/${deleteDialog.id}`, { method: "DELETE" });
                const data = await res.json();
                if (res.ok) {
                    toast.success("Subcategoria excluída com sucesso!");
                    setSubcategories(subcategories.filter(s => s.id !== deleteDialog.id));
                    fetchCategories();
                } else {
                    toast.error(data.error || "Erro ao excluir subcategoria.");
                }
            }
        } catch (error) {
            toast.error("Erro de conexão ao excluir.");
        } finally {
            setIsLoading(false);
            setDeleteDialog({ isOpen: false, id: null, ids: [] });
        }
    };

    const handleDelete = (id: string) => {
        setDeleteDialog({ isOpen: true, id });
    };

    const getParentNames = (sub: Category) => {
        if (sub.parentIds && sub.parentIds.length > 0) {
            return sub.parentIds.map(id => {
                const parent = categories.find(c => c.id === id);
                return parent ? parent.name : "Desconhecida";
            }).join(", ");
        }
        if (sub.parentId) {
            const parent = categories.find(c => c.id === sub.parentId);
            return parent ? parent.name : "Desconhecida";
        }
        return "-";
    };

    const filteredSubcategories = parentFilter === "all"
        ? subcategories
        : subcategories.filter(s =>
            (s.parentIds && s.parentIds.includes(parentFilter)) ||
            s.parentId === parentFilter
        );

    return (
        <div className="space-y-6 pb-20">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="font-heading font-bold text-neutral-900 text-4xl uppercase tracking-tight">
                        Subcategorias
                    </h1>
                    <p className="text-neutral-500 font-body mt-1">
                        Gerencie as subcategorias vinculadas às categorias principais.
                    </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                    <Link href="/admin/categorias" className="w-full sm:w-auto">
                        <button className="w-full bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-50 px-6 py-3 rounded-lg font-heading font-bold uppercase transition-all flex items-center justify-center gap-2">
                            <ArrowLeft className="w-4 h-4" /> Voltar para Categorias
                        </button>
                    </Link>
                    <button
                        onClick={() => {
                            setShowForm(true);
                            setEditingId(null);
                            setFormData({ name: "", slug: "", description: "", active: true, showInNavbar: true, parentId: "", parentIds: [] });
                        }}
                        className="w-full sm:w-auto bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-lg font-heading font-bold uppercase transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                    >
                        <Plus className="w-5 h-5" />
                        Nova Subcategoria
                    </button>
                </div>
            </div>

            {/* Filtros */}
            <div className="flex flex-wrap items-center gap-4 bg-white p-4 rounded-xl border border-neutral-200 shadow-sm">
                <div className="flex items-center gap-2 text-neutral-500 font-bold uppercase text-[10px] sm:text-xs shrink-0">
                    <Filter className="w-4 h-4" /> Filtrar por:
                </div>
                <select
                    value={parentFilter}
                    onChange={(e) => setParentFilter(e.target.value)}
                    className="flex-1 min-w-[200px] sm:flex-none px-4 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm font-body focus:outline-none focus:border-primary transition-colors"
                >
                    <option value="all">Todas as Categorias Pais</option>
                    {categories.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                </select>
            </div>

            {selectedIds.length > 0 && (
                <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg flex flex-wrap items-center justify-between gap-4 animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-center gap-2">
                        <span className="bg-primary text-white text-xs font-bold px-2 py-1 rounded-full">{selectedIds.length}</span>
                        <span className="text-sm font-medium text-primary-dark">item(s) selecionado(s)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => handleBulkToggleActive(true)}
                            disabled={isActionLoading}
                            className="flex items-center gap-1 px-3 py-2 bg-white border border-neutral-200 text-neutral-700 hover:text-green-600 hover:border-green-200 rounded-lg text-sm font-medium transition-colors"
                        >
                            <Eye className="w-4 h-4" /> Ativar
                        </button>
                        <button
                            onClick={() => handleBulkToggleActive(false)}
                            disabled={isActionLoading}
                            className="flex items-center gap-1 px-3 py-2 bg-white border border-neutral-200 text-neutral-700 hover:text-neutral-900 rounded-lg text-sm font-medium transition-colors"
                        >
                            <EyeOff className="w-4 h-4" /> Desativar
                        </button>
                        <div className="h-6 w-px bg-neutral-300 mx-2"></div>
                        <button
                            onClick={handleBulkDelete}
                            disabled={isActionLoading}
                            className="flex items-center gap-1 px-3 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-sm font-medium transition-colors"
                        >
                            <Trash2 className="w-4 h-4" /> Excluir
                        </button>
                    </div>
                </div>
            )}

            {/* Form Modal */}
            <Modal
                isOpen={showForm}
                onClose={() => setShowForm(false)}
                title={editingId ? "Editar Subcategoria" : "Nova Subcategoria"}
            >
                <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
                    <div className="space-y-6 overflow-y-auto">
                        <div className="bg-primary/5 p-4 rounded-lg border border-primary/10 space-y-3">
                            <div className="flex items-center gap-2 text-primary font-heading font-bold text-xs uppercase">
                                <Info className="w-4 h-4" /> Vinculação (Obrigatório)
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-body font-medium text-neutral-500 ml-1">Categoria Pai *</label>
                                <MultiSelectSearch
                                    options={categories.map(c => ({ label: c.name, value: c.id }))}
                                    value={formData.parentIds}
                                    onChange={(val) => setFormData({ ...formData, parentIds: val })}
                                    placeholder="Selecione as Categorias Pai..."
                                />
                            </div>
                        </div>

                        <div className="grid gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-body font-medium text-neutral-500 ml-1">Nome da Subcategoria</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    autoFocus
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        setFormData(prev => ({
                                            ...prev, name: val,
                                            slug: editingId ? prev.slug : val.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")
                                        }));
                                    }}
                                    className="w-full px-5 py-4 border border-neutral-200 rounded-lg font-body focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                                    placeholder="Ex: Futebol de Campo, Camisas..."
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-body font-medium text-neutral-500 ml-1">Slug</label>
                                <input
                                    type="text"
                                    value={formData.slug}
                                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                    className="w-full px-5 py-4 border border-neutral-200 rounded-lg font-body focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all bg-neutral-50/50"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-4 pt-4 border-t border-neutral-100">
                            <div className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    id="showInNavbar"
                                    checked={formData.showInNavbar}
                                    onChange={(e) => setFormData({ ...formData, showInNavbar: e.target.checked })}
                                    className="w-5 h-5 text-primary focus:ring-primary border-neutral-300 rounded transition-all cursor-pointer"
                                />
                                <label htmlFor="showInNavbar" className="text-sm font-body font-medium text-neutral-700 select-none cursor-pointer hover:text-primary transition-colors">
                                    Exibir no Menu Principal
                                </label>
                            </div>
                            <div className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    id="active"
                                    checked={formData.active}
                                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                                    className="w-5 h-5 text-primary focus:ring-primary border-neutral-300 rounded transition-all cursor-pointer"
                                />
                                <label htmlFor="active" className="text-sm font-body font-medium text-neutral-700 select-none cursor-pointer hover:text-primary transition-colors">
                                    Subcategoria Ativa
                                </label>
                            </div>
                        </div>
                    </div>
                    <div className="pt-6 mt-4 flex items-center justify-end gap-3 shrink-0">
                        <button type="submit" disabled={isLoading} className="w-full bg-primary hover:bg-primary-dark text-white px-8 py-3 rounded-lg font-heading font-bold uppercase transition-all shadow-lg shadow-primary/20 disabled:opacity-50">
                            {isLoading ? "Salvando..." : (editingId ? "Salvar" : "Criar")}
                        </button>
                    </div>
                </form>
            </Modal>

            <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-sm">
                <table className="w-full">
                    <thead className="bg-neutral-50 border-b border-neutral-200 text-left">
                        <tr>
                            <th className="w-12 px-6 py-4 text-left">
                                <button
                                    onClick={toggleSelectAll}
                                    className="text-neutral-400 hover:text-primary transition-colors"
                                >
                                    {selectedIds.length > 0 && selectedIds.length === filteredSubcategories.length ? (
                                        <CheckSquare className="w-5 h-5 text-primary" />
                                    ) : (
                                        <Square className="w-5 h-5" />
                                    )}
                                </button>
                            </th>
                            <th className="px-6 py-4 font-heading font-bold text-neutral-900 uppercase tracking-wide text-xs w-1/4">Nome</th>
                            <th className="px-6 py-4 font-heading font-bold text-neutral-900 uppercase tracking-wide text-xs w-1/4">Categoria Pai</th>
                            <th className="px-6 py-4 font-heading font-bold text-neutral-900 uppercase tracking-wide text-xs">Slug</th>
                            <th className="px-6 py-4 font-heading font-bold text-neutral-900 uppercase tracking-wide text-xs text-center">Menu</th>
                            <th className="px-6 py-4 font-heading font-bold text-neutral-900 uppercase tracking-wide text-xs text-center">Status</th>
                            <th className="px-6 py-4 font-heading font-bold text-neutral-900 uppercase tracking-wide text-xs text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                        {filteredSubcategories.length === 0 ? (
                            <tr><td colSpan={7} className="px-6 py-20 text-center text-neutral-400 font-body">Nenhuma subcategoria encontrada.</td></tr>
                        ) : filteredSubcategories.map((sub) => {
                            const isSelected = selectedIds.includes(sub.id);
                            return (
                                <tr key={sub.id} className={`hover:bg-neutral-50 transition-colors group ${isSelected ? "bg-primary/5" : ""}`}>
                                    <td className="px-6 py-4">
                                        <button
                                            onClick={() => toggleSelect(sub.id)}
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
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-primary/5 text-primary flex items-center justify-center font-bold text-sm">
                                                {sub.name.charAt(0)}
                                            </div>
                                            <p className="font-body font-bold text-neutral-900">{sub.name}</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center px-2 py-1 rounded-md bg-neutral-100 text-neutral-600 text-xs font-bold uppercase">
                                            {getParentNames(sub)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4"><span className="text-neutral-500 font-body text-sm bg-neutral-100 px-2 py-1 rounded">/{sub.slug}</span></td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex justify-center">{sub.showInNavbar ? <Check className="w-5 h-5 text-green-500" /> : <X className="w-5 h-5 text-neutral-200" />}</div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`inline-flex items-center px-2 py-1 rounded text-[10px] font-bold uppercase ${sub.active ? 'bg-green-100 text-green-700' : 'bg-neutral-100 text-neutral-500'}`}>
                                            {sub.active ? 'Ativo' : 'Inativo'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-end gap-2">
                                            <button onClick={() => handleEdit(sub)} className="p-2 text-neutral-400 hover:text-primary transition-colors hover:bg-primary/5 rounded-lg"><Edit className="w-4 h-4" /></button>
                                            <button onClick={() => handleDelete(sub.id)} className="p-2 text-neutral-400 hover:text-red-500 transition-colors hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                                        </div>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>

            <AlertDialog
                isOpen={deleteDialog.isOpen}
                onClose={() => setDeleteDialog({ isOpen: false, id: null })}
                onConfirm={confirmDelete}
                title="Excluir Subcategoria?"
                description="Certifique-se de que não existem produtos vinculados a esta subcategoria antes de excluí-la."
                confirmText="Sim, excluir"
                cancelText="Cancelar"
                variant="danger"
                isLoading={isLoading}
            />
        </div>
    );
}
