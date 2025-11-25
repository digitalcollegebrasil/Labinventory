import React, { useEffect, useRef, useState } from 'react';
import { X, Camera, Search } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Html5Qrcode } from 'html5-qrcode';
import { db } from '../db';

interface ScannerModalProps {
    onClose: () => void;
    onScan: (deviceId: string) => void;
}

export function ScannerModal({ onClose, onScan }: ScannerModalProps) {
    const [error, setError] = useState<string>('');
    const [manualId, setManualId] = useState('');
    const devices = useLiveQuery(() => db.devices.toArray()) || [];
    const scannerRef = useRef<Html5Qrcode | null>(null);

    useEffect(() => {
        const startScanner = async () => {
            try {
                const html5QrCode = new Html5Qrcode("reader");
                scannerRef.current = html5QrCode;

                const config = {
                    fps: 10,
                    qrbox: { width: 250, height: 250 }
                };

                const onSuccess = (decodedText: string) => {
                    onScan(decodedText);
                    html5QrCode.stop().catch(err => console.error("Failed to stop scanner", err));
                };

                try {
                    // Try environment camera first
                    await html5QrCode.start({ facingMode: "environment" }, config, onSuccess, () => { });
                } catch (envError) {
                    console.warn("Environment camera failed, trying user camera...", envError);
                    try {
                        // Fallback to user camera
                        await html5QrCode.start({ facingMode: "user" }, config, onSuccess, () => { });
                    } catch (userError: any) {
                        console.error("All cameras failed:", userError);
                        setError(`Erro ao acessar câmera: ${userError?.message || 'Permissão negada ou dispositivo não encontrado'}`);
                    }
                }
            } catch (err: any) {
                console.error("Scanner init error:", err);
                setError(`Erro de inicialização: ${err?.message || 'Desconhecido'}`);
            }
        };

        // Small delay to ensure DOM is ready
        const timer = setTimeout(() => {
            startScanner();
        }, 100);

        return () => {
            clearTimeout(timer);
            if (scannerRef.current && scannerRef.current.isScanning) {
                scannerRef.current.stop().then(() => {
                    scannerRef.current?.clear();
                }).catch(err => console.error("Failed to stop scanner on cleanup", err));
            }
        };
    }, [onScan]);

    const handleManualSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (manualId) {
            onScan(manualId);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex flex-col items-center justify-center p-4">
            <div className="w-[95%] md:w-full max-w-md max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-2xl relative">
                <button
                    onClick={() => {
                        if (scannerRef.current && scannerRef.current.isScanning) {
                            scannerRef.current.stop().then(() => {
                                scannerRef.current?.clear();
                                onClose();
                            }).catch(() => onClose());
                        } else {
                            onClose();
                        }
                    }}
                    className="absolute top-4 right-4 z-10 p-2 bg-black/50 text-white rounded-full hover:bg-black/70"
                >
                    <X className="w-6 h-6" />
                </button>

                <div className="relative aspect-[3/4] bg-black flex items-center justify-center overflow-hidden">
                    {error ? (
                        <div className="text-white text-center p-6">
                            <Camera className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p>{error}</p>
                        </div>
                    ) : (
                        <div id="reader" className="w-full h-full"></div>
                    )}

                    {/* Overlay is handled by html5-qrcode mostly, but we can keep a guide if needed. 
                        However, html5-qrcode renders its own video. 
                        We'll let it handle the video rendering in the #reader div.
                    */}
                </div>

                <div className="p-6 bg-white dark:bg-gray-800">
                    <form onSubmit={handleManualSubmit} className="flex gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                value={manualId}
                                onChange={(e) => setManualId(e.target.value)}
                                placeholder="Digitar código ou nome..."
                                className="w-full pl-9 pr-4 py-2 bg-gray-100 dark:bg-gray-700 border-none rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                                list="device-list"
                            />
                            <datalist id="device-list">
                                {devices.map(d => (
                                    <option key={d.id} value={d.id}>{d.name} - {d.lab}</option>
                                ))}
                            </datalist>
                        </div>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700"
                        >
                            Verificar
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

