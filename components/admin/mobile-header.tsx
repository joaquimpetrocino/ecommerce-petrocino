"use client";

import { Menu } from "lucide-react";
import Link from "next/link";

interface MobileHeaderProps {
    onOpenSidebar: () => void;
}

export function MobileHeader({ onOpenSidebar }: MobileHeaderProps) {
    return (
        <header className="bg-white border-b border-neutral-200 px-4 py-3 flex items-center justify-between lg:hidden sticky top-0 z-30">
            <div className="flex items-center gap-3">
                <button
                    onClick={onOpenSidebar}
                    className="p-2 -ml-2 text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors"
                >
                    <Menu className="w-6 h-6" />
                </button>
                <Link href="/admin" className="block">
                    <div className="text-xl font-heading font-bold text-primary uppercase tracking-tighter">
                        League<span className="text-accent">Sports</span>
                    </div>
                </Link>
            </div>
        </header>
    );
}
