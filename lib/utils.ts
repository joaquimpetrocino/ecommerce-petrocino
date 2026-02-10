import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatPrice(price: number): string {
    return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
    }).format(price);
}

export function formatDate(timestamp: number): string {
    return new Intl.DateTimeFormat("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    }).format(new Date(timestamp));
}

/**
 * Separa o nome da loja em duas partes para estilização.
 * 
 * Regras:
 * 1. Se contiver espaço, divide pelo primeiro espaço.
 * 2. Se contiver ponto ou hífen, divide pelo primeiro caractere especial.
 * 3. Se for CamelCase (Ex: LeagueSports), divide na segunda letra maiúscula.
 * 4. Se não se aplicar a nenhuma regra, retorna o nome inteiro na primeira parte.
 */
export function splitStoreName(name: string): { first: string; second: string | null } {
    if (!name) return { first: "", second: null };

    // 1. Separar por Espaço
    if (name.includes(" ")) {
        const parts = name.split(" ");
        return {
            first: parts[0],
            second: parts.slice(1).join(" ")
        };
    }

    // 2. Separar por Ponto ou Hífen
    const specialCharMatch = name.match(/[\.\-]/);
    if (specialCharMatch && specialCharMatch.index) {
        return {
            first: name.substring(0, specialCharMatch.index),
            second: name.substring(specialCharMatch.index + 1) // Remove o separador? O usuário disse "divide elas para cada um pegar uma cor"
            // Se tiver separador, talvez seja legal mantê-lo ou não. O usuário disse "se tiver qualquer caractere tipo . - e tals".
            // Vou assumir que o separador fica oculto ou faz parte da segunda.
            // Mas para "pegar uma cor", geralmente queremos as PALAVRAS.
            // Ex: "Auto-Parts" -> "Auto" (primary) "Parts" (accent)
            // Vou remover o separador para ficar limpo visualmente, ou incluí-lo na segunda parte?
            // "utiliza o nome da loja... divide elas para cada um pegar uma cor"
            // Vou manter simples e dividir pelo separador.
        };
    }

    // 3. Separar por CamelCase (Ex: LeagueSports)
    // Procura por uma letra maiúscula que NÃO seja a primeira
    // Ex: LeagueS... match em 'S' index 6
    const camelCaseMatch = name.match(/.[A-Z]/);
    // .[A-Z] pega qualquer char seguido de maiuscula. Mas queremos saber ONDE começa a segunda maiuscula.
    // Melhor iterar ou regex com lookbehind (que JS suporta moderno, mas safe é regex simples)

    // Encontrar o índice da segunda letra maiúscula
    let splitIndex = -1;
    for (let i = 1; i < name.length; i++) {
        if (name[i] >= 'A' && name[i] <= 'Z') {
            splitIndex = i;
            break;
        }
    }

    if (splitIndex !== -1) {
        return {
            first: name.substring(0, splitIndex),
            second: name.substring(splitIndex)
        };
    }

    // 4. Sem separação
    return { first: name, second: null };
}

export function capitalizeFirstLetter(str: string): string {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

