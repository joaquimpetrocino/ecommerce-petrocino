import { AlertTriangle, Info, CheckCircle2, XCircle } from "lucide-react";
import React from "react";

interface AlertDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    description: string;
    confirmText?: string;
    cancelText?: string;
    variant?: "danger" | "warning" | "info";
    isLoading?: boolean;
}

export function AlertDialog({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    confirmText = "Confirmar",
    cancelText = "Cancelar",
    variant = "danger",
    isLoading = false
}: AlertDialogProps) {
    if (!isOpen) return null;

    const variants = {
        danger: {
            icon: XCircle,
            iconClass: "text-red-600 bg-red-50",
            buttonClass: "bg-red-600 hover:bg-red-700 shadow-red-200",
            borderClass: "border-red-100"
        },
        warning: {
            icon: AlertTriangle,
            iconClass: "text-amber-600 bg-amber-50",
            buttonClass: "bg-amber-600 hover:bg-amber-700 shadow-amber-200",
            borderClass: "border-amber-100"
        },
        info: {
            icon: Info,
            iconClass: "text-blue-600 bg-blue-50",
            buttonClass: "bg-blue-600 hover:bg-blue-700 shadow-blue-200",
            borderClass: "border-blue-100"
        }
    };

    const currentVariant = variants[variant];
    const Icon = currentVariant.icon;

    return (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-neutral-900/40 backdrop-blur-sm animate-in fade-in duration-200"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-neutral-100">
                <div className="p-6">
                    <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-xl ${currentVariant.iconClass}`}>
                            <Icon className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-xl font-heading font-bold text-neutral-900 leading-tight">
                                {title}
                            </h3>
                            <p className="mt-2 text-neutral-500 font-body text-sm leading-relaxed">
                                {description}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-neutral-50 px-6 py-4 flex items-center justify-end gap-3 border-t border-neutral-100">
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="px-4 py-2.5 text-sm font-heading font-bold uppercase text-neutral-500 hover:text-neutral-900 transition-colors disabled:opacity-50"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isLoading}
                        className={`px-6 py-2.5 text-sm font-heading font-bold uppercase text-white rounded-xl transition-all shadow-lg active:scale-95 flex items-center gap-2 disabled:opacity-50 ${currentVariant.buttonClass}`}
                    >
                        {isLoading ? (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : null}
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}
