import React from "react";
import {
    BrainCircuit,
    QrCode,
    Search,
    Trash2,
    ChevronDown,
} from "lucide-react";
import { Device, DeviceStatus } from "../../types";
import { api } from "../../services/api";

interface Props {
    devices: Device[];
    setSelectedDevice: (d: Device) => void;
    openChecklist: () => void;
    openQR: () => void;
    openDetails: () => void;
    onAI: (d: Device) => void;
    refresh: () => void;
}

export function InventoryTable({
    devices,
    setSelectedDevice,
    openChecklist,
    openQR,
    openDetails,
    onAI,
    refresh,
}: Props) {
    const formatDate = (date?: string) => {
        if (!date) return "-";
        const [y, m, d] = date.split("-");
        return `${d}/${m}/${y}`;
    };

    const statusColor = (s: DeviceStatus) => {
        switch (s) {
            case DeviceStatus.OPERATIONAL:
                return "bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-200";
            case DeviceStatus.MAINTENANCE:
                return "bg-yellow-100 text-yellow-700 dark:bg-yellow-800 dark:text-yellow-200";
            case DeviceStatus.BROKEN:
                return "bg-red-100 text-red-700 dark:bg-red-800 dark:text-red-300";
            case DeviceStatus.MISSING:
                return "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300";
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden">
            <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">
                            Patrimônio
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">
                            Laboratório
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">
                            Equipamento
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">
                            Mod.
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">
                            Status
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">
                            Última Check
                        </th>
                        <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase">
                            Ações
                        </th>
                    </tr>
                </thead>

                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {devices.map((d) => (
                        <tr key={d.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                            <td className="px-6 py-4 font-bold">{d.id}</td>

                            <td className="px-6 py-4">{d.lab}</td>

                            <td className="px-6 py-4">
                                <button
                                    onClick={() => {
                                        setSelectedDevice(d);
                                        openDetails();
                                    }}
                                    className="font-semibold text-indigo-600 dark:text-indigo-400"
                                >
                                    {d.name}
                                </button>
                                <p className="text-xs text-gray-500">{d.brand}</p>
                            </td>

                            <td className="px-6 py-4 text-sm text-gray-500">
                                {d.model || "-"}
                            </td>

                            <td className="px-6 py-4">
                                <div className="relative">
                                    <select
                                        className={`px-3 pr-8 py-1 rounded-full text-xs font-bold cursor-pointer ${statusColor(
                                            d.status
                                        )}`}
                                        value={d.status}
                                        onChange={async (e) => {
                                            await api.updateDevice(d.id, {
                                                status: e.target.value as DeviceStatus,
                                            });
                                            refresh();
                                        }}
                                    >
                                        {Object.values(DeviceStatus).map((s) => (
                                            <option key={s}>{s}</option>
                                        ))}
                                    </select>
                                    <ChevronDown className="w-3 h-3 absolute right-2 top-1/2 -translate-y-1/2 text-gray-500" />
                                </div>
                            </td>

                            <td className="px-6 py-4">{formatDate(d.lastCheck)}</td>

                            <td className="px-6 py-4">
                                <div className="flex justify-end gap-2">
                                    <button
                                        onClick={() => {
                                            setSelectedDevice(d);
                                            openChecklist();
                                        }}
                                        className="px-3 py-1.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 rounded-lg text-sm"
                                    >
                                        Checklist
                                    </button>

                                    <button
                                        onClick={() => onAI(d)}
                                        disabled={d.status === DeviceStatus.OPERATIONAL}
                                        className={`p-2 rounded-lg ${d.status === DeviceStatus.OPERATIONAL
                                                ? "bg-gray-200 dark:bg-gray-700 text-gray-400"
                                                : "bg-purple-100 dark:bg-purple-900/30 text-purple-600"
                                            }`}
                                    >
                                        <BrainCircuit className="w-5 h-5" />
                                    </button>

                                    <button
                                        onClick={() => {
                                            setSelectedDevice(d);
                                            openQR();
                                        }}
                                        className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg"
                                    >
                                        <QrCode className="w-5 h-5" />
                                    </button>

                                    <button
                                        onClick={() => {
                                            setSelectedDevice(d);
                                            openDetails();
                                        }}
                                        className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-lg"
                                    >
                                        <Search className="w-5 h-5" />
                                    </button>

                                    <button
                                        onClick={async () => {
                                            if (confirm(`Excluir ${d.id}?`)) {
                                                await api.deleteDevice(d.id);
                                                refresh();
                                            }
                                        }}
                                        className="p-2 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-lg"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}

                    {devices.length === 0 && (
                        <tr>
                            <td colSpan={7} className="text-center py-8 text-gray-500">
                                Nenhum equipamento encontrado.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}
