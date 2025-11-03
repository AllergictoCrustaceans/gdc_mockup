"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUserStore } from "../../../lib/stores/userStore";
import { UserService } from "../../../lib/services/userService";
import Navbar from "../components/Navbar";
import Link from "next/link";

export default function ProfilePage() {
    const router = useRouter();
    const { user, isAuthenticated, fetchUser, signOut } = useUserStore();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [isUpdating, setIsUpdating] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        if (!isAuthenticated || !user) {
            router.push("/login");
            return;
        }

        const userInfo = user.getBasicInformation();
        setName(userInfo.name);
        setEmail(userInfo.email);
    }, [isAuthenticated, user, router]);

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setMessage("");
        setIsUpdating(true);

        try {
            if (!user) throw new Error("No user found");

            const { error: updateError } = await UserService.updateUserProfile(
                user.getId(),
                { name, email }
            );

            if (updateError) throw updateError;

            await fetchUser(user.getId());

            setMessage("Profile updated successfully!");
            setTimeout(() => setMessage(""), 3000);
        } catch (err: any) {
            setError(err.message || "Failed to update profile");
            setTimeout(() => setError(""), 5000);
        } finally {
            setIsUpdating(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (!confirm("Are you sure you want to delete your account? This action cannot be undone and will delete all your data including events, tickets, and registrations.")) {
            return;
        }

        const confirmText = prompt("Type 'DELETE' to confirm account deletion:");
        if (confirmText !== "DELETE") {
            alert("Account deletion cancelled");
            return;
        }

        setIsDeleting(true);
        try {
            if (!user) throw new Error("No user found");

            const response = await fetch("/api/user/delete-account", {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to delete account");
            }

            await signOut();
            router.push("/login");
        } catch (err: any) {
            setError(err.message || "Failed to delete account");
            setTimeout(() => setError(""), 5000);
            setIsDeleting(false);
        }
    };

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                Loading...
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            <Navbar />

            <main className="max-w-4xl mx-auto p-4">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">My Profile</h1>
                    <Link href="/dashboard" className="px-4 py-2 border rounded">
                        Back to Dashboard
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Update Profile */}
                    <div className="border rounded p-6">
                        <h2 className="text-xl font-semibold mb-4">Update Profile</h2>

                        {message && (
                            <div className="mb-4 p-3 border border-green-500 rounded text-sm">
                                {message}
                            </div>
                        )}

                        {error && (
                            <div className="mb-4 p-3 border border-red-500 rounded text-sm">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleUpdateProfile} className="space-y-4">
                            <div>
                                <label htmlFor="name" className="block text-sm mb-1">
                                    Name
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                    className="w-full px-3 py-2 border rounded"
                                />
                            </div>

                            <div>
                                <label htmlFor="email" className="block text-sm mb-1">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full px-3 py-2 border rounded"
                                />
                            </div>

                            <div>
                                <label className="block text-sm mb-1">
                                    Role
                                </label>
                                <input
                                    type="text"
                                    value={user.getRole()}
                                    disabled
                                    className="w-full px-3 py-2 border rounded opacity-50"
                                />
                                <p className="text-xs mt-1">Role cannot be changed</p>
                            </div>

                            <button
                                type="submit"
                                disabled={isUpdating}
                                className="w-full px-4 py-2 border rounded disabled:opacity-50"
                            >
                                {isUpdating ? "Updating..." : "Update Profile"}
                            </button>
                        </form>
                    </div>

                    {/* DELETE ACCOUNT */}
                    <div className="border border-red-300 rounded p-6">
                        <h2 className="text-xl font-semibold mb-4 text-red-600">Danger Zone</h2>

                        <p className="text-sm mb-4">
                            Deleting your account will permanently remove all your data including:
                        </p>

                        <ul className="text-sm mb-6 space-y-1 list-disc list-inside">
                            <li>Profile information</li>
                            <li>Events you created (if organizer)</li>
                            <li>Tickets and registrations</li>
                            <li>All related data</li>
                        </ul>

                        <p className="text-sm mb-6 font-semibold">
                            This action cannot be undone!
                        </p>

                        <button
                            onClick={handleDeleteAccount}
                            disabled={isDeleting}
                            className="w-full px-4 py-2 border border-red-500 rounded disabled:opacity-50"
                        >
                            {isDeleting ? "Deleting Account..." : "Delete My Account"}
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
}
