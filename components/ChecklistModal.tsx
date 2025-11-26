import React from 'react';
import { X, CheckCircle, Save, AlertCircle, Monitor, Mouse, Keyboard, Cable, HardDrive } from 'lucide-react';

interface ChecklistData {
    teclado: boolean;
    mouse: boolean;
    monitor: boolean;
    cabos: boolean;
    software: boolean;
    observacoes: string;
}

interface ChecklistModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: () => void;
    data: ChecklistData;
    onChange: (data: ChecklistData) => void;
    deviceName: string;
}

export function ChecklistModal({ isOpen, onClose, onSubmit, data, onChange, deviceName }: ChecklistModalProps) {
    if (!isOpen) return null;

    const toggleItem = (key: keyof ChecklistData) => {
        if (key === 'observacoes') return;
        onChange({ ...data, [key]: !data[key as keyof ChecklistData] });
    };

    const checklistItems = [
        { key: 'monitor', label: 'Monitor & Display', icon: Monitor },
        { key: 'teclado', label: 'Teclado / Input', icon: Keyboard },
        { key: 'mouse', label: 'Mouse / Trackpad', icon: Mouse },
        { key: 'cabos', label: 'Organização de Cabos', icon: Cable },
        { key: 'software', label: 'Sistema & Softwares', icon: HardDrive },
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-gray-100 dark:border-gray-700 flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <CheckCircle className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                            Checklist de Verificação
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Equipamento: <span className="font-medium text-indigo-600 dark:text-indigo-400">{deviceName}</span>
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body - Scrollable */}
                <div className="p-6 overflow-y-auto custom-scrollbar space-y-6">

                    <div className="space-y-3">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Itens de Inspeção</p>
                        {checklistItems.map((item) => {
                            const Icon = item.icon;
                            const isChecked = data[item.key as keyof ChecklistData] === true;

                            return (
                                <button
                                    key={item.key}
                                    onClick={() => toggleItem(item.key as keyof ChecklistData)}
                                    className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all duration-200 group ${isChecked
                                            ? 'bg-indigo-50 border-indigo-200 dark:bg-indigo-900/20 dark:border-indigo-800'
                                            : 'bg-white border-gray-200 dark:bg-gray-700/50 dark:border-gray-600 hover:border-indigo-300 dark:hover:border-indigo-500'
                                        }`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`p-2 rounded-lg ${isChecked ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-800 dark:text-indigo-300' : 'bg-gray-100 text-gray-500 dark:bg-gray-600 dark:text-gray-300'}`}>
                                            <Icon className="w-5 h-5" />
                                        </div>
                                        <span className={`font-medium ${isChecked ? 'text-indigo-900 dark:text-indigo-200' : 'text-gray-700 dark:text-gray-300'}`}>
                                            {item.label}
                                        </span>
                                    </div>

                                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${isChecked
                                            ? 'bg-indigo-600 border-indigo-600 dark:bg-indigo-500 dark:border-indigo-500'
                                            : 'border-gray-300 dark:border-gray-500 group-hover:border-indigo-400'
                                        }`}>
                                        {isChecked && <CheckCircle className="w-4 h-4 text-white" />}
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                            Observações Adicionais
                            <AlertCircle className="w-3 h-3" />
                        </label>
                        <textarea
                            value={data.observacoes}
                            onChange={(e) => onChange({ ...data, observacoes: e.target.value })}
                            placeholder="Descreva problemas encontrados ou detalhes da manutenção..."
                            className="w-full h-24 p-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-gray-700 dark:text-gray-200 resize-none transition-all placeholder-gray-400"
                        />
                    </div>

                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-600 dark:text-gray-300 font-medium hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={onSubmit}
                        className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-sm shadow-indigo-200 dark:shadow-none flex items-center gap-2 transition-all transform active:scale-95"
                    >
                        <Save className="w-4 h-4" />
                        Salvar Checklist
                    </button>
                </div>
            </div>
        </div>
    );
}
