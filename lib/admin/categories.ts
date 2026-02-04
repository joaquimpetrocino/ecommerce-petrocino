import connectDB from "@/lib/db";
import { Category as CategoryModel } from "@/lib/models/category";
import { unstable_cache } from "next/cache";

export interface Category {
    id: string;
    name: string;
    slug: string;
    description: string;
    active: boolean;
    showInNavbar: boolean;
    parentId?: string | null;
    parentIds?: string[];
    createdAt: number;
    image?: string;
}


// Categories CRUD
export async function getAllCategories(): Promise<Category[]> {
    await connectDB();
    const categories = await CategoryModel.find().lean();
    return categories.map((c: any) => ({ ...c, id: c.id || c._id.toString() })) as unknown as Category[];
}

export async function getCategoryById(id: string): Promise<Category | undefined> {
    await connectDB();
    const category = await CategoryModel.findOne({ id }).lean();
    if (!category) return undefined;
    return { ...category, id: category.id || (category as any)._id.toString() } as unknown as Category;
}

export async function createCategory(category: Omit<Category, "id" | "createdAt">): Promise<Category> {
    await connectDB();
    const newCategory = await CategoryModel.create({
        ...category,
        id: `cat-${Date.now()}`,
    });
    return newCategory.toObject() as unknown as Category;
}

export async function updateCategory(id: string, updates: Partial<Category>): Promise<Category | null> {
    await connectDB();
    const category = await CategoryModel.findOneAndUpdate(
        { id },
        updates,
        { new: true }
    ).lean();
    return category as unknown as Category;
}

export async function deleteCategory(id: string): Promise<boolean> {
    await connectDB();
    const result = await CategoryModel.deleteOne({ id });
    return result.deletedCount > 0;
}

// Obter todas as categorias (sem módulo)
export async function getCategoriesByModule(module?: string): Promise<Category[]> {
    return getAllCategories();
}

// Versão cacheada para o dashboard
export async function getCachedCategoriesByModule() {
    return unstable_cache(
        async () => getAllCategories(),
        ["categories-list", "all"], // Unified cache tag
        { tags: ["categories"] }
    )();
}

// Obter categorias para exibir na navbar
export async function getCategoriesForNavbar(): Promise<Category[]> {
    await connectDB();
    // Ordenar por ordem ou nome se necessário, aqui sem ordem específica
    const categories = await CategoryModel.find({ active: true, showInNavbar: true }).lean();
    return categories.map((c: any) => ({ ...c, id: c.id || c._id.toString() })) as unknown as Category[];
}

