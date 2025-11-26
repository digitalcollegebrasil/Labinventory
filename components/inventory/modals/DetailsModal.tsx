import React from "react";
import { X } from "lucide-react";
import { Device } from "../../../types";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    device: Device | null;
}

export function DetailsModal({ isOpen, onClose, device }: Props) {
    if (!isOpen || !device) return null;

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 max-w-lg w-full p-6 rounded-xl relative">

                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
                >
                    <X className="w-5 h-5" />
                </button>

                <h2 className="text-xl font-bold mb-3">
                    Detalhes do Equipamento • {device.name}
                </h2>

                <div className="space-y-2 text-sm">
                    <p><strong>ID:</strong> {device.id}</p>
                    <p><strong>Laboratório:</strong> {device.lab}</p>
                    <p><strong>Marca:</strong> {device.brand}</p>
                    <p><strong>Modelo:</strong> {device.model}</p>
                    <p><strong>Processador:</strong> {device.processor || "-"}</p>
                    <p><strong>RAM:</strong> {device.ram || "-"}</p>
                    <p><strong>Armazenamento:</strong> {device.storage || "-"}</p>
                </div>

                <h3 className="font-bold mt-4 mb-2">Histórico de Checks</h3>

                <div className="max-h-48 overflow-auto space-y-2 p-2 bg-gray-50 dark:bg-gray-700 rounded">
                    {device.checkHistory?.length ? (
                        device.checkHistory.map((h, i) => (
                            <div key={i} className="border-b pb-2">
                                <p className="text-xs text-gray-500">
                                    {h.date} • {h.time} • {h.userName}
                                </p>
                                <p className="text-sm">{h.observacoes || "Sem observações"}</p>
                            </div>
                        ))
                    ) : (
                        <p className="text-gray-500 text-sm">Sem histórico</p>
                    )}
                </div>
            </div>
        </div>
    );
}
