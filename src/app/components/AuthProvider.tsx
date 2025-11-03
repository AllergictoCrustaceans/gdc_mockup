"use client";

import { useEffect } from "react";
import { useUserStore } from "../../../lib/stores/userStore";

export default function AuthProvider({ children }: { children: React.ReactNode }) {
    const { initializeAuth, initialized } = useUserStore();

    useEffect(() => {
        initializeAuth();
    }, []);

    // Show nothing while initializing to prevent flash of wrong content
    if (!initialized) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-lg text-gray-600">Loading...</div>
            </div>
        );
    }

    return <>{children}</>;
}