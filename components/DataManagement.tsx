import React, { useState, useRef } from 'react';
import { Download, Upload, FileSpreadsheet, FileText, ChevronDown } from 'lucide-react';
import * as XLSX from 'xlsx';
import { db } from '../db';
import { Device, DeviceStatus } from '../types';

interface DataManagementProps {
    devices: Device[];
    onImportSuccess?: () => void;
}

export function DataManagement({ devices, onImportSuccess }: DataManagementProps) {
    const [isOpen, setIsOpen] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    React.useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const downloadTemplate = () => {
        const headers = ['Patrimônio', 'Laboratório', 'Marca', 'Modelo', 'Processador', 'RAM', 'Armazenamento', 'Status'];
        const csv = headers.join(',');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'modelo_importacao.csv';
        a.click();
        setIsOpen(false);
    };

    const exportToCSV = () => {
        const headers = ['Patrimônio', 'Laboratório', 'Marca', 'Modelo', 'Processador', 'RAM', 'Armazenamento', 'Status', 'Última Verificação'];
        const rows = devices.map(c => [
            c.id,
            c.lab,
            c.brand || '',
            c.model || '',
            c.processor || '',
            c.ram || '',
            c.storage || '',
            c.status,
            c.lastCheck
        ]);

        const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `inventario_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        setIsOpen(false);
    };

    const exportToExcel = () => {
        const data = devices.map(device => ({
            'Patrimônio': device.id,
            'Laboratório': device.lab,
            'Marca': device.brand,
            'Modelo': device.model,
            'Processador': device.processor,
            'RAM': device.ram,
            'Armazenamento': device.storage,
            'Status': device.status,
            'Última Verificação': device.lastCheck
        }));

        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Inventário");
        XLSX.writeFile(wb, `inventario_${new Date().toISOString().split('T')[0]}.xlsx`);
        setIsOpen(false);
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (evt) => {
            try {
                const bstr = evt.target?.result;
                const wb = XLSX.read(bstr, { type: 'binary' });
                const wsname = wb.SheetNames[0];
                const ws = wb.Sheets[wsname];
                const data = XLSX.utils.sheet_to_json(ws);

                let importedCount = 0;
                let errorCount = 0;

                for (const row of data as any[]) {
                    // Normalize keys to lowercase for easier matching
                    const normalizedRow: any = {};
                    Object.keys(row).forEach(key => {
                        normalizedRow[key.toLowerCase().trim()] = row[key];
                    });

                    // Flexible column matching
                    const id = normalizedRow['patrimônio'] || normalizedRow['patrimonio'] || normalizedRow['id'] || normalizedRow['serial'];
                    const lab = normalizedRow['laboratório'] || normalizedRow['laboratorio'] || normalizedRow['lab'] || normalizedRow['local'];

                    if (!id || !lab) {
                        console.warn("Skipping row due to missing ID or Lab:", row);
                        errorCount++;
                        continue;
                    }

                    const device: Device = {
                        id: String(id),
                        lab: String(lab),
                        brand: normalizedRow['marca'] || normalizedRow['brand'] || '',
                        model: normalizedRow['modelo'] || normalizedRow['model'] || '',
                        processor: normalizedRow['processador'] || normalizedRow['processor'] || normalizedRow['cpu'] || '',
                        ram: normalizedRow['ram'] || normalizedRow['memory'] || '',
                        storage: normalizedRow['armazenamento'] || normalizedRow['storage'] || normalizedRow['hd'] || normalizedRow['ssd'] || '',
                        status: (Object.values(DeviceStatus).includes(normalizedRow['status']) ? normalizedRow['status'] : DeviceStatus.OPERATIONAL) as DeviceStatus,
                        lastCheck: normalizedRow['última verificação'] || normalizedRow['ultima verificacao'] || new Date().toISOString().split('T')[0],
                        name: `${normalizedRow['marca'] || ''} ${normalizedRow['modelo'] || ''}`.trim() || 'Desconhecido',
                        specs: `${normalizedRow['processador'] || ''}, ${normalizedRow['ram'] || ''}, ${normalizedRow['armazenamento'] || ''}`,
                        logs: [],
                        checkHistory: []
                    };

                    try {
                        await db.devices.put(device);
                        importedCount++;
                    } catch (err) {
                        console.error("Error importing device:", device, err);
                        errorCount++;
                    }
                }

                alert(`Importação concluída!\nImportados/Atualizados: ${importedCount}\nErros/Ignorados: ${errorCount}`);
                if (onImportSuccess) onImportSuccess();

            } catch (error) {
                console.error("Error parsing file:", error);
                alert("Erro ao processar o arquivo. Verifique o formato.");
            } finally {
                if (fileInputRef.current) fileInputRef.current.value = ''; // Reset input
                setIsOpen(false);
            }
        };
        reader.readAsBinaryString(file);
    };

    const triggerImport = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-medium shadow-sm"
            >
                <Download className="w-4 h-4" />
                <span>Dados</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 py-1 z-50 animate-in fade-in zoom-in-95 duration-200">
                    <button
                        onClick={downloadTemplate}
                        className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
                    >
                        <FileText className="w-4 h-4 text-gray-500" />
                        Baixar Modelo CSV
                    </button>
                    <div className="h-px bg-gray-100 dark:bg-gray-700 my-1" />
                    <button
                        onClick={exportToCSV}
                        className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
                    >
                        <FileText className="w-4 h-4 text-green-600" />
                        Exportar CSV
                    </button>
                    <button
                        onClick={exportToExcel}
                        className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
                    >
                        <FileSpreadsheet className="w-4 h-4 text-green-600" />
                        Exportar Excel
                    </button>
                    <div className="h-px bg-gray-100 dark:bg-gray-700 my-1" />
                    <button
                        onClick={triggerImport}
                        className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
                    >
                        <Upload className="w-4 h-4 text-blue-600" />
                        Importar Dados
                    </button>
                </div>
            )}

            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                className="hidden"
            />
        </div>
    );
}
