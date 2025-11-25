import React, { useMemo, useState, useEffect } from 'react';
import { api } from '../services/api';
import { Device, DeviceStatus } from '../types';
import { StatCard } from './StatCard';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts';
import { Monitor, AlertTriangle, CheckCircle, Clock, Layout, HardDrive, Cpu } from 'lucide-react';

const COLORS = ['#10B981', '#F59E0B', '#EF4444', '#6B7280']; // Operational, Maint, Broken, Missing

export function Dashboard() {
    const [devices, setDevices] = useState<Device[]>([]);

    useEffect(() => {
        api.getDevices().then(setDevices).catch(console.error);
    }, []);

    const stats = useMemo(() => {
        return {
            total: devices.length,
            operational: devices.filter(d => d.status === DeviceStatus.OPERATIONAL).length,
            maintenance: devices.filter(d => d.status === DeviceStatus.MAINTENANCE).length,
            broken: devices.filter(d => d.status === DeviceStatus.BROKEN).length,
            missing: devices.filter(d => d.status === DeviceStatus.MISSING).length,
        };
    }, [devices]);

    const statusData = [
        { name: 'Operacional', value: stats.operational },
        { name: 'Manutenção', value: stats.maintenance },
        { name: 'Quebrado', value: stats.broken },
        { name: 'Desaparecido', value: stats.missing },
    ];

    // Mock Software/OS Data (In a real app, this would come from device specs or logs)
    const osData = [
        { name: 'Windows 11', value: Math.round(devices.length * 0.6) },
        { name: 'Windows 10', value: Math.round(devices.length * 0.3) },
        { name: 'Linux (Ubuntu)', value: Math.round(devices.length * 0.1) },
    ];

    const softwareData = [
        { name: 'Office 365', count: Math.round(devices.length * 0.9) },
        { name: 'VS Code', count: Math.round(devices.length * 0.5) },
        { name: 'Chrome', count: devices.length },
        { name: 'Adobe Reader', count: Math.round(devices.length * 0.8) },
    ];

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Visão Geral do Sistema</h2>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Total de Equipamentos"
                    value={stats.total}
                    icon={Monitor}
                    color="bg-blue-500"
                    textColor="text-white"
                />
                <StatCard
                    title="Operacionais"
                    value={stats.operational}
                    icon={CheckCircle}
                    color="bg-green-500"
                    textColor="text-white"
                />
                <StatCard
                    title="Em Manutenção"
                    value={stats.maintenance}
                    icon={Clock}
                    color="bg-yellow-500"
                    textColor="text-white"
                />
                <StatCard
                    title="Críticos/Quebrados"
                    value={stats.broken + stats.missing}
                    icon={AlertTriangle}
                    color="bg-red-500"
                    textColor="text-white"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Status Chart */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Status dos Equipamentos</h3>
                    <div className="h-64 w-full">
                        {statusData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={statusData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {statusData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px', color: '#fff' }}
                                    />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-full text-gray-500">
                                Carregando dados...
                            </div>
                        )}
                    </div>
                </div>

                {/* OS Distribution */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Distribuição de Sistema Operacional</h3>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={osData} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#374151" opacity={0.1} />
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" width={100} tick={{ fill: '#6B7280' }} />
                                <Tooltip
                                    cursor={{ fill: 'transparent' }}
                                    contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px', color: '#fff' }}
                                />
                                <Bar dataKey="value" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Software Stats */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-2 mb-6">
                    <Layout className="w-5 h-5 text-indigo-500" />
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Softwares Mais Comuns</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {softwareData.map((sw, idx) => (
                        <div key={idx} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                            <div className="flex justify-between items-start mb-2">
                                <span className="font-medium text-gray-900 dark:text-white">{sw.name}</span>
                                <span className="text-xs bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 px-2 py-1 rounded-full">
                                    {Math.round((sw.count / devices.length) * 100)}%
                                </span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1.5">
                                <div
                                    className="bg-indigo-500 h-1.5 rounded-full"
                                    style={{ width: `${(sw.count / devices.length) * 100}%` }}
                                ></div>
                            </div>
                            <p className="text-xs text-gray-500 mt-2">{sw.count} instalações detectadas</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
