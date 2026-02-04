import { StoreModule } from "@/types";
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
    module: StoreModule;
    parentId?: string | null;
    createdAt: number;
    image?: string;
}

export interface League {
    id: string;
    name: string;
    slug: string;
    active: boolean;
    module: StoreModule;
    createdAt: number;
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

// Filtrar categorias por módulo (Deprecating module filter)
export async function getCategoriesByModule(module: StoreModule): Promise<Category[]> {
    return getAllCategories();
}

// Versão cacheada para o dashboard
export async function getCachedCategoriesByModule(module: StoreModule) {
    return unstable_cache(
        async () => getAllCategories(),
        ["categories-list", "all"], // Unified cache tag
        { tags: ["categories"] }
    )();
}

// Obter categorias para exibir na navbar
export async function getCategoriesForNavbar(module?: StoreModule): Promise<Category[]> {
    await connectDB();
    // Ordenar por ordem ou nome se necessário, aqui sem ordem específica
    const categories = await CategoryModel.find({ active: true, showInNavbar: true }).lean();
    return categories.map((c: any) => ({ ...c, id: c.id || c._id.toString() })) as unknown as Category[];
}

import { League as LeagueModel } from "@/lib/models/league";

// Leagues CRUD
export async function getAllLeagues(): Promise<League[]> {
    await connectDB();
    const leagues = await LeagueModel.find().lean();
    return leagues.map((l: any) => ({ ...l, id: l.id || l._id.toString() })) as unknown as League[];
}

export async function getLeaguesByModule(module: StoreModule): Promise<League[]> {
    return getAllLeagues();
}

export async function getLeagueById(id: string): Promise<League | undefined> {
    await connectDB();
    const league = await LeagueModel.findOne({ id }).lean();
    if (!league) return undefined;
    return { ...league, id: league.id || (league as any)._id.toString() } as unknown as League;
}

export async function createLeague(league: Omit<League, "id" | "createdAt">): Promise<League> {
    await connectDB();
    const newLeague = await LeagueModel.create({
        ...league,
        id: `league-${Date.now()}`,
    });
    return newLeague.toObject() as unknown as League;
}

export async function updateLeague(id: string, updates: Partial<League>): Promise<League | null> {
    await connectDB();
    const league = await LeagueModel.findOneAndUpdate(
        { id },
        updates,
        { new: true }
    ).lean();
    return league as unknown as League;
}

export async function deleteLeague(id: string): Promise<boolean> {
    await connectDB();
    const result = await LeagueModel.deleteOne({ id });
    return result.deletedCount > 0;
}
