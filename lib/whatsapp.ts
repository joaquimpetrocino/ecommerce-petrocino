import { OrderItem, CustomerData } from "@/types";

export interface WhatsAppCheckoutData {
    orderId: string;
    items: OrderItem[];
    total: number;
    customerData: CustomerData;
}

/**
 * Formata mensagem de pedido para WhatsApp usando template dinâmico
 */
export function formatWhatsAppMessage(data: WhatsAppCheckoutData, template?: string): string {
    const { orderId, items, total, customerData } = data;

    const defaultTemplate = `*NOVO PEDIDO #{{orderId}}*
───────────────────

*DADOS DO CLIENTE*
*Nome:* {{customerName}}
*Telefone:* {{customerPhone}}
*Endereço:* {{customerAddress}}

───────────────────

*ITENS DO PEDIDO*
{{items}}

───────────────────

*PAGAMENTO*
*Método:* {{paymentMethod}}

───────────────────

*TOTAL: {{total}}*
───────────────────
_Pedido gerado via Site_`;

    const activeTemplate = template || defaultTemplate;

    // Formatar Itens
    let itemsText = "";
    items.forEach((item) => {
        itemsText += `\n*${item.quantity}x ${item.productName}*\n`;

        if (item.variantSize) {
            itemsText += `   Tamanho: ${item.variantSize}\n`;
        }
        if (item.customName) {
            itemsText += `   Nome: ${item.customName}\n`;
        }
        if (item.customNumber) {
            itemsText += `   Número: ${item.customNumber}\n`;
        }

        const subtotal = item.quantity * item.unitPrice;
        itemsText += `   *${item.quantity}x R$ ${item.unitPrice.toFixed(2)} = R$ ${subtotal.toFixed(2)}*\n`;
    });

    // Tradução de Variáveis
    const paymentText = customerData.paymentMethod === "credit" && customerData.installments
        ? `Cartão de Crédito (${customerData.installments}x)`
        : customerData.paymentMethod === "pix"
            ? "PIX"
            : customerData.paymentMethod === "debit"
                ? "Cartão de Débito"
                : "Não informado";

    const variables: Record<string, string> = {
        "{{orderId}}": orderId,
        "{{customerName}}": customerData.name,
        "{{customerPhone}}": customerData.phone,
        "{{customerAddress}}": customerData.address || "Não informado",
        "{{paymentMethod}}": paymentText,
        "{{total}}": `R$ ${total.toFixed(2)}`,
        "{{items}}": itemsText.trim()
    };

    let finalMessage = activeTemplate;
    Object.keys(variables).forEach(key => {
        finalMessage = finalMessage.replace(new RegExp(key, 'g'), variables[key]);
    });

    return finalMessage;
}

/**
 * Gera link wa.me com mensagem formatada
 */
export function generateWhatsAppLink(
    phoneNumber: string,
    data: WhatsAppCheckoutData,
    template?: string
): string {
    const message = formatWhatsAppMessage(data, template);
    const encodedMessage = encodeURIComponent(message);

    // Remove caracteres não numéricos do telefone
    const cleanPhone = phoneNumber.replace(/\D/g, '');

    return `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
}
