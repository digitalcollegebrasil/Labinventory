import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { User } from '../types';
import { Trash2, Plus, Shield, ShieldAlert, Lock, Ban, CheckCircle, KeyRound } from 'lucide-react';

export function UserManagement() {
    const [users, setUsers] = useState<User[]>([]);
    const fetchData = async () => {
        try {
            const usersData = await api.getUsers();
            setUsers(usersData);
        } catch (error) {
            console.error("Failed to fetch users", error);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const [isAdding, setIsAdding] = useState(false);
    const [newUser, setNewUser] = useState({
        name: '',
        email: '',
        password: '',
        role: 'user' as 'admin' | 'user',
        forceChangePassword: true
    });

    const [resetPasswordId, setResetPasswordId] = useState<number | null>(null);
    const [newPassword, setNewPassword] = useState('');

    const handleAddUser = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newUser.name || !newUser.email || !newUser.password) {
            alert("Por favor, preencha todos os campos obrigatórios (Nome, Email, Senha).");
            return;
        }

        try {
            await api.createUser({
                name: newUser.name,
                email: newUser.email,
                password: newUser.password,
                role: newUser.role,
                forceChangePassword: newUser.forceChangePassword,
                isBlocked: false,
                avatar: `https://ui-avatars.com/api/?name=${newUser.name}&background=random`
            });
            setIsAdding(false);
            setNewUser({ name: '', email: '', password: '', role: 'user', forceChangePassword: true });
            fetchData();
        } catch (error: any) {
            console.error("Error creating user:", error);
            alert(`Erro ao criar usuário: ${error.message || 'O email pode já estar em uso.'}`);
        }
    };

    const handleDeleteUser = async (id: number) => {
        if (confirm('Tem certeza que deseja excluir este usuário?')) {
            await api.deleteUser(id);
            fetchData();
        }
    };

    const toggleBlockUser = async (user: any) => {
        await api.updateUser(user.id, { isBlocked: !user.isBlocked });
        fetchData();
    };

    const handleResetPassword = async () => {
        if (resetPasswordId && newPassword) {
            await api.updateUser(resetPasswordId, {
                password: newPassword,
                forceChangePassword: true
            });
            setResetPasswordId(null);
            setNewPassword('');
            alert('Senha redefinida com sucesso. O usuário deverá alterá-la no próximo login.');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Gerenciamento de Usuários</h2>
                <button
                    onClick={() => setIsAdding(!isAdding)}
                    className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                >
                    <Plus className="w-4 h-4" />
                    <span>Novo Usuário</span>
                </button>
            </div>

            {isAdding && (
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">Adicionar Novo Usuário</h3>
                    <form onSubmit={handleAddUser} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome</label>
                            <input
                                type="text"
                                required
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                value={newUser.name}
                                onChange={e => setNewUser({ ...newUser, name: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                            <input
                                type="email"
                                required
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                value={newUser.email}
                                onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Senha Inicial</label>
                            <input
                                type="password"
                                required
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                value={newUser.password}
                                onChange={e => setNewUser({ ...newUser, password: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Função</label>
                            <select
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                value={newUser.role}
                                onChange={e => setNewUser({ ...newUser, role: e.target.value as 'admin' | 'user' })}
                            >
                                <option value="user">Usuário Comum</option>
                                <option value="admin">Administrador</option>
                            </select>
                        </div>

                        <div className="flex items-center mt-6">
                            <label className="flex items-center space-x-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={newUser.forceChangePassword}
                                    onChange={e => setNewUser({ ...newUser, forceChangePassword: e.target.checked })}
                                    className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                                />
                                <span className="text-sm text-gray-700 dark:text-gray-300">Exigir troca de senha no primeiro login</span>
                            </label>
                        </div>
                        <div className="md:col-span-2 flex justify-end space-x-3 mt-2">
                            <button
                                type="button"
                                onClick={() => setIsAdding(false)}
                                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                            >
                                Salvar Usuário
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                            <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Usuário</th>

                            <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                        {users.map(user => (
                            <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                                            {user.avatar ? (
                                                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="font-bold text-gray-600 dark:text-gray-300">{user.name.charAt(0)}</span>
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900 dark:text-white">{user.name}</p>
                                            <p className="text-xs text-gray-500">{user.email}</p>
                                        </div>
                                    </div>
                                </td>

                                <td className="px-6 py-4">
                                    <div className="flex flex-col gap-1">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium w-fit ${user.role === 'admin'
                                            ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
                                            : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                                            }`}>
                                            {user.role === 'admin' ? 'Admin' : 'User'}
                                        </span>
                                        {user.isBlocked && (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 w-fit">
                                                Bloqueado
                                            </span>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end space-x-2">
                                        <button
                                            onClick={() => setResetPasswordId(user.id!)}
                                            className="p-1.5 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
                                            title="Redefinir Senha"
                                        >
                                            <KeyRound className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => toggleBlockUser(user)}
                                            className={`p-1.5 transition ${user.isBlocked ? 'text-red-600 dark:text-red-400' : 'text-gray-400 hover:text-red-600 dark:hover:text-red-400'}`}
                                            title={user.isBlocked ? "Desbloquear" : "Bloquear"}
                                        >
                                            {user.isBlocked ? <Ban className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
                                        </button>
                                        <button
                                            onClick={() => user.id && handleDeleteUser(user.id)}
                                            className="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition"
                                            title="Excluir"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Reset Password Modal */}
            {resetPasswordId && (
                <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-sm p-6">
                        <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">Redefinir Senha</h3>
                        <p className="text-sm text-gray-500 mb-4">Digite a nova senha para o usuário.</p>
                        <input
                            type="password"
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg mb-4 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            placeholder="Nova senha"
                            value={newPassword}
                            onChange={e => setNewPassword(e.target.value)}
                        />
                        <div className="flex justify-end space-x-2">
                            <button
                                onClick={() => { setResetPasswordId(null); setNewPassword(''); }}
                                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleResetPassword}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                            >
                                Salvar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
