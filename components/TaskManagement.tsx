import React, { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { Task, User } from '../types';
import { Plus, Trash2, CheckSquare, Square, User as UserIcon, Clock, CheckCircle, AlertCircle } from 'lucide-react';

export function TaskManagement() {
    const tasks = useLiveQuery(() => db.tasks.toArray()) || [];
    const users = useLiveQuery(() => db.users.toArray()) || [];
    const sedes = useLiveQuery(() => db.sedes.toArray()) || [];
    const labs = useLiveQuery(() => db.labs.toArray()) || [];
    const devices = useLiveQuery(() => db.devices.toArray()) || [];

    const [showNewTaskForm, setShowNewTaskForm] = useState(false);
    const [newTaskTitle, setNewTaskTitle] = useState('');

    // Scoping State
    const [scopeType, setScopeType] = useState<'none' | 'sede' | 'lab' | 'device'>('none');
    const [selectedScopeId, setSelectedScopeId] = useState('');

    const handleCreateTask = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTaskTitle.trim()) return;

        let descriptionSuffix = '';
        if (scopeType !== 'none' && selectedScopeId) {
            if (scopeType === 'sede') {
                const sede = sedes.find(s => s.id?.toString() === selectedScopeId);
                descriptionSuffix = `\n\n[Escopo: Sede - ${sede?.name}]`;
            } else if (scopeType === 'lab') {
                const lab = labs.find(l => l.id?.toString() === selectedScopeId);
                descriptionSuffix = `\n\n[Escopo: Laboratório - ${lab?.name}]`;
            } else if (scopeType === 'device') {
                const device = devices.find(d => d.id === selectedScopeId);
                descriptionSuffix = `\n\n[Escopo: Equipamento - ${device?.name} (${device?.id})]`;
            }
        }

        await db.tasks.add({
            title: newTaskTitle,
            description: descriptionSuffix.trim(),
            status: 'pending',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            checklist: []
        });

        setNewTaskTitle('');
        setScopeType('none');
        setSelectedScopeId('');
        setShowNewTaskForm(false);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Gerenciamento de Tarefas</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Crie e gerencie tarefas e checklists para a equipe.</p>
                </div>
                <button
                    onClick={() => setShowNewTaskForm(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm font-medium shadow-sm"
                >
                    <Plus className="w-4 h-4" />
                    <span>Nova Tarefa</span>
                </button>
            </div>

            {showNewTaskForm && (
                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 animate-in fade-in slide-in-from-top-2">
                    <form onSubmit={handleCreateTask} className="space-y-4">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                placeholder="Título da nova tarefa..."
                                className="flex-1 px-4 py-2 bg-gray-50 dark:bg-gray-700 border-none rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900 dark:text-white"
                                value={newTaskTitle}
                                onChange={(e) => setNewTaskTitle(e.target.value)}
                                autoFocus
                            />
                        </div>

                        {/* Scope Selection */}
                        <div className="flex flex-wrap gap-4 items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Vincular a:</span>
                            <div className="flex gap-2">
                                <label className="flex items-center gap-1 cursor-pointer">
                                    <input type="radio" name="scope" checked={scopeType === 'none'} onChange={() => setScopeType('none')} />
                                    <span className="text-sm">Geral</span>
                                </label>
                                <label className="flex items-center gap-1 cursor-pointer">
                                    <input type="radio" name="scope" checked={scopeType === 'sede'} onChange={() => setScopeType('sede')} />
                                    <span className="text-sm">Sede</span>
                                </label>
                                <label className="flex items-center gap-1 cursor-pointer">
                                    <input type="radio" name="scope" checked={scopeType === 'lab'} onChange={() => setScopeType('lab')} />
                                    <span className="text-sm">Laboratório</span>
                                </label>
                                <label className="flex items-center gap-1 cursor-pointer">
                                    <input type="radio" name="scope" checked={scopeType === 'device'} onChange={() => setScopeType('device')} />
                                    <span className="text-sm">Equipamento</span>
                                </label>
                            </div>

                            {scopeType !== 'none' && (
                                <select
                                    className="px-3 py-1.5 rounded-lg border-none text-sm bg-white dark:bg-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                                    value={selectedScopeId}
                                    onChange={(e) => setSelectedScopeId(e.target.value)}
                                    required
                                >
                                    <option value="">Selecione...</option>
                                    {scopeType === 'sede' && sedes.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                    {scopeType === 'lab' && labs.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                                    {scopeType === 'device' && devices.map(d => <option key={d.id} value={d.id}>{d.name} ({d.id})</option>)}
                                </select>
                            )}
                        </div>

                        <div className="flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={() => setShowNewTaskForm(false)}
                                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 font-medium text-sm"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium text-sm"
                            >
                                Criar
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tasks.map(task => (
                    <TaskCard key={task.id} task={task} users={users} />
                ))}
            </div>

            {tasks.length === 0 && !showNewTaskForm && (
                <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
                    <CheckSquare className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-500 dark:text-gray-400">Nenhuma tarefa criada ainda.</p>
                </div>
            )}
        </div>
    );
}

function TaskCard({ task, users }: { task: Task, users: any[] }) {
    // Local state for immediate UI updates, debounced save to DB
    const [localTask, setLocalTask] = useState(task);
    const [newChecklistItem, setNewChecklistItem] = useState('');

    // Update local state when prop changes (e.g. from other updates)
    useEffect(() => {
        setLocalTask(task);
    }, [task]);

    // Autosave effect
    useEffect(() => {
        const timer = setTimeout(() => {
            if (JSON.stringify(task) !== JSON.stringify(localTask)) {
                db.tasks.update(task.id!, {
                    ...localTask,
                    updatedAt: new Date().toISOString()
                });
            }
        }, 1000); // 1 second debounce

        return () => clearTimeout(timer);
    }, [localTask, task]);

    const updateField = (field: keyof Task, value: any) => {
        setLocalTask(prev => ({ ...prev, [field]: value }));
    };

    const addChecklistItem = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newChecklistItem.trim()) return;

        const newItem = {
            id: Math.random().toString(36).substr(2, 9),
            text: newChecklistItem,
            completed: false
        };

        const updatedChecklist = [...(localTask.checklist || []), newItem];
        updateField('checklist', updatedChecklist);
        setNewChecklistItem('');
    };

    const toggleChecklistItem = (itemId: string) => {
        const updatedChecklist = (localTask.checklist || []).map(item =>
            item.id === itemId ? { ...item, completed: !item.completed } : item
        );
        updateField('checklist', updatedChecklist);
    };

    const deleteChecklistItem = (itemId: string) => {
        const updatedChecklist = (localTask.checklist || []).filter(item => item.id !== itemId);
        updateField('checklist', updatedChecklist);
    };

    const handleDeleteTask = () => {
        if (confirm('Tem certeza que deseja excluir esta tarefa?')) {
            db.tasks.delete(task.id!);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'done': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
            case 'in_progress': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col h-full transition-all hover:shadow-md">
            <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-start gap-3">
                <div className="flex-1">
                    <input
                        type="text"
                        value={localTask.title}
                        onChange={(e) => updateField('title', e.target.value)}
                        className="w-full font-bold text-gray-900 dark:text-white bg-transparent border-none focus:ring-0 p-0 placeholder-gray-400"
                        placeholder="Título da tarefa"
                    />
                </div>
                <button
                    onClick={handleDeleteTask}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>

            <div className="p-4 flex-1 space-y-4">
                {/* Description */}
                <div>
                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1 block">Descrição</label>
                    <textarea
                        value={localTask.description}
                        onChange={(e) => updateField('description', e.target.value)}
                        className="w-full text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-900/50 rounded-lg p-2 border-none focus:ring-1 focus:ring-indigo-500 resize-none h-20"
                        placeholder="O que precisa ser feito..."
                    />
                </div>

                {/* Status & Assignee */}
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1 block">Status</label>
                        <select
                            value={localTask.status}
                            onChange={(e) => updateField('status', e.target.value)}
                            className={`w-full text-xs font-medium rounded-lg p-2 border-none focus:ring-1 focus:ring-indigo-500 cursor-pointer ${getStatusColor(localTask.status)}`}
                        >
                            <option value="pending">Pendente</option>
                            <option value="in_progress">Em Progresso</option>
                            <option value="done">Concluído</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1 block">Responsável</label>
                        <div className="relative">
                            <select
                                value={localTask.assignedTo || ''}
                                onChange={(e) => {
                                    const userId = e.target.value;
                                    const user = users.find(u => u.id?.toString() === userId);
                                    setLocalTask(prev => ({
                                        ...prev,
                                        assignedTo: userId,
                                        assignedName: user?.name
                                    }));
                                }}
                                className="w-full text-xs text-gray-700 dark:text-gray-200 bg-gray-50 dark:bg-gray-700 rounded-lg p-2 border-none focus:ring-1 focus:ring-indigo-500 cursor-pointer appearance-none"
                            >
                                <option value="">Ninguém</option>
                                {users.map(user => (
                                    <option key={user.id} value={user.id}>{user.name}</option>
                                ))}
                            </select>
                            <UserIcon className="absolute right-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
                        </div>
                    </div>
                </div>

                {/* Checklist */}
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Checklist</label>
                        <span className="text-xs text-gray-400">
                            {(localTask.checklist || []).filter(i => i.completed).length}/{(localTask.checklist || []).length}
                        </span>
                    </div>

                    <div className="space-y-2 mb-3">
                        {(localTask.checklist || []).map(item => (
                            <div key={item.id} className="flex items-center gap-2 group">
                                <button
                                    onClick={() => toggleChecklistItem(item.id)}
                                    className={`flex-shrink-0 ${item.completed ? 'text-green-500' : 'text-gray-300 hover:text-gray-400'}`}
                                >
                                    {item.completed ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                                </button>
                                <span className={`flex-1 text-sm ${item.completed ? 'text-gray-400 line-through' : 'text-gray-700 dark:text-gray-200'}`}>
                                    {item.text}
                                </span>
                                <button
                                    onClick={() => deleteChecklistItem(item.id)}
                                    className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <Trash2 className="w-3 h-3" />
                                </button>
                            </div>
                        ))}
                    </div>

                    <form onSubmit={addChecklistItem} className="flex gap-2">
                        <input
                            type="text"
                            value={newChecklistItem}
                            onChange={(e) => setNewChecklistItem(e.target.value)}
                            placeholder="Adicionar item..."
                            className="flex-1 text-sm bg-transparent border-b border-gray-200 dark:border-gray-700 focus:border-indigo-500 outline-none py-1 text-gray-700 dark:text-gray-200 placeholder-gray-400"
                        />
                        <button
                            type="submit"
                            disabled={!newChecklistItem.trim()}
                            className="text-indigo-600 dark:text-indigo-400 disabled:opacity-50 text-xs font-medium"
                        >
                            Adicionar
                        </button>
                    </form>
                </div>
            </div>

            <div className="p-3 bg-gray-50 dark:bg-gray-900/30 border-t border-gray-100 dark:border-gray-700 text-xs text-gray-400 flex justify-between items-center rounded-b-xl">
                <span>Criado em {new Date(localTask.createdAt).toLocaleDateString()}</span>
                {localTask.assignedName && (
                    <span className="flex items-center gap-1">
                        <UserIcon className="w-3 h-3" />
                        {localTask.assignedName}
                    </span>
                )}
            </div>
        </div>
    );
}
