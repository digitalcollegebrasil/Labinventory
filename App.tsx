import React, { useState, useMemo } from 'react';
import {
  LayoutDashboard,
  Monitor,
  Settings,
  QrCode,
  AlertTriangle,
  CheckCircle,
  Search,
  Filter,
  BarChart3,
  FileText,
  BrainCircuit,
  Wrench,
  LogOut,
  Plus,
  Download,
  RefreshCw,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Moon,
  Sun,
  Users,
  Trash2,
  Clock,
  AlertCircle,
  X,
  Star,
  Camera,
  User as UserIcon,
  Circle
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { useLiveQuery } from 'dexie-react-hooks';

import { Device, DeviceStatus, CheckRecord } from './types';
import { db } from './db';
import { StatCard } from './components/StatCard';
import { Dashboard } from './components/Dashboard';
import { AIModal } from './components/AIModal';
import { analyzeMaintenanceIssue } from './services/geminiService';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { LoginPage } from './components/LoginPage';
import { MobileNav } from './components/MobileNav';
import { SettingsLayout } from './components/SettingsLayout';
import { ErrorBoundary } from './components/ErrorBoundary';
import { DataManagement } from './components/DataManagement';
import { DeviceDetailsModal } from './components/DeviceDetailsModal';
import { UserStatusSidebar } from './components/UserStatusSidebar';
import { TaskManagement } from './components/TaskManagement';
import { ChatWindow } from './components/ChatWindow';
import { ScannerModal } from './components/ScannerModal';

const COLORS = ['#10B981', '#F59E0B', '#EF4444', '#6B7280']; // Operational, Maint, Broken, Missing

function AppContent() {
  const { user, logout, updateUser, isLoading: isAuthLoading } = useAuth();
  const { theme, toggleTheme } = useTheme();

  // HOOKS MUST BE AT THE TOP LEVEL - BEFORE ANY RETURNS
  const [activeTab, setActiveTab] = useState<'dashboard' | 'inventory' | 'settings' | 'tasks'>('dashboard');

  // Actually, let's fix the type.
  const [chatUser, setChatUser] = useState<any>(null); // Using any to avoid import issues for now, or I should import User.

  const devices = useLiveQuery(() => db.devices.toArray()) || [];
  const labs = useLiveQuery(() => db.labs.toArray()) || [];

  const [searchTerm, setSearchTerm] = useState('');
  const [labFilter, setLabFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  // AI Modal State
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [aiAnalysisContent, setAiAnalysisContent] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [selectedDeviceName, setSelectedDeviceName] = useState('');

  // QR Code Simulator State (Scan)
  const [scanInput, setScanInput] = useState('');
  const [showScanner, setShowScanner] = useState(false);

  // New Features State
  const [showAddModal, setShowAddModal] = useState(false);
  const [showChecklistModal, setShowChecklistModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);

  const [newDevice, setNewDevice] = useState({
    id: '',
    lab: '',
    brand: '',
    model: '',
    processor: '',
    ram: '',
    storage: '',
    status: DeviceStatus.OPERATIONAL
  });

  const [checklistData, setChecklistData] = useState({
    teclado: true,
    mouse: true,
    monitor: true,
    cabos: true,
    software: true,
    observacoes: ''
  });

  // User Profile State
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [accountData, setAccountData] = useState({
    name: user?.name || '',
    avatar: user?.avatar || '',
    currentPassword: '',
    newPassword: ''
  });

  // Derived Stats
  const stats = useMemo(() => {
    return {
      total: devices.length,
      operational: devices.filter(d => d.status === DeviceStatus.OPERATIONAL).length,
      maintenance: devices.filter(d => d.status === DeviceStatus.MAINTENANCE).length,
      broken: devices.filter(d => d.status === DeviceStatus.BROKEN).length,
      missing: devices.filter(d => d.status === DeviceStatus.MISSING).length,
    };
  }, [devices]);

  // Handlers
  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  };

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

  const simulateScan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scanInput) return;

    setSearchTerm(scanInput);
    setActiveTab('inventory');
    setShowScanner(false);
    setScanInput('');
  };

  const handleAddDevice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDevice.id || !newDevice.lab || !newDevice.brand || !newDevice.model) {
      alert("Preencha os campos obrigatórios.");
      return;
    }

    try {
      await db.devices.add({
        id: newDevice.id,
        name: `${newDevice.brand} ${newDevice.model}`,
        brand: newDevice.brand,
        model: newDevice.model,
        processor: newDevice.processor,
        ram: newDevice.ram,
        storage: newDevice.storage,
        lab: newDevice.lab,
        status: newDevice.status,
        specs: `${newDevice.processor}, ${newDevice.ram}, ${newDevice.storage}`,
        lastCheck: new Date().toISOString().split('T')[0],
        logs: [],
        checkHistory: []
      });
      setShowAddModal(false);
      setNewDevice({
        id: '',
        lab: '',
        brand: '',
        model: '',
        processor: '',
        ram: '',
        storage: '',
        status: DeviceStatus.OPERATIONAL
      });
    } catch (error) {
      alert("Erro ao adicionar dispositivo. Verifique se o Patrimônio já existe.");
    }
  };

  const handleDeleteDevice = async (id: string) => {
    if (confirm(`Tem certeza que deseja excluir o equipamento ${id}?`)) {
      await db.devices.delete(id);
    }
  };

  const handleChecklistSubmit = async () => {
    if (!selectedDevice) return;

    const checkRecord: CheckRecord = {
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString('pt-BR'),
      userId: user?.id,
      userName: user?.name,
      ...checklistData
    };

    const allOk = checklistData.teclado && checklistData.mouse &&
      checklistData.monitor && checklistData.cabos && checklistData.software;

    const newStatus = allOk ? DeviceStatus.OPERATIONAL : DeviceStatus.MAINTENANCE;

    await db.devices.update(selectedDevice.id, {
      status: newStatus,
      lastCheck: checkRecord.date,
      checkHistory: [...(selectedDevice.checkHistory || []), checkRecord]
    });

    setShowChecklistModal(false);
    setChecklistData({
      teclado: true,
      mouse: true,
      monitor: true,
      cabos: true,
      software: true,
      observacoes: ''
    });
  };

  const generateQRCode = (device: Device) => {
    setSelectedDevice(device);
    setShowQRModal(true);
  };



  const getStatusColor = (status: DeviceStatus) => {
    switch (status) {
      case DeviceStatus.OPERATIONAL: return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case DeviceStatus.MAINTENANCE: return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case DeviceStatus.BROKEN: return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case DeviceStatus.MISSING: return 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const handleUpdateUserStatus = async (status: 'online' | 'busy' | 'offline') => {
    if (!user?.id) return;
    await db.users.update(Number(user.id), { status });
    // Force reload to update context or use a better state management in real app
    window.location.reload();
  };

  const handleUpdateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    const updates: any = {
      name: accountData.name,
      avatar: accountData.avatar
    };

    if (accountData.newPassword) {
      // In a real app, verify currentPassword first
      updates.password = accountData.newPassword;
    }

    await db.users.update(Number(user.id), updates);
    updateUser(updates);
    alert('Perfil atualizado com sucesso!');
    setShowAccountModal(false);
  };

  // CONDITIONAL RENDERING AFTER HOOKS
  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  // Filtering
  const filteredDevices = devices.filter(device => {
    const matchesSearch = device.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      device.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLab = labFilter === 'All' || device.lab === labFilter;
    const matchesStatus = statusFilter === 'All' || device.status === statusFilter;
    return matchesSearch && matchesLab && matchesStatus;
  });

  return (
    <div className="min-h-screen flex bg-[#F3F4F6] dark:bg-gray-900 text-gray-900 dark:text-gray-100 pb-16 md:pb-0 font-sans transition-colors duration-200">

      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 fixed h-full z-10 hidden md:flex flex-col transition-colors duration-200">
        <div className="p-6 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center space-x-2 text-indigo-600 dark:text-indigo-400">
            <img src="/logo.png" alt="Logo" className="w-8 h-8 rounded-lg" />
            <span className="text-xl font-bold tracking-tight">LabManager</span>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition ${activeTab === 'dashboard' ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => setActiveTab('inventory')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition ${activeTab === 'inventory' ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
          >
            <Monitor className="w-5 h-5" />
            <span>Inventário</span>
          </button>

          <button
            onClick={() => setActiveTab('tasks')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition ${activeTab === 'tasks' ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
          >
            <CheckCircle className="w-5 h-5" />
            <span>Tarefas</span>
          </button>



          <button
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition ${activeTab === 'settings' ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
          >
            <Settings className="w-5 h-5" />
            <span>Configurações</span>
          </button>
        </nav>

        <UserStatusSidebar onUserClick={setChatUser} />

        <div className="p-4 border-t border-gray-100 dark:border-gray-700 relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="w-full flex items-center justify-between px-4 py-2 text-sm text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition"
          >
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="font-bold text-gray-600 dark:text-gray-300">{user.name.charAt(0)}</span>
                  )}
                </div>
                <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-gray-800 ${user.status === 'busy' ? 'bg-red-500' :
                  user.status === 'offline' ? 'bg-gray-500' :
                    'bg-green-500'
                  }`}></div>
              </div>
              <div className="text-left">
                <p className="font-medium text-gray-700 dark:text-gray-200 truncate w-24">{user.name}</p>
                <p className="text-xs text-gray-400 capitalize">{user.status || 'online'}</p>
              </div>
            </div>
            <ChevronDown className="w-4 h-4" />
          </button>

          {showUserMenu && (
            <div className="absolute bottom-full left-4 right-4 mb-2 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 py-1 z-50 animate-in slide-in-from-bottom-2">
              <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Status</p>
                <div className="space-y-1">
                  <button onClick={() => handleUpdateUserStatus('online')} className="w-full flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span>Online</span>
                  </button>
                  <button onClick={() => handleUpdateUserStatus('busy')} className="w-full flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400">
                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                    <span>Ausente</span>
                  </button>
                  <button onClick={() => handleUpdateUserStatus('offline')} className="w-full flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400">
                    <div className="w-2 h-2 rounded-full bg-gray-500"></div>
                    <span>Offline</span>
                  </button>
                </div>
              </div>
              <button
                onClick={() => {
                  setAccountData({
                    name: user.name,
                    avatar: user.avatar || '',
                    currentPassword: '',
                    newPassword: ''
                  });
                  setShowAccountModal(true);
                  setShowUserMenu(false);
                }}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
              >
                <Settings className="w-4 h-4" />
                Configurações de Conta
              </button>
              <button onClick={logout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2">
                <LogOut className="w-4 h-4" />
                Sair
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 p-4 md:p-8 overflow-y-auto h-screen">

        {/* Mobile Header */}
        <div className="md:hidden flex justify-between items-center mb-6 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
          <div className="flex items-center space-x-2 text-indigo-600 dark:text-indigo-400">
            <img src="/logo.png" alt="Logo" className="w-6 h-6 rounded-lg" />
            <span className="font-bold">LabManager</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <span className="font-bold text-gray-600 dark:text-gray-300 text-xs">{user.name.charAt(0)}</span>
              )}
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto space-y-6">

          {/* Header & Actions - Only for Inventory */}
          {activeTab === 'inventory' && (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm flex flex-col md:flex-row justify-between items-center gap-4 transition-colors duration-200">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg text-indigo-600 dark:text-indigo-400">
                  <Monitor className="w-6 h-6" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Sistema de Inventário</h1>
              </div>

              <div className="flex items-center space-x-3 w-full md:w-auto">
                <button
                  onClick={toggleTheme}
                  className="p-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                >
                  {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => window.location.reload()}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition text-sm font-medium"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Atualizar</span>
                </button>
                <DataManagement devices={filteredDevices} />

                <button
                  onClick={() => setShowScanner(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm font-medium shadow-sm"
                >
                  <QrCode className="w-4 h-4" />
                  <span>Fazer Checklist</span>
                </button>

                <button
                  onClick={() => setShowAddModal(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm font-medium shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>Adicionar</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'settings' ? (
            <SettingsLayout onLogout={logout} />
          ) : activeTab === 'tasks' ? (
            <TaskManagement />
          ) : (
            <>
              {/* Dashboard View */}
              {activeTab === 'dashboard' && (
                <div className="space-y-6">
                  <Dashboard />
                </div>
              )}

              {/* Inventory View */}
              {activeTab === 'inventory' && (
                <>
                  {/* Stats Cards (Optional in Inventory, but keeping for context if needed, or removing if user wants strict separation. User said "Dashboard copies inventory", implying they want them separate. I will remove stats from Inventory view based on request to "fix dashboard") */}

                  {/* Filters Bar */}
                  <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm flex flex-col md:flex-row gap-4 items-center transition-colors duration-200">
                    <div className="relative flex-1 w-full">
                      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        placeholder="Buscar por patrimônio, marca ou modelo..."
                        className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-gray-700 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>

                    <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                      <div className="relative w-full md:w-64">
                        <select
                          className="w-full appearance-none bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 pr-10 focus:ring-2 focus:ring-indigo-500 outline-none text-gray-700 dark:text-gray-200 cursor-pointer"
                          value={labFilter}
                          onChange={(e) => setLabFilter(e.target.value)}
                        >
                          <option value="All">Todos os Laboratórios</option>
                          {labs.map(lab => (
                            <option key={lab.id} value={lab.name}>{lab.name}</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                      </div>

                      <div className="relative w-full md:w-48">
                        <select
                          className="w-full appearance-none bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 pr-10 focus:ring-2 focus:ring-indigo-500 outline-none text-gray-700 dark:text-gray-200 cursor-pointer"
                          value={statusFilter}
                          onChange={(e) => setStatusFilter(e.target.value)}
                        >
                          <option value="All">Todos os Status</option>
                          {Object.values(DeviceStatus).map(status => (
                            <option key={status} value={status}>{status}</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  {/* Mobile Card View */}
                  <div className="md:hidden space-y-4">
                    {filteredDevices.map(device => (
                      <div key={device.id} className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-gray-900 dark:text-white">{device.name}</span>
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${getStatusColor(device.status)}`}>
                                {device.status}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{device.brand} {device.model} • {device.lab}</p>
                          </div>
                          <button
                            onClick={() => {
                              setSelectedDevice(device);
                              setShowDetailsModal(true);
                            }}
                            className="text-indigo-600 dark:text-indigo-400"
                          >
                            <Search className="w-5 h-5" />
                          </button>
                        </div>

                        <div className="mt-3 bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg space-y-2">
                          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Especificações</p>
                          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                            <div>
                              <span className="block text-gray-400 dark:text-gray-500 text-[10px]">Processador</span>
                              <span className="font-medium text-gray-700 dark:text-gray-300 truncate block" title={device.processor}>{device.processor || '-'}</span>
                            </div>
                            <div>
                              <span className="block text-gray-400 dark:text-gray-500 text-[10px]">RAM</span>
                              <span className="font-medium text-gray-700 dark:text-gray-300 truncate block">{device.ram || '-'}</span>
                            </div>
                            <div className="col-span-2">
                              <span className="block text-gray-400 dark:text-gray-500 text-[10px]">Armazenamento</span>
                              <span className="font-medium text-gray-700 dark:text-gray-300 truncate block">{device.storage || '-'}</span>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 dark:text-gray-400 my-3">
                          <div className="bg-gray-50 dark:bg-gray-700/50 p-2 rounded-lg">
                            <span className="block font-medium text-gray-700 dark:text-gray-300">Patrimônio</span>
                            {device.id}
                          </div>
                          <div className="bg-gray-50 dark:bg-gray-700/50 p-2 rounded-lg">
                            <span className="block font-medium text-gray-700 dark:text-gray-300">Última Check</span>
                            {formatDate(device.lastCheck)}
                          </div>
                        </div>

                        <div className="flex justify-between items-center pt-3 border-t border-gray-100 dark:border-gray-700">
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setSelectedDevice(device);
                                setShowChecklistModal(true);
                              }}
                              className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg text-xs font-medium"
                            >
                              Checklist
                            </button>
                            <button
                              onClick={() => handleAIAnalysis(device)}
                              disabled={device.status === DeviceStatus.OPERATIONAL}
                              className={`p-1.5 rounded-lg ${device.status === DeviceStatus.OPERATIONAL ? 'text-gray-300 dark:text-gray-600' : 'bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'}`}
                            >
                              <BrainCircuit className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => generateQRCode(device)}
                              className="p-1.5 bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg"
                            >
                              <QrCode className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteDevice(device.id)}
                              className="p-1.5 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                    {filteredDevices.length === 0 && (
                      <div className="text-center py-8 text-gray-400 dark:text-gray-500">
                        Nenhum equipamento encontrado.
                      </div>
                    )}
                  </div>

                  {/* Desktop Table View */}
                  <div className="hidden md:block bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden transition-colors duration-200">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-gray-100 dark:border-gray-700">
                            <th className="px-6 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider">Patrimônio</th>
                            <th className="px-6 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider">Laboratório</th>
                            <th className="px-6 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider">Equipamento</th>
                            <th className="px-6 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider">Specs</th>
                            <th className="px-6 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider">Última Check</th>
                            <th className="px-6 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Ações</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                          {filteredDevices.map(device => (
                            <tr key={device.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group">
                              <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => {
                                      setSelectedDevice(device);
                                      setShowDetailsModal(true);
                                    }}
                                    className="flex items-center gap-2 hover:text-indigo-600 transition-colors text-left"
                                  >
                                    {device.id}
                                  </button>
                                </div>
                              </td>

                              <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{device.lab}</td>
                              <td className="px-6 py-4">
                                <button
                                  onClick={() => {
                                    setSelectedDevice(device);
                                    setShowDetailsModal(true);
                                  }}
                                  className="text-left group/btn"
                                >
                                  <p className="font-bold text-gray-900 dark:text-white uppercase group-hover/btn:text-indigo-600 dark:group-hover/btn:text-indigo-400 transition-colors">{device.name}</p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">{device.brand} {device.model}</p>
                                </button>
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 max-w-xs truncate">{device.specs}</td>
                              <td className="px-6 py-4">
                                <div className="relative group/status">
                                  <select
                                    value={device.status}
                                    onChange={(e) => db.devices.update(device.id, { status: e.target.value as DeviceStatus })}
                                    className={`appearance-none pl-3 pr-8 py-1 rounded-full text-xs font-medium cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500 ${getStatusColor(device.status)} bg-opacity-10 border-none`}
                                  >
                                    {Object.values(DeviceStatus).map(status => (
                                      <option key={status} value={status} className="text-gray-900 bg-white">
                                        {status}
                                      </option>
                                    ))}
                                  </select>
                                  <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-3 h-3 pointer-events-none opacity-50" />
                                </div>
                              </td>
                              <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{formatDate(device.lastCheck)}</td>
                              <td className="px-6 py-4 text-right">
                                <div className="flex justify-end space-x-2">
                                  <button
                                    onClick={() => {
                                      setSelectedDevice(device);
                                      setShowChecklistModal(true);
                                    }}
                                    className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg text-sm font-medium hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition"
                                  >
                                    Checklist
                                  </button>
                                  <button
                                    onClick={() => handleAIAnalysis(device)}
                                    disabled={device.status === DeviceStatus.OPERATIONAL}
                                    className={`p-1.5 rounded-lg transition ${device.status === DeviceStatus.OPERATIONAL ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed' : 'bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/50'}`}
                                    title="Diagnóstico IA"
                                  >
                                    <BrainCircuit className="w-5 h-5" />
                                  </button>
                                  <button
                                    onClick={() => generateQRCode(device)}
                                    className="p-1.5 bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition"
                                    title="QR Code"
                                  >
                                    <QrCode className="w-5 h-5" />
                                  </button>
                                  <button
                                    onClick={() => {
                                      setSelectedDevice(device);
                                      setShowDetailsModal(true);
                                    }}
                                    className="p-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition"
                                    title="Detalhes"
                                  >
                                    <Search className="w-5 h-5" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteDevice(device.id)}
                                    className="p-1.5 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/50 transition"
                                    title="Excluir"
                                  >
                                    <Trash2 className="w-5 h-5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                          {filteredDevices.length === 0 && (
                            <tr>
                              <td colSpan={7} className="px-6 py-12 text-center text-gray-400 dark:text-gray-500">
                                Nenhum equipamento encontrado com os filtros atuais.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination Mock */}
                    <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Mostrando {filteredDevices.length} resultados</span>
                      <div className="flex space-x-2">
                        <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50">
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </main>

      {/* Mobile Navigation */}
      <MobileNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onScanClick={() => setShowScanner(true)}
        onLogout={logout}
      />

      {/* Scanner Modal */}


      {/* Add Device Modal */}
      {
        showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-[95%] md:w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 relative">
              <button
                onClick={() => setShowAddModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-6 h-6" />
              </button>
              <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Adicionar Equipamento</h2>
              <form onSubmit={handleAddDevice} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Patrimônio</label>
                    <input
                      type="text"
                      required
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      value={newDevice.id}
                      onChange={e => setNewDevice({ ...newDevice, id: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Laboratório</label>
                    <select
                      required
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      value={newDevice.lab}
                      onChange={e => setNewDevice({ ...newDevice, lab: e.target.value })}
                    >
                      <option value="">Selecione...</option>
                      {labs.map(lab => (
                        <option key={lab.id} value={lab.name}>{lab.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Marca</label>
                    <input
                      type="text"
                      required
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      value={newDevice.brand}
                      onChange={e => setNewDevice({ ...newDevice, brand: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Modelo</label>
                    <input
                      type="text"
                      required
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      value={newDevice.model}
                      onChange={e => setNewDevice({ ...newDevice, model: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Processador</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    value={newDevice.processor}
                    onChange={e => setNewDevice({ ...newDevice, processor: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">RAM</label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      value={newDevice.ram}
                      onChange={e => setNewDevice({ ...newDevice, ram: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Armazenamento</label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      value={newDevice.storage}
                      onChange={e => setNewDevice({ ...newDevice, storage: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                  <select
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    value={newDevice.status}
                    onChange={e => setNewDevice({ ...newDevice, status: e.target.value as DeviceStatus })}
                  >
                    {Object.values(DeviceStatus).map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                  >
                    Adicionar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )
      }

      {/* Checklist Modal */}
      {
        showChecklistModal && selectedDevice && (
          <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-[95%] md:w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 relative">
              <button
                onClick={() => setShowChecklistModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-6 h-6" />
              </button>
              <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Checklist de Verificação</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">{selectedDevice.id} - {selectedDevice.lab}</p>

              <div className="space-y-3">
                {[
                  { key: 'teclado', label: 'Teclado funcionando' },
                  { key: 'mouse', label: 'Mouse funcionando' },
                  { key: 'monitor', label: 'Monitor funcionando' },
                  { key: 'cabos', label: 'Cabos em bom estado' },
                  { key: 'software', label: 'Software atualizado' }
                ].map(item => (
                  <label key={item.key} className="flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={(checklistData as any)[item.key]}
                      onChange={(e) => setChecklistData({ ...checklistData, [item.key]: e.target.checked })}
                      className="w-5 h-5 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500"
                    />
                    <span className="flex-1 text-gray-700 dark:text-gray-200">{item.label}</span>
                  </label>
                ))}

                <textarea
                  placeholder="Observações adicionais..."
                  value={checklistData.observacoes}
                  onChange={(e) => setChecklistData({ ...checklistData, observacoes: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white mt-4"
                  rows={3}
                />
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowChecklistModal(false)}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleChecklistSubmit}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  Salvar Checklist
                </button>
              </div>
            </div>
          </div>
        )
      }

      {/* QR Code Modal */}
      {
        showQRModal && selectedDevice && (
          <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-[95%] md:w-full max-w-sm max-h-[90vh] overflow-y-auto p-6 relative">
              <button
                onClick={() => setShowQRModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-6 h-6" />
              </button>
              <h2 className="text-2xl font-bold mb-4 text-center text-gray-900 dark:text-white">QR Code</h2>
              <div className="bg-gray-100 dark:bg-gray-700 p-6 rounded-lg mb-4">
                <div className="text-center mb-4">
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">{selectedDevice.id}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">{selectedDevice.lab}</div>
                </div>
                <div className="bg-white p-4 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <QrCode className="w-32 h-32 mx-auto text-gray-900" />
                    <p className="text-xs text-gray-500 mt-2">Código QR para {selectedDevice.id}</p>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowQRModal(false)}
                className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Fechar
              </button>
            </div>
          </div>
        )
      }

      {/* Account Settings Modal */}
      {showAccountModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-[95%] md:w-full max-w-md max-h-[90vh] overflow-y-auto p-6 relative">
            <button
              onClick={() => setShowAccountModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="w-6 h-6" />
            </button>
            <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Configurações de Conta</h2>

            <form onSubmit={handleUpdateAccount} className="space-y-4">
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden border-4 border-white dark:border-gray-600 shadow-lg">
                    {accountData.avatar ? (
                      <img src={accountData.avatar} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <UserIcon className="w-12 h-12 text-gray-400" />
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => document.getElementById('avatar-upload')?.click()}
                    className="absolute bottom-0 right-0 p-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 shadow-md"
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setAccountData({ ...accountData, avatar: reader.result as string });
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  value={accountData.name}
                  onChange={e => setAccountData({ ...accountData, name: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nova Senha (Opcional)</label>
                <input
                  type="password"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  value={accountData.newPassword}
                  onChange={e => setAccountData({ ...accountData, newPassword: e.target.value })}
                  placeholder="Deixe em branco para manter"
                />
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAccountModal(false)}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  Salvar Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Scanner Modal */}
      {showScanner && (
        <ScannerModal
          onClose={() => setShowScanner(false)}
          onScan={(deviceId) => {
            setShowScanner(false);
            const device = devices.find(d => d.id === deviceId);
            if (device) {
              setSelectedDevice(device);
              setShowChecklistModal(true);
            } else {
              alert('Dispositivo não encontrado!');
            }
          }}
        />
      )}

      {/* Device Details Modal */}
      {
        showDetailsModal && selectedDevice && (
          <DeviceDetailsModal
            device={selectedDevice}
            onClose={() => setShowDetailsModal(false)}
          />
        )
      }

      {/* AI Analysis Modal */}
      <AIModal
        isOpen={aiModalOpen}
        onClose={() => setAiModalOpen(false)}
        title={`Diagnóstico Técnico: ${selectedDeviceName}`}
        content={aiAnalysisContent}
        isLoading={isAiLoading}
      />

      {/* Helper icon for Lucide imports that aren't used in main render but imported */}
      <div className="hidden">
        <BarChart3 />
        <Settings />
      </div>

      {chatUser && (
        <ChatWindow
          targetUser={chatUser}
          onClose={() => setChatUser(null)}
        />
      )}

    </div >
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ThemeProvider>
          <AppContent />
        </ThemeProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
