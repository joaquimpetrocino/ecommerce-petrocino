import { Package, Tags, MessageSquare, Layout } from "lucide-react";
import { DashboardCard } from "./dashboard-card";
import { getCachedDashboardStats } from "@/lib/admin/dashboard-stats";
import { getStoreConfig, getModuleName } from "@/lib/admin/store-config";

export async function StatsOverview() {
    const storeConfig = await getStoreConfig();
    const currentModule = storeConfig.module;
    const moduleName = getModuleName(currentModule);

    // Fetch cached stats
    const { totalProducts, totalCategories, pendingQuestions, activeSections } =
        await getCachedDashboardStats(currentModule);

    return (
        <div className="space-y-4">
            {/* Indicador de Módulo Ativo */}
            <div className="bg-primary/10 border border-primary/20 rounded-lg px-4 py-3 flex items-center justify-between">
                <p className="text-sm font-body text-neutral-700">
                    Módulo Ativo: <span className="font-bold text-primary">{moduleName}</span>
                </p>
                <p className="text-xs text-neutral-500 font-body">
                    Dados atualizados em tempo real com o banco de dados.
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <DashboardCard
                    title="Produtos Ativos"
                    value={totalProducts}
                    icon={Package}
                    color="primary"
                />
                <DashboardCard
                    title="Categorias"
                    value={totalCategories}
                    icon={Tags}
                    color="purple"
                />
                <DashboardCard
                    title="Dúvidas Pendentes"
                    value={pendingQuestions}
                    icon={MessageSquare}
                    color="accent"
                />
                <DashboardCard
                    title="Seções na Home"
                    value={activeSections}
                    icon={Layout}
                    color="green"
                />
            </div>
        </div>
    );
}
