"use client";

import { useRouter } from "next/navigation";
import { useUserStore } from "../../../lib/stores/userStore";
import Link from "next/link";

export default function Navbar() {
    const router = useRouter();
    const { user, signOut } = useUserStore();

    const handleSignOut = async () => {
        await signOut();
        router.push("/login");
    };

    if (!user) {
        return null;
    }

    return (
        <nav className="border-b p-4">
            <div className="flex justify-between items-center max-w-7xl mx-auto">
                <Link href="/dashboard" className="text-xl font-bold">
                    Event Management
                </Link>
                <div className="flex items-center gap-4">
                    <span className="text-sm">{user.getBasicInformation().name}</span>
                    <button
                        onClick={handleSignOut}
                        className="px-4 py-2 border rounded"
                    >
                        Sign Out
                    </button>
                </div>
            </div>
        </nav>
    );
}
