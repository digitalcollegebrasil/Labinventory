import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Plus, Trash2, Edit2, ChevronRight, Building, MapPin, Monitor, Save, X, Laptop, AlertTriangle } from 'lucide-react';
import { Lab, DeviceStatus, Sede, Device } from '../types';

export function StructureManagement() {
    const [sedes, setSedes] = useState<Sede[]>([]);
    const [labs, setLabs] = useState<Lab[]>([]);
    const [devices, setDevices] = useState<Device[]>([]);

    const fetchData = async () => {
        try {
            const sedesData = await api.getSedes();
            setSedes(sedesData);
        } catch (error) {
            console.error("Failed to fetch sedes", error);
        }

        try {
            const labsData = await api.getLabs();
            setLabs(labsData);
        } catch (error) {
            console.error("Failed to fetch labs", error);
        }

        try {
            const devicesData = await api.getDevices();
            setDevices(devicesData);
        } catch (error) {
            console.error("Failed to fetch devices", error);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const [activeTab, setActiveTab] = useState<'sedes' | 'labs'>('sedes');

    // Form State
    const [newName, setNewName] = useState('');
    const [selectedSedeId, setSelectedSedeId] = useState<number | ''>('');

    // Editing State
    const [editingLab, setEditingLab] = useState<Lab | null>(null);
    const [editingSede, setEditingSede] = useState<Sede | null>(null);

    // Device Management State
    const [expandedLabId, setExpandedLabId] = useState<number | null>(null);
    const [isAddingDevice, setIsAddingDevice] = useState(false);
    const [newDevice, setNewDevice] = useState({
        id: '',
        brand: '',
        model: '',
        processor: '',
        ram: '',
        storage: '',
        status: DeviceStatus.OPERATIONAL
    });

    const handleAdd = async () => {
        if (!newName) return;

        if (activeTab === 'sedes') {
            await api.createSede({ name: newName });
            setNewName('');
            fetchData();
        } else if (activeTab === 'labs') {
            if (!selectedSedeId) {
                alert('Selecione uma sede para o laboratório.');
                return;
            }
            // Uniqueness Check
            // We can check locally or rely on server error
            const exists = labs.find(l => l.name === newName && l.sedeId === Number(selectedSedeId));

            if (exists) {
                alert('Já existe um laboratório com este nome nesta sede.');
                return;
            }

            await api.createLab({ name: newName, sedeId: Number(selectedSedeId) });
            setNewName('');
            fetchData();
        }
    };

    const handleUpdateLab = async () => {
        if (!editingLab || !editingLab.id) return;
        try {
            const payload = {
                name: editingLab.name,
                sedeId: Number(editingLab.sedeId)
            };
            console.log("Updating lab with payload:", payload);

            await api.updateLab(editingLab.id, payload);
            fetchData();
            setEditingLab(null);
        } catch (error: any) {
            console.error("Failed to update lab", error);
            alert(`Erro ao atualizar laboratório: ${error.message || JSON.stringify(error)}`);
        }
    };

    const handleUpdateSede = async () => {
        if (!editingSede || !editingSede.id) return;
        await api.updateSede(editingSede.id, { name: editingSede.name });
        fetchData();
        setEditingSede(null);
    };

    const handleDelete = async (id: number, type: 'sedes' | 'labs') => {
        if (confirm('Tem certeza? Isso pode afetar itens dependentes.')) {
            if (type === 'sedes') await api.deleteSede(id);
            if (type === 'labs') await api.deleteLab(id);
            fetchData();
        }
    };

    const handleAddDevice = async (lab: Lab) => {
        if (!newDevice.id || !newDevice.brand || !newDevice.model) {
            alert("Preencha os campos obrigatórios.");
            return;
        }

        try {
            // Check if updating or adding
            const existing = devices.find(d => d.id === newDevice.id);

            if (existing) {
                // Update
                // Note: If updating lab, we should pass labId if the backend supports it.
                // For now, keeping existing behavior but passing labId if possible or just ignoring if updateDevice doesn't handle it yet.
                await api.updateDevice(newDevice.id, {
                    name: `${newDevice.brand} ${newDevice.model}`,
                    brand: newDevice.brand,
                    model: newDevice.model,
                    processor: newDevice.processor,
                    ram: newDevice.ram,
                    storage: newDevice.storage,
                    // lab: lab.name, // potentially deprecated in favor of labId
                    status: newDevice.status,
                    specs: `${newDevice.processor}, ${newDevice.ram}, ${newDevice.storage}`,
                });
            } else {
                // Add
                await api.addComputador({
                    id: newDevice.id,
                    brand: newDevice.brand,
                    model: newDevice.model,
                    processor: newDevice.processor,
                    ram: newDevice.ram,
                    storage: newDevice.storage,
                    status: newDevice.status,
                    labId: lab.id
                });
            }

            fetchData();

            setIsAddingDevice(false);
            setNewDevice({
                id: '',
                brand: '',
                model: '',
                processor: '',
                ram: '',
                storage: '',
                status: DeviceStatus.OPERATIONAL
            });
        } catch (error) {
            console.error(error);
            alert("Erro ao salvar dispositivo.");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Estrutura Organizacional</h2>
            </div>

            <div className="flex border-b border-gray-200 dark:border-gray-700">
                <button
                    onClick={() => setActiveTab('sedes')}
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'sedes' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                >
                    Sedes
                </button>
                <button
                    onClick={() => setActiveTab('labs')}
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'labs' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                >
                    Laboratórios
                </button>
            </div>

            <div className="space-y-4">
                {/* Add Form */}
                <div className="flex gap-4 items-end bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome</label>
                        <input
                            type="text"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            placeholder={`Nome da ${activeTab === 'sedes' ? 'Sede' : 'Laboratório'}`}
                        />
                    </div>

                    {activeTab === 'labs' && (
                        <div className="w-64">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Sede
                            </label>
                            <select
                                value={selectedSedeId}
                                onChange={(e) => setSelectedSedeId(Number(e.target.value))}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            >
                                <option value="">Selecione...</option>
                                {sedes.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                        </div>
                    )}

                    <button
                        onClick={handleAdd}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        Adicionar
                    </button>
                </div>

                {/* List */}
                <div className="space-y-2">
                    {activeTab === 'sedes' && sedes.map(item => {
                        const labCount = labs.filter(l => l.sedeId === item.id).length;
                        return (
                            <div key={item.id} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
                                {editingSede?.id === item.id ? (
                                    <div className="flex gap-2 flex-1">
                                        <input
                                            type="text"
                                            value={editingSede.name}
                                            onChange={(e) => setEditingSede({ ...editingSede, name: e.target.value })}
                                            className="flex-1 px-3 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                        />
                                        <button onClick={handleUpdateSede} className="p-1 text-green-600 hover:bg-green-50 rounded"><Save className="w-4 h-4" /></button>
                                        <button onClick={() => setEditingSede(null)} className="p-1 text-gray-600 hover:bg-gray-50 rounded"><X className="w-4 h-4" /></button>
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex items-center gap-3">
                                            <Building className="w-5 h-5 text-gray-400" />
                                            <div>
                                                <span className="font-medium text-gray-900 dark:text-white block">{item.name}</span>
                                                <span className="text-xs text-gray-500">{labCount} laboratórios</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => {
                                                    setSelectedSedeId(item.id!);
                                                    setActiveTab('labs');
                                                }}
                                                className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded text-xs font-medium flex items-center gap-1"
                                                title="Adicionar Laboratório nesta Sede"
                                            >
                                                <Plus className="w-3 h-3" /> Lab
                                            </button>
                                            <button onClick={() => setEditingSede(item)} className="text-indigo-500 hover:text-indigo-700 p-1">
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => item.id && handleDelete(item.id, 'sedes')} className="text-red-500 hover:text-red-700 p-1">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        );
                    })}

                    {activeTab === 'labs' && labs
                        .filter(l => !selectedSedeId || l.sedeId === Number(selectedSedeId))
                        .map(item => {
                            const labDevices = devices.filter(d => d.lab === item.name);
                            const isExpanded = expandedLabId === item.id;

                            return (
                                <div key={item.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                                    <div className="p-3">
                                        {editingLab?.id === item.id ? (
                                            <div className="flex gap-4 items-end">
                                                <div className="flex-1">
                                                    <input
                                                        type="text"
                                                        value={editingLab.name}
                                                        onChange={(e) => setEditingLab({ ...editingLab, name: e.target.value })}
                                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                                    />
                                                </div>
                                                <div className="w-64">
                                                    <select
                                                        value={editingLab.sedeId || ''}
                                                        onChange={(e) => setEditingLab({ ...editingLab, sedeId: Number(e.target.value) })}
                                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                                    >
                                                        <option value="">Selecione...</option>
                                                        {sedes.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                                    </select>
                                                </div>
                                                <button onClick={handleUpdateLab} className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200">
                                                    <Save className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => setEditingLab(null)} className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200">
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-between">
                                                <div
                                                    className="flex items-center gap-3 cursor-pointer flex-1"
                                                    onClick={() => setExpandedLabId(isExpanded ? null : item.id!)}
                                                >
                                                    <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                                                    <Monitor className="w-5 h-5 text-gray-400" />
                                                    <div>
                                                        <span className="font-medium text-gray-900 dark:text-white block">{item.name}</span>
                                                        <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-300 mt-1">
                                                            <Building className="w-3 h-3" />
                                                            {item.sedeId !== undefined && item.sedeId !== null ? (
                                                                <span className="font-medium">
                                                                    {sedes.find(s => Number(s.id) === Number(item.sedeId))?.name || `Sede não encontrada (ID: ${item.sedeId})`}
                                                                </span>
                                                            ) : (
                                                                <span className="text-yellow-600 dark:text-yellow-400 flex items-center gap-1">
                                                                    <AlertTriangle className="w-3 h-3" /> Sede não definida
                                                                </span>
                                                            )}
                                                            <span className="text-gray-400 mx-1">•</span>
                                                            <span>{labDevices.length} dispositivos</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button onClick={() => setEditingLab(item)} className="text-indigo-500 hover:text-indigo-700">
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                    <button onClick={() => item.id && handleDelete(item.id, 'labs')} className="text-red-500 hover:text-red-700">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {isExpanded && (
                                        <div className="border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 p-4">
                                            <div className="flex justify-between items-center mb-4">
                                                <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300">Dispositivos no Laboratório</h4>
                                                <button
                                                    onClick={() => setIsAddingDevice(true)}
                                                    className="text-xs bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700 flex items-center gap-1"
                                                >
                                                    <Plus className="w-3 h-3" />
                                                    Adicionar Computador
                                                </button>
                                            </div>

                                            {isAddingDevice && (
                                                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-4">
                                                    <h5 className="text-sm font-bold mb-3 text-gray-900 dark:text-white">Novo Dispositivo</h5>
                                                    <div className="grid grid-cols-2 gap-3 mb-3">
                                                        <input
                                                            placeholder="Patrimônio (ID)"
                                                            className="px-3 py-2 border rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                                            value={newDevice.id}
                                                            onChange={e => setNewDevice({ ...newDevice, id: e.target.value })}
                                                        />
                                                        <input
                                                            placeholder="Marca"
                                                            className="px-3 py-2 border rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                                            value={newDevice.brand}
                                                            onChange={e => setNewDevice({ ...newDevice, brand: e.target.value })}
                                                        />
                                                        <input
                                                            placeholder="Modelo"
                                                            className="px-3 py-2 border rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                                            value={newDevice.model}
                                                            onChange={e => setNewDevice({ ...newDevice, model: e.target.value })}
                                                        />
                                                        <input
                                                            placeholder="Processador"
                                                            className="px-3 py-2 border rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                                            value={newDevice.processor}
                                                            onChange={e => setNewDevice({ ...newDevice, processor: e.target.value })}
                                                        />
                                                        <input
                                                            placeholder="RAM"
                                                            className="px-3 py-2 border rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                                            value={newDevice.ram}
                                                            onChange={e => setNewDevice({ ...newDevice, ram: e.target.value })}
                                                        />
                                                        <input
                                                            placeholder="Armazenamento"
                                                            className="px-3 py-2 border rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                                            value={newDevice.storage}
                                                            onChange={e => setNewDevice({ ...newDevice, storage: e.target.value })}
                                                        />
                                                    </div>
                                                    <div className="flex justify-end gap-2">
                                                        <button
                                                            onClick={() => setIsAddingDevice(false)}
                                                            className="px-3 py-1.5 text-gray-600 text-sm hover:bg-gray-100 rounded-lg"
                                                        >
                                                            Cancelar
                                                        </button>
                                                        <button
                                                            onClick={() => handleAddDevice(item)}
                                                            className="px-3 py-1.5 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700"
                                                        >
                                                            Salvar
                                                        </button>
                                                    </div>
                                                </div>
                                            )}

                                            <div className="space-y-2">
                                                {labDevices.length === 0 ? (
                                                    <p className="text-sm text-gray-500 italic">Nenhum dispositivo neste laboratório.</p>
                                                ) : (
                                                    labDevices.map(device => (
                                                        <div key={device.id} className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                                                            <div className="flex items-center gap-3">
                                                                <Laptop className="w-4 h-4 text-gray-400" />
                                                                <div>
                                                                    <p className="text-sm font-medium text-gray-900 dark:text-white">{device.name}</p>
                                                                    <p className="text-xs text-gray-500">ID: {device.id} • {device.status}</p>
                                                                </div>
                                                            </div>
                                                            <div className="flex gap-2">
                                                                <button
                                                                    onClick={() => {
                                                                        setNewDevice({
                                                                            id: device.id,
                                                                            brand: device.brand,
                                                                            model: device.model,
                                                                            processor: device.processor,
                                                                            ram: device.ram,
                                                                            storage: device.storage,
                                                                            status: device.status
                                                                        });
                                                                        setIsAddingDevice(true);
                                                                        // We need a way to know we are editing, maybe add a state or just use the ID existence check in handleAdd (but handleAdd checks for duplicates).
                                                                        // Ideally we should have a separate handleUpdate or modify handleAdd.
                                                                        // For simplicity in this iteration, I'll delete and re-add if ID matches, OR better, update handleAdd to support updates.
                                                                        // Actually, let's just use the form to populate and let the user "Save" which currently adds.
                                                                        // I will modify handleAddDevice to check if it exists and update if so, or add a specific update mode.
                                                                        // Let's add a state `isEditingDevice` to track this.
                                                                    }}
                                                                    className="text-indigo-500 hover:text-indigo-700"
                                                                >
                                                                    <Edit2 className="w-3 h-3" />
                                                                </button>
                                                                <button
                                                                    onClick={async () => {
                                                                        if (confirm('Tem certeza que deseja excluir este dispositivo?')) {
                                                                            await api.deleteDevice(device.id);
                                                                            fetchData();
                                                                        }
                                                                    }}
                                                                    className="text-red-500 hover:text-red-700"
                                                                >
                                                                    <Trash2 className="w-3 h-3" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                </div>
            </div>
        </div>
    );
}

