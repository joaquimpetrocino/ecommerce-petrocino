"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronDown } from "lucide-react";

interface Model {
    id: string;
    name: string;
}

export function ModelFilter() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const currentBrand = searchParams.get("brand");
    const currentModel = searchParams.get("model") || "";

    const [models, setModels] = useState<Model[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!currentBrand) {
            setModels([]);
            return;
        }

        setLoading(true);
        fetch(`/api/models?brandId=${currentBrand}`)
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setModels(data);
                }
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, [currentBrand]);

    const handleModelChange = (modelId: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (modelId) {
            params.set("model", modelId);
        } else {
            params.delete("model");
        }
        router.push(`/produtos?${params.toString()}`);
    };

    const [isOpen, setIsOpen] = useState(true);

    if (!currentBrand) return null; // Only show if brand is selected? Standard behavior often.
    if (loading) return <div className="animate-pulse h-10 bg-neutral-100 rounded-lg"></div>;
    if (models.length === 0) return null;

    return (
        <div className="space-y-4 border-t border-neutral-100 pt-6">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between group"
            >
                <h3 className="font-heading font-bold text-neutral-900 uppercase tracking-wider text-xs flex items-center gap-2">
                    <span className="w-1 h-4 bg-accent rounded-full"></span>
                    Modelos
                </h3>
                <div className="flex items-center gap-2">
                    {currentModel && (
                        <span
                            onClick={(e) => {
                                e.stopPropagation();
                                handleModelChange("");
                            }}
                            className="text-[10px] uppercase font-bold text-neutral-400 hover:text-red-500 transition-colors z-10"
                        >
                            Limpar
                        </span>
                    )}
                    <ChevronDown className={`w-4 h-4 text-neutral-400 group-hover:text-primary transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
                </div>
            </button>

            {isOpen && (
                <div className="space-y-1 max-h-48 overflow-y-auto pr-2 custom-scrollbar animate-in slide-in-from-top-2 duration-200">
                    {models.map((model) => (
                        <button
                            key={model.id}
                            onClick={() => handleModelChange(model.id)}
                            className={`
                                w-full flex items-center justify-between px-3 py-2 rounded-lg font-body text-sm font-medium transition-all
                                ${currentModel === model.id
                                    ? "bg-accent/5 text-accent border-r-2 border-accent"
                                    : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
                                }
                            `}
                        >
                            <span>{model.name}</span>
                            {currentModel === model.id && (
                                <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
