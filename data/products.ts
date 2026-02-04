import { Product } from "@/types";

export const products: Product[] = [
    // Camisas - Brasileirão
    {
        id: "1",
        name: "Camisa Flamengo I 2024",
        slug: "camisa-flamengo-i-2024",
        description: "Camisa oficial do Flamengo, modelo I 2024. Tecido respirável com tecnologia Dri-FIT. Escudo bordado e patrocínios oficiais.",
        price: 299.90,
        images: [
            "/images/flamengo_camisa_1769881653584.png",
            "/images/flamengo_camisa_1769881653584.png"
        ],
        category: "camisas",
        league: "brasileirao",
        variants: [
            { size: "P", stock: 15 },
            { size: "M", stock: 20 },
            { size: "G", stock: 18 },
            { size: "GG", stock: 10 }
        ],
        featured: true,
        module: "sports"
    },
    {
        id: "2",
        name: "Camisa Corinthians I 2024",
        slug: "camisa-corinthians-i-2024",
        description: "Camisa oficial do Corinthians, modelo I 2024. Design clássico com listras pretas. Material de alta qualidade.",
        price: 289.90,
        images: [
            "/images/corinthians_camisa_1769881667607.png",
            "/images/corinthians_camisa_1769881667607.png"
        ],
        category: "camisas",
        league: "brasileirao",
        variants: [
            { size: "P", stock: 12 },
            { size: "M", stock: 25 },
            { size: "G", stock: 20 },
            { size: "GG", stock: 8 }
        ],
        featured: true,
        module: "sports"
    },
    {
        id: "3",
        name: "Camisa Palmeiras I 2024",
        slug: "camisa-palmeiras-i-2024",
        description: "Camisa oficial do Palmeiras, modelo I 2024. Verde tradicional com detalhes dourados. Tecnologia anti-suor.",
        price: 299.90,
        images: [
            "/images/palmeiras_camisa_1769881680747.png",
            "/images/palmeiras_camisa_1769881680747.png"
        ],
        category: "camisas",
        league: "brasileirao",
        variants: [
            { size: "P", stock: 10 },
            { size: "M", stock: 15 },
            { size: "G", stock: 22 },
            { size: "GG", stock: 12 }
        ],
        featured: false,
        module: "sports"
    },

    // Camisas - Champions League
    {
        id: "4",
        name: "Camisa Real Madrid I 2024",
        slug: "camisa-real-madrid-i-2024",
        description: "Camisa oficial do Real Madrid, modelo I 2024. Branco tradicional com detalhes dourados. Edição Champions League.",
        price: 349.90,
        images: [
            "/images/real_madrid_camisa_1769881694246.png",
            "/images/real_madrid_camisa_1769881694246.png"
        ],
        category: "camisas",
        league: "champions",
        variants: [
            { size: "P", stock: 8 },
            { size: "M", stock: 18 },
            { size: "G", stock: 15 },
            { size: "GG", stock: 7 }
        ],
        featured: true,
        module: "sports"
    },
    {
        id: "5",
        name: "Camisa Barcelona I 2024",
        slug: "camisa-barcelona-i-2024",
        description: "Camisa oficial do Barcelona, modelo I 2024. Listras azul e grená tradicionais. Tecnologia de ponta.",
        price: 349.90,
        images: [
            "/images/barcelona_camisa_1769881707885.png",
            "/images/barcelona_camisa_1769881707885.png"
        ],
        category: "camisas",
        league: "champions",
        variants: [
            { size: "P", stock: 10 },
            { size: "M", stock: 20 },
            { size: "G", stock: 16 },
            { size: "GG", stock: 9 }
        ],
        featured: true,
        module: "sports"
    },

    // Camisas - Seleções
    {
        id: "6",
        name: "Camisa Seleção Brasileira I 2024",
        slug: "camisa-selecao-brasileira-i-2024",
        description: "Camisa oficial da Seleção Brasileira, modelo I 2024. Amarelo canário com detalhes em verde. Edição Copa América.",
        price: 329.90,
        images: [
            "/images/brasil_camisa_1769881733519.png",
            "/images/brasil_camisa_1769881733519.png"
        ],
        category: "camisas",
        league: "selecoes",
        variants: [
            { size: "P", stock: 20 },
            { size: "M", stock: 30 },
            { size: "G", stock: 25 },
            { size: "GG", stock: 15 }
        ],
        featured: true,
        module: "sports"
    },
    {
        id: "7",
        name: "Camisa Seleção Argentina I 2024",
        slug: "camisa-selecao-argentina-i-2024",
        description: "Camisa oficial da Seleção Argentina, modelo I 2024. Listras azul e branco. Campeã do Mundo.",
        price: 329.90,
        images: [
            "/images/argentina_camisa_1769881748935.png",
            "/images/argentina_camisa_1769881748935.png"
        ],
        category: "camisas",
        league: "selecoes",
        variants: [
            { size: "P", stock: 12 },
            { size: "M", stock: 22 },
            { size: "G", stock: 18 },
            { size: "GG", stock: 10 }
        ],
        featured: false,
        module: "sports"
    },

    // Chuteiras
    {
        id: "8",
        name: "Chuteira Nike Mercurial Vapor 15",
        slug: "chuteira-nike-mercurial-vapor-15",
        description: "Chuteira Nike Mercurial Vapor 15 Elite FG. Tecnologia ACC para controle em qualquer condição climática. Solado para campo.",
        price: 1299.90,
        images: [
            "/images/nike_mercurial_1769881763424.png",
            "/images/nike_mercurial_1769881763424.png"
        ],
        category: "chuteiras",
        variants: [
            { size: "38", stock: 5 },
            { size: "39", stock: 8 },
            { size: "40", stock: 10 },
            { size: "41", stock: 12 },
            { size: "42", stock: 10 },
            { size: "43", stock: 6 },
            { size: "44", stock: 4 }
        ],
        featured: true,
        module: "sports"
    },
    {
        id: "9",
        name: "Chuteira Adidas Predator Elite",
        slug: "chuteira-adidas-predator-elite",
        description: "Chuteira Adidas Predator Elite FG. Elementos de borracha para controle máximo. Design agressivo e moderno.",
        price: 1199.90,
        images: [
            "/images/adidas_predator_1769881776782.png",
            "/images/adidas_predator_1769881776782.png"
        ],
        category: "chuteiras",
        variants: [
            { size: "38", stock: 6 },
            { size: "39", stock: 9 },
            { size: "40", stock: 11 },
            { size: "41", stock: 13 },
            { size: "42", stock: 11 },
            { size: "43", stock: 7 },
            { size: "44", stock: 5 }
        ],
        featured: true,
        module: "sports"
    },
    {
        id: "10",
        name: "Chuteira Puma Future Ultimate",
        slug: "chuteira-puma-future-ultimate",
        description: "Chuteira Puma Future Ultimate FG. Sistema de amarração adaptável. Tecnologia GripControl Pro para aderência superior.",
        price: 1099.90,
        images: [
            "/images/puma_future_1769881791579.png",
            "/images/puma_future_1769881791579.png"
        ],
        category: "chuteiras",
        variants: [
            { size: "38", stock: 4 },
            { size: "39", stock: 7 },
            { size: "40", stock: 9 },
            { size: "41", stock: 10 },
            { size: "42", stock: 9 },
            { size: "43", stock: 5 },
            { size: "44", stock: 3 }
        ],
        featured: false,
        module: "sports"
    },

    // Acessórios
    {
        id: "11",
        name: "Bola Nike Flight Brasileirão 2024",
        slug: "bola-nike-flight-brasileirao-2024",
        description: "Bola oficial do Campeonato Brasileiro 2024. Tecnologia AerowSculpt para trajetória precisa. Tamanho oficial.",
        price: 199.90,
        images: [
            "/images/bola_brasileirao_1769881803821.png",
            "/images/bola_brasileirao_1769881803821.png"
        ],
        category: "acessorios",
        league: "brasileirao",
        variants: [
            { size: "Único", stock: 50 }
        ],
        featured: false,
        module: "sports"
    },

    // ============================================
    // MÓDULO AUTOMOTIVE - Peças Automotivas
    // ============================================

    // Motor
    {
        id: "auto-1",
        name: "Filtro de Óleo Mann W950/26",
        slug: "filtro-oleo-mann-w950-26",
        description: "Filtro de óleo de alta qualidade Mann Filter. Compatível com diversos modelos VW, Fiat e GM. Garante proteção superior do motor.",
        price: 45.90,
        images: [
            "/images/filtro-oleo-placeholder.png",
            "/images/filtro-oleo-placeholder.png"
        ],
        category: "motor",
        variants: [
            { size: "Único", stock: 35 }
        ],
        featured: true,
        module: "automotive",
        automotiveFields: {
            brand: "Volkswagen, Fiat, GM",
            model: "Gol, Uno, Onix",
            yearStart: 2010,
            yearEnd: 2024,
            oemCode: "W950/26",
            partType: "Original"
        }
    },
    {
        id: "auto-2",
        name: "Vela de Ignição NGK BKR6E",
        slug: "vela-ignicao-ngk-bkr6e",
        description: "Vela de ignição NGK premium. Eletrodo de cobre para melhor condutividade. Jogo com 4 unidades.",
        price: 89.90,
        images: [
            "/images/vela-ignicao-placeholder.png",
            "/images/vela-ignicao-placeholder.png"
        ],
        category: "motor",
        variants: [
            { size: "Jogo 4un", stock: 28 }
        ],
        featured: true,
        module: "automotive",
        automotiveFields: {
            brand: "Honda, Toyota, Nissan",
            model: "Civic, Corolla, March",
            yearStart: 2008,
            yearEnd: 2023,
            oemCode: "BKR6E",
            partType: "Original"
        }
    },

    // Suspensão
    {
        id: "auto-3",
        name: "Amortecedor Dianteiro Cofap",
        slug: "amortecedor-dianteiro-cofap",
        description: "Amortecedor dianteiro Cofap Turbogas. Tecnologia a gás para maior conforto e durabilidade. Par (2 unidades).",
        price: 389.90,
        images: [
            "/images/amortecedor-placeholder.png",
            "/images/amortecedor-placeholder.png"
        ],
        category: "suspensao",
        variants: [
            { size: "Par", stock: 12 }
        ],
        featured: true,
        module: "automotive",
        automotiveFields: {
            brand: "Volkswagen",
            model: "Gol, Voyage, Saveiro",
            yearStart: 2013,
            yearEnd: 2024,
            oemCode: "GA54321",
            partType: "Original"
        }
    },
    {
        id: "auto-4",
        name: "Kit Batente Amortecedor Traseiro",
        slug: "kit-batente-amortecedor-traseiro",
        description: "Kit completo com batente e coifa para amortecedor traseiro. Borracha de alta resistência.",
        price: 65.90,
        images: [
            "/images/batente-placeholder.png",
            "/images/batente-placeholder.png"
        ],
        category: "suspensao",
        variants: [
            { size: "Kit", stock: 20 }
        ],
        featured: false,
        module: "automotive",
        automotiveFields: {
            brand: "Fiat",
            model: "Palio, Siena, Strada",
            yearStart: 2012,
            yearEnd: 2023,
            oemCode: "51892345",
            partType: "Paralela"
        }
    },

    // Freios
    {
        id: "auto-5",
        name: "Pastilha de Freio Bosch Dianteira",
        slug: "pastilha-freio-bosch-dianteira",
        description: "Pastilha de freio cerâmica Bosch. Baixo nível de ruído e poeira. Jogo completo para eixo dianteiro.",
        price: 159.90,
        images: [
            "/images/pastilha-freio-placeholder.png",
            "/images/pastilha-freio-placeholder.png"
        ],
        category: "freios",
        variants: [
            { size: "Jogo", stock: 25 }
        ],
        featured: true,
        module: "automotive",
        automotiveFields: {
            brand: "Chevrolet",
            model: "Onix, Prisma, Spin",
            yearStart: 2012,
            yearEnd: 2024,
            oemCode: "BB1234",
            partType: "Original"
        }
    },
    {
        id: "auto-6",
        name: "Disco de Freio Ventilado Par",
        slug: "disco-freio-ventilado-par",
        description: "Par de discos de freio ventilados. Ferro fundido de alta qualidade. Melhor dissipação de calor.",
        price: 289.90,
        images: [
            "/images/disco-freio-placeholder.png",
            "/images/disco-freio-placeholder.png"
        ],
        category: "freios",
        variants: [
            { size: "Par", stock: 15 }
        ],
        featured: false,
        module: "automotive",
        automotiveFields: {
            brand: "Volkswagen",
            model: "Jetta, Passat, Tiguan",
            yearStart: 2015,
            yearEnd: 2024,
            oemCode: "5C0615301",
            partType: "Original"
        }
    },

    // Elétrica
    {
        id: "auto-7",
        name: "Bateria Moura 60Ah",
        slug: "bateria-moura-60ah",
        description: "Bateria automotiva Moura 60Ah. Tecnologia de prata para maior durabilidade. 18 meses de garantia.",
        price: 549.90,
        images: [
            "/images/bateria-placeholder.png",
            "/images/bateria-placeholder.png"
        ],
        category: "eletrica",
        variants: [
            { size: "60Ah", stock: 18 }
        ],
        featured: true,
        module: "automotive",
        automotiveFields: {
            brand: "Universal",
            model: "Diversos modelos",
            yearStart: 2000,
            yearEnd: 2024,
            oemCode: "M60GD",
            partType: "Original"
        }
    },

    // Carroceria
    {
        id: "auto-8",
        name: "Farol Dianteiro Esquerdo",
        slug: "farol-dianteiro-esquerdo",
        description: "Farol dianteiro lado esquerdo. Lente de policarbonato resistente. Compatível com lâmpadas H4.",
        price: 425.90,
        images: [
            "/images/farol-placeholder.png",
            "/images/farol-placeholder.png"
        ],
        category: "carroceria",
        variants: [
            { size: "Único", stock: 8 }
        ],
        featured: false,
        module: "automotive",
        automotiveFields: {
            brand: "Hyundai",
            model: "HB20, HB20S",
            yearStart: 2012,
            yearEnd: 2019,
            oemCode: "92101-1S010",
            partType: "Paralela"
        }
    },

    // Acessórios Auto
    {
        id: "auto-9",
        name: "Tapete Automotivo Borracha Premium",
        slug: "tapete-automotivo-borracha-premium",
        description: "Jogo de tapetes em borracha premium. 4 peças com encaixe universal. Fácil limpeza e alta durabilidade.",
        price: 129.90,
        images: [
            "/images/tapete-placeholder.png",
            "/images/tapete-placeholder.png"
        ],
        category: "acessorios-auto",
        variants: [
            { size: "Jogo 4pç", stock: 40 }
        ],
        featured: false,
        module: "automotive",
        automotiveFields: {
            brand: "Universal",
            model: "Todos",
            partType: "Acessório"
        }
    },
    {
        id: "auto-10",
        name: "Capa de Volante Couro Ecológico",
        slug: "capa-volante-couro-ecologico",
        description: "Capa de volante em couro ecológico premium. Costura reforçada. Tamanho universal com elástico.",
        price: 79.90,
        images: [
            "/images/capa-volante-placeholder.png",
            "/images/capa-volante-placeholder.png"
        ],
        category: "acessorios-auto",
        variants: [
            { size: "Universal", stock: 55 }
        ],
        featured: false,
        module: "automotive",
        automotiveFields: {
            brand: "Universal",
            model: "Todos",
            partType: "Acessório"
        }
    }
];
