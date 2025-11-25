import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Plus, Trash2, Edit2, Shield, Users, User, Save, X, UserPlus, CheckSquare, Square } from 'lucide-react';
import { Group, User as UserType } from '../types';

const AVAILABLE_PERMISSIONS = [
    { id: 'manage_users', label: 'Gerenciar Usuários' },
    { id: 'manage_groups', label: 'Gerenciar Grupos' },
    { id: 'manage_structure', label: 'Gerenciar Estrutura' },
    { id: 'manage_inventory', label: 'Gerenciar Inventário' },
    { id: 'manage_tasks', label: 'Gerenciar Tarefas' },
    { id: 'view_reports', label: 'Visualizar Relatórios' },
    { id: 'view_only', label: 'Leitor (Apenas Visualizar e Observações)' },
    { id: 'create_tasks', label: 'Criar Tarefas' },
];

interface GroupDetailsModalProps {
    group: Group;
    onClose: () => void;
}

function GroupDetailsModal({ group, onClose }: GroupDetailsModalProps) {
    const [activeTab, setActiveTab] = useState<'members' | 'permissions'>('members');
    const [users, setUsers] = useState<UserType[]>([]);

    const fetchUsers = async () => {
        try {
            const usersData = await api.getUsers();
            setUsers(usersData);
        } catch (error) {
            console.error("Failed to fetch users", error);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const groupUsers = users.filter(u => u.groupId === group.id);

    // Permissions State
    const [permissions, setPermissions] = useState<string[]>(group.permissions || []);

    // Member Add State
    const [isAddingMember, setIsAddingMember] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState<number | ''>('');

    const handleSavePermissions = async () => {
        if (group.id) {
            await api.updateGroup(group.id, { permissions });
            alert('Permissões salvas com sucesso!');
        }
    };

    const togglePermission = (permId: string) => {
        setPermissions(prev =>
            prev.includes(permId)
                ? prev.filter(p => p !== permId)
                : [...prev, permId]
        );
    };

    const handleAddMember = async () => {
        if (!selectedUserId) {
            alert("Por favor, selecione um usuário.");
            return;
        }
        if (!group.id) {
            alert("Erro: ID do grupo não encontrado.");
            return;
        }

        try {
            console.log(`Adding user ${selectedUserId} to group ${group.id}`);
            await api.updateUser(Number(selectedUserId), { groupId: group.id });
            await fetchUsers(); // Wait for fetch to complete
            setIsAddingMember(false);
            setSelectedUserId('');
            alert("Usuário adicionado com sucesso!");
        } catch (error) {
            console.error("Failed to add member:", error);
            alert("Erro ao adicionar membro ao grupo. Verifique o console para mais detalhes.");
        }
    };

    const handleRemoveMember = async (userId: number) => {
        if (confirm('Remover usuário deste grupo?')) {
            try {
                await api.updateUser(userId, { groupId: null as any });
                await fetchUsers();
                alert("Usuário removido do grupo.");
            } catch (error) {
                console.error("Failed to remove member:", error);
                alert("Erro ao remover usuário do grupo.");
            }
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <Shield className="w-5 h-5 text-indigo-500" />
                            {group.name}
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{group.description}</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="flex border-b border-gray-200 dark:border-gray-700 px-6">
                    <button
                        onClick={() => setActiveTab('members')}
                        className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'members' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                    >
                        Membros ({groupUsers.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('permissions')}
                        className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'permissions' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                    >
                        Permissões
                    </button>
                </div>

                <div className="p-6 overflow-y-auto flex-1 bg-gray-50 dark:bg-gray-900/50">
                    {activeTab === 'members' && (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <h3 className="font-medium text-gray-900 dark:text-white">Gerenciar Membros</h3>
                                <button
                                    onClick={() => setIsAddingMember(true)}
                                    className="text-xs bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700 flex items-center gap-1"
                                >
                                    <UserPlus className="w-3 h-3" />
                                    Adicionar
                                </button>
                            </div>

                            {isAddingMember && (
                                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 flex gap-2 items-end animate-in fade-in slide-in-from-top-2">
                                    <div className="flex-1">
                                        <label className="block text-xs font-medium text-gray-500 mb-1">Selecione o Usuário</label>
                                        <select
                                            value={selectedUserId}
                                            onChange={(e) => setSelectedUserId(Number(e.target.value))}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                                        >
                                            <option value="">Selecione...</option>
                                            {users.filter(u => u.groupId !== group.id).map(u => (
                                                <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                                            ))}
                                        </select>
                                    </div>
                                    <button onClick={handleAddMember} className="px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700">Confirmar</button>
                                    <button onClick={() => setIsAddingMember(false)} className="px-3 py-2 bg-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-300">Cancelar</button>
                                </div>
                            )}

                            <div className="space-y-2">
                                {groupUsers.length === 0 ? (
                                    <p className="text-sm text-gray-500 italic text-center py-4">Nenhum membro neste grupo.</p>
                                ) : (
                                    groupUsers.map(user => (
                                        <div key={user.id} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                                                    {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover" /> : <User className="w-4 h-4 text-gray-500" />}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</p>
                                                    <p className="text-xs text-gray-500">{user.email}</p>
                                                </div>
                                            </div>
                                            <button onClick={() => user.id && handleRemoveMember(user.id)} className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20">
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'permissions' && (
                        <div className="space-y-6">
                            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-100 dark:border-yellow-900/50">
                                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                                    Selecione as permissões que os membros deste grupo terão no sistema.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {AVAILABLE_PERMISSIONS.map(perm => (
                                    <div
                                        key={perm.id}
                                        onClick={() => togglePermission(perm.id)}
                                        className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${permissions.includes(perm.id)
                                            ? 'bg-indigo-50 border-indigo-200 dark:bg-indigo-900/20 dark:border-indigo-800'
                                            : 'bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700 hover:border-indigo-300'
                                            }`}
                                    >
                                        <div className={`w-5 h-5 rounded border flex items-center justify-center ${permissions.includes(perm.id)
                                            ? 'bg-indigo-600 border-indigo-600 text-white'
                                            : 'border-gray-400 bg-white dark:bg-gray-700'
                                            }`}>
                                            {permissions.includes(perm.id) && <CheckSquare className="w-3.5 h-3.5" />}
                                        </div>
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{perm.label}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
                                <button
                                    onClick={handleSavePermissions}
                                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium text-sm"
                                >
                                    <Save className="w-4 h-4" />
                                    Salvar Permissões
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export function GroupManagement() {
    const [groups, setGroups] = useState<Group[]>([]);
    const [users, setUsers] = useState<UserType[]>([]);

    const fetchData = async () => {
        try {
            const [groupsData, usersData] = await Promise.all([
                api.getGroups(),
                api.getUsers()
            ]);
            setGroups(groupsData);
            setUsers(usersData);
        } catch (error) {
            console.error("Failed to fetch data", error);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Form State
    const [newGroupName, setNewGroupName] = useState('');
    const [newGroupDesc, setNewGroupDesc] = useState('');

    // Editing State
    const [editingGroup, setEditingGroup] = useState<Group | null>(null);

    // Modal State
    const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);

    const handleAddGroup = async () => {
        if (!newGroupName) return;
        await api.createGroup({ name: newGroupName, description: newGroupDesc, permissions: [] });
        setNewGroupName('');
        setNewGroupDesc('');
        fetchData();
    };

    const handleUpdateGroup = async () => {
        if (!editingGroup || !editingGroup.id) return;
        await api.updateGroup(editingGroup.id, {
            name: editingGroup.name,
            description: editingGroup.description
        });
        setEditingGroup(null);
        fetchData();
    };

    const handleDeleteGroup = async (id: number) => {
        if (confirm('Tem certeza? Usuários neste grupo perderão a associação.')) {
            // We need to update users first.
            // But we can't do a bulk update via API easily unless we add an endpoint.
            // Or we iterate.
            // Or we let the database handle it (foreign key set null? SQLite supports it if configured).
            // But we didn't configure foreign keys in migrate.js explicitly with onDelete('SET NULL').
            // So we should do it manually.
            // Find users in group
            const usersInGroup = users.filter(u => u.groupId === id);
            await Promise.all(usersInGroup.map(u => api.updateUser(u.id, { groupId: null as any })));

            await api.deleteGroup(id);
            fetchData();
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Gerenciamento de Grupos</h2>
            </div>

            <div className="space-y-4">
                {/* Add Form */}
                <div className="flex gap-4 items-end bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome do Grupo</label>
                        <input
                            type="text"
                            value={newGroupName}
                            onChange={(e) => setNewGroupName(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            placeholder="Ex: Técnicos"
                        />
                    </div>
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Descrição</label>
                        <input
                            type="text"
                            value={newGroupDesc}
                            onChange={(e) => setNewGroupDesc(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            placeholder="Descrição das permissões..."
                        />
                    </div>
                    <button
                        onClick={handleAddGroup}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        Adicionar
                    </button>
                </div>

                {/* List */}
                <div className="space-y-2">
                    {groups.map(group => {
                        const groupUsers = users.filter(u => u.groupId === group.id);

                        return (
                            <div key={group.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden p-3 transition-all hover:shadow-md">
                                {editingGroup?.id === group.id ? (
                                    <div className="flex gap-4 items-end">
                                        <div className="flex-1">
                                            <input
                                                type="text"
                                                value={editingGroup.name}
                                                onChange={(e) => setEditingGroup({ ...editingGroup, name: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <input
                                                type="text"
                                                value={editingGroup.description || ''}
                                                onChange={(e) => setEditingGroup({ ...editingGroup, description: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                            />
                                        </div>
                                        <button onClick={handleUpdateGroup} className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200">
                                            <Save className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => setEditingGroup(null)} className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200">
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-between">
                                        <div
                                            className="flex items-center gap-3 cursor-pointer flex-1"
                                            onClick={() => setSelectedGroup(group)}
                                        >
                                            <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg">
                                                <Shield className="w-5 h-5 text-indigo-500" />
                                            </div>
                                            <div>
                                                <span className="font-medium text-gray-900 dark:text-white block">{group.name}</span>
                                                <span className="text-xs text-gray-500">{group.description} • {groupUsers.length} membros</span>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={() => setEditingGroup(group)} className="text-indigo-500 hover:text-indigo-700 p-2 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors">
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => group.id && handleDeleteGroup(group.id)} className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {selectedGroup && (
                <GroupDetailsModal
                    group={selectedGroup}
                    onClose={() => setSelectedGroup(null)}
                />
            )}
        </div>
    );
}
