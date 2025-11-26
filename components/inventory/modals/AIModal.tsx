import React from "react";
import { X, Loader2 } from "lucide-react";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    isLoading: boolean;
    content: string;
    title: string;
}

export function AIModal({ isOpen, onClose, isLoading, content, title }: Props) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 w-full max-w-lg p-6 rounded-xl relative">

                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
                >
                    <X className="w-5 h-5" />
                </button>

                <h2 className="text-xl font-bold mb-3">{title}</h2>

                {isLoading ? (
                    <div className="flex justify-center py-6">
                        <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
                    </div>
                ) : (
                    <p className="text-sm whitespace-pre-wrap">{content}</p>
                )}

                <div className="flex justify-end pt-4">
                    <button onClick={onClose} className="btn-primary">
                        Fechar
                    </button>
                </div>
            </div>
        </div>
    );
}
