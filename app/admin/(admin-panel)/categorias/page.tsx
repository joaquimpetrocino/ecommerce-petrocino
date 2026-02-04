"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Edit, Trash2, Check, X, Info, ArrowRight, CheckSquare, Square, Eye, EyeOff } from "lucide-react";
import type { Category } from "@/lib/admin/categories";
import { toast } from "sonner";
import { AlertDialog } from "@/components/ui/alert-dialog";
import { Modal } from "@/components/ui/modal";

export default function CategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isActionLoading, setIsActionLoading] = useState(false);

    // Filtros
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState<string>("all");

    // Bulk Selection State
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    // Alert Dialog state
    const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; ids: string[] }>({
        isOpen: false,
        ids: []
    });

    const [formData, setFormData] = useState({
        name: "",
        slug: "",
        description: "",
        active: true,
        showInNavbar: true,
        image: ""
    });

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        const res = await fetch(`/api/admin/categories`); // Unified API
        const data = await res.json();
        // Filtrar apenas principais
        setCategories(data.filter((c: Category) => !c.parentId));
    };

    // Bulk Actions Handlers
    const toggleSelectAll = () => {
        if (selectedIds.length === filteredCategories.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(filteredCategories.map(c => c.id));
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

        setIsLoading(true);
        try {
            await Promise.all(deleteDialog.ids.map(id =>
                fetch(`/api/admin/categories/${id}`, { method: "DELETE" })
            ));

            toast.success(`${deleteDialog.ids.length} categoria(s) excluída(s) com sucesso!`);
            setCategories(categories.filter((c) => !deleteDialog.ids.includes(c.id)));
            setSelectedIds([]);
        } catch (error) {
            console.error("Erro ao excluir categorias:", error);
            toast.error("Erro ao excluir algumas categorias.");
        } finally {
            setIsLoading(false);
            setDeleteDialog({ isOpen: false, ids: [] });
        }
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

            setCategories(categories.map(c =>
                selectedIds.includes(c.id) ? { ...c, active: status } : c
            ));

            toast.success(`Status atualizado para ${selectedIds.length} categorias!`);
            setSelectedIds([]);
        } catch (error) {
            console.error("Erro ao atualizar status:", error);
            toast.error("Erro ao atualizar status.");
        } finally {
            setIsActionLoading(false);
        }
    }

    const filteredCategories = categories.filter((c) => {
        const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === "all" ? true : (filterStatus === "active" ? c.active : !c.active);
        return matchesSearch && matchesStatus;
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        if (formData.showInNavbar) {
            const currentNavbarCount = categories.filter(c => c.showInNavbar && c.id !== editingId).length;
            if (currentNavbarCount >= 3) {
                toast.error("Limite atingido! Você só pode exibir no máximo 3 categorias no menu superior.");
                setIsLoading(false);
                return;
            }
        }

        const payload = {
            ...formData,
            parentId: null,
            // module: "unified" // Not needed or optional now
        };

        try {
            if (editingId) {
                await fetch(`/api/admin/categories/${editingId}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                });
                toast.success("Categoria atualizada com sucesso!");
            } else {
                await fetch("/api/admin/categories", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                });
                toast.success("Categoria criada com sucesso!");
            }

            setShowForm(false);
            setEditingId(null);
            setFormData({ name: "", slug: "", description: "", active: true, showInNavbar: true, image: "" });
            fetchCategories();
        } catch (error) {
            toast.error("Ocorreu um erro ao salvar a categoria.");
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
            image: item.image || ""
        });
        setShowForm(true);
    };

    return (
        <div className="space-y-6 pb-20">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="font-heading font-bold text-neutral-900 text-4xl uppercase tracking-tight">
                        Categorias Principais
                    </h1>
                    <p className="text-neutral-500 font-body mt-1">
                        Gerencie as categorias de nível superior da loja.
                    </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                    <Link href="/admin/subcategorias" className="w-full sm:w-auto">
                        <button className="w-full bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-50 px-6 py-3 rounded-lg font-heading font-bold uppercase transition-all flex items-center justify-center gap-2">
                            Gerenciar Subcategorias <ArrowRight className="w-4 h-4" />
                        </button>
                    </Link>
                    <button
                        onClick={() => {
                            setShowForm(true);
                            setEditingId(null);
                            setFormData({ name: "", slug: "", description: "", active: true, showInNavbar: true, image: "" });
                        }}
                        className="w-full sm:w-auto bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-lg font-heading font-bold uppercase transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                    >
                        <Plus className="w-5 h-5" />
                        Nova Categoria
                    </button>
                </div>
            </div>

            {/* Barra de Filtros */}
            <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-sm flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                    <input
                        type="text"
                        placeholder="Buscar categoria..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-4 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm font-body focus:border-primary outline-none transition-all"
                    />
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="w-full sm:w-auto min-w-[140px] px-4 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm font-body focus:border-primary outline-none transition-all"
                    >
                        <option value="all">Status: Todos</option>
                        <option value="active">Ativos</option>
                        <option value="inactive">Inativos</option>
                    </select>
                </div>
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
                title={editingId ? "Editar Categoria" : "Nova Categoria"}
            >
                <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
                    <div className="space-y-6 overflow-y-auto">
                        <div className="grid gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-body font-medium text-neutral-700 ml-1">Nome</label>
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
                                    placeholder="Ex: Roupas, Acessórios..."
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-body font-medium text-neutral-700 ml-1">Slug</label>
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
                                    Categoria Ativa
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
                                    {selectedIds.length > 0 && selectedIds.length === filteredCategories.length ? (
                                        <CheckSquare className="w-5 h-5 text-primary" />
                                    ) : (
                                        <Square className="w-5 h-5" />
                                    )}
                                </button>
                            </th>
                            <th className="px-6 py-4 font-heading font-bold text-neutral-900 uppercase tracking-wide text-xs w-1/3">Nome</th>
                            <th className="px-6 py-4 font-heading font-bold text-neutral-900 uppercase tracking-wide text-xs">Slug</th>
                            <th className="px-6 py-4 font-heading font-bold text-neutral-900 uppercase tracking-wide text-xs text-center">Menu</th>
                            <th className="px-6 py-4 font-heading font-bold text-neutral-900 uppercase tracking-wide text-xs text-center">Status</th>
                            <th className="px-6 py-4 font-heading font-bold text-neutral-900 uppercase tracking-wide text-xs text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                        {filteredCategories.length === 0 ? (
                            <tr><td colSpan={6} className="px-6 py-20 text-center text-neutral-400 font-body">Nenhuma categoria encontrada com os filtros atuais.</td></tr>
                        ) : filteredCategories.map((cat) => {
                            const isSelected = selectedIds.includes(cat.id);
                            return (
                                <tr key={cat.id} className={`hover:bg-neutral-50 transition-colors group ${isSelected ? "bg-primary/5" : ""}`}>
                                    <td className="px-6 py-4">
                                        <button
                                            onClick={() => toggleSelect(cat.id)}
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
                                            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold">
                                                {cat.name.charAt(0)}
                                            </div>
                                            <p className="font-body font-bold text-neutral-900">{cat.name}</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4"><span className="text-neutral-500 font-body text-sm bg-neutral-100 px-2 py-1 rounded">/{cat.slug}</span></td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex justify-center">{cat.showInNavbar ? <Check className="w-5 h-5 text-green-500" /> : <X className="w-5 h-5 text-neutral-200" />}</div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`inline-flex items-center px-2 py-1 rounded text-[10px] font-bold uppercase ${cat.active ? 'bg-green-100 text-green-700' : 'bg-neutral-100 text-neutral-500'}`}>
                                            {cat.active ? 'Ativo' : 'Inativo'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-end gap-2">
                                            <button onClick={() => handleEdit(cat)} className="p-2 text-neutral-400 hover:text-primary transition-colors hover:bg-primary/5 rounded-lg"><Edit className="w-4 h-4" /></button>
                                            <button onClick={() => setDeleteDialog({ isOpen: true, ids: [cat.id] })} className="p-2 text-neutral-400 hover:text-red-500 transition-colors hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            <AlertDialog
                isOpen={deleteDialog.isOpen}
                onClose={() => setDeleteDialog({ isOpen: false, ids: [] })}
                onConfirm={confirmDelete}
                title={deleteDialog.ids.length > 1 ? "Excluir Categorias?" : "Excluir Categoria?"}
                description={`Tem certeza que deseja remover ${deleteDialog.ids.length > 1 ? "as categorias selecionadas" : "esta categoria"}? Itens vinculados podem ficar órfãos.`}
                confirmText="Sim, excluir"
                cancelText="Cancelar"
                variant="danger"
                isLoading={isLoading}
            />
        </div>
    );
}
