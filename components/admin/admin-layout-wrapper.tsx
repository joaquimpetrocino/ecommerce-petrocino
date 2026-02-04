"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "@/components/admin/sidebar";
import { MobileHeader } from "@/components/admin/mobile-header";
import { usePathname } from "next/navigation";

export default function AdminLayoutWrapper({
    children,
}: {
    children: React.ReactNode;
}) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const pathname = usePathname();

    // Close sidebar on route change
    useEffect(() => {
        setIsSidebarOpen(false);
    }, [pathname]);

    return (
        <div className="flex min-h-screen bg-neutral-50 font-body">
            {/* Sidebar with mobile props */}
            <Sidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
            />

            <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
                {/* Mobile Header */}
                <MobileHeader onOpenSidebar={() => setIsSidebarOpen(true)} />

                <main className="flex-1 p-4 md:p-8 overflow-x-hidden">
                    {children}
                </main>
            </div>

            {/* Overlay for mobile */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}
        </div>
    );
}
