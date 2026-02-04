"use client"

import * as React from "react"
import { Check, ChevronsUpDown, X } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

export interface ComboboxOption {
    value: string
    label: string
}

interface ComboboxProps {
    options: ComboboxOption[]
    value?: string | string[] // string for single, string[] for multiple
    onChange: (value: string | string[]) => void
    placeholder?: string
    searchPlaceholder?: string
    emptyText?: string
    multiple?: boolean
    className?: string
    disabled?: boolean
}

export function Combobox({
    options,
    value,
    onChange,
    placeholder = "Selecione...",
    searchPlaceholder = "Buscar...",
    emptyText = "Nenhum resultado encontrado.",
    multiple = false,
    className,
    disabled = false
}: ComboboxProps) {
    const [open, setOpen] = React.useState(false)
    const [search, setSearch] = React.useState("")

    const selectedValues = React.useMemo(() => {
        if (!value) return []
        return Array.isArray(value) ? value : [value]
    }, [value])

    const handleSelect = (optionValue: string) => {
        if (multiple) {
            const newValues = selectedValues.includes(optionValue)
                ? selectedValues.filter((v) => v !== optionValue)
                : [...selectedValues, optionValue]
            onChange(newValues)
        } else {
            onChange(optionValue === value ? "" : optionValue)
            setOpen(false)
        }
    }

    const handleRemove = (e: React.MouseEvent, optionValue: string) => {
        e.stopPropagation()
        if (multiple) {
            onChange(selectedValues.filter((v) => v !== optionValue))
        } else {
            onChange("")
        }
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <div
                    role="combobox"
                    aria-expanded={open}
                    className={cn(
                        "flex min-h-[44px] w-full items-center justify-between rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-950 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                        className
                    )}
                    onClick={() => !disabled && setOpen(!open)}
                >
                    <div className="flex flex-wrap gap-1">
                        {selectedValues.length > 0 ? (
                            multiple ? (
                                selectedValues.map((val) => {
                                    const option = options.find((o) => o.value === val)
                                    return (
                                        <Badge
                                            key={val}
                                            variant="secondary"
                                            className="mr-1 mb-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-900 font-normal px-2 py-0.5 rounded-md flex items-center gap-1"
                                        >
                                            {option?.label || val}
                                            <button
                                                className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                                onKeyDown={(e) => {
                                                    if (e.key === "Enter") {
                                                        handleRemove(e as any, val)
                                                    }
                                                }}
                                                onMouseDown={(e) => {
                                                    e.preventDefault()
                                                    e.stopPropagation()
                                                }}
                                                onClick={(e) => handleRemove(e, val)}
                                            >
                                                <X className="h-3 w-3 text-neutral-500 hover:text-neutral-900" />
                                            </button>
                                        </Badge>
                                    )
                                })
                            ) : (
                                <span className="font-body">
                                    {options.find((o) => o.value === value)?.label || placeholder}
                                </span>
                            )
                        ) : (
                            <span className="text-neutral-500 font-body">{placeholder}</span>
                        )}
                    </div>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </div>
            </PopoverTrigger>
            <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                <Command>
                    <CommandInput placeholder={searchPlaceholder} value={search} onValueChange={setSearch} />
                    <CommandList>
                        <CommandEmpty>{emptyText}</CommandEmpty>
                        <CommandGroup>
                            {options.map((option) => {
                                const isSelected = selectedValues.includes(option.value)
                                return (
                                    <CommandItem
                                        key={option.value}
                                        value={option.label} // Search by label
                                        onSelect={() => handleSelect(option.value)}
                                    >
                                        <Check
                                            className={cn(
                                                "mr-2 h-4 w-4",
                                                isSelected ? "opacity-100" : "opacity-0"
                                            )}
                                        />
                                        {option.label}
                                    </CommandItem>
                                )
                            })}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}
