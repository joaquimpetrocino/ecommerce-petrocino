import Link from "next/link";
import { Home } from "lucide-react";
import { StatsOverview } from "@/components/admin/stats-overview";

export default function AdminDashboard() {
    return (
        <div>
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="font-heading font-bold text-neutral-900 text-4xl uppercase tracking-tight">
                        Dashboard
                    </h1>
                    <p className="text-neutral-600 font-body mt-1">
                        Bem-vindo ao painel administrativo do LeagueSports!
                    </p>
                </div>
                <Link
                    href="/"
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-lg font-body font-semibold transition-all hover:scale-105 hover:shadow-lg w-full md:w-auto"
                >
                    <Home className="w-5 h-5" />
                    Voltar para Loja
                </Link>
            </div>

            {/* Stats */}
            <StatsOverview />

            {/* Informações Úteis */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Estoque Baixo */}
                <LowStockPanel />

                {/* Últimas Dúvidas */}
                <RecentQuestionsPanel />
            </div>
        </div>
    );
}

import { getCachedDashboardStats } from "@/lib/admin/dashboard-stats";
import { AlertTriangle, MessageCircle, ArrowRight } from "lucide-react";

async function LowStockPanel() {
    const stats = await getCachedDashboardStats();

    const lowStock = stats?.lowStockProducts || [];

    return (
        <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-sm">
            <div className="p-6 border-b border-neutral-100 flex items-center justify-between bg-red-50/30">
                <div className="flex items-center gap-2 text-red-600 font-heading font-bold uppercase text-sm">
                    <AlertTriangle className="w-5 h-5" />
                    Atenção: Estoque Baixo
                </div>
                <Link href="/admin/produtos?inventory=low" className="text-xs font-bold uppercase text-neutral-400 hover:text-primary transition-colors flex items-center gap-1">
                    Ver todos <ArrowRight className="w-3 h-3" />
                </Link>
            </div>
            <div className="divide-y divide-neutral-50">
                {lowStock.length === 0 ? (
                    <div className="p-8 text-center text-neutral-400 text-sm font-body">
                        Todos os produtos estão com estoque em dia!
                    </div>
                ) : (
                    lowStock.map((product) => (
                        <Link
                            key={product.id}
                            href={`/admin/produtos?search=${product.name}`}
                            className="flex items-center justify-between p-4 hover:bg-neutral-50 transition-colors group"
                        >
                            <div className="flex flex-col">
                                <span className="font-body font-bold text-neutral-900 group-hover:text-primary transition-colors">{product.name}</span>
                                <span className="text-xs text-neutral-500 uppercase font-medium">Slug: {product.slug}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className={`px-3 py-1 rounded-full font-bold text-xs ${product.stock === 0 ? "bg-red-100 text-red-700" : "bg-orange-100 text-orange-700"}`}>
                                    {product.stock} unidades
                                </span>
                            </div>
                        </Link>
                    ))
                )}
            </div>
        </div>
    );
}

async function RecentQuestionsPanel() {
    const stats = await getCachedDashboardStats();

    const latestQuestions = stats?.latestQuestions || [];

    return (
        <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-sm">
            <div className="p-6 border-b border-neutral-100 flex items-center justify-between bg-blue-50/30">
                <div className="flex items-center gap-2 text-blue-600 font-heading font-bold uppercase text-sm">
                    <MessageCircle className="w-5 h-5" />
                    Dúvidas Recentes
                </div>
                <Link href="/admin/duvidas" className="text-xs font-bold uppercase text-neutral-400 hover:text-primary transition-colors flex items-center gap-1">
                    Gerenciar <ArrowRight className="w-3 h-3" />
                </Link>
            </div>
            <div className="divide-y divide-neutral-50">
                {latestQuestions.length === 0 ? (
                    <div className="p-8 text-center text-neutral-400 text-sm font-body">
                        Nenhuma dúvida registrada recentemente.
                    </div>
                ) : (
                    latestQuestions.map((q) => (
                        <div key={q.id} className="p-4 hover:bg-neutral-50 transition-colors">
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-[10px] font-bold uppercase text-neutral-400 tracking-wider font-heading">{q.userName} perguntou:</span>
                                <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${q.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
                                    {q.status === 'pending' ? 'Pendente' : 'Respondida'}
                                </span>
                            </div>
                            <p className="font-body text-sm text-neutral-900 line-clamp-1 mb-1 italic">"{q.question}"</p>
                            <div className="flex items-center gap-1 text-[10px] text-neutral-500">
                                <span className="font-bold uppercase text-neutral-400">Produto:</span>
                                <span className="font-medium truncate">{q.productName}</span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
