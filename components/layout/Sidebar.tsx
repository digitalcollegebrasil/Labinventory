import React, { useState } from "react";
import {
    LayoutDashboard,
    Monitor,
    Settings,
    ClipboardList,
    LogOut,
    User as UserIcon,
    ChevronDown
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { UserStatusSidebar } from "../UserStatusSidebar";
import { AccountModal } from "../AccountModal";

interface SidebarProps {
    activeTab: string;
    setActiveTab: (tab: any) => void;
}

export function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
    const { logout, user } = useAuth();
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [showAccountModal, setShowAccountModal] = useState(false);

    const NavItem = ({
        icon: Icon,
        label,
        tab,
    }: {
        icon: any;
        label: string;
        tab: any;
    }) => (
        <button
            onClick={() => setActiveTab(tab)}
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg w-full text-left transition 
      ${activeTab === tab
                    ? "bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300"
                    : "hover:bg-gray-200 dark:hover:bg-gray-700"
                }`}
        >
            <Icon className="w-5 h-5" />
            <span>{label}</span>
        </button>
    );

    const statusColor = user?.status === 'busy' ? 'bg-red-500' : user?.status === 'offline' ? 'bg-gray-500' : 'bg-green-500';

    return (
        <>
            <aside className="hidden md:flex flex-col w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 fixed h-full">
                <div className="p-6">
                    <div className="flex items-center space-x-2 mb-6">
                        <img src="/logo.png" alt="Logo" className="w-8 h-8 rounded-lg" />
                        <span className="text-xl font-bold text-gray-900 dark:text-white">LabManager</span>
                    </div>

                    <nav className="space-y-2">
                        <NavItem icon={LayoutDashboard} label="Dashboard" tab="dashboard" />
                        <NavItem icon={Monitor} label="Inventário" tab="inventory" />
                        <NavItem icon={ClipboardList} label="Tarefas" tab="tasks" />
                        <NavItem icon={Settings} label="Configurações" tab="settings" />
                    </nav>
                </div>

                {/* User Section at Bottom */}
                <div className="mt-auto border-t border-gray-200 dark:border-gray-700 flex flex-col">

                    {/* Other Users Status - Now Above Current User */}
                    <div className="flex-1 overflow-y-auto max-h-48 custom-scrollbar">
                        <UserStatusSidebar />
                    </div>

                    {/* Current User Profile */}
                    <div className="p-4 border-t border-gray-100 dark:border-gray-700 relative">
                        <button
                            onClick={() => setShowUserMenu(!showUserMenu)}
                            className="flex items-center space-x-3 w-full p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                            <div className="relative shrink-0">
                                <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                                    {user?.avatar ? (
                                        <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-lg font-bold text-gray-600 dark:text-gray-300">{user?.name?.charAt(0)}</span>
                                    )}
                                </div>
                                <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white dark:border-gray-800 ${statusColor}`}></div>
                            </div>

                            {/* Added min-w-0 to allow truncation */}
                            <div className="flex-1 text-left min-w-0">
                                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user?.name}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
                            </div>

                            <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform shrink-0 ${showUserMenu ? 'rotate-180' : ''}`} />
                        </button>

                        {/* User Menu Dropdown - Opening Upwards */}
                        {showUserMenu && (
                            <div className="absolute bottom-full left-4 right-4 mb-2 py-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 animate-in slide-in-from-bottom-2 z-50">
                                <button
                                    onClick={() => {
                                        setShowAccountModal(true);
                                        setShowUserMenu(false);
                                    }}
                                    className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                                >
                                    <UserIcon className="w-4 h-4" />
                                    Minha Conta
                                </button>
                                <button
                                    onClick={logout}
                                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                                >
                                    <LogOut className="w-4 h-4" />
                                    Sair
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </aside>

            {/* Account Modal */}
            <AccountModal
                isOpen={showAccountModal}
                onClose={() => setShowAccountModal(false)}
                onSubmit={(e) => {
                    e.preventDefault();
                    setShowAccountModal(false);
                }}
                data={{
                    name: user?.name || '',
                    avatar: user?.avatar || '',
                }}
                setData={() => { }}
                user={user}
                theme={'light'}
                toggleTheme={() => { }}
            />
        </>
    );
}
