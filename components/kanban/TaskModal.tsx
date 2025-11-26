import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import toast from "react-hot-toast";

import { SubtaskItem } from "./SubtaskItem";
import { CommentItem } from "./CommentItem";
import { AttachmentItem } from "./AttachmentItem";

import { Task, Subtask, Comment, Attachment } from "./types";

    useEffect(() => {
        if (!task) return;

        const loadData = async () => {
            try {
                const [st, cm, at] = await Promise.all([
                    api.getSubtasks(task.id),
                    api.getComments(task.id),
                    api.getTaskAttachments(task.id)
                ]);
                setSubtasks(st || []);
                setComments(cm || []);
                setAttachments(at || []);
            } catch (error) {
                console.error("Error loading task details:", error);
                toast.error("Erro ao carregar detalhes da tarefa.");
            }
        };
        loadData();
    }, [task]);

    if (!task) return null;

    const toggleSubtask = async (st: Subtask) => {
        try {
            await api.updateSubtask(st.id, { done: !st.done });
            setSubtasks(await api.getSubtasks(task.id));
        } catch (error) {
            toast.error("Erro ao atualizar subtarefa.");
        }
    };

    const addSubtask = async () => {
        const title = prompt("Subtarefa:");
        if (!title) return;
        try {
            await api.createSubtask(task.id, title);
            setSubtasks(await api.getSubtasks(task.id));
            toast.success("Subtarefa adicionada!");
        } catch (error) {
            toast.error("Erro ao criar subtarefa.");
        }
    };

    const deleteSubtask = async (id: number) => {
        if (!confirm("Excluir subtarefa?")) return;
        try {
            await api.deleteSubtask(id);
            setSubtasks(await api.getSubtasks(task.id));
            toast.success("Subtarefa removida.");
        } catch (error) {
            toast.error("Erro ao remover subtarefa.");
        }
    };

    const addComment = async () => {
        if (!commentText.trim()) return;
        try {
            await api.addComment(task.id, user!.id, commentText);
            setComments(await api.getComments(task.id));
            setCommentText("");
            toast.success("Comentário adicionado.");
        } catch (error) {
            toast.error("Erro ao adicionar comentário.");
        }
    };

    const uploadAttachment = async (file: File) => {
        try {
            await api.uploadAttachment(task.id, file);
            setAttachments(await api.getTaskAttachments(task.id));
            toast.success("Anexo enviado!");
        } catch (error) {
            console.error(error);
            toast.error("Erro ao enviar anexo.");
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-6 z-50 backdrop-blur-sm">
            <div className="bg-gray-900 text-white w-full max-w-2xl rounded-xl p-6 relative overflow-auto max-h-[95vh] shadow-2xl border border-gray-700">

                <button className="absolute right-4 top-4 text-gray-400 hover:text-white" onClick={close}>
                    <X className="w-6 h-6" />
                </button>

                <h2 className="text-2xl font-bold mb-4 pr-8">{task.title}</h2>
                <p className="text-gray-400 mb-6 text-sm">{task.description}</p>

                {/* PRIORIDADE */}
                <div className="mt-4 mb-6">
                    <label className="block mb-1 font-semibold text-sm text-gray-300">Prioridade</label>
                    <select
                        className="w-full px-3 py-2 rounded-lg border border-gray-600 bg-gray-800 text-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                        value={task.priority || "normal"}
                        onChange={async (e) => {
                            await api.updateTask(task.id, { priority: e.target.value as any });
                            toast.success("Prioridade atualizada!");
                            refresh();
                        }}
                    >
                        <option value="normal">🔵 Normal</option>
                        <option value="alta">🟡 Alta</option>
                        <option value="critica">🔴 Crítica</option>
                        <option value="urgente">💎 Urgente</option>
                    </select>
                </div>

                {/* SUBTAREFAS */}
                <section className="mt-6 border-t border-gray-700 pt-4">
                    <h3 className="font-bold mb-3 text-lg flex items-center gap-2">
                        ✅ Subtarefas
                        <span className="text-xs bg-gray-700 px-2 py-0.5 rounded-full text-gray-300">{subtasks.length}</span>
                    </h3>

                    <div className="space-y-1">
                        {subtasks.map((st) => (
                            <SubtaskItem
                                key={st.id}
                                subtask={st}
                                toggle={toggleSubtask}
                                remove={deleteSubtask}
                            />
                        ))}
                    </div>

                    <button
                        onClick={addSubtask}
                        className="text-indigo-400 hover:text-indigo-300 mt-3 text-sm font-medium flex items-center gap-1"
                    >
                        + Adicionar Subtarefa
                    </button>
                </section>

                {/* ANEXOS */}
                <section className="mt-6 border-t border-gray-700 pt-4">
                    <h3 className="font-bold mb-3 text-lg flex items-center gap-2">
                        📎 Anexos
                        <span className="text-xs bg-gray-700 px-2 py-0.5 rounded-full text-gray-300">{attachments.length}</span>
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {attachments.map((a) => (
                            <AttachmentItem key={a.id} a={a} />
                        ))}
                    </div>

                    <label className="mt-3 inline-block cursor-pointer">
                        <span className="text-indigo-400 hover:text-indigo-300 text-sm font-medium">
                            + Upload de Arquivo
                        </span>
                        <input
                            type="file"
                            className="hidden"
                            onChange={(e) => e.target.files && uploadAttachment(e.target.files[0])}
                        />
                    </label>
                </section>

                {/* COMENTÁRIOS */}
                <section className="mt-6 border-t border-gray-700 pt-4">
                    <h3 className="font-bold mb-3 text-lg flex items-center gap-2">
                        💬 Comentários
                        <span className="text-xs bg-gray-700 px-2 py-0.5 rounded-full text-gray-300">{comments.length}</span>
                    </h3>

                    <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar mb-4">
                        {comments.map((c) => (
                            <CommentItem key={c.id} c={c} />
                        ))}
                        {comments.length === 0 && <p className="text-gray-500 text-sm italic">Nenhum comentário ainda.</p>}
                    </div>

                    <div className="flex gap-2">
                        <textarea
                            className="flex-1 p-3 rounded bg-gray-800 border border-gray-700 text-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                            placeholder="Escreva um comentário..."
                            rows={2}
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                        />
                        <button
                            onClick={addComment}
                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg self-end font-medium text-sm transition-colors"
                        >
                            Enviar
                        </button>
                    </div>
                </section>

                {/* FOOTER */}
                <div className="text-right mt-8 pt-4 border-t border-gray-700">
                    <button onClick={close} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors">
                        Fechar
                    </button>
                </div>
            </div>
        </div>
    );
}
