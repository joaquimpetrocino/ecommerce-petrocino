"use client";

import { useState, useRef, useEffect } from "react";
import { X, Search, Check, ChevronDown } from "lucide-react";

interface Option {
    label: string;
    value: string;
}

interface MultiSelectSearchProps {
    options: Option[];
    value: string[];
    onChange: (value: string[]) => void;
    placeholder?: string;
}

export function MultiSelectSearch({ options, value, onChange, placeholder }: MultiSelectSearchProps) {
    const [search, setSearch] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const filteredOptions = options.filter(opt =>
        opt.label.toLowerCase().includes(search.toLowerCase())
    );

    const selectedOptions = options.filter(opt => value.includes(opt.value));

    const toggleOption = (optValue: string) => {
        if (value.includes(optValue)) {
            onChange(value.filter(v => v !== optValue));
        } else {
            onChange([...value, optValue]);
        }
    };

    // Fechar ao clicar fora
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="relative w-full" ref={containerRef}>
            <div
                className={`w-full min-h-[48px] p-2 border rounded-lg bg-white flex flex-wrap gap-2 cursor-text transition-all ${isOpen ? "border-primary ring-2 ring-primary/20" : "border-neutral-300 hover:border-neutral-400"
                    }`}
                onClick={() => setIsOpen(true)}
            >
                {selectedOptions.map(opt => (
                    <span key={opt.value} className="bg-primary/10 text-primary-dark px-2 py-1 rounded flex items-center gap-1 text-xs font-bold uppercase tracking-wider animate-in fade-in zoom-in-95 duration-200">
                        {opt.label}
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                toggleOption(opt.value);
                            }}
                            className="hover:text-red-600 transition-colors bg-white/50 rounded-full p-0.5"
                        >
                            <X className="w-3 h-3" />
                        </button>
                    </span>
                ))}

                <div className="flex-1 flex items-center min-w-[80px]">
                    <Search className="w-4 h-4 text-neutral-400 mr-2 shrink-0" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setIsOpen(true);
                        }}
                        onFocus={() => setIsOpen(true)}
                        placeholder={selectedOptions.length === 0 ? placeholder : "Buscar..."}
                        className="w-full outline-none bg-transparent h-8 font-body text-sm text-neutral-700 placeholder:text-neutral-400"
                    />
                </div>

                <div className="flex items-center pr-1 text-neutral-400">
                    <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
                </div>
            </div>

            {isOpen && (
                <div className="absolute z-[100] w-full mt-2 bg-white border border-neutral-200 rounded-xl shadow-2xl max-h-64 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200 scrollbar-thin scrollbar-thumb-neutral-200">
                    {filteredOptions.length > 0 ? (
                        <div className="p-2">
                            {filteredOptions.map(opt => {
                                const isSelected = value.includes(opt.value);
                                return (
                                    <div
                                        key={opt.value}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            toggleOption(opt.value);
                                        }}
                                        className={`flex items-center justify-between px-4 py-3 rounded-lg cursor-pointer transition-all mb-1 last:mb-0 ${isSelected
                                                ? "bg-primary text-white font-bold"
                                                : "hover:bg-neutral-50 text-neutral-700 font-medium"
                                            }`}
                                    >
                                        <span className="text-sm font-body">{opt.label}</span>
                                        {isSelected ? (
                                            <Check className="w-4 h-4 text-white" />
                                        ) : (
                                            <div className="w-4 h-4 rounded border border-neutral-300" />
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="p-8 text-center bg-neutral-50 rounded-xl m-2 border border-dashed border-neutral-200">
                            <p className="text-neutral-400 text-sm font-body italic">
                                Nenhum resultado para "{search}"
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
