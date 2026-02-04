"use client";

import { useRouter } from "next/navigation";
import { ProductForm } from "@/components/admin/product-form";
import { Product } from "@/types";
import { toast } from "sonner";

export default function NewProductPage() {
    const router = useRouter();

    const handleSubmit = async (product: Product) => {
        try {
            const res = await fetch("/api/admin/products", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(product),
            });

            if (res.ok) {
                toast.success("Produto criado com sucesso!");
                router.push("/admin/produtos");
            } else {
                toast.error("Erro do servidor ao criar produto.");
                throw new Error("Erro ao criar produto");
            }
        } catch (error) {
            toast.error("Erro de rede ao tentar criar o produto.");
            throw error;
        }
    };

    return (
        <div>
            <h1 className="font-heading font-bold text-neutral-900 text-4xl uppercase tracking-tight mb-8">
                Novo Produto
            </h1>
            <ProductForm onSubmit={handleSubmit} />
        </div>
    );
}
