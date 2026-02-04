import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { StoreConfig } from "@/lib/models/store-config";
import { Category } from "@/lib/models/category";
import { Product } from "@/lib/models/product";
import { HomeSection } from "@/lib/models/home-section";
import { ProductQuestion } from "@/lib/models/question";

import { getStoreConfig } from "@/lib/admin/store-config";
import { getAllCategories } from "@/lib/admin/categories";
import { products } from "@/data/products";
import { getAllSections } from "@/lib/admin/home-sections";
import { getAllQuestions } from "@/lib/admin/product-questions";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const key = searchParams.get("key");

    if (key !== "secret_seed_key") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        await connectDB();

        // 1. Store Config
        await StoreConfig.deleteMany({});
        const configData = getStoreConfig();
        // Mongoose espera _id, mas temos id. Vamos deixar o Mongo criar _id e salvar id como string
        // Ajustamos o model para id: String
        await StoreConfig.create(configData);

        // 2. Categories
        await Category.deleteMany({});
        const categoriesData = await getAllCategories();
        await Category.insertMany(categoriesData);

        // 3. Products
        await Product.deleteMany({});
        // Precisamos ajustar algumas coisas se necessario, mas o schema deve bater
        await Product.insertMany(products);

        // 4. Home Sections
        await HomeSection.deleteMany({});
        const sectionsData = await getAllSections();
        await HomeSection.insertMany(sectionsData);

        // 5. Questions
        await ProductQuestion.deleteMany({});
        const questionsData = await getAllQuestions();
        await ProductQuestion.insertMany(questionsData);

        return NextResponse.json({
            success: true,
            message: "Database seeded successfully",
            counts: {
                categories: categoriesData.length,
                products: products.length,
                sections: sectionsData.length,
                questions: questionsData.length
            }
        });
    } catch (error: any) {
        console.error("Seed error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
