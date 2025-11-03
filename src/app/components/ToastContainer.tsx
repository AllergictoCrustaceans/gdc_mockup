"use client";

import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from "react";
import Toast from "./Toast";
import { setToastFunction } from "../../../lib/stores/eventStore";

interface ToastMessage {
    id: string;
    message: string;
    type: "success" | "info" | "warning" | "error";
}

interface ToastContextType {
    showToast: (message: string, type: "success" | "info" | "warning" | "error") => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error("useToast must be used within a ToastProvider");
    }
    return context;
}

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<ToastMessage[]>([]);

    const showToast = useCallback((message: string, type: "success" | "info" | "warning" | "error") => {
        const id = Math.random().toString(36).substring(7);
        setToasts((prev) => [...prev, { id, message, type }]);
    }, []);

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    // Set the global toast function for use in Zustand stores
    useEffect(() => {
        setToastFunction(showToast);
    }, [showToast]);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
                {toasts.map((toast) => (
                    <Toast
                        key={toast.id}
                        message={toast.message}
                        type={toast.type}
                        onClose={() => removeToast(toast.id)}
                    />
                ))}
            </div>
        </ToastContext.Provider>
    );
}
