import React from "react";
import { X, QrCode } from "lucide-react";
import { Device } from "../../../types";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    device: Device | null;
}

export function QRCodeModal({ isOpen, onClose, device }: Props) {
    if (!isOpen || !device) return null;

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 w-full max-w-sm rounded-xl p-6 relative">

                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
                >
                    <X className="w-6 h-6" />
                </button>

                <h2 className="text-xl font-bold text-center mb-4">
                    QR Code • {device.id}
                </h2>

                <div className="bg-gray-100 dark:bg-gray-700 p-6 rounded-lg flex items-center justify-center">
                    <QrCode className="w-40 h-40 text-gray-900 dark:text-gray-200" />
                </div>
            </div>
        </div>
    );
}
