import { Product } from "@/types";
import { ProductCard } from "./product-card";

interface ProductGridProps {
    products: Product[];
}

export function ProductGrid({ products }: ProductGridProps) {
    if (products.length === 0) {
        return (
            <div className="py-12 text-center">
                <p className="text-lg text-gray-500">Nenhum produto encontrado.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
                <ProductCard key={product.id} product={product} />
            ))}
        </div>
    );
}
