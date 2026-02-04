import { NextRequest, NextResponse } from "next/server";
import { generateWhatsAppLink } from "@/lib/whatsapp";
import { nanoid } from "nanoid";
import { Order } from "@/types";
import { clearCart } from "@/lib/cart";
import { getStoreConfig } from "@/lib/admin/store-config";

import { createOrder } from "@/lib/admin/orders";

// Mock storage removed
// const orders: Order[] = [];

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { items, total, customerData } = body;

        if (!items || items.length === 0) {
            return NextResponse.json(
                { success: false, error: "Carrinho vazio" },
                { status: 400 }
            );
        }

        if (!customerData?.name || !customerData?.phone) {
            return NextResponse.json(
                { success: false, error: "Dados do cliente incompletos" },
                { status: 400 }
            );
        }

        // Sanitizar itens
        const sanitizedItems = items.map((item: any) => ({
            ...item,
            unitPrice: Number(item.unitPrice) || 0,
            customizationPrice: Number(item.customizationPrice) || 0,
        }));

        // Gerar ID único
        const orderId = nanoid(10).toUpperCase();
        // Criar pedido
        const order: Order = {
            id: nanoid(),
            orderId,
            items: sanitizedItems,
            total: Number(total) || 0,
            customerData,
            status: "pendente",
            createdAt: Date.now(),
            updatedAt: Date.now(),
        };

        // Salvar no MongoDB
        await createOrder(order);

        // Gerar link WhatsApp do banco de dados
        const config = await getStoreConfig();
        const whatsappNumber = config.whatsappNumber;
        const whatsappLink = generateWhatsAppLink(
            whatsappNumber,
            {
                orderId,
                items,
                total,
                customerData,
            },
            config.whatsappTemplate
        );

        return NextResponse.json({
            success: true,
            orderId,
            whatsappLink,
        });
    } catch (error) {
        console.error("Checkout error:", error);
        return NextResponse.json(
            { success: false, error: "Erro ao processar pedido" },
            { status: 500 }
        );
    }
}
