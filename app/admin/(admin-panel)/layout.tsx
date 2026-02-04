import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Sidebar } from "@/components/admin/sidebar";

export default async function AdminPanelLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();

    // Se a sessão não existir, manda pro login
    if (!session) {
        redirect("/admin/login");
    }

    return (
        <div className="flex min-h-screen bg-neutral-50 font-body">
            <Sidebar />
            <main className="flex-1 p-8">
                {children}
            </main>
        </div>
    );
}
