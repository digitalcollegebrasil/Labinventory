import React from 'react';
import { X, Save, User as UserIcon, Lock, Camera, Moon, Sun } from 'lucide-react';

interface AccountData {
    name: string;
    avatar: string;
    currentPassword?: string;
    newPassword?: string;
}

interface AccountModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (e: React.FormEvent) => void;
    data: AccountData;
    setData: React.Dispatch<React.SetStateAction<AccountData>>;
    user: any; // user object from AuthContext
    theme: 'light' | 'dark';
    toggleTheme: () => void;
}

export function AccountModal({
    isOpen,
    onClose,
    onSubmit,
    data,
    setData,
    user,
    theme,
    toggleTheme
}: AccountModalProps) {
    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setData(prev => ({ ...prev, [name]: value }));
    };

    const statusColor = user.status === 'busy' ? 'bg-red-500' : user.status === 'offline' ? 'bg-gray-500' : 'bg-green-500';

    return (
        // Overlay e Backdrop
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden transform transition-all scale-100 border border-gray-100 dark:border-gray-700">

                {/* Header */}
                <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <UserIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                        Configurações de Conta
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={onSubmit} className="space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">

                    {/* Seção 1: Informações do Perfil */}
                    <div className="p-6 border-b border-gray-100 dark:border-gray-700 space-y-4">
                        <h3 className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-4">
                            Detalhes Pessoais
                        </h3>

                        {/* Avatar e Status */}
                        <div className="flex items-center space-x-4">
                            <div className="relative w-16 h-16">
                                <div className="w-full h-full rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                                    {user.avatar ? (
                                        <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-xl font-bold text-gray-600 dark:text-gray-300">{user.name.charAt(0)}</span>
                                    )}
                                </div>
                                {/* Botão de upload simulado */}
                                <button type="button" className="absolute bottom-0 right-0 p-1 bg-indigo-600 text-white rounded-full border-2 border-white dark:border-gray-800 hover:bg-indigo-700 transition">
                                    <Camera className="w-4 h-4" />
                                </button>
                                {/* Indicador de Status */}
                                <div className={`absolute top-0 right-0 w-3 h-3 rounded-full border-2 border-white dark:border-gray-800 ${statusColor}`}></div>
                            </div>

                            <div className="text-left">
                                <p className="font-bold text-lg text-gray-900 dark:text-white">{user.name}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{user.email || 'Usuário do Sistema'}</p>
                            </div>
                        </div>

                        {/* Nome */}
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome Completo</label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={data.name}
                                onChange={handleChange}
                                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 outline-none text-gray-900 dark:text-gray-100 transition"
                                placeholder="Seu nome"
                            />
                        </div>

                        {/* Link do Avatar (opcional) */}
                        <div>
                            <label htmlFor="avatar" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">URL do Avatar (Exemplo)</label>
                            <input
                                type="text"
                                id="avatar"
                                name="avatar"
                                value={data.avatar}
                                onChange={handleChange}
                                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 outline-none text-gray-900 dark:text-gray-100 transition"
                                placeholder="https://exemplo.com/minhafoto.png"
                            />
                        </div>
                    </div>

                    {/* Seção 2: Segurança */}
                    <div className="p-6 border-b border-gray-100 dark:border-gray-700 space-y-4">
                        <h3 className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                            <Lock className="w-4 h-4" />
                            Alterar Senha
                        </h3>

                        {/* Senha Atual */}
                        <div>
                            <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Senha Atual</label>
                            <input
                                type="password"
                                id="currentPassword"
                                name="currentPassword"
                                value={data.currentPassword || ''}
                                onChange={handleChange}
                                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 outline-none text-gray-900 dark:text-gray-100 transition"
                                placeholder="Digite sua senha atual (requerido para alterar)"
                            />
                        </div>

                        {/* Nova Senha */}
                        <div>
                            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nova Senha</label>
                            <input
                                type="password"
                                id="newPassword"
                                name="newPassword"
                                value={data.newPassword || ''}
                                onChange={handleChange}
                                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 outline-none text-gray-900 dark:text-gray-100 transition"
                                placeholder="Deixe em branco se não quiser alterar"
                            />
                        </div>
                    </div>

                    {/* Seção 3: Preferências de Tema */}
                    <div className="p-6 space-y-4">
                        <h3 className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                            <Sun className="w-4 h-4" />
                            Preferências
                        </h3>
                        <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-700">
                            <span className="font-medium text-gray-700 dark:text-gray-300">Modo Escuro / Claro</span>
                            <button
                                type="button"
                                onClick={toggleTheme}
                                className="p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition shadow-sm"
                            >
                                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>

                    {/* Rodapé (Botão de Salvar) */}
                    <div className="sticky bottom-0 bg-white dark:bg-gray-800 p-6 border-t border-gray-100 dark:border-gray-700 flex justify-end">
                        <button
                            type="submit"
                            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-md shadow-indigo-300 dark:shadow-none flex items-center gap-2 transition-all transform active:scale-95"
                        >
                            <Save className="w-4 h-4" />
                            Salvar Alterações
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
