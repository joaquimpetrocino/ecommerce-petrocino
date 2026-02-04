"use client";

import Link from "next/link";
import { ChevronLeft, Home, Search } from "lucide-react";

export default function NotFound() {
    return (
        <div className="min-h-screen bg-neutral-50 flex items-center justify-center px-4 py-12">
            <div className="max-w-md w-full text-center space-y-8">
                {/* 404 Visual */}
                <div className="relative">
                    <h1 className="text-[12rem] font-heading font-black text-neutral-200 leading-none select-none">
                        404
                    </h1>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-white px-6 py-2 rounded-2xl shadow-xl border border-neutral-100 transform -rotate-2">
                            <p className="font-heading font-bold text-neutral-900 uppercase tracking-widest text-lg italic">
                                Página Não Encontrada
                            </p>
                        </div>
                    </div>
                </div>

                {/* Mensagem */}
                <div className="space-y-3">
                    <h2 className="text-3xl font-heading font-bold text-neutral-900 uppercase tracking-tight">
                        Ops! Onde estamos?
                    </h2>
                    <p className="text-neutral-500 font-body text-lg leading-relaxed">
                        A página que você está procurando parece ter saído de campo ou nunca foi escalada.
                    </p>
                </div>

                {/* Ações */}
                <div className="flex flex-col gap-3 sm:flex-row sm:justify-center pt-4">
                    <Link
                        href="/"
                        className="bg-primary hover:bg-primary-dark text-white px-8 py-4 rounded-xl font-heading font-bold uppercase transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 hover:scale-105 active:scale-95"
                    >
                        <Home className="w-5 h-5" />
                        Voltar ao Início
                    </Link>
                    <Link
                        href="/produtos"
                        className="bg-white border border-neutral-200 hover:border-primary hover:text-primary text-neutral-600 px-8 py-4 rounded-xl font-heading font-bold uppercase transition-all flex items-center justify-center gap-2"
                    >
                        <Search className="w-5 h-5" />
                        Ver Produtos
                    </Link>
                </div>

                {/* Footer do 404 */}
                <div className="pt-8 text-neutral-400 font-body text-sm">
                    <button
                        onClick={() => window.history.back()}
                        className="flex items-center gap-1 mx-auto hover:text-neutral-900 transition-colors"
                    >
                        <ChevronLeft className="w-4 h-4" />
                        Voltar para a página anterior
                    </button>
                </div>
            </div>
        </div>
    );
}
