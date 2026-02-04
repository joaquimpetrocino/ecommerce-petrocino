import Link from "next/link";
import { Home } from "lucide-react";
import { StatsOverview } from "@/components/admin/stats-overview";

export default function AdminDashboard() {
    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
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
                    className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg font-body font-medium transition-colors"
                >
                    <Home className="w-4 h-4" />
                    Voltar para Loja
                </Link>
            </div>

            {/* Stats */}
            <StatsOverview />
        </div>
    );
}
