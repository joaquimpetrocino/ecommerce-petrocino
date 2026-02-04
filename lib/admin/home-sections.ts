
import { StoreModule } from "@/types";
import connectDB from "@/lib/db";
import { HomeSection as HomeSectionModel } from "@/lib/models/home-section";

export interface HomeSection {
    id: string;
    type: "featured" | "category" | "cta";
    title: string;
    description?: string;
    active: boolean;
    order: number;
    createdAt: number;
    module: StoreModule;
    productIds?: string[];
    categorySlug?: string;
    categoryName?: string;
    buttonText?: string;
    ctaLink?: string;
    backgroundImage?: string;
}

// CRUD Operations
export async function getAllSections(): Promise<HomeSection[]> {
    await connectDB();
    const sections = await HomeSectionModel.find().session(null).sort({ order: 1 }).lean();
    return sections.map((s: any) => ({ ...s, id: s.id || s._id.toString() })) as unknown as HomeSection[];
}

export async function getActiveSections(): Promise<HomeSection[]> {
    await connectDB();
    const sections = await HomeSectionModel.find({ active: true }).sort({ order: 1 }).lean();
    return sections.map((s: any) => ({ ...s, id: s.id || s._id.toString() })) as unknown as HomeSection[];
}

export async function getSectionsByModule(module: StoreModule): Promise<HomeSection[]> {
    await connectDB();
    const sections = await HomeSectionModel.find({ module }).sort({ order: 1 }).lean();
    return sections.map((s: any) => ({ ...s, id: s.id || s._id.toString() })) as unknown as HomeSection[];
}

export async function getActiveSectionsByModule(module: StoreModule): Promise<HomeSection[]> {
    await connectDB();
    const sections = await HomeSectionModel.find({ module, active: true }).sort({ order: 1 }).lean();
    return sections.map((s: any) => ({ ...s, id: s.id || s._id.toString() })) as unknown as HomeSection[];
}

export async function getSectionById(id: string): Promise<HomeSection | undefined> {
    await connectDB();
    const section = await HomeSectionModel.findOne({ id }).lean();
    if (!section) return undefined;
    return { ...section, id: section.id || (section as any)._id.toString() } as unknown as HomeSection;
}

export async function createSection(section: Omit<HomeSection, "id" | "createdAt">): Promise<HomeSection> {
    await connectDB();
    const newSection = await HomeSectionModel.create({
        ...section,
        id: `section-${Date.now()}`,
    });
    return newSection.toObject() as unknown as HomeSection;
}

export async function updateSection(id: string, updates: Partial<HomeSection>): Promise<HomeSection | null> {
    await connectDB();
    const section = await HomeSectionModel.findOneAndUpdate(
        { id },
        updates,
        { new: true }
    ).lean();
    return section as unknown as HomeSection;
}

export async function deleteSection(id: string): Promise<boolean> {
    await connectDB();
    const result = await HomeSectionModel.deleteOne({ id });
    return result.deletedCount > 0;
}

export async function reorderSections(sectionIds: string[]): Promise<boolean> {
    await connectDB();
    // Bulk write is better for reordering
    const ops = sectionIds.map((id, index) => ({
        updateOne: {
            filter: { id },
            update: { order: index + 1 }
        }
    }));

    try {
        await HomeSectionModel.bulkWrite(ops);
        return true;
    } catch {
        return false;
    }
}
