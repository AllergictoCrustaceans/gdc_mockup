"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUserStore } from "../../../../lib/stores/userStore";
import Navbar from "../../components/Navbar";
import Link from "next/link";
import { createClient } from "../../../../utils/supabase/client";

const supabase = createClient();

interface UserProfile {
    id: string;
    name: string;
    email: string;
    role: string;
    created_at: string;
}

export default function AdminUsersPage() {
    const router = useRouter();
    const { user, isAuthenticated } = useUserStore();
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [deletingUserId, setDeletingUserId] = useState<string | null>(null);

    useEffect(() => {
        if (!isAuthenticated || !user) {
            router.push("/login");
            return;
        }

        if (user.getRole() !== "administrator") {
            router.push("/dashboard");
            return;
        }

        fetchUsers();
    }, [isAuthenticated, user, router]);

    const fetchUsers = async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from("user_profiles")
                .select("*")
                .order("created_at", { ascending: false });

            if (error) throw error;
            setUsers(data || []);
        } catch (error) {
            console.error("Error fetching users:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteUser = async (userId: string, userName: string) => {
        if (!confirm(`Are you sure you want to delete user "${userName}"? This action cannot be undone.`)) {
            return;
        }

        setDeletingUserId(userId);
        try {
            // Call the API route to delete the user
            const response = await fetch("/api/admin/delete-user", {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ userId }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to delete user");
            }

            // Refresh the user list
            await fetchUsers();
            alert("User deleted successfully");
        } catch (error: any) {
            console.error("Error deleting user:", error);
            alert(`Failed to delete user: ${error.message}`);
        } finally {
            setDeletingUserId(null);
        }
    };

    const formatDate = (dateString: string) => {
        return new Intl.DateTimeFormat("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        }).format(new Date(dateString));
    };

    if (!user || user.getRole() !== "administrator") {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-lg">Access Denied</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            <Navbar />

            <main className="max-w-7xl mx-auto p-4">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">Manage Users</h1>
                    <Link href="/dashboard" className="px-4 py-2 border rounded">
                        Back to Dashboard
                    </Link>
                </div>

                {isLoading && (
                    <div className="text-center py-12">
                        Loading users...
                    </div>
                )}

                {!isLoading && users.length === 0 && (
                    <div className="text-center py-12">
                        No users found.
                    </div>
                )}

                {!isLoading && users.length > 0 && (
                    <div className="border rounded overflow-hidden">
                        <table className="min-w-full">
                            <thead className="border-b">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase">
                                        Name
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase">
                                        Email
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase">
                                        Role
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase">
                                        Joined
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-semibold uppercase">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((userProfile) => (
                                    <tr key={userProfile.id} className="border-b last:border-b-0">
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-semibold">
                                                {userProfile.name}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm">
                                                {userProfile.email}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm px-2 py-1 border rounded">
                                                {userProfile.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm">
                                                {formatDate(userProfile.created_at)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right text-sm">
                                            <button
                                                onClick={() => handleDeleteUser(userProfile.id, userProfile.name)}
                                                disabled={deletingUserId === userProfile.id || userProfile.id === user.getId()}
                                                className="underline disabled:opacity-50"
                                            >
                                                {deletingUserId === userProfile.id ? "Deleting..." : "Delete"}
                                            </button>
                                            {userProfile.id === user.getId() && (
                                                <span className="ml-2 text-xs">(You)</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </main>
        </div>
    );
}
