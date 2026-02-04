// Tipos de módulo da loja
export type StoreModule = "sports" | "automotive";

// Estrutura dinâmica de categorias e ligas
export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  active: boolean;
  showInNavbar: boolean;
  module: StoreModule;
  parentId?: string;
}

export interface League {
  id: string;
  name: string;
  slug: string;
  active: boolean;
  module: StoreModule;
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
  stock: number;
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
  category: string; // Slug ou ID
  league?: string; // Slug ou ID
  variants: ProductVariant[];
  featured: boolean;
  module: StoreModule; // Módulo ao qual o produto pertence
  brandId?: string;
  modelId?: string;
  colors?: ProductColor[]; // Cores disponíveis (apenas para sports)
  automotiveFields?: AutomotiveFields; // Campos específicos para automotive
  allowCustomization?: boolean; // Permite personalização (nome/número)
  customizationPrice?: number; // Preço adicional pela personalização
}

export interface CartItem {
  productId: string;
  variantSize: string;
  quantity: number;
  customName?: string;
  customNumber?: string;
}

export interface Cart {
  items: CartItem[];
  updatedAt: number;
}

export interface OrderItem {
  productName: string;
  variantSize: string;
  quantity: number;
  unitPrice: number;
  customName?: string;
  customNumber?: string;
}

export interface CustomerData {
  name: string;
  phone: string;
  address?: string;
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
