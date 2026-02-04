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
    const [configLoading, setConfigLoading] = useState(!product);
    const [defaultModule, setDefaultModule] = useState<StoreModule>("sports");

    // Start with default module or product module
    useEffect(() => {
        if (!product) {
            fetch("/api/config")
                .then(res => res.json())
                .then(data => {
                    setDefaultModule(data.module);
                    setConfigLoading(false);
                })
                .catch(() => setConfigLoading(false));
        } else {
            setDefaultModule(product.module);
        }
    }, [product]);

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

    // Metadata State
    const [categories, setCategories] = useState<Category[]>([]);
    const [leagues, setLeagues] = useState<League[]>([]);
    const [brands, setBrands] = useState<any[]>([]);
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
                league: product.league,
                brandId: product.brandId,
                modelId: product.modelId,
                featured: product.featured,
                module: product.module,
                allowCustomization: product.allowCustomization || false,
                customizationPrice: product.customizationPrice || 0,
            }
            : {
                allowCustomization: false,
                customizationPrice: 0,
            },
    });

    const currentBrandId = watch("brandId");
    const allowCustomization = watch("allowCustomization"); // Watch this field to conditional render

    // Force module update in form when valid config is loaded
    useEffect(() => {
        if (!product && !configLoading) {
            setValue("module", defaultModule);
            reset({
                featured: false,
                module: defaultModule,
                allowCustomization: false,
                customizationPrice: 0,
            });
        }
    }, [defaultModule, configLoading, product, setValue, reset]);

    // Fetch Metadata (Categories, Leagues, Brands) based on module
    useEffect(() => {
        const fetchMetadata = async () => {
            // Only fetch if we know the module
            if (configLoading) return;

            try {
                const moduleToFetch = defaultModule;

                const [catsRes, leaguesRes, brandsRes] = await Promise.all([
                    fetch(`/api/admin/categories?module=${moduleToFetch}`),
                    fetch(`/api/admin/leagues?module=${moduleToFetch}`),
                    fetch(`/api/admin/brands?module=${moduleToFetch}`)
                ]);

                if (catsRes.ok) setCategories(await catsRes.json());
                if (leaguesRes.ok) setLeagues(await leaguesRes.json());
                if (brandsRes.ok) setBrands(await brandsRes.json());

            } catch (error) {
                console.error("Erro ao carregar metadados:", error);
            }
        };

        fetchMetadata();
    }, [defaultModule, configLoading]);

    // Fetch Models when Brand changes
    useEffect(() => {
        const fetchModels = async () => {
            if (!currentBrandId) {
                setModels([]);
                return;
            }
            try {
                const res = await fetch(`/api/admin/models?module=${defaultModule}&brandId=${currentBrandId}`);
                if (res.ok) {
                    setModels(await res.json());
                }
            } catch (error) {
                console.error("Erro ao buscar modelos:", error);
            }
        };

        fetchModels();
    }, [currentBrandId, defaultModule]);


    if (configLoading) {
        return (
            <div className="flex items-center justify-center p-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <span className="ml-2 text-neutral-600">Carregando formulário...</span>
            </div>
        );
    }

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
                ...data,
                module: defaultModule, // Enforce current module
                images: images,
                variants: variants.filter((v) => v.size.trim() !== ""),
                ...(defaultModule === "sports" && colors.length > 0 && {
                    colors: colors.filter((c) => c.name.trim() !== ""),
                }),
                ...(defaultModule === "automotive" && {
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

    // Dynamic Placeholders
    const isSports = defaultModule === "sports";
    const namePlaceholder = isSports ? "Ex: Camisa Flamengo 2024" : "Ex: Farol Gol G5";
    const variantPlaceholder = isSports ? "P, M, G, 42..." : "Único, PE, LE...";

    return (
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-8">
            <input type="hidden" {...register("module")} value={defaultModule} />

            {/* Header / Module Indicator */}
            <div className="bg-neutral-100 border border-neutral-200 rounded-lg p-4 flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${isSports ? 'bg-blue-500' : 'bg-orange-500'}`} />
                <p className="font-body text-sm text-neutral-700">
                    Cadastrando produto no módulo: <span className="font-bold uppercase">{isSports ? "Artigos Esportivos" : "Peças Automotivas"}</span>
                </p>
            </div>

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
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.slug}>{cat.name}</option>
                            ))}
                        </select>
                        {errors.category && (
                            <p className="text-red-600 text-sm mt-1">{errors.category.message}</p>
                        )}
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
                <div className="flex items-center justify-between mb-4">
                    <h2 className="font-heading font-bold text-neutral-900 text-xl uppercase tracking-tight">
                        Variantes / Estoque
                    </h2>
                    <button
                        type="button"
                        onClick={handleAddVariant}
                        className="flex items-center gap-2 text-primary hover:text-primary-dark font-body font-medium"
                    >
                        <Plus className="w-5 h-5" />
                        Adicionar
                    </button>
                </div>

                <div className="space-y-3">
                    {variants.map((variant, index) => (
                        <div key={index} className="flex items-center gap-3">
                            <input
                                type="text"
                                value={variant.size}
                                onChange={(e) => handleVariantChange(index, "size", e.target.value)}
                                className="w-40 px-4 py-3 border border-neutral-300 rounded-lg font-body focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                placeholder={variantPlaceholder}
                            />
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
                    ))}
                </div>
            </div>

            {/* Cores - Sports Only */}
            {isSports && (
                <div className="bg-white rounded-xl border border-neutral-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="font-heading font-bold text-neutral-900 text-xl uppercase tracking-tight">
                            Cores Disponíveis
                        </h2>
                        <button
                            type="button"
                            onClick={handleAddColor}
                            className="flex items-center gap-2 text-primary hover:text-primary-dark font-body font-medium"
                        >
                            <Plus className="w-5 h-5" />
                            Adicionar Cor
                        </button>
                    </div>

                    <div className="space-y-3">
                        {colors.map((color, index) => (
                            <div key={index} className="flex items-center gap-3">
                                <input
                                    type="text"
                                    value={color.name}
                                    onChange={(e) => handleColorChange(index, "name", e.target.value)}
                                    className="flex-1 px-4 py-3 border border-neutral-300 rounded-lg font-body focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                    placeholder="Nome da cor"
                                />
                                <input
                                    type="color"
                                    value={color.hex}
                                    onChange={(e) => handleColorChange(index, "hex", e.target.value)}
                                    className="w-20 h-12 border border-neutral-300 rounded-lg cursor-pointer"
                                />
                                <button
                                    type="button"
                                    onClick={() => handleRemoveColor(index)}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
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
            <div className="flex items-center gap-4 pt-4">
                <button
                    type="submit"
                    disabled={loading}
                    className="bg-accent hover:bg-accent-dark disabled:bg-neutral-300 text-white px-8 py-4 rounded-lg font-heading font-bold text-lg uppercase tracking-wide transition-all hover:scale-105 hover:shadow-xl disabled:hover:scale-100 disabled:hover:shadow-none cursor-pointer disabled:cursor-not-allowed"
                >
                    {loading ? "Salvando..." : product ? "Atualizar Produto" : "Criar Produto"}
                </button>
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="bg-neutral-200 hover:bg-neutral-300 text-neutral-900 px-8 py-4 rounded-lg font-body font-semibold transition-all cursor-pointer"
                >
                    Cancelar
                </button>
            </div>
        </form >
    );
}
