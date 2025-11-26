import React, { useState } from "react";
import { X } from "lucide-react";
import { Lab, DeviceStatus } from "../../../types";
import { api } from "../../../services/api";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    labs: Lab[];
    refresh: () => void;
}

export function AddDeviceModal({ isOpen, onClose, labs, refresh }: Props) {
    const [data, setData] = useState({
        id: "",
        lab: "",
        brand: "",
        model: "",
        processor: "",
        ram: "",
        storage: "",
        status: DeviceStatus.OPERATIONAL,
    });

    if (!isOpen) return null;

    const submit = async (e: any) => {
        e.preventDefault();

        const labObj = labs.find((l) => l.name === data.lab);
        if (!labObj) return alert("Laboratório inválido.");

        await api.addComputador({
            id: data.id,
            brand: data.brand,
            model: data.model,
            processor: data.processor,
            ram: data.ram,
            storage: data.storage,
            status: data.status,
            labId: labObj.id,
        });

        refresh();
        onClose();

        setData({
            id: "",
            lab: "",
            brand: "",
            model: "",
            processor: "",
            ram: "",
            storage: "",
            status: DeviceStatus.OPERATIONAL,
        });
    };

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-xl relative">

                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
                >
                    <X className="w-5 h-5" />
                </button>

                <h2 className="text-2xl font-bold mb-4">Adicionar Equipamento</h2>

                <form onSubmit={submit} className="space-y-4">

                    <input
                        className="input"
                        placeholder="Patrimônio"
                        required
                        value={data.id}
                        onChange={(e) => setData({ ...data, id: e.target.value })}
                    />

                    <select
                        className="input"
                        required
                        value={data.lab}
                        onChange={(e) => setData({ ...data, lab: e.target.value })}
                    >
                        <option value="">Selecione o laboratório</option>
                        {labs.map((l) => (
                            <option key={l.id} value={l.name}>
                                {l.name}
                            </option>
                        ))}
                    </select>

                    <div className="grid grid-cols-2 gap-4">
                        <input
                            className="input"
                            placeholder="Marca"
                            required
                            value={data.brand}
                            onChange={(e) => setData({ ...data, brand: e.target.value })}
                        />
                        <input
                            className="input"
                            placeholder="Modelo"
                            required
                            value={data.model}
                            onChange={(e) => setData({ ...data, model: e.target.value })}
                        />
                    </div>

                    <input
                        className="input"
                        placeholder="Processador"
                        value={data.processor}
                        onChange={(e) => setData({ ...data, processor: e.target.value })}
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <input
                            className="input"
                            placeholder="RAM"
                            value={data.ram}
                            onChange={(e) => setData({ ...data, ram: e.target.value })}
                        />
                        <input
                            className="input"
                            placeholder="Armazenamento"
                            value={data.storage}
                            onChange={(e) => setData({ ...data, storage: e.target.value })}
                        />
                    </div>

                    <select
                        className="input"
                        value={data.status}
                        onChange={(e) =>
                            setData({ ...data, status: e.target.value as DeviceStatus })
                        }
                    >
                        {Object.values(DeviceStatus).map((s) => (
                            <option key={s}>{s}</option>
                        ))}
                    </select>

                    <div className="flex justify-end gap-3 pt-4">
                        <button onClick={onClose} type="button" className="btn-secondary">
                            Cancelar
                        </button>
                        <button type="submit" className="btn-primary">
                            Adicionar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
