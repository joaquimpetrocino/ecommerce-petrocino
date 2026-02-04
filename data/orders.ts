import { Order } from "@/types";

export const orders: Order[] = [
    {
        id: "ord-1",
        orderId: "LS2024001",
        items: [
            {
                productName: "Camisa Flamengo I 2024",
                variantSize: "M",
                quantity: 1,
                unitPrice: 299.90
            },
            {
                productName: "Caneleira Nike Mercurial Lite",
                variantSize: "M",
                quantity: 1,
                unitPrice: 89.90
            }
        ],
        total: 389.80,
        customerData: {
            name: "João Silva",
            phone: "11987654321",
            address: "Rua das Flores, 123 - São Paulo, SP"
        },
        status: "entregue",
        createdAt: Date.now() - 7 * 24 * 60 * 60 * 1000, // 7 dias atrás
        updatedAt: Date.now() - 2 * 24 * 60 * 60 * 1000,
        notes: "Cliente solicitou entrega expressa. Pedido entregue com sucesso."
    },
    {
        id: "ord-2",
        orderId: "LS2024002",
        items: [
            {
                productName: "Chuteira Nike Mercurial Vapor 15",
                variantSize: "42",
                quantity: 1,
                unitPrice: 1299.90
            }
        ],
        total: 1299.90,
        customerData: {
            name: "Maria Santos",
            phone: "11976543210",
            address: "Av. Paulista, 1000 - São Paulo, SP"
        },
        status: "enviado",
        createdAt: Date.now() - 3 * 24 * 60 * 60 * 1000, // 3 dias atrás
        updatedAt: Date.now() - 1 * 24 * 60 * 60 * 1000,
        notes: "Código de rastreamento: BR123456789"
    },
    {
        id: "ord-3",
        orderId: "LS2024003",
        items: [
            {
                productName: "Camisa Seleção Brasileira I 2024",
                variantSize: "G",
                quantity: 2,
                unitPrice: 329.90
            }
        ],
        total: 659.80,
        customerData: {
            name: "Pedro Oliveira",
            phone: "21987654321",
            address: "Rua do Catete, 456 - Rio de Janeiro, RJ"
        },
        status: "confirmado",
        createdAt: Date.now() - 2 * 24 * 60 * 60 * 1000, // 2 dias atrás
        updatedAt: Date.now() - 1 * 24 * 60 * 60 * 1000,
        notes: "Pagamento confirmado via PIX. Aguardando separação."
    },
    {
        id: "ord-4",
        orderId: "LS2024004",
        items: [
            {
                productName: "Camisa Real Madrid I 2024",
                variantSize: "M",
                quantity: 1,
                unitPrice: 349.90
            },
            {
                productName: "Bola Nike Flight Brasileirão 2024",
                variantSize: "Único",
                quantity: 1,
                unitPrice: 199.90
            }
        ],
        total: 549.80,
        customerData: {
            name: "Ana Costa",
            phone: "11965432109"
        },
        status: "pendente",
        createdAt: Date.now() - 1 * 24 * 60 * 60 * 1000, // 1 dia atrás
        updatedAt: Date.now() - 1 * 24 * 60 * 60 * 1000,
        notes: "Aguardando confirmação de pagamento pelo WhatsApp."
    },
    {
        id: "ord-5",
        orderId: "LS2024005",
        items: [
            {
                productName: "Chuteira Adidas Predator Elite",
                variantSize: "40",
                quantity: 1,
                unitPrice: 1199.90
            },
            {
                productName: "Luva de Goleiro Adidas Predator Pro",
                variantSize: "9",
                quantity: 1,
                unitPrice: 399.90
            }
        ],
        total: 1599.80,
        customerData: {
            name: "Carlos Mendes",
            phone: "11954321098",
            address: "Rua Augusta, 789 - São Paulo, SP"
        },
        status: "confirmado",
        createdAt: Date.now() - 12 * 60 * 60 * 1000, // 12 horas atrás
        updatedAt: Date.now() - 6 * 60 * 60 * 1000,
        notes: "Cliente é goleiro profissional. Priorizar qualidade na embalagem."
    },
    {
        id: "ord-6",
        orderId: "LS2024006",
        items: [
            {
                productName: "Camisa Barcelona I 2024",
                variantSize: "P",
                quantity: 1,
                unitPrice: 349.90
            }
        ],
        total: 349.90,
        customerData: {
            name: "Juliana Ferreira",
            phone: "21976543210",
            address: "Av. Atlântica, 2000 - Rio de Janeiro, RJ"
        },
        status: "pendente",
        createdAt: Date.now() - 3 * 60 * 60 * 1000, // 3 horas atrás
        updatedAt: Date.now() - 3 * 60 * 60 * 1000
    }
];
