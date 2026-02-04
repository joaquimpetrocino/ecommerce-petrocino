import { NextResponse } from "next/server";
import { getActiveSectionsByModule } from "@/lib/admin/home-sections";
import { getStoreConfig } from "@/lib/admin/store-config";

// API pública para a home page consumir as seções ativas do módulo atual
export async function GET() {
    const storeConfig = await getStoreConfig();
    const sections = await getActiveSectionsByModule("sports"); // Module ignored

    // Conteúdo dinâmico do Hero vindo da config única
    const defaults = {
        title: "Sua Paixão, Nosso Jogo",
        subtitle: "Os melhores artigos esportivos.",
        bannerUrl: "https://images.unsplash.com/photo-1522778119026-d647f0596c20?q=80&w=2000",
        badge: "Loja Oficial"
    };

    // Merge defaults with saved config (now flattened)
    const heroContent = { ...defaults, ...storeConfig.hero };

    return NextResponse.json({
        sections,
        hero: heroContent,
        module: "unified"
    });
}
