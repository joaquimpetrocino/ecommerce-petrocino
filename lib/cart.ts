import { Cart, CartItem } from "@/types";

const CART_KEY = "leaguesports_cart";

export function getCart(): Cart {
    if (typeof window === "undefined") {
        return { items: [], updatedAt: Date.now() };
    }

    const stored = localStorage.getItem(CART_KEY);
    if (!stored) {
        return { items: [], updatedAt: Date.now() };
    }

    return JSON.parse(stored);
}

export function saveCart(cart: Cart): void {
    if (typeof window === "undefined") return;

    cart.updatedAt = Date.now();
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

export function addToCart(
    productId: string,
    variantSize: string,
    quantity: number,
    customName?: string,
    customNumber?: string
): void {
    const cart = getCart();

    const existingItem = cart.items.find(
        (item) =>
            item.productId === productId &&
            item.variantSize === variantSize &&
            item.customName === customName &&
            item.customNumber === customNumber
    );

    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.items.push({
            productId,
            variantSize,
            quantity,
            customName,
            customNumber
        });
    }

    saveCart(cart);
}

export function updateCartItem(
    productId: string,
    variantSize: string,
    quantity: number,
    customName?: string,
    customNumber?: string
): void {
    const cart = getCart();
    const item = cart.items.find(
        (item) =>
            item.productId === productId &&
            item.variantSize === variantSize &&
            item.customName === customName &&
            item.customNumber === customNumber
    );

    if (item) {
        item.quantity = quantity;
        saveCart(cart);
    }
}

export function removeFromCart(
    productId: string,
    variantSize: string,
    customName?: string,
    customNumber?: string
): void {
    const cart = getCart();
    cart.items = cart.items.filter(
        (item) => !(
            item.productId === productId &&
            item.variantSize === variantSize &&
            item.customName === customName &&
            item.customNumber === customNumber
        )
    );
    saveCart(cart);
}

export function clearCart(): void {
    saveCart({ items: [], updatedAt: Date.now() });
}

export function getCartItemCount(): number {
    const cart = getCart();
    return cart.items.reduce((total, item) => total + item.quantity, 0);
}
