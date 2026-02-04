"use client";

import React, { useState, useEffect } from "react";
import { Plus, Edit, Trash2, X, Info } from "lucide-react";
import { toast } from "sonner";
import { AlertDialog } from "@/components/ui/alert-dialog";
import { Modal } from "@/components/ui/modal";
import { StoreModule } from "@/types";

interface Model {
    id: string;
    name: string;
    slug: string;
    brandId: string;
    module: StoreModule;
    active: boolean;
}

interface Brand {
    id: string;
    name: string;
}

export default function ModelsPage() {
    const [currentModule, setCurrentModule] = useState<StoreModule>("sports");
    const [models, setModels] = useState<Model[]>([]);
    const [brands, setBrands] = useState<Brand[]>([]);
    const [loading, setLoading] = useState(true);

    // Form State
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        name: "",
        slug: "",
        brandId: "",
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
        // Load config, models and brands
        const loadData = async () => {
            try {
                const configRes = await fetch("/api/config");
                const config = await configRes.json();
                setCurrentModule(config.module);

                // Fetch brands for selector
                const brandsRes = await fetch(`/api/admin/brands?module=${config.module}`);
                const brandsData = await brandsRes.json();
                setBrands(brandsData);

                // Fetch models
                const modelsRes = await fetch(`/api/admin/models?module=${config.module}`);
                const modelsData = await modelsRes.json();
                setModels(modelsData);
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
                ? `/api/admin/models/${editingId}`
                : "/api/admin/models";

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
                const updatedModel = await res.json();
                if (editingId) {
                    setModels(models.map(m => m.id === editingId ? updatedModel : m));
                    toast.success("Modelo atualizado com sucesso!");
                } else {
                    setModels([...models, updatedModel]);
                    toast.success("Modelo criado com sucesso!");
                }
                setShowForm(false);
                resetForm();
            } else {
                toast.error("Erro ao salvar modelo.");
            }
        } catch (error) {
            console.error(error);
            toast.error("Erro ao salvar modelo.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteDialog.id) return;
        setIsDeleting(true);

        try {
            const res = await fetch(`/api/admin/models/${deleteDialog.id}`, {
                method: "DELETE"
            });

            if (res.ok) {
                setModels(models.filter(m => m.id !== deleteDialog.id));
                toast.success("Modelo removido com sucesso!");
            } else {
                toast.error("Erro ao remover modelo.");
            }
        } catch (error) {
            console.error(error);
            toast.error("Erro ao remover modelo.");
        } finally {
            setIsDeleting(false);
            setDeleteDialog({ isOpen: false, id: null });
        }
    };

    const resetForm = () => {
        setFormData({
            name: "",
            slug: "",
            brandId: "",
            active: true
        });
        setEditingId(null);
    };

    const openEdit = (model: Model) => {
        setFormData({
            name: model.name,
            slug: model.slug,
            brandId: model.brandId,
            active: model.active
        });
        setEditingId(model.id);
        setShowForm(true);
    };

    const getBrandName = (brandId: string) => {
        return brands.find(b => b.id === brandId)?.name || "Desconhecida";
    };

    if (loading) return <div className="p-8 text-center text-neutral-500">Carregando...</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="font-heading font-bold text-neutral-900 text-4xl uppercase tracking-tight">
                        Modelos
                    </h1>
                    <p className="text-neutral-600 font-body mt-1">
                        Gerencie os modelos para o módulo <span className="font-bold text-primary">{currentModule === "sports" ? "Esportes" : "Automotivo"}</span>
                    </p>
                </div>
                <button
                    onClick={() => { resetForm(); setShowForm(true); }}
                    className="bg-accent hover:bg-accent-dark text-white px-6 py-3 rounded-lg font-heading font-bold uppercase flex items-center gap-2 transition-all shadow-lg shadow-accent/20 hover:scale-105"
                >
                    <Plus className="w-5 h-5" />
                    Novo Modelo
                </button>
            </div>

            {/* List */}
            <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-sm">
                <table className="w-full">
                    <thead className="bg-neutral-50 border-b border-neutral-200">
                        <tr>
                            <th className="text-left px-6 py-4 font-heading font-bold text-neutral-900 uppercase text-sm">Nome</th>
                            <th className="text-left px-6 py-4 font-heading font-bold text-neutral-900 uppercase text-sm">Marca</th>
                            <th className="text-left px-6 py-4 font-heading font-bold text-neutral-900 uppercase text-sm">Status</th>
                            <th className="text-right px-6 py-4 font-heading font-bold text-neutral-900 uppercase text-sm">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {models.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-6 py-12 text-center text-neutral-500">
                                    Nenhum modelo cadastrado.
                                </td>
                            </tr>
                        ) : (
                            models.map(model => (
                                <tr key={model.id} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50 transition-colors">
                                    <td className="px-6 py-4 font-body font-medium text-neutral-900">{model.name}</td>
                                    <td className="px-6 py-4 font-body text-neutral-600">{getBrandName(model.brandId)}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${model.active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                                            }`}>
                                            {model.active ? "Ativo" : "Inativo"}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-end gap-2">
                                            <button onClick={() => openEdit(model)} className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors">
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => setDeleteDialog({ isOpen: true, id: model.id })} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
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
                title={editingId ? "Editar Modelo" : "Novo Modelo"}
            >
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="bg-primary/5 p-4 rounded-lg border border-primary/10 space-y-3">
                        <div className="flex items-center gap-2 text-primary font-heading font-bold text-xs uppercase">
                            <Info className="w-4 h-4" /> Marca (Obrigatório)
                        </div>
                        <select
                            value={formData.brandId}
                            onChange={(e) => setFormData({ ...formData, brandId: e.target.value })}
                            className="w-full px-4 py-3 border border-neutral-200 rounded-lg font-body focus:ring-2 focus:ring-primary/20 outline-none bg-white"
                            required
                        >
                            <option value="">Selecione uma Marca...</option>
                            {brands.map(b => (
                                <option key={b.id} value={b.id}>{b.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-body font-medium text-neutral-700">Nome do Modelo</label>
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
                                placeholder={currentModule === "sports" ? "Ex: Predador 24, Air Max" : "Ex: Uno Mille, Gol G4"}
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
                                Modelo Ativo
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
                title="Excluir Modelo"
                description="Tem certeza que deseja excluir este modelo?"
                isLoading={isDeleting}
                variant="danger"
            />
        </div>
    );
}
