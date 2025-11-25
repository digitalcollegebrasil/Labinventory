import React from 'react';
import { LayoutDashboard, Monitor, QrCode, LogOut, Settings, CheckCircle, FileText } from 'lucide-react';

interface MobileNavProps {
    activeTab: 'dashboard' | 'inventory' | 'settings' | 'tasks';
    setActiveTab: (tab: 'dashboard' | 'inventory' | 'settings' | 'tasks') => void;
    onScanClick: () => void;
    onLogout: () => void;
}

export function MobileNav({ activeTab, setActiveTab, onScanClick, onLogout }: MobileNavProps) {
    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-50 pb-safe transition-colors duration-200">
            <div className="flex justify-around items-center h-16">
                <button
                    onClick={() => setActiveTab('dashboard')}
                    className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${activeTab === 'dashboard' ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400'}`}
                >
                    <LayoutDashboard className="w-6 h-6" />
                    <span className="text-[10px] font-medium">Dashboard</span>
                </button>

                <button
                    onClick={() => setActiveTab('inventory')}
                    className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${activeTab === 'inventory' ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400'}`}
                >
                    <Monitor className="w-6 h-6" />
                    <span className="text-[10px] font-medium">Inventário</span>
                </button>



                <button
                    onClick={() => setActiveTab('tasks')}
                    className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${activeTab === 'tasks' ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400'}`}
                >
                    <CheckCircle className="w-6 h-6" />
                    <span className="text-[10px] font-medium">Tarefas</span>
                </button>



                <button
                    onClick={() => setActiveTab('settings')}
                    className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${activeTab === 'settings' ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400'}`}
                >
                    <Settings className="w-6 h-6" />
                    <span className="text-[10px] font-medium">Config</span>
                </button>
            </div>
        </div>
    );
}
