import React, { useState } from 'react';
import { X, Calendar, User, AlertTriangle, Search, CheckCircle, Clock, Plus, Save } from 'lucide-react';
import { Device, CheckRecord, Log } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';

interface DeviceDetailsModalProps {
    device: Device;
    onClose: () => void;
}

export function DeviceDetailsModal({ device, onClose }: DeviceDetailsModalProps) {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<'info' | 'history' | 'logs'>('info');
    const [searchTerm, setSearchTerm] = useState('');
    const [dateFilter, setDateFilter] = useState('');

    // Manual Log State
    const [showAddLog, setShowAddLog] = useState(false);
    const [newLogContent, setNewLogContent] = useState('');
    const [newLogDate, setNewLogDate] = useState(new Date().toISOString().split('T')[0]);

    // Checklist State
    const [showAddChecklist, setShowAddChecklist] = useState(false);
    const [newChecklist, setNewChecklist] = useState({
        teclado: false,
        mouse: false,
        monitor: false,
        cabos: false,
        software: false,
        observacoes: ''
    });

    const handleAddChecklist = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        const record: CheckRecord = {
            date: new Date().toISOString().split('T')[0],
            time: new Date().toLocaleTimeString(),
            teclado: newChecklist.teclado,
            mouse: newChecklist.mouse,
            monitor: newChecklist.monitor,
            cabos: newChecklist.cabos,
            software: newChecklist.software,
            observacoes: newChecklist.observacoes,
            userId: user.id.toString(),
            userName: user.name
        };

        const updatedHistory = [...(device.checkHistory || []), record];
        await api.updateDevice(device.id, {
            checkHistory: updatedHistory,
            lastCheck: record.date
        });

        setShowAddChecklist(false);
        setNewChecklist({
            teclado: false,
            mouse: false,
            monitor: false,
            cabos: false,
            software: false,
            observacoes: ''
        });
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return '-';
        const [year, month, day] = dateString.split('-');
        return `${day}/${month}/${year}`;
    };

    const filterByDateAndSearch = (items: (CheckRecord | Log)[]) => {
        return items.filter(item => {
            const matchesSearch = JSON.stringify(item).toLowerCase().includes(searchTerm.toLowerCase());
            const matchesDate = !dateFilter || item.date === dateFilter;
            return matchesSearch && matchesDate;
        });
    };

    const handleAddLog = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newLogContent.trim() || !user) return;

        const newLog: Log = {
            id: Date.now(), // Simple ID generation
            date: newLogDate,
            description: newLogContent,
            type: 'info', // Default type for manual entry
            userId: user.id.toString(),
            userName: user.name
        };

        const updatedLogs = [...(device.logs || []), newLog];

        await api.updateDevice(device.id, {
            logs: updatedLogs
        });

        setNewLogContent('');
        setShowAddLog(false);
    };

    const sortedHistory = [...(device.checkHistory || [])].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const sortedLogs = [...(device.logs || [])].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const filteredHistory = filterByDateAndSearch(sortedHistory) as CheckRecord[];
    const filteredLogs = filterByDateAndSearch(sortedLogs) as Log[];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-[95%] md:w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-start">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            {device.name}
                            <span className={`text-xs px-2 py-1 rounded-full ${device.status === 'Operacional' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                {device.status}
                            </span>
                        </h2>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">ID: {device.id} • {device.lab}</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-200 dark:border-gray-700 px-6">
                    <button
                        onClick={() => setActiveTab('info')}
                        className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'info' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                    >
                        Informações
                    </button>
                    <button
                        onClick={() => setActiveTab('history')}
                        className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'history' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                    >
                        Histórico de Checklists
                    </button>
                    <button
                        onClick={() => setActiveTab('logs')}
                        className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'logs' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                    >
                        Login de atividade
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto flex-1 bg-gray-50 dark:bg-gray-900/50">
                    {activeTab === 'info' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
                                <h3 className="font-bold text-gray-900 dark:text-white mb-4">Especificações Técnicas</h3>
                                <div className="space-y-3 text-sm">
                                    <div className="flex justify-between border-b border-gray-100 dark:border-gray-700 pb-2">
                                        <span className="text-gray-500">Marca</span>
                                        <span className="font-medium text-gray-900 dark:text-white">{device.brand}</span>
                                    </div>
                                    <div className="flex justify-between border-b border-gray-100 dark:border-gray-700 pb-2">
                                        <span className="text-gray-500">Modelo</span>
                                        <span className="font-medium text-gray-900 dark:text-white">{device.model}</span>
                                    </div>
                                    <div className="flex justify-between border-b border-gray-100 dark:border-gray-700 pb-2">
                                        <span className="text-gray-500">Processador</span>
                                        <span className="font-medium text-gray-900 dark:text-white">{device.processor}</span>
                                    </div>
                                    <div className="flex justify-between border-b border-gray-100 dark:border-gray-700 pb-2">
                                        <span className="text-gray-500">RAM</span>
                                        <span className="font-medium text-gray-900 dark:text-white">{device.ram}</span>
                                    </div>
                                    <div className="flex justify-between border-b border-gray-100 dark:border-gray-700 pb-2">
                                        <span className="text-gray-500">Armazenamento</span>
                                        <span className="font-medium text-gray-900 dark:text-white">{device.storage}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
                                <h3 className="font-bold text-gray-900 dark:text-white mb-4">Status Atual</h3>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-3 h-3 rounded-full ${device.status === 'Operacional' ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                                        <span className="text-gray-700 dark:text-gray-300">{device.status}</span>
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        Última verificação: {formatDate(device.lastCheck)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {(activeTab === 'history' || activeTab === 'logs') && (
                        <div className="space-y-4">
                            {/* Filters & Actions */}
                            <div className="flex flex-col md:flex-row gap-4 mb-4 justify-between">
                                <div className="flex gap-4 flex-1">
                                    <div className="flex-1 relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                        <input
                                            type="text"
                                            placeholder="Pesquisar..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                        />
                                    </div>
                                    <input
                                        type="date"
                                        value={dateFilter}
                                        onChange={(e) => setDateFilter(e.target.value)}
                                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                    />
                                </div>
                                {activeTab === 'logs' && (
                                    <button
                                        onClick={() => setShowAddLog(!showAddLog)}
                                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm font-medium"
                                    >
                                        <Plus className="w-4 h-4" />
                                        Adicionar Registro
                                    </button>
                                )}
                            </div>

                            {/* Add Log Form */}
                            {activeTab === 'logs' && showAddLog && (
                                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-indigo-100 dark:border-indigo-900/50 mb-4 animate-in fade-in slide-in-from-top-2">
                                    <form onSubmit={handleAddLog} className="space-y-3">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Conteúdo</label>
                                            <textarea
                                                value={newLogContent}
                                                onChange={(e) => setNewLogContent(e.target.value)}
                                                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none resize-none h-20"
                                                placeholder="Descreva a atividade..."
                                                required
                                            />
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center gap-2">
                                                <label className="text-xs font-medium text-gray-700 dark:text-gray-300">Data:</label>
                                                <input
                                                    type="date"
                                                    value={newLogDate}
                                                    onChange={(e) => setNewLogDate(e.target.value)}
                                                    className="p-1 border border-gray-300 dark:border-gray-600 rounded text-xs bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                                    required
                                                />
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => setShowAddLog(false)}
                                                    className="px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                                                >
                                                    Cancelar
                                                </button>
                                                <button
                                                    type="submit"
                                                    className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-xs font-medium"
                                                >
                                                    <Save className="w-3 h-3" />
                                                    Salvar
                                                </button>
                                            </div>
                                        </div>
                                    </form>
                                </div>
                            )}

                            {/* List */}
                            <div className="space-y-3">
                                {activeTab === 'history' ? (
                                    <>
                                        <div className="flex justify-end mb-4">
                                            <button
                                                onClick={() => setShowAddChecklist(!showAddChecklist)}
                                                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm font-medium"
                                            >
                                                <CheckCircle className="w-4 h-4" />
                                                Realizar Checklist
                                            </button>
                                        </div>

                                        {showAddChecklist && (
                                            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-indigo-100 dark:border-indigo-900/50 mb-4 animate-in fade-in slide-in-from-top-2">
                                                <form onSubmit={handleAddChecklist} className="space-y-4">
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div className="flex items-center gap-2">
                                                            <input type="checkbox" checked={newChecklist.teclado} onChange={e => setNewChecklist({ ...newChecklist, teclado: e.target.checked })} id="chk_teclado" />
                                                            <label htmlFor="chk_teclado" className="text-sm">Teclado</label>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <input type="checkbox" checked={newChecklist.mouse} onChange={e => setNewChecklist({ ...newChecklist, mouse: e.target.checked })} id="chk_mouse" />
                                                            <label htmlFor="chk_mouse" className="text-sm">Mouse</label>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <input type="checkbox" checked={newChecklist.monitor} onChange={e => setNewChecklist({ ...newChecklist, monitor: e.target.checked })} id="chk_monitor" />
                                                            <label htmlFor="chk_monitor" className="text-sm">Monitor</label>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <input type="checkbox" checked={newChecklist.cabos} onChange={e => setNewChecklist({ ...newChecklist, cabos: e.target.checked })} id="chk_cabos" />
                                                            <label htmlFor="chk_cabos" className="text-sm">Cabos</label>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <input type="checkbox" checked={newChecklist.software} onChange={e => setNewChecklist({ ...newChecklist, software: e.target.checked })} id="chk_software" />
                                                            <label htmlFor="chk_software" className="text-sm">Software</label>
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Responsável</label>
                                                        <input
                                                            type="text"
                                                            value={user?.name || 'Usuário Desconhecido'}
                                                            disabled
                                                            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-gray-100 dark:bg-gray-700 text-gray-500 cursor-not-allowed"
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Observações</label>
                                                        <textarea
                                                            value={newChecklist.observacoes}
                                                            onChange={(e) => setNewChecklist({ ...newChecklist, observacoes: e.target.value })}
                                                            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white outline-none resize-none h-20"
                                                            placeholder="Observações adicionais..."
                                                        />
                                                    </div>

                                                    <div className="flex justify-end gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => setShowAddChecklist(false)}
                                                            className="px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                                                        >
                                                            Cancelar
                                                        </button>
                                                        <button
                                                            type="submit"
                                                            className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-xs font-medium"
                                                        >
                                                            <Save className="w-3 h-3" />
                                                            Salvar Checklist
                                                        </button>
                                                    </div>
                                                </form>
                                            </div>
                                        )}

                                        {filteredHistory.length === 0 ? (
                                            <p className="text-center text-gray-500 py-8">Nenhum checklist encontrado.</p>
                                        ) : (
                                            filteredHistory.map((record, idx) => (
                                                <div key={idx} className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <div className="flex items-center gap-2">
                                                            <Calendar className="w-4 h-4 text-indigo-500" />
                                                            <span className="font-medium text-gray-900 dark:text-white">{formatDate(record.date)}</span>
                                                            <span className="text-gray-400 text-sm">• {record.time}</span>
                                                        </div>
                                                        {record.userId && record.userId !== user?.id.toString() && (
                                                            <div className="flex items-center gap-1 text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded-full">
                                                                <AlertTriangle className="w-3 h-3" />
                                                                Feito por: {record.userName || 'Outro usuário'}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm mb-3">
                                                        <div className={`flex items-center gap-1 ${record.teclado ? 'text-green-600' : 'text-red-600'}`}>
                                                            <CheckCircle className="w-3 h-3" /> Teclado
                                                        </div>
                                                        <div className={`flex items-center gap-1 ${record.mouse ? 'text-green-600' : 'text-red-600'}`}>
                                                            <CheckCircle className="w-3 h-3" /> Mouse
                                                        </div>
                                                        <div className={`flex items-center gap-1 ${record.monitor ? 'text-green-600' : 'text-red-600'}`}>
                                                            <CheckCircle className="w-3 h-3" /> Monitor
                                                        </div>
                                                    </div>
                                                    {record.observacoes && (
                                                        <div className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900 p-2 rounded">
                                                            "{record.observacoes}"
                                                        </div>
                                                    )}
                                                </div>
                                            ))
                                        )}
                                    </>
                                ) : (
                                    filteredLogs.length === 0 ? (
                                        <p className="text-center text-gray-500 py-8">Nenhum log encontrado.</p>
                                    ) : (
                                        filteredLogs.map((log, idx) => (
                                            <div key={idx} className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                                                <div className="flex justify-between items-start mb-2">
                                                    <div className="flex items-center gap-2">
                                                        <Clock className="w-4 h-4 text-purple-500" />
                                                        <span className="font-medium text-gray-900 dark:text-white">{formatDate(log.date)}</span>
                                                        <span className={`text-xs px-2 py-0.5 rounded-full ${log.type === 'error' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>
                                                            {log.type}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        {log.userName && (
                                                            <div className="flex items-center gap-1 text-xs text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
                                                                <User className="w-3 h-3" />
                                                                {log.userName}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                <p className="text-sm text-gray-700 dark:text-gray-300">{log.description}</p>
                                            </div>
                                        ))
                                    )
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
