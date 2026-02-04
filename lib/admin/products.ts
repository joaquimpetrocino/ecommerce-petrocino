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

// Filtros específicos (Deprecating module filter)
export async function getProductsByModule(module: StoreModule): Promise<Product[]> {
    await connectDB();
    const products = await ProductModel.find({ active: true }).lean();
    return products.map((p: any) => ({ ...p, id: p.id || p._id.toString() })) as unknown as Product[];
}

// Versão cacheada para o dashboard
export async function getCachedProductsByModule(module: StoreModule) {
    return unstable_cache(
        async () => getAllProducts(),
        ["products-list", "all"], // Unified cache tag
        { tags: ["products"] }
    )();
}

export async function getFeaturedProducts(module?: StoreModule): Promise<Product[]> {
    await connectDB();
    const products = await ProductModel.find({ featured: true, active: true }).lean();
    return products.map((p: any) => ({ ...p, id: p.id || p._id.toString() })) as unknown as Product[];
}

export async function getProductsByCategory(slug: string, module?: StoreModule): Promise<Product[]> {
    await connectDB();
    const products = await ProductModel.find({ category: slug, active: true }).lean();
    return products.map((p: any) => ({ ...p, id: p.id || p._id.toString() })) as unknown as Product[];
}

export async function getRelatedProducts(productId: string, module?: StoreModule): Promise<Product[]> {
    await connectDB();
    const product = await ProductModel.findOne({ id: productId });
    if (!product) return [];

    // Buscar produtos da mesma categoria, excluindo o atual
    const related = await ProductModel.find({
        category: product.category,
        id: { $ne: productId },
        active: true
    }).limit(4).lean();

    return related.map((p: any) => ({ ...p, id: p.id || p._id.toString() })) as unknown as Product[];
}

export async function decrementProductStock(productId: string, variantSize: string, quantity: number): Promise<boolean> {
    await connectDB();
    const product = await ProductModel.findOne({ id: productId });

    if (!product) return false;

    const variantIndex = product.variants.findIndex((v: any) => v.size === variantSize);
    if (variantIndex === -1) return false;

    // Check if enough stock
    if (product.variants[variantIndex].stock < quantity) return false;

    product.variants[variantIndex].stock -= quantity;
    await product.save();

    return true;
}
