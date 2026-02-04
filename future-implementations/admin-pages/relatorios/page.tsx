"use client";

import { useState, useEffect } from "react";
import { DollarSign, TrendingUp, TrendingDown, Download, Calendar } from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface ReportData {
    totalRevenue: number;
    totalOrders: number;
    averageTicket: number;
    topProducts: Array<{ name: string; quantity: number; revenue: number }>;
    revenueByCategory: Array<{ category: string; revenue: number }>;
    ordersByStatus: Array<{ status: string; count: number }>;
    revenueGrowth: number;
    ordersGrowth: number;
}

export default function ReportsPage() {
    const [period, setPeriod] = useState<"7d" | "30d" | "90d">("30d");
    const [data, setData] = useState<ReportData | null>(null);

    useEffect(() => {
        fetchReportData();
    }, [period]);

    const fetchReportData = async () => {
        // Mock data - em produção viria da API
        const mockData: ReportData = {
            totalRevenue: 45890.5,
            totalOrders: 156,
            averageTicket: 294.17,
            topProducts: [
                { name: "Camisa PSG 2024", quantity: 45, revenue: 15745.5 },
                { name: "Chuteira Nike Mercurial", quantity: 32, revenue: 12800.0 },
                { name: "Camisa Real Madrid", quantity: 28, revenue: 9772.0 },
            ],
            revenueByCategory: [
                { category: "Camisas", revenue: 28450.0 },
                { category: "Chuteiras", revenue: 14200.0 },
                { category: "Acessórios", revenue: 3240.5 },
            ],
            ordersByStatus: [
                { status: "Entregue", count: 89 },
                { status: "Enviado", count: 34 },
                { status: "Confirmado", count: 21 },
                { status: "Pendente", count: 12 },
            ],
            revenueGrowth: 12.5,
            ordersGrowth: 8.3,
        };
        setData(mockData);
    };

    const exportReport = () => {
        alert("Funcionalidade de exportação será implementada em breve!");
    };

    if (!data) {
        return (
            <div className="flex items-center justify-center h-64">
                <p className="text-neutral-600 font-body">Carregando relatórios...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="font-heading font-bold text-neutral-900 text-4xl uppercase tracking-tight">
                    Relatórios
                </h1>
                <div className="flex gap-3">
                    <select
                        value={period}
                        onChange={(e) => setPeriod(e.target.value as "7d" | "30d" | "90d")}
                        className="px-4 py-2 border border-neutral-300 rounded-lg font-body focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                    >
                        <option value="7d">Últimos 7 dias</option>
                        <option value="30d">Últimos 30 dias</option>
                        <option value="90d">Últimos 90 dias</option>
                    </select>
                    <button
                        onClick={exportReport}
                        className="bg-primary hover:bg-primary-dark text-white px-6 py-2 rounded-lg font-heading font-bold uppercase flex items-center gap-2 transition-colors"
                    >
                        <Download className="w-5 h-5" />
                        Exportar
                    </button>
                </div>
            </div>

            {/* Métricas Principais */}
            <div className="grid gap-6 md:grid-cols-3">
                <div className="bg-white rounded-xl border border-neutral-200 p-6">
                    <div className="flex items-start justify-between mb-4">
                        <div className="p-3 rounded-lg bg-accent/10 text-accent">
                            <DollarSign className="w-6 h-6" />
                        </div>
                        <span
                            className={`text-sm font-body font-semibold ${data.revenueGrowth >= 0 ? "text-green-600" : "text-red-600"
                                }`}
                        >
                            {data.revenueGrowth >= 0 ? "+" : ""}
                            {data.revenueGrowth}%
                        </span>
                    </div>
                    <h3 className="text-sm font-body font-medium text-neutral-600 mb-1">
                        Receita Total
                    </h3>
                    <p className="font-heading font-bold text-neutral-900 text-3xl">
                        {formatPrice(data.totalRevenue)}
                    </p>
                </div>

                <div className="bg-white rounded-xl border border-neutral-200 p-6">
                    <div className="flex items-start justify-between mb-4">
                        <div className="p-3 rounded-lg bg-primary/10 text-primary">
                            <Calendar className="w-6 h-6" />
                        </div>
                        <span
                            className={`text-sm font-body font-semibold ${data.ordersGrowth >= 0 ? "text-green-600" : "text-red-600"
                                }`}
                        >
                            {data.ordersGrowth >= 0 ? "+" : ""}
                            {data.ordersGrowth}%
                        </span>
                    </div>
                    <h3 className="text-sm font-body font-medium text-neutral-600 mb-1">
                        Total de Pedidos
                    </h3>
                    <p className="font-heading font-bold text-neutral-900 text-3xl">
                        {data.totalOrders}
                    </p>
                </div>

                <div className="bg-white rounded-xl border border-neutral-200 p-6">
                    <div className="flex items-start justify-between mb-4">
                        <div className="p-3 rounded-lg bg-green-100 text-green-700">
                            <TrendingUp className="w-6 h-6" />
                        </div>
                    </div>
                    <h3 className="text-sm font-body font-medium text-neutral-600 mb-1">
                        Ticket Médio
                    </h3>
                    <p className="font-heading font-bold text-neutral-900 text-3xl">
                        {formatPrice(data.averageTicket)}
                    </p>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Top Produtos */}
                <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-neutral-200">
                        <h2 className="font-heading font-bold text-neutral-900 text-xl uppercase tracking-tight">
                            Produtos Mais Vendidos
                        </h2>
                    </div>
                    <div className="p-6">
                        <div className="space-y-4">
                            {data.topProducts.map((product, index) => (
                                <div key={index} className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <p className="font-body font-semibold text-neutral-900">
                                            {product.name}
                                        </p>
                                        <p className="text-sm text-neutral-600 font-body">
                                            {product.quantity} unidades vendidas
                                        </p>
                                    </div>
                                    <p className="font-heading font-bold text-accent">
                                        {formatPrice(product.revenue)}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Receita por Categoria */}
                <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-neutral-200">
                        <h2 className="font-heading font-bold text-neutral-900 text-xl uppercase tracking-tight">
                            Receita por Categoria
                        </h2>
                    </div>
                    <div className="p-6">
                        <div className="space-y-4">
                            {data.revenueByCategory.map((item, index) => {
                                const percentage = (item.revenue / data.totalRevenue) * 100;
                                return (
                                    <div key={index}>
                                        <div className="flex items-center justify-between mb-2">
                                            <p className="font-body font-semibold text-neutral-900">
                                                {item.category}
                                            </p>
                                            <p className="font-heading font-bold text-primary">
                                                {formatPrice(item.revenue)}
                                            </p>
                                        </div>
                                        <div className="w-full bg-neutral-100 rounded-full h-2">
                                            <div
                                                className="bg-primary h-2 rounded-full transition-all"
                                                style={{ width: `${percentage}%` }}
                                            />
                                        </div>
                                        <p className="text-xs text-neutral-600 font-body mt-1">
                                            {percentage.toFixed(1)}% do total
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* Pedidos por Status */}
            <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-neutral-200">
                    <h2 className="font-heading font-bold text-neutral-900 text-xl uppercase tracking-tight">
                        Distribuição de Pedidos por Status
                    </h2>
                </div>
                <div className="p-6">
                    <div className="grid gap-4 md:grid-cols-4">
                        {data.ordersByStatus.map((item, index) => (
                            <div key={index} className="text-center p-4 bg-neutral-50 rounded-lg">
                                <p className="font-heading font-bold text-3xl text-neutral-900 mb-1">
                                    {item.count}
                                </p>
                                <p className="text-sm font-body font-medium text-neutral-600">
                                    {item.status}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
