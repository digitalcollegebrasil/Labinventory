import React, { useState } from "react";
import { X } from "lucide-react";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    setSearch: (v: string) => void;
}

export function ScannerModal({ isOpen, onClose, setSearch }: Props) {
    const [code, setCode] = useState("");

    if (!isOpen) return null;

    const submit = () => {
        setSearch(code);
        onClose();
        setCode("");
    };

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl w-full max-w-md relative">

                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 text-gray-500"
                >
                    <X className="w-6 h-6" />
                </button>

                <h2 className="text-xl font-bold mb-4">Simular QR Code</h2>

                <input
                    placeholder="Digite o patrimônio"
                    className="input mb-4"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                />

                <button onClick={submit} className="btn-primary w-full">
                    Buscar
                </button>
            </div>
        </div>
    );
}
