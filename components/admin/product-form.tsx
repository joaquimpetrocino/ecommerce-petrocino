"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X, Plus, Images, Loader2 } from "lucide-react";
import { Product, ProductVariant, Category, League, StoreModule, ProductColor, AutomotiveFields } from "@/types";
import { toast } from "sonner";
import { UploadDropzone } from "@/lib/uploadthing";

const productSchema = z.object({
    name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
    slug: z.string().min(3, "Slug deve ter pelo menos 3 caracteres"),
    description: z.string().min(10, "Descrição deve ter pelo menos 10 caracteres"),
    price: z.number().min(0, "Preço deve ser maior que zero"),
    category: z.string().min(1, "Categoria é obrigatória"),
    subCategory: z.string().optional(),
    league: z.string().optional(),
    brandId: z.string().optional(),
    modelId: z.string().optional(),
    featured: z.boolean(),
    module: z.enum(["sports", "automotive"]),
    allowCustomization: z.boolean().optional(),
    customizationPrice: z.number().min(0).optional(),
});

type ProductFormData = z.infer<typeof productSchema>;

interface ProductFormProps {
    product?: Product;
    onSubmit: (data: Product) => Promise<void>;
}

export function ProductForm({ product, onSubmit }: ProductFormProps) {
    const router = useRouter();
    const [images, setImages] = useState<string[]>(product?.images || []);
    const [variants, setVariants] = useState<ProductVariant[]>(
        product?.variants || [{ size: "", stock: 0 }]
    );
    const [colors, setColors] = useState<ProductColor[]>(
        product?.colors || []
    );
    const [automotiveFields, setAutomotiveFields] = useState<AutomotiveFields>(
        product?.automotiveFields || {}
    );

    // Selected Module (Type of product)
    const [selectedModule, setSelectedModule] = useState<StoreModule>(product?.module || "sports");

    // Metadata State
    const [allCategories, setAllCategories] = useState<Category[]>([]);
    const [leagues, setLeagues] = useState<League[]>([]);
    const [allBrands, setAllBrands] = useState<any[]>([]);
    const [models, setModels] = useState<any[]>([]);

    const [loading, setLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
        watch,
        setValue,
        reset
    } = useForm<ProductFormData>({
        resolver: zodResolver(productSchema),
        defaultValues: product
            ? {
                name: product.name,
                slug: product.slug,
                description: product.description,
                price: product.price,
                category: product.category,
                subCategory: product.subCategory || "",
                league: product.league,
                brandId: product.brandId,
                modelId: product.modelId,
                featured: product.featured,
                module: product.module as "sports" | "automotive",
                allowCustomization: product.allowCustomization || false,
                customizationPrice: product.customizationPrice || 0,
            }
            : {
                module: "sports",
                allowCustomization: false,
                customizationPrice: 0,
                featured: false,
                category: "",
                subCategory: "",
            },
    });

    const currentBrandId = watch("brandId");
    const currentCategoryId = watch("category");
    const allowCustomization = watch("allowCustomization");

    // Fetch Metadata (Categories, Leagues, Brands)
    useEffect(() => {
        const fetchMetadata = async () => {
            try {
                const [catsRes, leaguesRes, brandsRes] = await Promise.all([
                    fetch(`/api/admin/categories`),
                    fetch(`/api/admin/leagues`),
                    fetch(`/api/admin/brands`)
                ]);

                if (catsRes.ok) setAllCategories(await catsRes.json());
                if (leaguesRes.ok) setLeagues(await leaguesRes.json());
                if (brandsRes.ok) setAllBrands(await brandsRes.json());

            } catch (error) {
                console.error("Erro ao carregar metadados:", error);
            }
        };

        fetchMetadata();
    }, []);

    // Filtered Metadata based on module
    // Main categories are those without parentId
    const categories = allCategories.filter(c => (!selectedModule || c.module === selectedModule) && !c.parentId);
    const filteredLeagues = leagues.filter(l => l.module === "sports");

    // Brands should be unified or filtered if they have a specific module
    const brands = allBrands.filter(b => !b.module || b.module === "unified" || (!selectedModule || b.module === selectedModule));

    // Filter subcategories based on currentCategoryId (which is a slug)
    // A subcategory is a category with a parentId
    const selectedParent = allCategories.find(c => c.slug === currentCategoryId);
    const subCategories = allCategories.filter(c => c.parentId && c.parentId === selectedParent?.id);

    // Reset subcategory if it doesn't belong to the NEWly selected category
    useEffect(() => {
        const sub = watch("subCategory");
        if (sub && !subCategories.find(s => s.slug === sub)) {
            setValue("subCategory", "");
        }
    }, [currentCategoryId, subCategories, setValue, watch]);

    // Fetch Models when Brand changes
    useEffect(() => {
        const fetchModels = async () => {
            if (!currentBrandId) {
                setModels([]);
                return;
            }
            try {
                // Models API also needs to be unified or we just pass the brandId
                const res = await fetch(`/api/admin/models?brandId=${currentBrandId}`);
                if (res.ok) {
                    setModels(await res.json());
                }
            } catch (error) {
                console.error("Erro ao buscar modelos:", error);
            }
        };

        fetchModels();
    }, [currentBrandId]);

    const handleModuleChange = (module: StoreModule) => {
        setSelectedModule(module);
        setValue("module", module as "sports" | "automotive");
        // Reset category if it doesn't belong to the new module
        setValue("category", "");
        setValue("subCategory", "");
        setValue("brandId", "");
        setValue("modelId", "");
    };

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        const slug = value
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "");
        setValue("slug", slug);
    };

    const handleRemoveImage = async (index: number) => {
        const urlToDelete = images[index];
        setImages(images.filter((_, i) => i !== index)); // Otimista

        try {
            await fetch("/api/uploadthing/delete", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ url: urlToDelete }),
            });
            toast.success("Imagem removida.");
        } catch (error) {
            console.error("Erro ao excluir imagem do servidor:", error);
            toast.error("Erro ao excluir arquivo de imagem, mas removido do formulário.");
        }
    };

    // Variants Helpers
    const handleAddVariant = () => setVariants([...variants, { size: "", stock: 0 }]);
    const handleRemoveVariant = (index: number) => setVariants(variants.filter((_, i) => i !== index));
    const handleVariantChange = (index: number, field: keyof ProductVariant, value: string | number) => {
        const newVariants = [...variants];
        newVariants[index] = { ...newVariants[index], [field]: value };
        setVariants(newVariants);
    };

    // Colors Helpers
    const handleAddColor = () => setColors([...colors, { name: "", hex: "#000000" }]);
    const handleRemoveColor = (index: number) => setColors(colors.filter((_, i) => i !== index));
    const handleColorChange = (index: number, field: keyof ProductColor, value: string) => {
        const newColors = [...colors];
        newColors[index] = { ...newColors[index], [field]: value };
        setColors(newColors);
    };

    const onFormSubmit = async (data: ProductFormData) => {
        setLoading(true);
        try {
            const productData: Product = {
                id: product?.id || "",
                active: product?.active ?? true,
                ...data,
                subCategory: data.subCategory || undefined,
                module: selectedModule as any,
                images: images,
                variants: variants.filter((v) => v.size.trim() !== ""),
                ...(selectedModule === "sports" && colors.length > 0 && {
                    colors: colors.filter((c) => c.name.trim() !== ""),
                }),
                ...(selectedModule === "automotive" && {
                    automotiveFields,
                }),
            };

            await onSubmit(productData);
        } catch (error) {
            console.error("Erro ao salvar produto:", error);
            toast.error("Ocorreu um erro ao salvar o produto.");
        } finally {
            setLoading(false);
        }
    };

    const isSports = selectedModule === "sports";
    const namePlaceholder = isSports ? "Ex: Camisa Flamengo 2024" : "Ex: Farol Gol G5";
    const variantPlaceholder = isSports ? "P, M, G, 42..." : "Único, PE, LE...";

    return (
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-8">
            {/* Seletor de Tipo de Produto */}
            <div className="bg-white rounded-xl border border-neutral-200 p-6 shadow-sm">
                <h2 className="font-heading font-bold text-neutral-900 text-xl uppercase tracking-tight mb-6 flex items-center gap-2">
                    <span className="w-2 h-6 bg-primary rounded-full"></span>
                    Tipo de Produto
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button
                        type="button"
                        onClick={() => handleModuleChange("sports")}
                        disabled={!!product} // Desabilitar se estiver editando para manter integridade
                        className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all group ${isSports
                            ? "border-primary bg-primary/5 ring-4 ring-primary/10"
                            : "border-neutral-100 hover:border-neutral-300 bg-neutral-50 grayscale hover:grayscale-0"
                            } ${!!product && "opacity-80"}`}
                    >
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl ${isSports ? "bg-primary text-white" : "bg-neutral-200 text-neutral-500"}`}>
                            👕
                        </div>
                        <div className="text-left">
                            <p className={`font-heading font-bold uppercase tracking-wide text-sm ${isSports ? "text-primary" : "text-neutral-500"}`}>Artigos Esportivos</p>
                            <p className="text-xs text-neutral-400 font-body">Roupas, Chuteiras, Acessórios</p>
                        </div>
                    </button>

                    <button
                        type="button"
                        onClick={() => handleModuleChange("automotive")}
                        disabled={!!product}
                        className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all group ${!isSports
                            ? "border-orange-500 bg-orange-50 ring-4 ring-orange-100"
                            : "border-neutral-100 hover:border-neutral-300 bg-neutral-50 grayscale hover:grayscale-0"
                            } ${!!product && "opacity-80"}`}
                    >
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl ${!isSports ? "bg-orange-500 text-white" : "bg-neutral-200 text-neutral-500"}`}>
                            🚗
                        </div>
                        <div className="text-left">
                            <p className={`font-heading font-bold uppercase tracking-wide text-sm ${!isSports ? "text-orange-600" : "text-neutral-500"}`}>Peças Automotivas</p>
                            <p className="text-xs text-neutral-400 font-body">Faróis, Suspensão, Motores</p>
                        </div>
                    </button>
                </div>
                {!!product && (
                    <p className="text-xs text-neutral-500 mt-4 italic text-center">
                        Para evitar inconsistências, o tipo de produto não pode ser alterado após a criação.
                    </p>
                )}
            </div>

            {/* Header / Module Indicator */}
            {/* <div className="bg-neutral-100 border border-neutral-200 rounded-lg p-4 flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${isSports ? 'bg-blue-500' : 'bg-orange-500'}`} />
                <p className="font-body text-sm text-neutral-700">
                    Cadastrando produto como: <span className="font-bold uppercase">{isSports ? "Artigo Esportivo" : "Peça Automotiva"}</span>
                </p>
            </div> */}

            {/* Informações Básicas */}
            <div className="bg-white rounded-xl border border-neutral-200 p-6">
                <h2 className="font-heading font-bold text-neutral-900 text-xl uppercase tracking-tight mb-4">
                    Informações Principais
                </h2>

                <div className="grid gap-4 md:grid-cols-2">
                    <div>
                        <label className="block text-sm font-body font-medium text-neutral-700 mb-2">
                            Nome do Produto *
                        </label>
                        <input
                            {...register("name")}
                            onChange={(e) => {
                                register("name").onChange(e);
                                handleNameChange(e);
                            }}
                            className="w-full px-4 py-3 border border-neutral-300 rounded-lg font-body focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                            placeholder={namePlaceholder}
                        />
                        {errors.name && (
                            <p className="text-red-600 text-sm mt-1">{errors.name.message}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-body font-medium text-neutral-700 mb-2">
                            Slug (URL automatically generated) *
                        </label>
                        <input
                            {...register("slug")}
                            className="w-full px-4 py-3 border border-neutral-300 rounded-lg font-body bg-neutral-50 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                            placeholder="url-do-produto"
                            readOnly
                        />
                        {errors.slug && (
                            <p className="text-red-600 text-sm mt-1">{errors.slug.message}</p>
                        )}
                    </div>
                </div>

                <div className="mt-4">
                    <label className="block text-sm font-body font-medium text-neutral-700 mb-2">
                        Descrição *
                    </label>
                    <textarea
                        {...register("description")}
                        rows={4}
                        className="w-full px-4 py-3 border border-neutral-300 rounded-lg font-body focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                        placeholder="Descrição detalhada do produto..."
                    />
                    {errors.description && (
                        <p className="text-red-600 text-sm mt-1">{errors.description.message}</p>
                    )}
                </div>

                <div className="grid gap-4 md:grid-cols-3 mt-4">
                    <div>
                        <label className="block text-sm font-body font-medium text-neutral-700 mb-2">
                            Preço (R$) *
                        </label>
                        <input
                            type="number"
                            step="0.01"
                            {...register("price", { valueAsNumber: true })}
                            className="w-full px-4 py-3 border border-neutral-300 rounded-lg font-body focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                            placeholder="0.00"
                        />
                        {errors.price && (
                            <p className="text-red-600 text-sm mt-1">{errors.price.message}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-body font-medium text-neutral-700 mb-2">
                            Categoria *
                        </label>
                        <select
                            {...register("category")}
                            className="w-full px-4 py-3 border border-neutral-300 rounded-lg font-body focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                        >
                            <option value="">Selecione...</option>
                            {/* Filter out subcategories from main category list if not already done */}
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.slug}>{cat.name}</option>
                            ))}
                        </select>
                        {errors.category && (
                            <p className="text-red-600 text-sm mt-1">{errors.category.message}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-body font-medium text-neutral-700 mb-2">
                            Subcategoria (Opcional)
                        </label>
                        <select
                            {...register("subCategory")}
                            disabled={!currentCategoryId}
                            className="w-full px-4 py-3 border border-neutral-300 rounded-lg font-body focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all disabled:bg-neutral-50 disabled:text-neutral-400"
                        >
                            <option value="">Nenhuma</option>
                            {subCategories.map((sub) => (
                                <option key={sub.id} value={sub.slug}>{sub.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Liga - Sports Only */}
                    {isSports && leagues.length > 0 && (
                        <div>
                            <label className="block text-sm font-body font-medium text-neutral-700 mb-2">
                                Liga (Opcional)
                            </label>
                            <select
                                {...register("league")}
                                className="w-full px-4 py-3 border border-neutral-300 rounded-lg font-body focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                            >
                                <option value="">Nenhuma</option>
                                {leagues.map((l) => (
                                    <option key={l.id} value={l.slug}>{l.name}</option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>

                {/* Brand and Model - Dynamic for both modules now */}
                <div className="grid gap-4 md:grid-cols-2 mt-4 pt-4 border-t border-neutral-100">
                    <div>
                        <label className="block text-sm font-body font-medium text-neutral-700 mb-2">
                            Marca
                        </label>
                        <select
                            {...register("brandId")}
                            className="w-full px-4 py-3 border border-neutral-300 rounded-lg font-body focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                        >
                            <option value="">Selecione a Marca...</option>
                            {brands.map(b => (
                                <option key={b.id} value={b.id}>{b.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-body font-medium text-neutral-700 mb-2">
                            Modelo
                        </label>
                        <select
                            {...register("modelId")}
                            disabled={!currentBrandId}
                            className="w-full px-4 py-3 border border-neutral-300 rounded-lg font-body focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none disabled:bg-neutral-100 disabled:text-neutral-400"
                        >
                            <option value="">Selecione o Modelo...</option>
                            {models.map(m => (
                                <option key={m.id} value={m.id}>{m.name}</option>
                            ))}
                        </select>
                        {!currentBrandId && (
                            <p className="text-xs text-neutral-500 mt-1">Selecione uma marca primeiro.</p>
                        )}
                    </div>
                </div>

                <div className="mt-4 pt-4 border-t border-neutral-100">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            {...register("featured")}
                            className="w-5 h-5 text-primary border-neutral-300 rounded focus:ring-primary"
                        />
                        <span className="font-body font-medium text-neutral-700">
                            Produto em destaque
                        </span>
                    </label>
                </div>
            </div>

            {/* Imagens (UploadThing) */}
            <div className="bg-white rounded-xl border border-neutral-200 p-6">
                <h2 className="font-heading font-bold text-neutral-900 text-xl uppercase tracking-tight mb-4 flex items-center gap-2">
                    <Images className="w-5 h-5" /> Imagens
                </h2>

                <div className="mb-6">
                    <UploadDropzone
                        endpoint="imageUploader"
                        onClientUploadComplete={(res) => {
                            if (res) {
                                const newUrls = res.map(file => file.url);
                                setImages(prev => [...prev, ...newUrls]);
                                toast.success("Upload concluído!");
                            }
                        }}
                        onUploadError={(error: Error) => {
                            toast.error(`Erro no upload: ${error.message}`);
                        }}
                        className="bg-neutral-50 border-2 border-dashed border-neutral-300 hover:border-primary rounded-xl transition-colors"
                        appearance={{
                            button: "bg-primary text-white font-bold font-heading uppercase",
                            container: "p-8"
                        }}
                    />
                </div>

                {images.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {images.map((image, index) => (
                            <div key={index} className="group relative aspect-square rounded-lg overflow-hidden border border-neutral-200">
                                <img src={image} alt={`Imagem ${index + 1}`} className="w-full h-full object-cover" />
                                <button
                                    type="button"
                                    onClick={() => handleRemoveImage(index)}
                                    className="absolute top-2 right-2 bg-red-600 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Variantes */}
            <div className="bg-white rounded-xl border border-neutral-200 p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
                    <h2 className="font-heading font-bold text-neutral-900 text-xl uppercase tracking-tight">
                        Variantes / Estoque
                    </h2>
                    <button
                        type="button"
                        onClick={handleAddVariant}
                        className="w-fit flex items-center gap-2 text-primary hover:text-primary-dark font-body font-bold uppercase text-xs"
                    >
                        <Plus className="w-4 h-4" />
                        Adicionar
                    </button>
                </div>

                <div className="space-y-3">
                    {variants.map((variant, index) => (
                        <div key={index} className="flex flex-col sm:flex-row sm:items-center gap-3 bg-neutral-50 p-3 rounded-lg sm:bg-transparent sm:p-0">
                            <input
                                type="text"
                                value={variant.size}
                                onChange={(e) => handleVariantChange(index, "size", e.target.value)}
                                className="w-full sm:w-40 px-4 py-3 border border-neutral-300 rounded-lg font-body focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                placeholder={variantPlaceholder}
                            />
                            <div className="flex-1 flex gap-3 w-full">
                                <input
                                    type="number"
                                    value={variant.stock}
                                    onChange={(e) => handleVariantChange(index, "stock", parseInt(e.target.value) || 0)}
                                    className="flex-1 px-4 py-3 border border-neutral-300 rounded-lg font-body focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                    placeholder="Estoque"
                                    min="0"
                                />
                                {variants.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveVariant(index)}
                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Cores - Sports Only */}
            {isSports && (
                <div className="bg-white rounded-xl border border-neutral-200 p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
                        <h2 className="font-heading font-bold text-neutral-900 text-xl uppercase tracking-tight">
                            Cores Disponíveis
                        </h2>
                        <button
                            type="button"
                            onClick={handleAddColor}
                            className="w-fit flex items-center gap-2 text-primary hover:text-primary-dark font-body font-bold uppercase text-xs"
                        >
                            <Plus className="w-5 h-5" />
                            Adicionar Cor
                        </button>
                    </div>

                    <div className="space-y-3">
                        {colors.map((color, index) => (
                            <div key={index} className="flex flex-col sm:flex-row sm:items-center gap-3 bg-neutral-50 p-3 rounded-lg sm:bg-transparent sm:p-0">
                                <input
                                    type="text"
                                    value={color.name}
                                    onChange={(e) => handleColorChange(index, "name", e.target.value)}
                                    className="w-full sm:flex-1 px-4 py-3 border border-neutral-300 rounded-lg font-body focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                    placeholder="Nome da cor"
                                />
                                <div className="flex items-center gap-3 w-full sm:w-auto">
                                    <input
                                        type="color"
                                        value={color.hex}
                                        onChange={(e) => handleColorChange(index, "hex", e.target.value)}
                                        className="flex-1 sm:w-20 h-12 border border-neutral-300 rounded-lg cursor-pointer"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveColor(index)}
                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                        {colors.length === 0 && (
                            <p className="text-neutral-500 font-body text-sm italic">Nenhuma cor selecionada.</p>
                        )}
                    </div>
                </div>
            )}

            {/* Personalização - Sports Only */}
            {isSports && (
                <div className="bg-white rounded-xl border border-neutral-200 p-6">
                    <h2 className="font-heading font-bold text-neutral-900 text-xl uppercase tracking-tight mb-4 flex items-center gap-2">
                        <span className="text-2xl">👕</span> Personalização
                    </h2>

                    <div className="space-y-4">
                        <label className="flex items-center gap-3 p-4 border border-neutral-200 rounded-lg cursor-pointer hover:bg-neutral-50 transition-colors">
                            <input
                                type="checkbox"
                                {...register("allowCustomization")}
                                className="w-5 h-5 text-primary border-neutral-300 rounded focus:ring-primary"
                            />
                            <div>
                                <span className="font-heading font-bold text-neutral-900 block">
                                    Permitir Personalização (Nome e Número)
                                </span>
                                <span className="text-sm text-neutral-500 font-body">
                                    O cliente poderá adicionar nome e número na camisa.
                                </span>
                            </div>
                        </label>

                        {allowCustomization && (
                            <div className="animate-in slide-in-from-top-2 duration-200">
                                <label className="block text-sm font-body font-medium text-neutral-700 mb-2">
                                    Custo Adicional (R$)
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    {...register("customizationPrice", { valueAsNumber: true })}
                                    className="w-full md:w-1/3 px-4 py-3 border border-neutral-300 rounded-lg font-body focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                    placeholder="0.00"
                                />
                                <p className="text-xs text-neutral-500 mt-1">
                                    Valor acrescentado ao total se o cliente optar por personalizar.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Automotive Extra Fields - Only show if Automotive module */}
            {!isSports && (
                <div className="bg-white rounded-xl border border-neutral-200 p-6">
                    <h2 className="font-heading font-bold text-neutral-900 text-xl uppercase tracking-tight mb-4">
                        Detalhes Técnicos Automotivos
                    </h2>
                    <div className="grid gap-4 md:grid-cols-2">
                        <div>
                            <label className="block text-sm font-body font-medium text-neutral-700 mb-2">Ano Inicial</label>
                            <input
                                type="number"
                                value={automotiveFields.yearStart || ""}
                                onChange={(e) => setAutomotiveFields({ ...automotiveFields, yearStart: Number(e.target.value) })}
                                className="w-full px-4 py-3 border border-neutral-300 rounded-lg"
                                placeholder="2010"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-body font-medium text-neutral-700 mb-2">Ano Final</label>
                            <input
                                type="number"
                                value={automotiveFields.yearEnd || ""}
                                onChange={(e) => setAutomotiveFields({ ...automotiveFields, yearEnd: Number(e.target.value) })}
                                className="w-full px-4 py-3 border border-neutral-300 rounded-lg"
                                placeholder="2020"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-body font-medium text-neutral-700 mb-2">Código OEM</label>
                            <input
                                type="text"
                                value={automotiveFields.oemCode || ""}
                                onChange={(e) => setAutomotiveFields({ ...automotiveFields, oemCode: e.target.value })}
                                className="w-full px-4 py-3 border border-neutral-300 rounded-lg"
                                placeholder="123456"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-body font-medium text-neutral-700 mb-2">Tipo de Peça</label>
                            <input
                                type="text"
                                value={automotiveFields.partType || ""}
                                onChange={(e) => setAutomotiveFields({ ...automotiveFields, partType: e.target.value })}
                                className="w-full px-4 py-3 border border-neutral-300 rounded-lg"
                                placeholder="Original"
                            />
                        </div>
                    </div>
                </div>
            )
            }

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full sm:w-auto bg-primary hover:bg-primary-dark disabled:bg-neutral-300 text-white px-8 py-4 rounded-lg font-heading font-bold text-lg uppercase tracking-wide transition-all hover:scale-105 hover:shadow-xl disabled:hover:scale-100 disabled:hover:shadow-none cursor-pointer disabled:cursor-not-allowed"
                >
                    {loading ? "Salvando..." : product ? "Atualizar Produto" : "Criar Produto"}
                </button>
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="w-full sm:w-auto bg-neutral-200 hover:bg-neutral-300 text-neutral-900 px-8 py-4 rounded-lg font-body font-semibold transition-all cursor-pointer"
                >
                    Cancelar
                </button>
            </div>
        </form >
    );
}
