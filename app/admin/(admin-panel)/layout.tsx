import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { Sidebar } from "@/components/admin/sidebar";

export default async function AdminPanelLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const sessionCookie = (await cookies()).get("admin_session");

    // Se o cookie de sessão mockado não existir, manda pro login
    if (!sessionCookie) {
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
