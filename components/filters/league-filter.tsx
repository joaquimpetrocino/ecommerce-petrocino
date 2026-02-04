"use client";

import { useRouter, useSearchParams } from "next/navigation";

const leagues = [
    { value: "", label: "Todas" },
    { value: "brasileirao", label: "Brasileirão" },
    { value: "champions", label: "Champions" },
    { value: "selecoes", label: "Seleções" },
];

export function LeagueFilter() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const currentLeague = searchParams.get("league") || "";

    const handleLeagueChange = (league: string) => {
        const params = new URLSearchParams(searchParams.toString());

        if (league) {
            params.set("league", league);
        } else {
            params.delete("league");
        }

        router.push(`/produtos?${params.toString()}`);
    };

    return (
        <div className="space-y-3">
            <h3 className="font-heading font-bold text-neutral-900 uppercase tracking-wide text-sm">
                Liga
            </h3>
            <div className="flex flex-wrap gap-2">
                {leagues.map((league) => (
                    <button
                        key={league.value}
                        onClick={() => handleLeagueChange(league.value)}
                        className={`px-5 py-2.5 rounded-lg font-body font-semibold transition-all ${currentLeague === league.value
                                ? "bg-accent text-white shadow-md ring-2 ring-accent ring-offset-2"
                                : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200 hover:shadow-sm"
                            }`}
                    >
                        {league.label}
                    </button>
                ))}
            </div>
        </div>
    );
}
