"use client";

import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, GripVertical, Eye, EyeOff, ArrowUp, ArrowDown, Image as ImageIcon } from "lucide-react";
import type { HomeSection } from "@/lib/admin/home-sections";
import { StoreModule } from "@/types";
import { toast } from "sonner";
import { AlertDialog } from "@/components/ui/alert-dialog";
import { Modal } from "@/components/ui/modal";
import { UploadDropzone } from "@/lib/uploadthing";

export default function HomeSectionsPage() {
    const [currentModule, setCurrentModule] = useState<StoreModule>("sports");
    const [moduleName, setModuleName] = useState("Carregando...");
    const [storeConfig, setStoreConfig] = useState<any>(null);

    const [sections, setSections] = useState<HomeSection[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [isActionLoading, setIsActionLoading] = useState(false);

    // Alert Dialog state
    const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; id: string | null }>({
        isOpen: false,
        id: null
    });

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/admin/store-config")
            .then(res => res.json())
            .then(config => {
                setStoreConfig(config);
                setCurrentModule(config.module);
                setModuleName(config.module === "sports" ? "Artigos Esportivos" : "Peças Automotivas");
                setLoading(false);
            });
    }, []);

    // Atualiza module name
    useEffect(() => {
        if (storeConfig) {
            setModuleName(currentModule === "sports" ? "Artivos Esportivos" : "Peças Automotivas");
        }
    }, [currentModule, storeConfig]);

    const [formData, setFormData] = useState<Partial<HomeSection>>({
        type: "featured",
        title: "",
        description: "",
        active: true,
        order: 1,
        productIds: [],
        categorySlug: "",
        categoryName: "",
        buttonText: "",
        ctaLink: "",
        backgroundImage: "",
        module: currentModule,
    });

    // Filter states for product selection
    const [searchTerm, setSearchTerm] = useState("");
    const [filterCategory, setFilterCategory] = useState("");

    // Effect to update formData module when currentModule changes
    useEffect(() => {
        setFormData(prev => ({ ...prev, module: currentModule }));
    }, [currentModule]);

    // Effect to reset search and filter terms when the form is hidden
    useEffect(() => {
        if (!showForm) {
            setSearchTerm("");
            setFilterCategory("");
        }
    }, [showForm]);

    useEffect(() => {
        if (!loading) {
            fetchSections();
            fetchProducts();
            fetchCategories();
        }
    }, [currentModule, loading]);



    const fetchSections = async () => {
        const res = await fetch(`/api/admin/home-sections?module=${currentModule}`);
        const data = await res.json();
        setSections(data);
    };

    const fetchProducts = async () => {
        const res = await fetch(`/api/admin/products?module=${currentModule}`);
        const data = await res.json();
        setProducts(data);
    };

    const fetchCategories = async () => {
        const res = await fetch(`/api/admin/categories?module=${currentModule}`);
        const data = await res.json();
        setCategories(data);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsActionLoading(true);

        const endpoint = "/api/admin/home-sections";

        try {
            if (editingId) {
                await fetch(`${endpoint}/${editingId}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(formData),
                });
                toast.success("Seção atualizada!");
            } else {
                await fetch(endpoint, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(formData),
                });
                toast.success("Seção criada!");
            }

            setShowForm(false);
            setEditingId(null);
            resetForm();
            fetchSections();
        } catch (error) {
            toast.error("Erro ao salvar seção.");
        } finally {
            setIsActionLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            type: "featured",
            title: "",
            description: "",
            active: true,
            order: sections.length + 1,
            productIds: [],
            categorySlug: "",
            categoryName: "",
            buttonText: "",
            ctaLink: "",
            backgroundImage: "",
            module: currentModule,
        });
        setSearchTerm("");
        setFilterCategory("");
    };

    const handleEdit = (section: HomeSection) => {
        setEditingId(section.id);
        setFormData(section);
        setShowForm(true);
    };

    const confirmDelete = async () => {
        if (!deleteDialog.id) return;

        setIsActionLoading(true);
        try {
            await fetch(`/api/admin/home-sections/${deleteDialog.id}`, { method: "DELETE" });
            toast.success("Seção excluída com sucesso!");
            fetchSections();
        } catch (error) {
            toast.error("Erro ao excluir seção.");
        } finally {
            setIsActionLoading(false);
            setDeleteDialog({ isOpen: false, id: null });
        }
    };

    const handleDelete = (id: string) => {
        setDeleteDialog({ isOpen: true, id });
    };

    const toggleActive = async (section: HomeSection) => {
        await fetch(`/api/admin/home-sections/${section.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ active: !section.active }),
        });
        fetchSections();
    };

    const moveSection = async (index: number, direction: "up" | "down") => {
        const newSections = [...sections];
        const targetIndex = direction === "up" ? index - 1 : index + 1;

        if (targetIndex < 0 || targetIndex >= newSections.length) return;

        [newSections[index], newSections[targetIndex]] = [newSections[targetIndex], newSections[index]];

        const sectionIds = newSections.map((s) => s.id);
        await fetch("/api/admin/home-sections", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "reorder", sectionIds }),
        });

        fetchSections();
    };

    const toggleProductSelection = (productId: string) => {
        const current = formData.productIds || [];
        const updated = current.includes(productId)
            ? current.filter((id) => id !== productId)
            : [...current, productId];
        setFormData({ ...formData, productIds: updated });
    };

    return (
        <div className="space-y-6 pb-20">



            <div className="flex items-center justify-between pt-4 mt-4">
                <div>
                    <h2 className="font-heading font-bold text-neutral-900 text-2xl uppercase tracking-tight">
                        Outras Seções da Home
                    </h2>
                    <p className="text-neutral-600 font-body mt-1">
                        Gerencie os grids de produtos e CTAs intermediários
                    </p>
                </div>
                <button
                    onClick={() => {
                        setShowForm(true);
                        setEditingId(null);
                        resetForm();
                    }}
                    className="bg-accent hover:bg-accent-dark text-white px-6 py-3 rounded-lg font-heading font-bold uppercase flex items-center gap-2 transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    Nova Seção
                </button>
            </div>

            {/* Form Modal */}
            <Modal
                isOpen={showForm}
                onClose={() => {
                    setShowForm(false);
                    setEditingId(null);
                }}
                title={editingId ? "Editar Seção" : "Nova Seção"}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-body font-medium text-neutral-700 mb-2">
                            Tipo de Seção
                        </label>
                        <select
                            value={formData.type}
                            onChange={(e) =>
                                setFormData({ ...formData, type: e.target.value as HomeSection["type"] })
                            }
                            className="w-full px-4 py-2 border border-neutral-300 rounded-lg font-body focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                        >
                            <option value="featured">Produtos em Destaque</option>
                            <option value="category">Produtos por Categoria</option>
                            <option value="cta">Banner CTA</option>
                        </select>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <div>
                            <label className="block text-sm font-body font-medium text-neutral-700 mb-2">
                                Título
                            </label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="w-full px-4 py-2 border border-neutral-300 rounded-lg font-body focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                                required
                            />
                        </div>

                        <div className="flex items-center gap-2 pt-7">
                            <input
                                type="checkbox"
                                checked={formData.active}
                                onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                                className="w-4 h-4 rounded border-neutral-300 text-primary focus:ring-primary"
                            />
                            <label className="text-sm font-body font-medium text-neutral-700">
                                Seção Ativa
                            </label>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-body font-medium text-neutral-700 mb-2">
                            Descrição
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full px-4 py-2 border border-neutral-300 rounded-lg font-body focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                            rows={2}
                        />
                    </div>

                    {/* Seleção de Produtos (para featured e category) */}
                    {(formData.type === "featured" || formData.type === "category") && (
                        <div>
                            <label className="block text-sm font-body font-medium text-neutral-700 mb-2">
                                Selecionar Produtos ({formData.productIds?.length || 0} selecionados)
                            </label>

                            {/* Filtros */}
                            <div className="flex flex-col gap-2 mb-2 p-3 bg-neutral-50 rounded-lg border border-neutral-200">
                                <input
                                    type="text"
                                    placeholder="Buscar por nome..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full px-3 py-2 border border-neutral-300 rounded text-sm outline-none focus:border-primary"
                                />
                                <div className="flex gap-2">
                                    <select
                                        value={filterCategory}
                                        onChange={(e) => setFilterCategory(e.target.value)}
                                        className="flex-1 px-3 py-2 border border-neutral-300 rounded text-sm outline-none focus:border-primary"
                                    >
                                        <option value="">Todas Categorias</option>
                                        {categories.map(c => (
                                            <option key={c.id} value={c.slug}>{c.name}</option>
                                        ))}
                                    </select>
                                    {/* Se tiver marcas carregadas, poderia filtrar aqui, mas por enquanto vamos simplificar com busca texto e categoria */}
                                </div>
                            </div>

                            <div className="border border-neutral-300 rounded-lg p-4 max-h-64 overflow-y-auto">
                                <div className="grid gap-2">
                                    {products
                                        .filter(p => {
                                            const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
                                            const matchesCategory = filterCategory ? p.category === filterCategory : true;
                                            return matchesSearch && matchesCategory;
                                        })
                                        .map((product) => (
                                            <label
                                                key={product.id}
                                                className="flex items-center gap-3 p-2 hover:bg-neutral-50 rounded cursor-pointer"
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={formData.productIds?.includes(product.id)}
                                                    onChange={() => toggleProductSelection(product.id)}
                                                    className="w-4 h-4 rounded border-neutral-300 text-primary focus:ring-primary"
                                                />
                                                <div className="w-12 h-12 rounded overflow-hidden border border-neutral-200 shrink-0">
                                                    <img
                                                        src={product.images && product.images.length > 0 ? product.images[0] : "/images/placeholder.png"}
                                                        alt={product.name}
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => {
                                                            e.currentTarget.src = "/images/placeholder.png";
                                                        }}
                                                    />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-body font-semibold text-sm truncate">{product.name}</p>
                                                    <p className="text-xs text-neutral-600 truncate">{product.category} • {product.brand ? "Marca X" : "Genérico"}</p>
                                                </div>
                                                {formData.productIds?.includes(product.id) && (
                                                    <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded">Selecionado</span>
                                                )}
                                            </label>
                                        ))}
                                    {products.length === 0 && <p className="text-center text-sm text-neutral-500 py-4">Nenhum produto encontrado.</p>}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Configuração de CTA */}
                    {formData.type === "cta" && (
                        <>
                            <div>
                                <label className="block text-sm font-body font-medium text-neutral-700 mb-2">
                                    Texto do Botão
                                </label>
                                <input
                                    type="text"
                                    value={formData.buttonText}
                                    onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })}
                                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg font-body focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                                    placeholder="Ex: Ver Chuteiras"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-body font-medium text-neutral-700 mb-2">
                                    Link do Botão
                                </label>
                                <input
                                    type="text"
                                    value={formData.ctaLink}
                                    onChange={(e) => setFormData({ ...formData, ctaLink: e.target.value })}
                                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg font-body focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                                    placeholder="Ex: /produtos?category=chuteiras ou /produtos"
                                    required
                                />
                                <p className="text-xs text-neutral-500 mt-1">
                                    Use /produtos?category=slug para filtrar por categoria
                                </p>
                            </div>

                            <div className="space-y-3">
                                <label className="block text-sm font-body font-medium text-neutral-700">
                                    Imagem de Fundo (Banner CTA)
                                </label>
                                {formData.backgroundImage ? (
                                    <div className="relative group rounded-lg overflow-hidden h-32 w-full bg-neutral-100 border border-neutral-200">
                                        <img src={formData.backgroundImage} alt="CTA Background" className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                type="button"
                                                onClick={() => setFormData({ ...formData, backgroundImage: "" })}
                                                className="text-white bg-red-600 px-3 py-1 rounded text-xs font-bold uppercase"
                                            >
                                                Remover
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <UploadDropzone
                                        endpoint="imageUploader"
                                        onClientUploadComplete={(res) => {
                                            if (res && res[0]) setFormData({ ...formData, backgroundImage: res[0].url });
                                        }}
                                        onUploadError={(error: Error) => alert(`Erro: ${error.message}`)}
                                        appearance={{
                                            button: "bg-primary text-white font-bold font-heading uppercase p-2 text-sm",
                                            container: "p-4 border-2 border-dashed border-neutral-200 rounded-lg bg-neutral-50 h-32"
                                        }}
                                    />
                                )}
                                <p className="text-xs text-neutral-500">Escolha uma imagem impactante para o fundo deste banner.</p>
                            </div>
                        </>
                    )}

                    <div className="flex gap-3 pt-4">
                        <button
                            type="submit"
                            className="flex-1 bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-lg font-heading font-bold uppercase transition-colors"
                        >
                            {editingId ? "Atualizar" : "Criar"} Seção
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setShowForm(false);
                                setEditingId(null);
                            }}
                            className="px-6 py-3 border border-neutral-300 rounded-lg font-heading font-bold uppercase hover:bg-neutral-50 transition-colors"
                        >
                            Cancelar
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Sections List */}
            <div className="space-y-4">
                {sections.map((section, index) => (
                    <div
                        key={section.id}
                        className={`bg-white rounded-xl border-2 p-6 transition-all ${section.active ? "border-neutral-200" : "border-neutral-100 opacity-60"
                            }`}
                    >
                        <div className="flex items-start gap-4">
                            <div className="flex flex-col gap-2">
                                <button
                                    onClick={() => moveSection(index, "up")}
                                    disabled={index === 0}
                                    className="p-1 text-neutral-400 hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed"
                                >
                                    <ArrowUp className="w-4 h-4" />
                                </button>
                                <GripVertical className="w-5 h-5 text-neutral-400" />
                                <button
                                    onClick={() => moveSection(index, "down")}
                                    disabled={index === sections.length - 1}
                                    className="p-1 text-neutral-400 hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed"
                                >
                                    <ArrowDown className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="flex-1">
                                <div className="flex items-start justify-between mb-2">
                                    <div>
                                        <h3 className="font-heading font-bold text-neutral-900 text-xl uppercase">
                                            {section.title}
                                        </h3>
                                        <p className="text-sm text-neutral-600 font-body">{section.description}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span
                                            className={`px-3 py-1 rounded-full text-xs font-body font-semibold ${section.type === "featured"
                                                ? "bg-accent/10 text-accent"
                                                : section.type === "category"
                                                    ? "bg-primary/10 text-primary"
                                                    : "bg-green-100 text-green-700"
                                                }`}
                                        >
                                            {section.type === "featured"
                                                ? "Destaque"
                                                : section.type === "category"
                                                    ? "Categoria"
                                                    : "CTA"}
                                        </span>
                                    </div>
                                </div>

                                {section.type === "cta" && (
                                    <p className="text-sm text-neutral-600 font-body">
                                        Link: <span className="font-semibold">{section.ctaLink || "Não configurado"}</span>
                                    </p>
                                )}

                                {(section.type === "featured" || section.type === "category") && (
                                    <p className="text-sm text-neutral-600 font-body">
                                        {section.productIds?.length || 0} produtos selecionados
                                    </p>
                                )}
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => toggleActive(section)}
                                    className={`p-2 rounded-lg transition-colors ${section.active
                                        ? "text-green-600 hover:bg-green-50"
                                        : "text-neutral-400 hover:bg-neutral-50"
                                        }`}
                                    title={section.active ? "Desativar" : "Ativar"}
                                >
                                    {section.active ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                                </button>
                                <button
                                    onClick={() => handleEdit(section)}
                                    className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                                >
                                    <Edit className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => handleDelete(section.id)}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}

                {sections.length === 0 && (
                    <div className="text-center py-12 bg-neutral-50 rounded-xl">
                        <p className="text-neutral-600 font-body">
                            Nenhuma seção criada ainda. Clique em "Nova Seção" para começar.
                        </p>
                    </div>
                )}
            </div>

            <AlertDialog
                isOpen={deleteDialog.isOpen}
                onClose={() => setDeleteDialog({ isOpen: false, id: null })}
                onConfirm={confirmDelete}
                title="Excluir Seção?"
                description="Tem certeza que deseja remover esta seção da página inicial? Esta ação não pode ser desfeita."
                confirmText="Sim, excluir"
                cancelText="Cancelar"
                variant="danger"
                isLoading={isActionLoading}
            />
        </div>
    );
}
