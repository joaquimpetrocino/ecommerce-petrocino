import mongoose, { Schema } from "mongoose";

const StoreConfigSchema = new Schema({
    id: { type: String, required: true, unique: true }, // Maintain string ID for compatibility

    // Unified Settings (No more nested module settings)
    storeName: { type: String, default: "Loja Virtual" },
    storeEmail: { type: String, default: "" },
    storePhone: { type: String, default: "" },
    storeAddress: { type: String, default: "" },
    storeCEP: { type: String, default: "" },
    storeNumber: { type: String, default: "" },
    storeComplement: { type: String, default: "" },
    logoUrl: { type: String, default: "" },
    whatsappNumber: { type: String, default: "" },
    enableWhatsApp: { type: Boolean, default: true },

    // Unified Hero Configuration
    hero: {
        title: { type: String, default: "Bem-vindo" },
        subtitle: { type: String, default: "Confira nossas ofertas." },
        bannerUrl: { type: String, default: "" },
        badge: { type: String, default: "Loja Oficial" }
    },
    whatsappTemplate: {
        type: String,
        default: `*NOVO PEDIDO #{{orderId}}*
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
_Pedido gerado via Site_`
    },
    whatsappRecoveryTemplate: {
        type: String,
        default: `Olá *{{customerName}}*! 
    
Notamos que seu pedido *#{{orderId}}* está pendente.

*RESUMO DO PEDIDO:*
{{items}}
 *Total: {{total}}*

Podemos ajudar a finalizar sua compra?
Se tiver dúvidas, estamos à disposição!`
    }
}, {
    timestamps: true
});

// Singleton pattern for Config
// NOTE: If you add new fields to the schema, you MUST restart the dev server for Mongoose to pick them up.
export const StoreConfig = mongoose.models.StoreConfig || mongoose.model("StoreConfig", StoreConfigSchema);
