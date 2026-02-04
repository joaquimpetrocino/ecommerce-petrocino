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

    let message = `🛒 *NOVO PEDIDO - #${orderId}*\n\n`;

    message += `👤 *Cliente:*\n`;
    message += `Nome: ${customerData.name}\n`;
    message += `Telefone: ${customerData.phone}\n`;
    if (customerData.address) {
        message += `Endereço: ${customerData.address}\n`;
    }

    message += `\n📦 *Itens do Pedido:*\n`;
    items.forEach((item, index) => {
        message += `\n${index + 1}. ${item.productName}\n`;
        message += `   Tamanho: ${item.variantSize}\n`;
        message += `   Quantidade: ${item.quantity}x\n`;
        message += `   Preço unitário: R$ ${item.unitPrice.toFixed(2)}\n`;
        message += `   Subtotal: R$ ${(item.quantity * item.unitPrice).toFixed(2)}\n`;
    });

    message += `\n💰 *TOTAL: R$ ${total.toFixed(2)}*\n`;
    message += `\n_Pedido gerado automaticamente pelo sistema_`;

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
