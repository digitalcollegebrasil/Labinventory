import React, { useState, useMemo, useEffect } from 'react';
import { api } from '../services/api';
import { Printer, Calendar, FileText, Download, Filter } from 'lucide-react';
import { Device, CheckRecord } from '../types';

type Period = 'day' | 'week' | 'month' | 'semester' | 'year';

interface ReportItem {
    date: string;
    time: string;
    deviceName: string;
    labName: string;
    userName: string;
    status: string; // 'Completo' or 'Incompleto' (based on checks)
    issues: string[];
}

export function Reports() {
    const [period, setPeriod] = useState<Period>('month');
    const [devices, setDevices] = useState<Device[]>([]);

    useEffect(() => {
        api.getDevices().then(setDevices).catch(console.error);
    }, []);

    const getStartDate = (p: Period): Date => {
        const now = new Date();
        switch (p) {
            case 'day': return new Date(now.setHours(0, 0, 0, 0));
            case 'week': {
                const d = new Date(now);
                d.setDate(d.getDate() - 7);
                return d;
            }
            case 'month': {
                const d = new Date(now);
                d.setMonth(d.getMonth() - 1);
                return d;
            }
            case 'semester': {
                const d = new Date(now);
                d.setMonth(d.getMonth() - 6);
                return d;
            }
            case 'year': {
                const d = new Date(now);
                d.setFullYear(d.getFullYear() - 1);
                return d;
            }
        }
    };

    const reportData = useMemo(() => {
        const startDate = getStartDate(period);
        const items: ReportItem[] = [];

        devices.forEach(device => {
            if (device.checkHistory) {
                device.checkHistory.forEach(check => {
                    const checkDate = new Date(check.date);
                    if (checkDate >= startDate) {
                        const issues = [];
                        if (!check.teclado) issues.push('Teclado');
                        if (!check.mouse) issues.push('Mouse');
                        if (!check.monitor) issues.push('Monitor');
                        if (!check.cabos) issues.push('Cabos');
                        if (!check.software) issues.push('Software');

                        items.push({
                            date: check.date,
                            time: check.time,
                            deviceName: device.name,
                            labName: device.lab,
                            userName: check.userName || 'Desconhecido',
                            status: issues.length === 0 ? 'OK' : 'Problemas',
                            issues
                        });
                    }
                });
            }
        });

        return items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [devices, period]);

    const handlePrint = () => {
        window.print();
    };

    const formatDate = (dateStr: string) => {
        const [year, month, day] = dateStr.split('-');
        return `${day}/${month}/${year}`;
    };

    return (
        <div className="space-y-6 print:space-y-0 print:p-0">
            {/* Header - Hidden on Print */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 print:hidden">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <FileText className="w-6 h-6 text-indigo-600" />
                        Relatórios de Manutenção
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        Gere relatórios detalhados das verificações de laboratório.
                    </p>
                </div>
                <button
                    onClick={handlePrint}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-sm transition-colors"
                >
                    <Printer className="w-4 h-4" />
                    Imprimir / Salvar PDF
                </button>
            </div>

            {/* Filters - Hidden on Print */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 print:hidden">
                <div className="flex items-center gap-2 mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                    <Filter className="w-4 h-4" />
                    Filtrar por Período:
                </div>
                <div className="flex flex-wrap gap-2">
                    {(['day', 'week', 'month', 'semester', 'year'] as Period[]).map((p) => (
                        <button
                            key={p}
                            onClick={() => setPeriod(p)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${period === p
                                ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
                                : 'bg-gray-50 text-gray-600 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
                                }`}
                        >
                            {p === 'day' && 'Hoje'}
                            {p === 'week' && 'Última Semana'}
                            {p === 'month' && 'Último Mês'}
                            {p === 'semester' && 'Último Semestre'}
                            {p === 'year' && 'Último Ano'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Report Content - Visible on Print */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden print:shadow-none print:border-none">
                {/* Print Header */}
                <div className="hidden print:block p-8 border-b border-gray-200">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-3xl font-bold text-gray-900">Relatório de Verificações</h1>
                        <div className="text-right">
                            <p className="text-sm text-gray-500">Gerado em:</p>
                            <p className="font-medium">{new Date().toLocaleString()}</p>
                        </div>
                    </div>
                    <div className="flex gap-8 text-sm text-gray-600">
                        <div>
                            <span className="font-bold">Período:</span> {
                                period === 'day' ? 'Hoje' :
                                    period === 'week' ? 'Última Semana' :
                                        period === 'month' ? 'Último Mês' :
                                            period === 'semester' ? 'Último Semestre' : 'Último Ano'
                            }
                        </div>
                        <div>
                            <span className="font-bold">Total de Registros:</span> {reportData.length}
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 font-medium border-b border-gray-200 dark:border-gray-700">
                            <tr>
                                <th className="px-6 py-4">Data/Hora</th>
                                <th className="px-6 py-4">Laboratório</th>
                                <th className="px-6 py-4">Equipamento</th>
                                <th className="px-6 py-4">Responsável</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Observações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {reportData.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                                        Nenhum registro encontrado para este período.
                                    </td>
                                </tr>
                            ) : (
                                reportData.map((item, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                        <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                                            {formatDate(item.date)} <span className="text-xs text-gray-400 ml-1">{item.time}</span>
                                        </td>
                                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                                            {item.labName}
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                                            {item.deviceName}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs font-bold text-gray-600 dark:text-gray-300">
                                                    {item.userName.charAt(0)}
                                                </div>
                                                <span className="text-gray-700 dark:text-gray-300">{item.userName}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {item.status === 'OK' ? (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                                    OK
                                                </span>
                                            ) : (
                                                <div className="flex flex-col gap-1">
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 w-fit">
                                                        Problemas
                                                    </span>
                                                    <span className="text-xs text-red-600 dark:text-red-400">
                                                        {item.issues.join(', ')}
                                                    </span>
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 dark:text-gray-400 max-w-xs truncate">
                                            -
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
