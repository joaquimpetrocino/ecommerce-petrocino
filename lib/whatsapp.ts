import { OrderItem, CustomerData } from "@/types";

export interface WhatsAppCheckoutData {
    orderId: string;
    items: OrderItem[];
    total: number;
    customerData: CustomerData;
}

/**
 * Formata mensagem de pedido para WhatsApp
 */
export function formatWhatsAppMessage(data: WhatsAppCheckoutData): string {
    const { orderId, items, total, customerData } = data;

    // Cabeçalho simplificado e limpo
    let message = `*NOVO PEDIDO #${orderId}*\n`;
    message += `───────────────────\n\n`;

    // Dados do Cliente com melhor espaçamento
    message += `*DADOS DO CLIENTE*\n`;
    message += `*Nome:* ${customerData.name}\n`;
    message += `*Telefone:* ${customerData.phone}\n`;
    if (customerData.address) {
        message += `*Endereço:* ${customerData.address}\n`;
    }
    message += `\n───────────────────\n\n`;

    // Itens do Pedido
    message += `*ITENS DO PEDIDO*\n`;
    items.forEach((item) => {
        message += `\n*${item.quantity}x ${item.productName}*\n`;

        if (item.variantSize) {
            message += `   Tamanho: ${item.variantSize}\n`;
        }
        if (item.customName) {
            message += `   Nome: ${item.customName}\n`;
        }
        if (item.customNumber) {
            message += `   Número: ${item.customNumber}\n`;
        }

        const subtotal = item.quantity * item.unitPrice;
        message += `   💲 ${item.quantity}x R$ ${item.unitPrice.toFixed(2)} = R$ ${subtotal.toFixed(2)}\n`;
    });

    message += `\n───────────────────\n\n`;

    // Total
    message += `*TOTAL: R$ ${total.toFixed(2)}*\n`;
    message += `───────────────────\n`;
    message += `_Pedido gerado via Site_`;

    return message;
}

/**
 * Gera link wa.me com mensagem formatada
 */
export function generateWhatsAppLink(
    phoneNumber: string,
    data: WhatsAppCheckoutData
): string {
    const message = formatWhatsAppMessage(data);
    const encodedMessage = encodeURIComponent(message);

    // Remove caracteres não numéricos do telefone
    const cleanPhone = phoneNumber.replace(/\D/g, '');

    return `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
}
