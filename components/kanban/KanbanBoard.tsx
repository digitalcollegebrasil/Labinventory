import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { api } from "../../services/api";
import { Task } from "./types";
import { TaskModal } from "./TaskModal";

import {
    Plus,
} from "lucide-react";

export function KanbanBoard() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [sedes, setSedes] = useState<any[]>([]);
    const [labs, setLabs] = useState<any[]>([]);

    // Filtros
    const [filterUser, setFilterUser] = useState("");
    const [filterSede, setFilterSede] = useState("");
    const [filterLab, setFilterLab] = useState("");
    const [filterPriority, setFilterPriority] = useState("");
    const [filterDate, setFilterDate] = useState("");

    const [modalTask, setModalTask] = useState<Task | null>(null);

    const fetchAll = async () => {
        try {
            const [t, u, s, l] = await Promise.all([
                api.getTasks(),
                api.getUsers(),
                api.getSedes(),
                api.getLabs(),
            ]);
            setTasks(t);
            setUsers(u);
            setSedes(s);
            setLabs(l);
        } catch (error) {
            console.error("Error fetching Kanban data:", error);
            toast.error("Erro ao carregar dados do Kanban.");
        }
    };

    useEffect(() => {
        fetchAll();
    }, []);

    const createTask = async () => {
        const title = prompt("Título da tarefa:");
        if (!title) return;

        try {
            const newTask = await api.createTask({ title, status: "pendente" });
            toast.success("Tarefa criada!");
            setTasks((prev) => [...prev, newTask as Task]);
            fetchAll(); // Refresh to get full object if needed
        } catch (error) {
            toast.error("Erro ao criar tarefa.");
        }
    };

    const column = (status: string, label: string, colorClass: string) => (
        <div className="w-full md:w-1/4 bg-gray-100 dark:bg-gray-800/50 p-4 rounded-xl flex flex-col h-full min-h-[500px]">
            <div className={`flex justify-between mb-4 pb-2 border-b-2 ${colorClass}`}>
                <h2 className="font-bold text-lg text-gray-700 dark:text-gray-200">{label}</h2>
                <span className="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs px-2 py-1 rounded-full">
                    {filteredTasks.filter((t) => t.status === status).length}
                </span>
            </div>

            <div className="space-y-3 flex-1 overflow-y-auto custom-scrollbar pr-1">
                {filteredTasks
                    .filter((t) => t.status === status)
                    .map((t) => (
                        <div
                            key={t.id}
                            className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-sm cursor-pointer hover:shadow-md transition-all border border-gray-200 dark:border-gray-600 group"
                            onClick={() => openTask(t)}
                        >
                            <h3 className="font-bold text-gray-800 dark:text-white mb-2">{t.title}</h3>

                            <div className="flex flex-wrap gap-2 text-xs">
                                {t.priority === "alta" && <span className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded border border-yellow-200">⚠ Alta</span>}
                                {t.priority === "critica" && <span className="bg-red-100 text-red-800 px-2 py-0.5 rounded border border-red-200">⛔ Crítica</span>}
                                {t.assigned_to && (
                                    <span className="bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded border border-indigo-200 flex items-center gap-1">
                                        👤 {users.find(u => u.id === t.assigned_to)?.name || 'Usuário'}
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
            </div>
        </div>
    );

    return (
        <div className="space-y-6 h-full flex flex-col">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Quadro Kanban</h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Gerencie tarefas e projetos visualmente</p>
                </div>
                <button onClick={createTask} className="btn-primary flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm">
                    <Plus className="w-5 h-5" />
                    Nova Tarefa
                </button>
            </div>

            {/* === FILTROS === */}
            <div className="flex flex-wrap gap-3 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                <select className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" onChange={(e) => setFilterUser(e.target.value)}>
                    <option value="">Responsável</option>
                    {users.map((u) => (
                        <option value={u.id} key={u.id}>
                            {u.name}
                        </option>
                    ))}
                </select>

                <select className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" onChange={(e) => setFilterSede(e.target.value)}>
                    <option value="">Sede</option>
                    {sedes.map((s) => (
                        <option value={s.id} key={s.id}>
                            {s.name}
                        </option>
                    ))}
                </select>

                <select className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" onChange={(e) => setFilterLab(e.target.value)}>
                    <option value="">Laboratório</option>
                    {labs.map((l) => (
                        <option value={l.id} key={l.id}>
                            {l.name}
                        </option>
                    ))}
                </select>

                <select className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" onChange={(e) => setFilterPriority(e.target.value)}>
                    <option value="">Prioridade</option>
                    <option value="normal">Normal</option>
                    <option value="alta">Alta</option>
                    <option value="critica">Crítica</option>
                </select>

                <input
                    type="date"
                    className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    onChange={(e) => setFilterDate(e.target.value)}
                />
            </div>

            {/* === COLUNAS === */}
            <div className="flex flex-col md:flex-row gap-4 flex-1 overflow-x-auto pb-4">
                {column("pendente", "Pendente", "border-gray-400")}
                {column("progresso", "Em Progresso", "border-blue-500")}
                {column("cancelado", "Cancelado", "border-red-500")}
                {column("concluido", "Concluído", "border-green-500")}
            </div>

            <TaskModal task={modalTask} close={() => setModalTask(null)} refresh={fetchAll} />
        </div>
    );
}
