"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ProductForm } from "@/components/admin/product-form";
import { Product } from "@/types";
import { toast } from "sonner";

export default function EditProductPage() {
    const router = useRouter();
    const params = useParams();
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProduct();
    }, []);

    const fetchProduct = async () => {
        try {
            const res = await fetch(`/api/admin/products/${params.id}`);
            if (res.ok) {
                const data = await res.json();
                setProduct(data);
            } else {
                toast.error("Produto não encontrado.");
                router.push("/admin/produtos");
            }
        } catch (error) {
            console.error("Erro ao carregar produto:", error);
            toast.error("Erro ao carregar os dados do produto.");
            router.push("/admin/produtos");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (updatedProduct: Product) => {
        try {
            const res = await fetch(`/api/admin/products/${params.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updatedProduct),
            });

            if (res.ok) {
                toast.success("Produto atualizado com sucesso!");
                router.push("/admin/produtos");
            } else {
                toast.error("Erro ao salvar as alterações.");
                throw new Error("Erro ao atualizar produto");
            }
        } catch (error) {
            toast.error("Erro de conexão ao salvar.");
            throw error;
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="text-neutral-600 font-body">Carregando produto...</p>
            </div>
        );
    }

    if (!product) {
        return null;
    }

    return (
        <div>
            <h1 className="font-heading font-bold text-neutral-900 text-4xl uppercase tracking-tight mb-8">
                Editar Produto
            </h1>
            <ProductForm product={product} onSubmit={handleSubmit} />
        </div>
    );
}
