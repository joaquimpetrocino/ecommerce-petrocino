import { Product, StoreModule } from "@/types";
import connectDB from "@/lib/db";
import { Product as ProductModel } from "@/lib/models/product";
import { unstable_cache } from "next/cache";

// Products CRUD
export async function getAllProducts(): Promise<Product[]> {
    await connectDB();
    const products = await ProductModel.find().lean();
    return products.map((p: any) => ({ ...p, id: p.id || p._id.toString() })) as unknown as Product[];
}

export async function getProductById(id: string): Promise<Product | undefined> {
    await connectDB();
    const product = await ProductModel.findOne({ id }).lean();
    if (!product) return undefined;
    return { ...product, id: product.id || (product as any)._id.toString() } as unknown as Product;
}

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
    await connectDB();
    const product = await ProductModel.findOne({ slug }).lean();
    if (!product) return undefined;
    return { ...product, id: product.id || (product as any)._id.toString() } as unknown as Product;
}

export async function createProduct(product: Omit<Product, "id">): Promise<Product> {
    await connectDB();
    const newProduct = await ProductModel.create({
        ...product,
        id: `prod-${Date.now()}`, // Fallback ID generator if not provided, basically mimicking mock logic
        // But seed data already has IDs.
        // Usually we let mongo generate IDs but we want to keep string IDs for URLs.
        // We will generate a unique ID.
    });
    return newProduct.toObject() as unknown as Product;
}

export async function updateProduct(id: string, updates: Partial<Product>): Promise<Product | null> {
    await connectDB();
    const product = await ProductModel.findOneAndUpdate(
        { id },
        updates,
        { new: true }
    ).lean();
    return product as unknown as Product;
}

export async function deleteProduct(id: string): Promise<boolean> {
    await connectDB();
    const result = await ProductModel.deleteOne({ id });
    return result.deletedCount > 0;
}

// Filtros específicos
export async function getProductsByModule(module: StoreModule): Promise<Product[]> {
    await connectDB();
    const products = await ProductModel.find({ module }).lean();
    return products.map((p: any) => ({ ...p, id: p.id || p._id.toString() })) as unknown as Product[];
}

// Versão cacheada para o dashboard
export async function getCachedProductsByModule(module: StoreModule) {
    return unstable_cache(
        async () => getProductsByModule(module),
        ["products-list", module],
        { tags: ["products"] }
    )();
}

export async function getFeaturedProducts(module: StoreModule): Promise<Product[]> {
    await connectDB();
    const products = await ProductModel.find({ module, featured: true }).lean();
    return products.map((p: any) => ({ ...p, id: p.id || p._id.toString() })) as unknown as Product[];
}

export async function getProductsByCategory(slug: string, module: StoreModule): Promise<Product[]> {
    // Buscar produtos onde category match o slug E module match
    // Mas category no produto é o slug da categoria ou ID?
    // No mock data: category: "camisas" (que é o slug/id da categoria?)
    // No model Product, category é String.
    await connectDB();
    const products = await ProductModel.find({ module, category: slug }).lean();
    return products.map((p: any) => ({ ...p, id: p.id || p._id.toString() })) as unknown as Product[];
}

export async function getRelatedProducts(productId: string, module: StoreModule): Promise<Product[]> {
    await connectDB();
    const product = await ProductModel.findOne({ id: productId });
    if (!product) return [];

    // Buscar produtos da mesma categoria, excluindo o atual
    const related = await ProductModel.find({
        module,
        category: product.category,
        id: { $ne: productId }
    }).limit(4).lean();

    return related.map((p: any) => ({ ...p, id: p.id || p._id.toString() })) as unknown as Product[];
}
