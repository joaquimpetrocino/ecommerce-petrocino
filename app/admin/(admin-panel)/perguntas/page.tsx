"use client";

import { useState, useEffect } from "react";
import { MessageCircle, Check, X, Clock, Send } from "lucide-react";
import { toast } from "sonner";
import { AlertDialog } from "@/components/ui/alert-dialog";

interface ProductQuestion {
    id: string;
    productName: string;
    productImage: string;
    userName: string;
    userEmail: string;
    question: string;
    answer?: string;
    status: "pending" | "approved" | "rejected";
    createdAt: number;
    answeredAt?: number;
}

export default function QuestionsPage() {
    const [questions, setQuestions] = useState<ProductQuestion[]>([]);
    const [loading, setLoading] = useState(true);
    const [replyingId, setReplyingId] = useState<string | null>(null);
    const [replyText, setReplyText] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [activeTab, setActiveTab] = useState<"pending" | "approved">("pending");
    const [isActionLoading, setIsActionLoading] = useState(false);
    const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; id: string | null }>({
        isOpen: false,
        id: null
    });

    useEffect(() => {
        fetchQuestions();
    }, []);

    const fetchQuestions = async () => {
        try {
            const res = await fetch("/api/admin/questions");
            if (res.ok) {
                const data = await res.json();
                setQuestions(data);
            }
        } catch (error) {
            console.error("Erro ao carregar perguntas:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleReply = async (id: string) => {
        if (!replyText.trim()) return;
        setSubmitting(true);

        try {
            const res = await fetch("/api/admin/questions", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, answer: replyText })
            });

            if (res.ok) {
                toast.success("Resposta enviada e pergunta aprovada!");
                await fetchQuestions();
                setReplyingId(null);
                setReplyText("");
            } else {
                toast.error("Erro ao enviar resposta.");
            }
        } catch (error) {
            console.error("Erro ao responder:", error);
            toast.error("Erro de conexão ao responder.");
        } finally {
            setSubmitting(false);
        }
    };

    const confirmReject = async () => {
        if (!deleteDialog.id) return;

        setIsActionLoading(true);
        try {
            const res = await fetch(`/api/admin/questions?id=${deleteDialog.id}`, {
                method: "DELETE"
            });

            if (res.ok) {
                toast.success("Pergunta removida com sucesso!");
                fetchQuestions();
            } else {
                toast.error("Erro ao rejeitar pergunta.");
            }
        } catch (error) {
            console.error("Erro ao rejeitar:", error);
            toast.error("Erro de conexão ao rejeitar.");
        } finally {
            setIsActionLoading(false);
            setDeleteDialog({ isOpen: false, id: null });
        }
    };

    const handleReject = (id: string) => {
        setDeleteDialog({ isOpen: true, id });
    };

    const [editingId, setEditingId] = useState<string | null>(null);
    const [editReplyText, setEditReplyText] = useState("");

    const handleUpdateStatus = async (id: string, status: "approved" | "rejected" | "pending") => {
        setIsActionLoading(true);
        try {
            const res = await fetch("/api/admin/questions", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, status })
            });

            if (res.ok) {
                toast.success(status === "approved" ? "Pergunta exibida!" : "Pergunta ocultada!");
                await fetchQuestions();
            } else {
                toast.error("Erro ao atualizar status.");
            }
        } catch (error) {
            console.error("Erro ao atualizar status:", error);
            toast.error("Erro de conexão.");
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleEditSave = async (id: string) => {
        if (!editReplyText.trim()) return;
        setSubmitting(true);

        try {
            const res = await fetch("/api/admin/questions", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, answer: editReplyText, status: "approved" })
            });

            if (res.ok) {
                toast.success("Resposta atualizada!");
                await fetchQuestions();
                setEditingId(null);
                setEditReplyText("");
            } else {
                toast.error("Erro ao atualizar resposta.");
            }
        } catch (error) {
            console.error("Erro ao editar:", error);
            toast.error("Erro de conexão.");
        } finally {
            setSubmitting(false);
        }
    };

    const filteredQuestions = questions.filter(q => {
        if (activeTab === "pending") return q.status === "pending";
        return q.status === "approved" || q.status === "rejected"; // Mostrar rejeitadas na aba de respondidas
    });

    const formatDate = (timestamp: number) => {
        return new Date(timestamp).toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    return (
        <div className="space-y-6 pb-20">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="font-heading font-bold text-neutral-900 text-3xl uppercase tracking-tight">
                        Moderação de Perguntas
                    </h1>
                    <p className="text-neutral-600 font-body mt-1">
                        Responda as dúvidas dos clientes para aprovar e publicar no site.
                    </p>
                </div>
            </div>

            {/* Abas */}
            <div className="flex gap-4 border-b border-neutral-200">
                <button
                    onClick={() => setActiveTab("pending")}
                    className={`pb-3 px-1 font-heading font-bold uppercase text-sm border-b-2 transition-colors flex items-center gap-2 ${activeTab === "pending"
                        ? "border-primary text-primary"
                        : "border-transparent text-neutral-500 hover:text-neutral-700"
                        }`}
                >
                    Pendentes
                    {questions.filter(q => q.status === "pending").length > 0 && (
                        <span className="bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded-full">
                            {questions.filter(q => q.status === "pending").length}
                        </span>
                    )}
                </button>
                <button
                    onClick={() => setActiveTab("approved")}
                    className={`pb-3 px-1 font-heading font-bold uppercase text-sm border-b-2 transition-colors ${activeTab === "approved"
                        ? "border-primary text-primary"
                        : "border-transparent text-neutral-500 hover:text-neutral-700"
                        }`}
                >
                    Respondidas / Aprovadas
                </button>
            </div>

            {/* Lista */}
            <div className="space-y-4">
                {loading ? (
                    <div className="text-center py-12">Carregando...</div>
                ) : filteredQuestions.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-xl border border-neutral-200">
                        <MessageCircle className="w-10 h-10 text-neutral-300 mx-auto mb-3" />
                        <p className="text-neutral-500 font-body">Nenhuma pergunta encontrada nesta aba.</p>
                    </div>
                ) : (
                    filteredQuestions.map((q) => (
                        <div key={q.id} className={`bg-white rounded-xl border border-neutral-200 p-6 shadow-sm ${q.status === "rejected" ? "opacity-60 grayscale-[0.5]" : ""}`}>
                            <div className="flex flex-col md:flex-row gap-6">
                                {/* Informações do Produto e Usuário */}
                                <div className="md:w-1/4 space-y-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-neutral-100 rounded-lg overflow-hidden shrink-0">
                                            <img
                                                src={q.productImage || "/images/placeholder.png"}
                                                alt=""
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    e.currentTarget.src = "/images/placeholder.png";
                                                }}
                                            />
                                        </div>
                                        <div>
                                            <p className="font-bold text-neutral-900 text-sm line-clamp-1">{q.productName}</p>
                                            <span className="text-xs text-neutral-500">ID: {q.id}</span>
                                        </div>
                                    </div>
                                    <div className="bg-neutral-50 p-3 rounded-lg border border-neutral-100 text-sm">
                                        <p className="font-bold text-neutral-900">{q.userName}</p>
                                        <p className="text-neutral-500 text-xs">{q.userEmail}</p>
                                        <div className="flex items-center gap-1 mt-2 text-xs text-neutral-400">
                                            <Clock className="w-3 h-3" />
                                            {formatDate(q.createdAt)}
                                        </div>
                                    </div>
                                    {q.status === "rejected" && (
                                        <span className="inline-block bg-red-100 text-red-600 text-[10px] font-bold uppercase py-1 px-2 rounded">Oculto</span>
                                    )}
                                </div>

                                {/* Pergunta e Ação */}
                                <div className="md:w-3/4 space-y-4">
                                    <div>
                                        <h3 className="text-sm font-bold text-neutral-500 uppercase mb-1">Pergunta do Cliente</h3>
                                        <p className="text-lg text-neutral-900 font-medium bg-neutral-50 p-4 rounded-lg border border-neutral-100 italic">
                                            "{q.question}"
                                        </p>
                                    </div>

                                    {activeTab === "pending" ? (
                                        <div className="pt-2">
                                            {replyingId === q.id ? (
                                                <div className="animate-fade-in">
                                                    <label className="block text-sm font-bold text-neutral-700 mb-2">Sua Resposta</label>
                                                    <textarea
                                                        value={replyText}
                                                        onChange={(e) => setReplyText(e.target.value)}
                                                        className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none min-h-[100px]"
                                                        placeholder="Olá! Sim, este produto..."
                                                        autoFocus
                                                    ></textarea>
                                                    <div className="flex justify-end gap-3 mt-3">
                                                        <button
                                                            onClick={() => setReplyingId(null)}
                                                            className="px-4 py-2 text-neutral-600 hover:bg-neutral-100 rounded-lg font-bold transition-colors"
                                                        >
                                                            Cancelar
                                                        </button>
                                                        <button
                                                            onClick={() => handleReply(q.id)}
                                                            disabled={submitting || !replyText.trim()}
                                                            className="px-6 py-2 bg-primary text-white rounded-lg font-bold hover:bg-primary-dark transition-colors flex items-center gap-2 disabled:opacity-50"
                                                        >
                                                            {submitting ? "Enviando..." : (
                                                                <>
                                                                    Enviar Resposta
                                                                    <Send className="w-4 h-4" />
                                                                </>
                                                            )}
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex gap-3">
                                                    <button
                                                        onClick={() => {
                                                            setReplyingId(q.id);
                                                            setReplyText(`Olá ${q.userName.split(" ")[0]}! `);
                                                        }}
                                                        className="bg-primary hover:bg-primary-dark text-white px-6 py-2.5 rounded-lg font-heading font-bold uppercase text-sm flex items-center gap-2 transition-colors"
                                                    >
                                                        <MessageCircle className="w-4 h-4" />
                                                        Responder e Aprovar
                                                    </button>
                                                    <button
                                                        onClick={() => handleReject(q.id)}
                                                        className="bg-white border border-red-200 text-red-600 hover:bg-red-50 px-6 py-2.5 rounded-lg font-heading font-bold uppercase text-sm flex items-center gap-2 transition-colors"
                                                    >
                                                        <X className="w-4 h-4" />
                                                        Rejeitar / Excluir
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            <div>
                                                <h3 className="text-sm font-bold text-primary uppercase mb-1">Sua Resposta</h3>
                                                {editingId === q.id ? (
                                                    <div className="space-y-3">
                                                        <textarea
                                                            value={editReplyText}
                                                            onChange={(e) => setEditReplyText(e.target.value)}
                                                            className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none min-h-[100px]"
                                                            autoFocus
                                                        ></textarea>
                                                        <div className="flex justify-end gap-2">
                                                            <button
                                                                onClick={() => setEditingId(null)}
                                                                className="px-3 py-1.5 text-xs font-bold text-neutral-500 hover:bg-neutral-100 rounded transition-colors uppercase"
                                                            >
                                                                Cancelar
                                                            </button>
                                                            <button
                                                                onClick={() => handleEditSave(q.id)}
                                                                disabled={submitting}
                                                                className="px-4 py-1.5 text-xs font-bold bg-primary text-white rounded hover:bg-primary-dark transition-colors uppercase"
                                                            >
                                                                {submitting ? "Salvando..." : "Salvar Alterações"}
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <p className="text-neutral-700 bg-primary/5 p-4 rounded-lg border border-primary/10">
                                                            {q.answer}
                                                        </p>
                                                        <div className="flex items-center justify-between mt-2">
                                                            <div className="flex gap-4">
                                                                <button
                                                                    onClick={() => {
                                                                        setEditingId(q.id);
                                                                        setEditReplyText(q.answer || "");
                                                                    }}
                                                                    className="text-xs font-bold text-neutral-500 hover:text-primary flex items-center gap-1 transition-colors uppercase"
                                                                >
                                                                    Editar Resposta
                                                                </button>
                                                                <button
                                                                    onClick={() => handleUpdateStatus(q.id, q.status === "approved" ? "rejected" : "approved")}
                                                                    className={`text-xs font-bold flex items-center gap-1 transition-colors uppercase ${q.status === 'approved' ? 'text-orange-600 hover:text-orange-700' : 'text-green-600 hover:text-green-700'}`}
                                                                >
                                                                    {q.status === "approved" ? "Ocultar do Site" : "Exibir no Site"}
                                                                </button>
                                                                <button
                                                                    onClick={() => handleReject(q.id)}
                                                                    className="text-xs font-bold text-red-500 hover:text-red-700 flex items-center gap-1 transition-colors uppercase"
                                                                >
                                                                    Excluir Permanentemente
                                                                </button>
                                                            </div>
                                                            <p className="text-[10px] text-neutral-400">
                                                                Respondido em {formatDate(q.answeredAt || 0)}
                                                            </p>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <AlertDialog
                isOpen={deleteDialog.isOpen}
                onClose={() => setDeleteDialog({ isOpen: false, id: null })}
                onConfirm={confirmReject}
                title="Rejeitar Pergunta?"
                description="Tem certeza que deseja remover esta pergunta? Ela não será publicada e será excluída permanentemente."
                confirmText="Sim, rejeitar"
                cancelText="Cancelar"
                variant="danger"
                isLoading={isActionLoading}
            />
        </div>
    );
}
