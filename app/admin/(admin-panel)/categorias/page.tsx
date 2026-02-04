"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Edit, Trash2, Check, X, Info, ArrowRight } from "lucide-react";
import type { Category } from "@/lib/admin/categories";
import { StoreModule } from "@/types";
import { toast } from "sonner";
import { AlertDialog } from "@/components/ui/alert-dialog";
import { Modal } from "@/components/ui/modal";

export default function CategoriesPage() {
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

    const [categories, setCategories] = useState<Category[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Alert Dialog state
    const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; id: string | null }>({
        isOpen: false,
        id: null
    });

    const [formData, setFormData] = useState({
        name: "",
        slug: "",
        description: "",
        active: true,
        showInNavbar: true,
        // parentId: "" // Removido nesta tela
    });

    useEffect(() => {
        if (moduleName !== "Carregando...") {
            fetchCategories();
        }
    }, [currentModule, moduleName]);

    const fetchCategories = async () => {
        const res = await fetch(`/api/admin/categories?module=${currentModule}`);
        const data = await res.json();
        // Filtrar apenas principais
        setCategories(data.filter((c: Category) => !c.parentId));
    };

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
            parentId: null, // Forçar null
            module: currentModule,
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
            setFormData({ name: "", slug: "", description: "", active: true, showInNavbar: true });
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
        });
        setShowForm(true);
    };

    const confirmDelete = async () => {
        if (!deleteDialog.id) return;

        setIsLoading(true);
        try {
            const res = await fetch(`/api/admin/categories/${deleteDialog.id}`, { method: "DELETE" });
            const data = await res.json();

            if (res.ok) {
                toast.success("Categoria excluída com sucesso!");
                fetchCategories();
            } else {
                toast.error(data.error || "Erro ao excluir categoria.");
            }
        } catch (error) {
            toast.error("Erro de conexão ao excluir.");
        } finally {
            setIsLoading(false);
            setDeleteDialog({ isOpen: false, id: null });
        }
    };

    const handleDelete = (id: string) => {
        setDeleteDialog({ isOpen: true, id });
    };

    return (
        <div className="space-y-6 pb-20">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="font-heading font-bold text-neutral-900 text-4xl uppercase tracking-tight">
                        Categorias Principais
                    </h1>
                    <p className="text-neutral-500 font-body mt-1">
                        Gerencie as categorias de nível superior da loja.
                    </p>
                </div>
                <div className="flex gap-4">
                    <Link href="/admin/subcategorias">
                        <button className="bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-50 px-6 py-3 rounded-lg font-heading font-bold uppercase transition-all flex items-center gap-2">
                            Gerenciar Subcategorias <ArrowRight className="w-4 h-4" />
                        </button>
                    </Link>
                    <button
                        onClick={() => {
                            setShowForm(true);
                            setEditingId(null);
                            setFormData({ name: "", slug: "", description: "", active: true, showInNavbar: true });
                        }}
                        className="bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-lg font-heading font-bold uppercase transition-all shadow-lg shadow-primary/20 flex items-center gap-2"
                    >
                        <Plus className="w-5 h-5" />
                        Nova Categoria
                    </button>
                </div>
            </div>

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
                                    placeholder={currentModule === "sports" ? "Ex: Roupas" : "Ex: Motor"}
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

                        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-neutral-100">
                            <label className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all cursor-pointer ${formData.showInNavbar ? 'border-primary bg-primary/5 text-primary' : 'border-neutral-100 bg-neutral-50 text-neutral-400 hover:border-neutral-200'}`}>
                                <input type="checkbox" checked={formData.showInNavbar} onChange={(e) => setFormData({ ...formData, showInNavbar: e.target.checked })} className="sr-only" />
                                <Check className={`w-5 h-5 mb-1 ${formData.showInNavbar ? 'opacity-100' : 'opacity-0'}`} />
                                <span className="text-[10px] font-heading font-bold uppercase">Menu Nav</span>
                            </label>
                            <label className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all cursor-pointer ${formData.active ? 'border-green-500 bg-green-50 text-green-600' : 'border-neutral-100 bg-neutral-50 text-neutral-400 hover:border-neutral-200'}`}>
                                <input type="checkbox" checked={formData.active} onChange={(e) => setFormData({ ...formData, active: e.target.checked })} className="sr-only" />
                                <Check className={`w-5 h-5 mb-1 ${formData.active ? 'opacity-100' : 'opacity-0'}`} />
                                <span className="text-[10px] font-heading font-bold uppercase">Categoria Ativa</span>
                            </label>
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
                            <th className="px-6 py-4 font-heading font-bold text-neutral-900 uppercase tracking-wide text-xs w-1/3">Nome</th>
                            <th className="px-6 py-4 font-heading font-bold text-neutral-900 uppercase tracking-wide text-xs">Slug</th>
                            <th className="px-6 py-4 font-heading font-bold text-neutral-900 uppercase tracking-wide text-xs text-center">Menu</th>
                            <th className="px-6 py-4 font-heading font-bold text-neutral-900 uppercase tracking-wide text-xs text-center">Status</th>
                            <th className="px-6 py-4 font-heading font-bold text-neutral-900 uppercase tracking-wide text-xs text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                        {categories.length === 0 ? (
                            <tr><td colSpan={5} className="px-6 py-20 text-center text-neutral-400 font-body">Nenhuma categoria principal encontrada.</td></tr>
                        ) : categories.map((cat) => (
                            <tr key={cat.id} className="hover:bg-neutral-50 transition-colors group">
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
                                        <button onClick={() => handleDelete(cat.id)} className="p-2 text-neutral-400 hover:text-red-500 transition-colors hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <AlertDialog
                isOpen={deleteDialog.isOpen}
                onClose={() => setDeleteDialog({ isOpen: false, id: null })}
                onConfirm={confirmDelete}
                title="Excluir Categoria?"
                description="Certifique-se de que não existem subcategorias ou produtos vinculados a esta categoria antes de excluí-la."
                confirmText="Sim, excluir"
                cancelText="Cancelar"
                variant="danger"
                isLoading={isLoading}
            />
        </div>
    );
}
