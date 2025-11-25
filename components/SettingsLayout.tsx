import React, { useState } from 'react';
import { Building2, Users, ChevronRight, LogOut, FileText } from 'lucide-react';
import { UserManagement } from './UserManagement';
import { StructureManagement } from './StructureManagement';
import { GroupManagement } from './GroupManagement';
import { Reports } from './Reports';

interface SettingsLayoutProps {
    onLogout?: () => void;
}

export function SettingsLayout({ onLogout }: SettingsLayoutProps) {
    const [activeSection, setActiveSection] = useState<'structure' | 'users' | 'groups' | 'reports'>('structure');

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex space-x-1 bg-white dark:bg-gray-800 p-1 rounded-xl shadow-sm w-fit overflow-x-auto max-w-full">
                    <button
                        onClick={() => setActiveSection('structure')}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap ${activeSection === 'structure'
                            ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400'
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                            }`}
                    >
                        <Building2 className="w-4 h-4" />
                        <span>Estrutura</span>
                    </button>
                    <button
                        onClick={() => setActiveSection('users')}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap ${activeSection === 'users'
                            ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400'
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                            }`}
                    >
                        <Users className="w-4 h-4" />
                        <span>Usuários</span>
                    </button>
                    <button
                        onClick={() => setActiveSection('groups')}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap ${activeSection === 'groups'
                            ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400'
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                            }`}
                    >
                        <Users className="w-4 h-4" />
                        <span>Grupos</span>
                    </button>
                    <button
                        onClick={() => setActiveSection('reports')}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap ${activeSection === 'reports'
                            ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400'
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                            }`}
                    >
                        <FileText className="w-4 h-4" />
                        <span>Relatórios</span>
                    </button>
                </div>

                {onLogout && (
                    <button
                        onClick={onLogout}
                        className="flex items-center space-x-2 px-4 py-2 bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition text-sm font-medium"
                    >
                        <LogOut className="w-4 h-4" />
                        <span>Sair</span>
                    </button>
                )}
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6">
                {activeSection === 'structure' ? (
                    <StructureManagement />
                ) : activeSection === 'users' ? (
                    <UserManagement />
                ) : activeSection === 'groups' ? (
                    <GroupManagement />
                ) : (
                    <Reports />
                )}
            </div>
        </div>
    );
}
