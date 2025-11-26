import React, { useState, useEffect } from 'react';
import {
    Search,
    Plus,
    ScanLine,
} from 'lucide-react';
import { Device, DeviceStatus, Lab, Sede } from '../../types';
import { api } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { analyzeMaintenanceIssue } from '../../services/geminiService';

// Components
import { InventoryTable } from './InventoryTable';
import { InventoryMobileCards } from './InventoryMobileCards';

// Modals
import { AddDeviceModal } from './modals/AddDeviceModal';
import { ChecklistModal } from './modals/ChecklistModal';
import { QRCodeModal } from './modals/QRCodeModal';
import { DetailsModal } from './modals/DetailsModal';
import { ScannerModal } from './modals/ScannerModal';
import { AIModal } from './modals/AIModal';

export function InventoryView() {
    const { user } = useAuth();
    const [devices, setDevices] = useState<Device[]>([]);
    const [sedes, setSedes] = useState<Sede[]>([]);
    const [labs, setLabs] = useState<Lab[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [labFilter, setLabFilter] = useState<string>('All');
    const [statusFilter, setStatusFilter] = useState<string>('All');

    // Modals State
    const [showAddModal, setShowAddModal] = useState(false);
    const [showChecklistModal, setShowChecklistModal] = useState(false);
    const [showQRModal, setShowQRModal] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showScanner, setShowScanner] = useState(false);

    // AI Modal State
    const [aiModalOpen, setAiModalOpen] = useState(false);
    const [aiAnalysisContent, setAiAnalysisContent] = useState('');
    const [isAiLoading, setIsAiLoading] = useState(false);
    const [selectedDeviceName, setSelectedDeviceName] = useState('');

    const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);

    const loadAll = async () => {
        try {
            const [sedesData, labsData, devicesData] = await Promise.all([
                api.getSedes(),
                api.getLabs(),
                api.getDevices()
            ]);
            setSedes(sedesData);
            setLabs(labsData);
            setDevices(devicesData);
        } catch (error) {
            console.error("Failed to fetch data", error);
        }
    };

    useEffect(() => {
        loadAll();
    }, []);

    const handleAIAnalysis = async (device: Device) => {
        if (device.logs.length === 0) {
            alert("Este equipamento não possui logs de erro para analisar.");
            return;
        }

        setSelectedDeviceName(`${device.name} (${device.id})`);
        setAiAnalysisContent('');
        setAiModalOpen(true);
        setIsAiLoading(true);

        const latestIssue = device.logs[0].description;
        const result = await analyzeMaintenanceIssue(latestIssue, device.name);

        setAiAnalysisContent(result);
        setIsAiLoading(false);
    };

    const filteredDevices = devices.filter(device => {
        const matchesSearch = device.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            device.id.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesLab = labFilter === 'All' || device.lab === labFilter;
        const matchesStatus = statusFilter === 'All' || device.status === statusFilter;
        return matchesSearch && matchesLab && matchesStatus;
    });

    return (
        <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Inventário</h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Gerenciamento de equipamentos</p>
                </div>

                <div className="flex flex-col md:flex-row gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Buscar equipamento..."
                            className="w-full md:w-64 pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setShowScanner(true)}
                            className="flex items-center justify-center px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                            <ScanLine className="w-5 h-5 md:mr-2" />
                            <span className="hidden md:inline">Escanear</span>
                        </button>
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                        >
                            <Plus className="w-5 h-5 md:mr-2" />
                            <span className="hidden md:inline">Adicionar</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block">
                <InventoryTable
                    devices={filteredDevices}
                    setSelectedDevice={setSelectedDevice}
                    openChecklist={() => setShowChecklistModal(true)}
                    openQR={() => setShowQRModal(true)}
                    openDetails={() => setShowDetailsModal(true)}
                    onAI={handleAIAnalysis}
                    refresh={fetchData}
                />
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden">
                <InventoryMobileCards
                    devices={filteredDevices}
                    onChecklist={(d) => {
                        setSelectedDevice(d);
                        setShowChecklistModal(true);
                    }}
                    onQR={(d) => {
                        setSelectedDevice(d);
                        setShowQRModal(true);
                    }}
                    onDetails={(d) => {
                        setSelectedDevice(d);
                        setShowDetailsModal(true);
                    }}
                    onAI={handleAIAnalysis}
                />
            </div>

            {/* Modals */}
            <AddDeviceModal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                labs={labs}
                refresh={fetchData}
            />

            <ChecklistModal
                isOpen={showChecklistModal}
                onClose={() => setShowChecklistModal(false)}
                device={selectedDevice}
                refresh={fetchData}
            />

            <QRCodeModal
                isOpen={showQRModal}
                onClose={() => setShowQRModal(false)}
                device={selectedDevice}
            />

            <DetailsModal
                isOpen={showDetailsModal}
                onClose={() => setShowDetailsModal(false)}
                device={selectedDevice}
            />

            <ScannerModal
                isOpen={showScanner}
                onClose={() => setShowScanner(false)}
                setSearch={(v) => {
                    setSearchTerm(v);
                    // If exact match found, maybe open details?
                    const found = devices.find(d => d.id === v);
                    if (found) {
                        setSelectedDevice(found);
                        setShowDetailsModal(true);
                    }
                }}
            />

            <AIModal
                isOpen={aiModalOpen}
                onClose={() => setAiModalOpen(false)}
                title={`Diagnóstico Técnico: ${selectedDeviceName}`}
                content={aiAnalysisContent}
                isLoading={isAiLoading}
            />
        </div>
    );
}
