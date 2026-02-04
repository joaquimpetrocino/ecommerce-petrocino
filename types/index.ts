// Estrutura dinâmica de categorias e ligas
export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  active: boolean;
  showInNavbar: boolean;
  parentId?: string; // Deprecated
  parentIds?: string[]; // New: Multiple parents support
}

export type VariantType = "roupa" | "calcado";
export type OrderStatus = "pendente" | "confirmado" | "enviado" | "entregue" | "cancelado";

// Cor do produto (para artigos esportivos)
export interface ProductColor {
  name: string; // Ex: "Azul", "Vermelho"
  hex: string; // Ex: "#0000FF"
}

export interface ProductVariant {
  type?: VariantType;
  size: string; // "P", "M", "G", "GG" ou "37", "38", etc
  color?: string; // Nome da cor (vinculado a ProductColor.name)
  stock: number;
  allowCustomization?: boolean; // New: Variant-level customization
}

// Campos específicos para peças automotivas
export interface AutomotiveFields {
  brand?: string; // Marca do veículo (Ex: "Volkswagen", "Fiat")
  model?: string; // Modelo (Ex: "Gol", "Uno")
  yearStart?: number; // Ano inicial de compatibilidade
  yearEnd?: number; // Ano final de compatibilidade
  oemCode?: string; // Código OEM da peça
  partType?: string; // Tipo de peça (Ex: "Filtro de Óleo", "Pastilha de Freio")
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  images: string[];
  categories?: string[]; // IDs/Slugs array
  subCategories?: string[]; // IDs/Slugs array
  category?: string; // Deprecated
  subCategory?: string; // Deprecated
  variants: ProductVariant[];
  featured: boolean;
  active?: boolean; // Controla visibilidade na loja
  brands?: string[]; // IDs array
  models?: string[]; // IDs array
  brandId?: string; // Deprecated
  modelId?: string; // Deprecated
  colors?: ProductColor[]; // Cores disponíveis (apenas para sports)
  module?: string; // Módulo ao qual o produto pertence (Ex: "sports", "automotive")
  automotiveFields?: AutomotiveFields; // Campos específicos para automotive
  allowCustomization?: boolean; // Permite personalização (nome/número)
  customizationPrice?: number; // Preço adicional pela personalização
}

export interface CartItem {
  productId: string;
  variantSize: string;
  quantity: number;
  color?: string;
  customName?: string;
  customNumber?: string;
}

export interface Cart {
  items: CartItem[];
  updatedAt: number;
}

export interface OrderItem {
  productId: string;
  productName: string;
  variantSize: string;
  quantity: number;
  unitPrice: number;
  customizationPrice?: number; // Preço da personalização (já incluído no unitPrice, apenas para exibição)
  color?: string;
  customName?: string;
  customNumber?: string;
}

export interface CustomerData {
  name: string;
  phone: string;
  address?: string;
  paymentMethod?: string;
  installments?: string;
}

export interface Order {
  id: string;
  orderId: string; // ID único para rastreamento
  items: OrderItem[];
  total: number;
  customerData: CustomerData;
  status: OrderStatus;
  createdAt: number;
  updatedAt: number;
  notes?: string; // Notas do admin
}
export interface HeroConfig {
  title: string;
  subtitle: string;
  bannerUrl: string;
  badge: string;
}

export interface StoreConfig {
  id: string;
  storeName: string;
  storeEmail: string;
  storePhone: string;
  storeAddress: string;
  storeCEP: string;
  storeNumber: string;
  storeComplement: string;
  logoUrl: string;
  whatsappNumber: string;
  enableWhatsApp: boolean;
  whatsappTemplate?: string;
  whatsappRecoveryTemplate?: string;
  updatedAt: number;
  hero: HeroConfig;
}

export const DEFAULT_WHATSAPP_TEMPLATE = `*NOVO PEDIDO #{{orderId}}*
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
*Parcelas:* {{installments}}

───────────────────

*TOTAL: {{total}}*
───────────────────
_Pedido gerado via Site_`;

export const DEFAULT_RECOVERY_TEMPLATE = `Olá *{{customerName}}*!

Notamos que seu pedido *#{{orderId}}* está pendente.

*RESUMO DO PEDIDO:*
{{items}}
*Total: {{total}}*

Podemos ajudar a finalizar sua compra?
Se tiver dúvidas, estamos à disposição!`;
