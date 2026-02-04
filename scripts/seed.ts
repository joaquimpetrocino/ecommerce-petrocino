
import mongoose from "mongoose";
import { StoreConfig } from "../lib/models/store-config.js";
import { Category } from "../lib/models/category.js";
import { Product } from "../lib/models/product.js";
import { HomeSection } from "../lib/models/home-section.js";

// Note: Using .js extension for imports because we'll run this with tsx/node directly
// and it often helps with ESM/TS compatibility in standalone scripts.

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error("MONGODB_URI não encontrado no ambiente.");
    process.exit(1);
}

async function seed() {
    try {
        console.log("Conectando ao MongoDB...");
        await mongoose.connect(MONGODB_URI as string);
        console.log("Conectado!");

        // 1. Limpar coleções
        console.log("Limpando coleções existentes...");
        await StoreConfig.deleteMany({});
        await Category.deleteMany({});
        await Product.deleteMany({});
        await HomeSection.deleteMany({});

        // 2. Seed StoreConfig
        console.log("Inserindo Configuração da Loja...");
        await StoreConfig.create({
            id: "main-config",
            module: "sports",
            storeName: "LeagueSports",
            storeEmail: "contato@leaguesports.com",
            storePhone: "(11) 99999-9999",
            storeAddress: "Rua Exemplo, 123 - São Paulo, SP",
            whatsappNumber: "5511999999999",
            enableWhatsApp: true,
            hero: {
                sports: {
                    title: "Sua Paixão, Nosso Jogo",
                    subtitle: "Os melhores artigos esportivos de futebol.",
                    bannerUrl: "https://images.unsplash.com/photo-1522778119026-d647f0596c20?q=80&w=2000",
                    badge: "Loja Oficial"
                },
                automotive: {
                    title: "Peças de Alta Performance",
                    subtitle: "Tudo para o seu veículo em um só lugar.",
                    bannerUrl: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?q=80&w=2000",
                    badge: "Premium Auto"
                }
            }
        });

        // 3. Seed Categories
        console.log("Inserindo Categorias...");
        const categories = await Category.insertMany([
            // Sports
            { id: "cat-1", name: "Chuteiras", slug: "chuteiras", description: "Chuteiras profissionais e amadoras", active: true, showInNavbar: true, module: "sports" },
            { id: "cat-2", name: "Camisas", slug: "camisas", description: "Camisas oficiais de times", active: true, showInNavbar: true, module: "sports" },
            { id: "cat-3", name: "Equipamentos", slug: "equipamentos", description: "Bolas, luvas e caneleiras", active: true, showInNavbar: true, module: "sports" },
            // Automotive
            { id: "cat-4", name: "Motor", slug: "motor", description: "Peças internas e externas do motor", active: true, showInNavbar: true, module: "automotive" },
            { id: "cat-5", name: "Freios", slug: "freios", description: "Discos, pastilhas e fluídos", active: true, showInNavbar: true, module: "automotive" },
            { id: "cat-6", name: "Suspensão", slug: "suspensao", description: "Amortecedores e molas", active: true, showInNavbar: true, module: "automotive" },
        ]);

        // 4. Seed Products
        console.log("Inserindo Produtos...");
        const products = await Product.insertMany([
            // Sports - Chuteiras
            {
                id: "prod-1",
                name: "Chuteira Nike Mercurial Vapor 15",
                slug: "chuteira-nike-mercurial-vapor-15",
                description: "Chuteira de alta performance para gramado natural.",
                price: 1299.90,
                category: "Chuteiras",
                categorySlug: "chuteiras",
                images: ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1000"],
                featured: true,
                active: true,
                module: "sports",
                variants: [{ size: "40", stock: 10 }, { size: "41", stock: 5 }],
                colors: [{ name: "Amarelo", hex: "#FFFF00" }]
            },
            {
                id: "prod-2",
                name: "Camisa Brasil Oficial 2024",
                slug: "camisa-brasil-oficial-2024",
                description: "A amarelinha original com tecnologia de ponta.",
                price: 349.90,
                category: "Camisas",
                categorySlug: "camisas",
                images: ["https://images.unsplash.com/photo-1551927336-09d50efd69cd?q=80&w=1000"],
                featured: true,
                active: true,
                module: "sports",
                variants: [{ size: "M", stock: 20 }, { size: "G", stock: 15 }],
                colors: [{ name: "Amarelo", hex: "#FFDF00" }]
            },
            // Automotive - Motor
            {
                id: "prod-3",
                name: "Kit Pistão e Anéis Forjados",
                slug: "kit-pistao-aneis-forjados",
                description: "Kit para motores de alta performance e turbo.",
                price: 2450.00,
                category: "Motor",
                categorySlug: "motor",
                images: ["https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?q=80&w=1000"],
                featured: true,
                active: true,
                module: "automotive",
                automotiveFields: {
                    brand: "MetalLeve",
                    model: "Universal 2.0",
                    yearStart: 2010,
                    yearEnd: 2023,
                    partType: "Pistão"
                }
            }
        ]);

        // 5. Seed HomeSections
        console.log("Inserindo Seções da Home...");
        await HomeSection.insertMany([
            {
                id: "sec-1",
                type: "featured",
                title: "Destaques da Temporada",
                description: "Confira as chuteiras mais desejadas pelos craques.",
                active: true,
                order: 1,
                module: "sports",
                productIds: [products[0].id, products[1].id]
            },
            {
                id: "sec-2",
                type: "cta",
                title: "Equipe seu Carro com o Melhor",
                description: "Peças de reposição e performance com garantia.",
                active: true,
                order: 1,
                module: "automotive",
                buttonText: "Ver Peças de Motor",
                ctaLink: "/produtos?category=motor"
            }
        ]);

        console.log("Database seeded successfully!");
        process.exit(0);
    } catch (error) {
        console.error("Erro ao rodar seed:", error);
        process.exit(1);
    }
}

seed();
