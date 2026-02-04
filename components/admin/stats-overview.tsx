import { Package, Tags, MessageSquare, Layout } from "lucide-react";
import { DashboardCard } from "./dashboard-card";
import { getCachedDashboardStats } from "@/lib/admin/dashboard-stats";
import { getStoreConfig } from "@/lib/admin/store-config";

export async function StatsOverview() {
    const storeConfig = await getStoreConfig();
    const currentModule = "sports"; // Fallback para compatibilidade com helpers

    // Fetch cached stats
    const { totalProducts, totalCategories, pendingQuestions, activeSections } =
        await getCachedDashboardStats(currentModule);

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                <DashboardCard
                    title="Produtos Ativos"
                    value={totalProducts}
                    icon={Package}
                    color="primary"
                    href="/admin/produtos"
                />
                <DashboardCard
                    title="Categorias"
                    value={totalCategories}
                    icon={Tags}
                    color="purple"
                    href="/admin/categorias"
                />
                <DashboardCard
                    title="Dúvidas Pendentes"
                    value={pendingQuestions}
                    icon={MessageSquare}
                    color="accent"
                    href="/admin/duvidas"
                />
                <DashboardCard
                    title="Seções na Home"
                    value={activeSections}
                    icon={Layout}
                    color="green"
                    href="/admin/home"
                />
            </div>
        </div>
    );
}
