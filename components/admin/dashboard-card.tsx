import { LucideIcon } from "lucide-react";

interface DashboardCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    trend?: {
        value: string;
        positive: boolean;
    };
    color?: "primary" | "accent" | "green" | "purple";
}

const colorClasses = {
    primary: "bg-primary/10 text-primary",
    accent: "bg-accent/10 text-accent",
    green: "bg-green-100 text-green-700",
    purple: "bg-purple-100 text-purple-700",
};

export function DashboardCard({ title, value, icon: Icon, trend, color = "primary" }: DashboardCardProps) {
    return (
        <div className="bg-white rounded-xl border border-neutral-200 p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
                    <Icon className="w-6 h-6" />
                </div>
                {trend && (
                    <span
                        className={`text-sm font-body font-semibold ${trend.positive ? "text-green-600" : "text-red-600"
                            }`}
                    >
                        {trend.positive ? "+" : ""}{trend.value}
                    </span>
                )}
            </div>
            <h3 className="text-sm font-body font-medium text-neutral-600 mb-1">{title}</h3>
            <p className="font-heading font-bold text-neutral-900 text-3xl">{value}</p>
        </div>
    );
}
