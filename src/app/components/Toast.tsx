"use client";

import { useEffect } from "react";

export interface ToastProps {
    message: string;
    type: "success" | "info" | "warning" | "error";
    onClose: () => void;
    duration?: number;
}

export default function Toast({ message, type, onClose, duration = 5000 }: ToastProps) {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose]);

    const bgColor = {
        success: "bg-green-500",
        info: "bg-blue-500",
        warning: "bg-yellow-500",
        error: "bg-red-500",
    }[type];

    const icon = {
        success: "✓",
        info: "ℹ",
        warning: "⚠",
        error: "✗",
    }[type];

    return (
        <div
            className={`${bgColor} text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 min-w-[300px] max-w-md animate-slide-in`}
        >
            <span className="text-xl font-bold">{icon}</span>
            <p className="flex-1 text-sm">{message}</p>
            <button
                onClick={onClose}
                className="text-white hover:text-gray-200 font-bold text-lg"
            >
                ×
            </button>
        </div>
    );
}
