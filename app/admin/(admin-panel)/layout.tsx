import { redirect } from "next/navigation";
import { auth } from "@/auth";
import AdminLayoutWrapper from "@/components/admin/admin-layout-wrapper";

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
        <AdminLayoutWrapper>
            {children}
        </AdminLayoutWrapper>
    );
}
