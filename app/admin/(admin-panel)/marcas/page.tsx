"use client";

import React, { useState, useEffect } from "react";
import { Plus, Edit, Trash2, X, Search, Check, CheckSquare, Square, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { AlertDialog } from "@/components/ui/alert-dialog";
import { Modal } from "@/components/ui/modal";

interface Brand {
    id: string;
    name: string;
    slug: string;
    logoUrl?: string;
    module?: "sports" | "automotive" | "unified";
    active: boolean;
}

export default function BrandsPage() {
    const [brands, setBrands] = useState<Brand[]>([]);
    const [loading, setLoading] = useState(true);
    const [isActionLoading, setIsActionLoading] = useState(false);

    // Filtros
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState<string>("all");
    const [filterModule, setFilterModule] = useState<string>("all");

    // Bulk Selection State
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    // Form State
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        name: "",
        slug: "",
        logoUrl: "",
        module: "sports" as "sports" | "automotive" | "unified",
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
        // Load brands
        const loadData = async () => {
            try {
                const brandsRes = await fetch(`/api/admin/brands`);
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
    }, []);

    const toggleSelectAll = () => {
        if (selectedIds.length === filteredBrands.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(filteredBrands.map(b => b.id));
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
                fetch(`/api/admin/brands/${id}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ active: status })
                })
            ));

            setBrands(brands.map(b =>
                selectedIds.includes(b.id) ? { ...b, active: status } : b
            ));

            toast.success(`Status atualizado para ${selectedIds.length} marcas!`);
            setSelectedIds([]);
        } catch (error) {
            console.error("Erro ao atualizar status:", error);
            toast.error("Erro ao atualizar status.");
        } finally {
            setIsActionLoading(false);
        }
    };

    const filteredBrands = brands.filter((b) => {
        const matchesSearch = b.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === "all" ? true : (filterStatus === "active" ? b.active : !b.active);
        const matchesModule = filterModule === "all" ? true : b.module === filterModule;
        return matchesSearch && matchesStatus && matchesModule;
    });

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
                body: JSON.stringify(formData)
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
        if (deleteDialog.ids.length === 0) return;
        setIsDeleting(true);

        try {
            await Promise.all(deleteDialog.ids.map(id =>
                fetch(`/api/admin/brands/${id}`, { method: "DELETE" })
            ));

            setBrands(brands.filter(b => !deleteDialog.ids.includes(b.id)));
            toast.success(`${deleteDialog.ids.length} marca(s) removida(s)!`);
            setSelectedIds([]);
        } catch (error) {
            console.error(error);
            toast.error("Erro ao remover marcas.");
        } finally {
            setIsDeleting(false);
            setDeleteDialog({ isOpen: false, ids: [] });
        }
    };

    const resetForm = () => {
        setFormData({
            name: "",
            slug: "",
            logoUrl: "",
            module: "sports",
            active: true
        });
        setEditingId(null);
    };

    const openEdit = (brand: Brand) => {
        setFormData({
            name: brand.name,
            slug: brand.slug,
            logoUrl: brand.logoUrl || "",
            module: brand.module || "sports",
            active: brand.active
        });
        setEditingId(brand.id);
        setShowForm(true);
    };

    if (loading) return <div className="p-8 text-center text-neutral-500">Carregando...</div>;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="font-heading font-bold text-neutral-900 text-4xl uppercase tracking-tight">
                        Marcas
                    </h1>
                    <p className="text-neutral-600 font-body mt-1">
                        Gerencie as marcas disponíveis na loja.
                    </p>
                </div>
                <button
                    onClick={() => { resetForm(); setShowForm(true); }}
                    className="w-full sm:w-auto bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-lg font-heading font-bold uppercase flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary/20 hover:scale-105"
                >
                    <Plus className="w-5 h-5" />
                    Nova Marca
                </button>
            </div>

            {/* Barra de Filtros */}
            <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-sm flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                    <input
                        type="text"
                        placeholder="Buscar marca..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-4 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm font-body focus:border-primary outline-none transition-all"
                    />
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                    <select
                        value={filterModule}
                        onChange={(e) => setFilterModule(e.target.value)}
                        className="w-full sm:w-auto min-w-[140px] px-4 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm font-body focus:border-primary outline-none transition-all"
                    >
                        <option value="all">Módulo: Todos</option>
                        <option value="sports">Esportes/Roupas</option>
                        <option value="automotive">Auto Peças</option>
                        <option value="unified">Unificado</option>
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
                            className="flex items-center gap-1 px-3 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-sm font-medium transition-colors"
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
                                    {selectedIds.length > 0 && selectedIds.length === filteredBrands.length ? (
                                        <CheckSquare className="w-5 h-5 text-primary" />
                                    ) : (
                                        <Square className="w-5 h-5" />
                                    )}
                                </button>
                            </th>
                            <th className="text-left px-6 py-4 font-heading font-bold text-neutral-900 uppercase text-sm">Nome</th>
                            <th className="text-left px-6 py-4 font-heading font-bold text-neutral-900 uppercase text-sm">Módulo</th>
                            <th className="text-left px-6 py-4 font-heading font-bold text-neutral-900 uppercase text-sm">Slug</th>
                            <th className="text-left px-6 py-4 font-heading font-bold text-neutral-900 uppercase text-sm">Status</th>
                            <th className="text-right px-6 py-4 font-heading font-bold text-neutral-900 uppercase text-sm">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredBrands.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-neutral-500 font-body">
                                    Nenhuma marca encontrada com os filtros atuais.
                                </td>
                            </tr>
                        ) : (
                            filteredBrands.map(brand => {
                                const isSelected = selectedIds.includes(brand.id);
                                return (
                                    <tr key={brand.id} className={`border-b border-neutral-100 last:border-0 hover:bg-neutral-50 transition-colors ${isSelected ? "bg-primary/5" : ""}`}>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => toggleSelect(brand.id)}
                                                className="text-neutral-400 hover:text-primary transition-colors"
                                            >
                                                {isSelected ? (
                                                    <CheckSquare className="w-5 h-5 text-primary" />
                                                ) : (
                                                    <Square className="w-5 h-5" />
                                                )}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 font-body font-medium text-neutral-900">{brand.name}</td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase ${brand.module === 'automotive' ? 'bg-orange-100 text-orange-700' : brand.module === 'unified' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                                                {brand.module === 'automotive' ? 'Auto Peças' : brand.module === 'unified' ? 'Unificado' : 'Esportes'}
                                            </span>
                                        </td>
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
                                                <button onClick={() => setDeleteDialog({ isOpen: true, ids: [brand.id] })} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
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
                                placeholder="Ex: Nike, Adidas"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-body font-medium text-neutral-700">Módulo</label>
                            <select
                                value={formData.module}
                                onChange={(e) => setFormData({ ...formData, module: e.target.value as any })}
                                className="w-full px-4 py-3 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                required
                            >
                                <option value="sports">Esportes/Roupas</option>
                                <option value="automotive">Auto Peças</option>
                                <option value="unified">Unificado (Ambos)</option>
                            </select>
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
                onClose={() => setDeleteDialog({ isOpen: false, ids: [] })}
                onConfirm={handleDelete}
                title={deleteDialog.ids.length > 1 ? "Excluir Marcas?" : "Excluir Marca?"}
                description={`Tem certeza que deseja excluir ${deleteDialog.ids.length > 1 ? "as marcas selecionadas" : "esta marca"}?`}
                isLoading={isDeleting}
                variant="danger"
            />
        </div>
    );
}
