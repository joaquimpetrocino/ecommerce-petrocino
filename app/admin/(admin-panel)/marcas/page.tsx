"use client";

import React, { useState, useEffect } from "react";
import { Plus, Edit, Trash2, X, Search, Check } from "lucide-react";
import { toast } from "sonner";
import { AlertDialog } from "@/components/ui/alert-dialog";
import { Modal } from "@/components/ui/modal";
import { StoreModule } from "@/types";

interface Brand {
    id: string;
    name: string;
    slug: string;
    logoUrl?: string;
    module: StoreModule;
    active: boolean;
}

export default function BrandsPage() {
    const [currentModule, setCurrentModule] = useState<StoreModule>("sports");
    const [brands, setBrands] = useState<Brand[]>([]);
    const [loading, setLoading] = useState(true);

    // Form State
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        name: "",
        slug: "",
        logoUrl: "",
        active: true
    });
    const [isSaving, setIsSaving] = useState(false);

    // Delete State
    const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; id: string | null }>({
        isOpen: false,
        id: null
    });
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        // Load config and brands
        const loadData = async () => {
            try {
                const configRes = await fetch("/api/config");
                const config = await configRes.json();
                setCurrentModule(config.module);

                const brandsRes = await fetch(`/api/admin/brands?module=${config.module}`);
                const brandsData = await brandsRes.json();
                setBrands(brandsData);
            } catch (error) {
                console.error("Error loading data:", error);
                toast.error("Erro ao carregar dados.");
            } finally {
                setLoading(false);
            }
        };

        loadData();

        // Listen for module changes
        const handleModuleChange = () => {
            setLoading(true);
            loadData();
        };
        window.addEventListener("moduleChanged", handleModuleChange);
        return () => window.removeEventListener("moduleChanged", handleModuleChange);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        try {
            const url = editingId
                ? `/api/admin/brands/${editingId}`
                : "/api/admin/brands";

            const method = editingId ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    module: currentModule
                })
            });

            if (res.ok) {
                const updatedBrand = await res.json();
                if (editingId) {
                    setBrands(brands.map(b => b.id === editingId ? updatedBrand : b));
                    toast.success("Marca atualizada com sucesso!");
                } else {
                    setBrands([...brands, updatedBrand]);
                    toast.success("Marca criada com sucesso!");
                }
                setShowForm(false);
                resetForm();
            } else {
                toast.error("Erro ao salvar marca.");
            }
        } catch (error) {
            console.error(error);
            toast.error("Erro ao salvar marca.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteDialog.id) return;
        setIsDeleting(true);

        try {
            const res = await fetch(`/api/admin/brands/${deleteDialog.id}`, {
                method: "DELETE"
            });

            if (res.ok) {
                setBrands(brands.filter(b => b.id !== deleteDialog.id));
                toast.success("Marca removida com sucesso!");
            } else {
                toast.error("Erro ao remover marca.");
            }
        } catch (error) {
            console.error(error);
            toast.error("Erro ao remover marca.");
        } finally {
            setIsDeleting(false);
            setDeleteDialog({ isOpen: false, id: null });
        }
    };

    const resetForm = () => {
        setFormData({
            name: "",
            slug: "",
            logoUrl: "",
            active: true
        });
        setEditingId(null);
    };

    const openEdit = (brand: Brand) => {
        setFormData({
            name: brand.name,
            slug: brand.slug,
            logoUrl: brand.logoUrl || "",
            active: brand.active
        });
        setEditingId(brand.id);
        setShowForm(true);
    };

    if (loading) return <div className="p-8 text-center text-neutral-500">Carregando...</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="font-heading font-bold text-neutral-900 text-4xl uppercase tracking-tight">
                        Marcas
                    </h1>
                    <p className="text-neutral-600 font-body mt-1">
                        Gerencie as marcas para o módulo <span className="font-bold text-primary">{currentModule === "sports" ? "Esportes" : "Automotivo"}</span>
                    </p>
                </div>
                <button
                    onClick={() => { resetForm(); setShowForm(true); }}
                    className="bg-accent hover:bg-accent-dark text-white px-6 py-3 rounded-lg font-heading font-bold uppercase flex items-center gap-2 transition-all shadow-lg shadow-accent/20 hover:scale-105"
                >
                    <Plus className="w-5 h-5" />
                    Nova Marca
                </button>
            </div>

            {/* List */}
            <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-sm">
                <table className="w-full">
                    <thead className="bg-neutral-50 border-b border-neutral-200">
                        <tr>
                            <th className="text-left px-6 py-4 font-heading font-bold text-neutral-900 uppercase text-sm">Nome</th>
                            <th className="text-left px-6 py-4 font-heading font-bold text-neutral-900 uppercase text-sm">Slug</th>
                            <th className="text-left px-6 py-4 font-heading font-bold text-neutral-900 uppercase text-sm">Status</th>
                            <th className="text-right px-6 py-4 font-heading font-bold text-neutral-900 uppercase text-sm">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {brands.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-6 py-12 text-center text-neutral-500">
                                    Nenhuma marca cadastrada para este módulo.
                                </td>
                            </tr>
                        ) : (
                            brands.map(brand => (
                                <tr key={brand.id} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50 transition-colors">
                                    <td className="px-6 py-4 font-body font-medium text-neutral-900">{brand.name}</td>
                                    <td className="px-6 py-4 font-mono text-xs text-neutral-500">{brand.slug}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${brand.active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                                            }`}>
                                            {brand.active ? "Ativo" : "Inativo"}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-end gap-2">
                                            <button onClick={() => openEdit(brand)} className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors">
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => setDeleteDialog({ isOpen: true, id: brand.id })} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            <Modal
                isOpen={showForm}
                onClose={() => setShowForm(false)}
                title={editingId ? "Editar Marca" : "Nova Marca"}
            >
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-body font-medium text-neutral-700">Nome da Marca</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    setFormData(prev => ({
                                        ...prev,
                                        name: val,
                                        slug: editingId ? prev.slug : val.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")
                                    }));
                                }}
                                className="w-full px-4 py-3 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                placeholder={currentModule === "sports" ? "Ex: Nike, Adidas" : "Ex: Bosch, Fiat"}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-body font-medium text-neutral-700">Slug</label>
                            <input
                                type="text"
                                value={formData.slug}
                                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                className="w-full px-4 py-3 border border-neutral-200 rounded-lg bg-neutral-50"
                                required
                            />
                        </div>
                        <div className="flex items-center gap-3 pt-2">
                            <input
                                type="checkbox"
                                id="active"
                                checked={formData.active}
                                onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                                className="w-5 h-5 text-primary focus:ring-primary border-gray-300 rounded"
                            />
                            <label htmlFor="active" className="text-sm font-body text-neutral-700 select-none">
                                Marca Ativa
                            </label>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-neutral-100">
                        <button
                            type="button"
                            onClick={() => setShowForm(false)}
                            className="px-4 py-2 text-neutral-600 hover:text-neutral-900 font-body font-medium"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="bg-primary hover:bg-primary-dark text-white px-6 py-2 rounded-lg font-heading font-bold uppercase disabled:opacity-50"
                        >
                            {isSaving ? "Salvando..." : "Salvar"}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Delete Alert */}
            <AlertDialog
                isOpen={deleteDialog.isOpen}
                onClose={() => setDeleteDialog({ isOpen: false, id: null })}
                onConfirm={handleDelete}
                title="Excluir Marca"
                description="Tem certeza que deseja excluir esta marca? Esta ação não pode ser desfeita."
                isLoading={isDeleting}
                variant="danger"
            />
        </div>
    );
}
