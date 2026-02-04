import { NextResponse } from "next/server";
import { getActiveSectionsByModule } from "@/lib/admin/home-sections";
import { getStoreConfig } from "@/lib/admin/store-config";

// API pública para a home page consumir as seções ativas do módulo atual
export async function GET() {
    const storeConfig = await getStoreConfig();
    const sections = await getActiveSectionsByModule(storeConfig.module);

    // Conteúdo dinâmico do Hero baseado no módulo
    // Conteúdo dinâmico do Hero baseado no módulo (agora vindo da config salva)
    const defaults = storeConfig.module === "sports"
        ? {
            title: "Sua Paixão, Nosso Jogo",
            subtitle: "Os melhores artigos esportivos de futebol para você jogar como um profissional.",
            bannerUrl: "https://images.unsplash.com/photo-1522778119026-d647f0596c20?q=80&w=2000",
            badge: "Loja Oficial de Esportes"
        }
        : {
            title: "Performance e Potência",
            subtitle: "Peças automotivas de alta qualidade para manter seu veículo em máxima performance.",
            bannerUrl: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?q=80&w=2000",
            badge: "Peças Originais e Importadas"
        };

    // Tenta pegar da config salva, se não tiver, usa default
    const savedHero = storeConfig.hero?.[storeConfig.module];
    const heroContent = { ...defaults, ...savedHero };

    return NextResponse.json({
        sections,
        hero: heroContent,
        module: storeConfig.module
    });
}
