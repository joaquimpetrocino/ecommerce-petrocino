"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce"; // Assuming this exists or I will create it

export function SearchInput({ placeholder = "Buscar produtos..." }: { placeholder?: string }) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const initialQuery = searchParams.get("q") || "";

    const [value, setValue] = useState(initialQuery);
    const debouncedValue = useDebounce(value, 500);

    useEffect(() => {
        const current = searchParams.get("q") || "";
        if (debouncedValue === current) return;

        const params = new URLSearchParams(searchParams.toString());
        if (debouncedValue) {
            params.set("q", debouncedValue);
        } else {
            params.delete("q");
        }
        router.push(`/produtos?${params.toString()}`);
    }, [debouncedValue, router, searchParams]);

    return (
        <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400 group-focus-within:text-primary transition-colors" />
            <input
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={placeholder}
                className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm font-body focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary focus:bg-white transition-all shadow-inner"
            />
        </div>
    );
}
