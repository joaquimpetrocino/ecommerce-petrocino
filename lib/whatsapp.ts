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

    const defaultTemplate = `Olá, *{{customerName}}*!
Recebemos seu pedido *#{{orderId}}* com sucesso!

*RESUMO DO PEDIDO:*
{{items}}

*TOTAL: {{total}}*

*DADOS DE ENTREGA:*
Endereço: {{customerAddress}}
Telefone: {{customerPhone}}

*PAGAMENTO:*
{{paymentMethod}}

_Obrigado por comprar conosco!_`;

    const activeTemplate = template || defaultTemplate;

    // Formatar Itens
    let itemsText = "";
    items.forEach((item) => {
        itemsText += `\n*${item.quantity}x ${item.productName}*`;
        
        const basePrice = item.unitPrice - (item.customizationPrice || 0);
        itemsText += `\n   Produto: R$ ${basePrice.toFixed(2)}`;

        if (item.variantSize) itemsText += `\n   Tamanho: ${item.variantSize}`;
        if (item.color) itemsText += `\n   Cor: ${item.color}`;
        
        if (item.customName || item.customNumber) {
            itemsText += `\n   Personalização:`;
            if (item.customName) itemsText += ` ${item.customName}`;
            if (item.customNumber) itemsText += ` (Nº ${item.customNumber})`;
            
            if (item.customizationPrice && item.customizationPrice > 0) {
                itemsText += `\n      + R$ ${item.customizationPrice.toFixed(2)}`;
            }
        }
        itemsText += "\n";
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

export function formatRecoveryMessage(data: WhatsAppCheckoutData, template?: string): string {
    const { customerData, items, total, orderId } = data;

    const defaultTemplate = `Olá *{{customerName}}*!
    
Notamos que seu pedido *#{{orderId}}* está pendente.

*RESUMO DO PEDIDO:*
{{items}}
 *Total: {{total}}*

Podemos ajudar a finalizar sua compra?
Se tiver dúvidas, estamos à disposição!`;

    const activeTemplate = template || defaultTemplate;

    let itemsText = "";
    items.forEach((item) => {
        itemsText += `\n *${item.quantity}x ${item.productName}*`;
        
        const basePrice = item.unitPrice - (item.customizationPrice || 0);
        itemsText += `\n    Produto: R$ ${basePrice.toFixed(2)}`;

        if (item.variantSize) itemsText += `\n    Tamanho: ${item.variantSize}`;
        if (item.color) itemsText += `\n   Cor: ${item.color}`;
        
        if (item.customName || item.customNumber) {
            itemsText += `\n    Personalização:`;
            if (item.customName) itemsText += ` ${item.customName}`;
            if (item.customNumber) itemsText += ` (Nº ${item.customNumber})`;
             if (item.customizationPrice && item.customizationPrice > 0) {
                itemsText += `\n      + R$ ${item.customizationPrice.toFixed(2)}`;
            }
        }
        itemsText += "\n";
    });

    const variables: Record<string, string> = {
        "{{orderId}}": orderId,
        "{{customerName}}": customerData.name,
        "{{customerPhone}}": customerData.phone,
        "{{customerAddress}}": customerData.address || "Não informado",
        "{{total}}": `R$ ${total.toFixed(2)}`,
        "{{items}}": itemsText.trim()
    };

    let finalMessage = activeTemplate;
    Object.keys(variables).forEach(key => {
        finalMessage = finalMessage.replace(new RegExp(key, 'g'), variables[key]);
    });

    return finalMessage;
}
