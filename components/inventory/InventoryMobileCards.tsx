import React from "react";
import {
    BrainCircuit,
    QrCode,
    Search,
    Trash2
} from "lucide-react";
import { Device, DeviceStatus } from "../../types";

interface Props {
    devices: Device[];
    onChecklist: (d: Device) => void;
    onQR: (d: Device) => void;
    onDetails: (d: Device) => void;
    onAI: (d: Device) => void;
}

export function InventoryMobileCards({
    devices,
    onChecklist,
    onQR,
    onDetails,
    onAI
}: Props) {
    const statusColor = (s: DeviceStatus) => {
        switch (s) {
            case DeviceStatus.OPERATIONAL:
                return "bg-green-100 text-green-700";
            case DeviceStatus.MAINTENANCE:
                return "bg-yellow-100 text-yellow-700";
            case DeviceStatus.BROKEN:
                return "bg-red-100 text-red-700";
            case DeviceStatus.MISSING:
                return "bg-gray-200 text-gray-700";
        }
    };

    return (
        <div className="space-y-4">
            {devices.map((d) => (
                <div
                    key={d.id}
                    className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow"
                >
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="font-bold">{d.name}</h3>
                            <p className="text-xs text-gray-500">
                                {d.brand} • {d.model}
                            </p>
                        </div>

                        <span
                            className={`px-2 py-1 rounded-full text-xs font-bold ${statusColor(
                                d.status
                            )}`}
                        >
                            {d.status}
                        </span>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3">
                        <button
                            onClick={() => onChecklist(d)}
                            className="px-3 py-2 bg-indigo-100 text-indigo-700 rounded-lg text-xs"
                        >
                            Checklist
                        </button>

                        <button
                            onClick={() => onAI(d)}
                            disabled={d.status === DeviceStatus.OPERATIONAL}
                            className={`p-2 rounded-lg text-xs ${d.status === DeviceStatus.OPERATIONAL
                                    ? "bg-gray-200 text-gray-400"
                                    : "bg-purple-100 text-purple-700"
                                }`}
                        >
                            <BrainCircuit className="w-4 h-4 mx-auto" />
                        </button>

                        <button
                            onClick={() => onQR(d)}
                            className="p-2 bg-gray-100 rounded-lg"
                        >
                            <QrCode className="w-4 h-4 mx-auto" />
                        </button>

                        <button
                            onClick={() => onDetails(d)}
                            className="p-2 bg-blue-100 text-blue-700 rounded-lg"
                        >
                            <Search className="w-4 h-4 mx-auto" />
                        </button>
                    </div>
                </div>
            ))}

            {devices.length === 0 && (
                <p className="text-center text-gray-500 py-4">
                    Nenhum equipamento encontrado.
                </p>
            )}
        </div>
    );
}
