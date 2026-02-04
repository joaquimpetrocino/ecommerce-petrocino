"use client";

import React, { useState, useEffect } from "react";
import { Plus, Edit, Trash2, X, Info, CheckSquare, Square, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { AlertDialog } from "@/components/ui/alert-dialog";
import { Modal } from "@/components/ui/modal";

interface Model {
    id: string;
    name: string;
    slug: string;
    brandId: string;
    active: boolean;
}

interface Brand {
    id: string;
    name: string;
}

export default function ModelsPage() {
    const [models, setModels] = useState<Model[]>([]);
    const [brands, setBrands] = useState<Brand[]>([]);
    const [loading, setLoading] = useState(true);
    const [isActionLoading, setIsActionLoading] = useState(false);

    // Filtros
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState<string>("all");
    const [filterBrand, setFilterBrand] = useState<string>("all");

    // Bulk Selection State
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

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
    const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; ids: string[] }>({
        isOpen: false,
        ids: []
    });
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        // Load config, models and brands
        const loadData = async () => {
            try {
                // Fetch brands for selector
                const brandsRes = await fetch(`/api/admin/brands`);
                const brandsData = await brandsRes.json();
                setBrands(brandsData);

                // Fetch models
                const modelsRes = await fetch(`/api/admin/models`);
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
    }, []);

    const toggleSelectAll = () => {
        if (selectedIds.length === filteredModels.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(filteredModels.map(m => m.id));
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

    const handleBulkToggleActive = async (status: boolean) => {
        if (selectedIds.length === 0) return;

        setIsActionLoading(true);
        try {
            await Promise.all(selectedIds.map(id =>
                fetch(`/api/admin/models/${id}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ active: status })
                })
            ));

            setModels(models.map(m =>
                selectedIds.includes(m.id) ? { ...m, active: status } : m
            ));

            toast.success(`Status atualizado para ${selectedIds.length} modelos!`);
            setSelectedIds([]);
        } catch (error) {
            console.error("Erro ao atualizar status:", error);
            toast.error("Erro ao atualizar status.");
        } finally {
            setIsActionLoading(false);
        }
    }

    const filteredModels = models.filter((m) => {
        const matchesSearch = m.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === "all" ? true : (filterStatus === "active" ? m.active : !m.active);
        const matchesBrand = filterBrand === "all" ? true : m.brandId === filterBrand;
        return matchesSearch && matchesStatus && matchesBrand;
    });

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
                body: JSON.stringify(formData)
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
        if (deleteDialog.ids.length === 0) return;
        setIsDeleting(true);

        try {
            await Promise.all(deleteDialog.ids.map(id =>
                fetch(`/api/admin/models/${id}`, { method: "DELETE" })
            ));

            setModels(models.filter(m => !deleteDialog.ids.includes(m.id)));
            toast.success(`${deleteDialog.ids.length} modelo(s) removido(s)!`);
            setSelectedIds([]);
        } catch (error) {
            console.error(error);
            toast.error("Erro ao remover modelos.");
        } finally {
            setIsDeleting(false);
            setDeleteDialog({ isOpen: false, ids: [] });
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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="font-heading font-bold text-neutral-900 text-4xl uppercase tracking-tight">
                        Modelos
                    </h1>
                    <p className="text-neutral-600 font-body mt-1">
                        Gerencie os modelos disponíveis na loja.
                    </p>
                </div>
                <button
                    onClick={() => { resetForm(); setShowForm(true); }}
                    className="w-full sm:w-auto bg-neutral-900 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-heading font-bold uppercase flex items-center justify-center gap-2 transition-all shadow-lg shadow-neutral-900/20 hover:shadow-red-600/20 hover:scale-105"
                >
                    <Plus className="w-5 h-5" />
                    Novo Modelo
                </button>
            </div>

            {/* Barra de Filtros */}
            <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-sm flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                    <input
                        type="text"
                        placeholder="Buscar modelo..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-4 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm font-body focus:border-primary outline-none transition-all"
                    />
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                    <select
                        value={filterBrand}
                        onChange={(e) => setFilterBrand(e.target.value)}
                        className="w-full sm:w-auto min-w-[160px] px-4 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm font-body focus:border-primary outline-none transition-all"
                    >
                        <option value="all">Todas Marcas</option>
                        {brands.map(brand => (
                            <option key={brand.id} value={brand.id}>{brand.name}</option>
                        ))}
                    </select>
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
                            className="flex items-center gap-1 px-3 py-2 bg-white border border-neutral-200 text-neutral-700 hover:text-red-600 hover:bg-red-50 hover:border-red-200 rounded-lg text-sm font-medium transition-colors"
                        >
                            <Trash2 className="w-4 h-4" /> Excluir
                        </button>
                    </div>
                </div>
            )}

            {/* List */}
            <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-sm">
                <table className="w-full">
                    <thead className="bg-neutral-50 border-b border-neutral-200">
                        <tr>
                            <th className="w-12 px-6 py-4 text-left">
                                <button
                                    onClick={toggleSelectAll}
                                    className="text-neutral-400 hover:text-primary transition-colors"
                                >
                                    {selectedIds.length > 0 && selectedIds.length === filteredModels.length ? (
                                        <CheckSquare className="w-5 h-5 text-primary" />
                                    ) : (
                                        <Square className="w-5 h-5" />
                                    )}
                                </button>
                            </th>
                            <th className="text-left px-6 py-4 font-heading font-bold text-neutral-900 uppercase text-sm">Nome</th>
                            <th className="text-left px-6 py-4 font-heading font-bold text-neutral-900 uppercase text-sm">Marca</th>
                            <th className="text-left px-6 py-4 font-heading font-bold text-neutral-900 uppercase text-sm">Status</th>
                            <th className="text-right px-6 py-4 font-heading font-bold text-neutral-900 uppercase text-sm">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredModels.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-neutral-500 font-body">
                                    Nenhum modelo encontrado com os filtros atuais.
                                </td>
                            </tr>
                        ) : (
                            filteredModels.map(model => {
                                const isSelected = selectedIds.includes(model.id);
                                return (
                                    <tr key={model.id} className={`border-b border-neutral-100 last:border-0 hover:bg-neutral-50 transition-colors ${isSelected ? "bg-primary/5" : ""}`}>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => toggleSelect(model.id)}
                                                className="text-neutral-400 hover:text-primary transition-colors"
                                            >
                                                {isSelected ? (
                                                    <CheckSquare className="w-5 h-5 text-primary" />
                                                ) : (
                                                    <Square className="w-5 h-5" />
                                                )}
                                            </button>
                                        </td>
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
                                                <button onClick={() => openEdit(model)} className="p-2 text-neutral-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => setDeleteDialog({ isOpen: true, ids: [model.id] })} className="p-2 text-neutral-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
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
                                placeholder="Ex: Predador 24, Air Max..."
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            {/* Campo de módulo removido (não utilizado) */}
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
                onClose={() => setDeleteDialog({ isOpen: false, ids: [] })}
                onConfirm={handleDelete}
                title={deleteDialog.ids.length > 1 ? "Excluir Modelos?" : "Excluir Modelo?"}
                description={`Tem certeza que deseja excluir ${deleteDialog.ids.length > 1 ? "os modelos selecionados" : "este modelo"}?`}
                isLoading={isDeleting}
                variant="danger"
            />
        </div>
    );
}
