import React, { useState } from "react";
import { X } from "lucide-react";
import { Device, CheckRecord, DeviceStatus } from "../../../types";
import { api } from "../../../services/api";
import { useAuth } from "../../../contexts/AuthContext";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    device: Device | null;
    refresh: () => void;
}

export function ChecklistModal({ isOpen, onClose, device, refresh }: Props) {
    const { user } = useAuth();

    const [data, setData] = useState({
        teclado: true,
        mouse: true,
        monitor: true,
        cabos: true,
        software: true,
        observacoes: "",
    });

    if (!isOpen || !device) return null;

    const handleSubmit = async () => {
        const record: CheckRecord = {
            date: new Date().toISOString().split("T")[0],
            time: new Date().toLocaleTimeString("pt-BR"),
            userId: user?.id?.toString(),
            userName: user?.name,
            ...data,
        };

        const allOk =
            data.teclado &&
            data.mouse &&
            data.monitor &&
            data.cabos &&
            data.software;

        await api.updateDevice(device.id, {
            status: allOk ? DeviceStatus.OPERATIONAL : DeviceStatus.MAINTENANCE,
            lastCheck: record.date,
            checkHistory: [...(device.checkHistory || []), record],
        });

        refresh();
        onClose();

        setData({
            teclado: true,
            mouse: true,
            monitor: true,
            cabos: true,
            software: true,
            observacoes: "",
        });
    };

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 w-full max-w-lg rounded-xl p-6 relative">

                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
                >
                    <X className="w-6 h-6" />
                </button>

                <h2 className="text-xl font-bold mb-4">Checklist - {device.name}</h2>

                <div className="space-y-3">
                    {Object.keys(data).map((field) =>
                        field !== "observacoes" ? (
                            <label className="flex items-center gap-3" key={field}>
                                <input
                                    type="checkbox"
                                    checked={(data as any)[field]}
                                    onChange={(e) =>
                                        setData({ ...data, [field]: e.target.checked })
                                    }
                                />
                                <span className="capitalize">{field}</span>
                            </label>
                        ) : null
                    )}

                    <textarea
                        placeholder="Observações"
                        className="input h-24 resize-none"
                        value={data.observacoes}
                        onChange={(e) =>
                            setData({ ...data, observacoes: e.target.value })
                        }
                    />
                </div>

                <div className="flex justify-end gap-3 pt-6">
                    <button onClick={onClose} className="btn-secondary">
                        Cancelar
                    </button>
                    <button onClick={handleSubmit} className="btn-primary">
                        Salvar Checklist
                    </button>
                </div>
            </div>
        </div>
    );
}
