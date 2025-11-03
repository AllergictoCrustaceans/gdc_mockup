"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUserStore } from "../../../lib/stores/userStore";
import Navbar from "../components/Navbar";
import Link from "next/link";

export default function DashboardPage() {
    const router = useRouter();
    const { user, isAuthenticated } = useUserStore();

    useEffect(() => {
        if (!isAuthenticated) {
            router.push("/login");
        }
    }, [isAuthenticated, router]);

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

            <div className="max-w-7xl mx-auto p-4">
                <div className="mb-6">
                    <h2 className="text-2xl font-bold mb-2">
                        Welcome, {user.getBasicInformation().name}!
                    </h2>
                    <p className="text-sm">
                        Role: <span className="font-semibold">{user.getRole()}</span>
                    </p>
                </div>

                {user.getRole() === "attendee" && (
                    <div className="mb-6">
                        <h3 className="text-xl font-semibold mb-4">Attendee Dashboard</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Link href="/events" className="border rounded p-4">
                                <h4 className="text-lg font-semibold mb-2">Browse Events</h4>
                                <p className="text-sm">Find events to attend</p>
                            </Link>
                            <Link href="/my-tickets" className="border rounded p-4">
                                <h4 className="text-lg font-semibold mb-2">My Tickets</h4>
                                <p className="text-sm">View your tickets</p>
                            </Link>
                            <Link href="/my-registrations" className="border rounded p-4">
                                <h4 className="text-lg font-semibold mb-2">My Registrations</h4>
                                <p className="text-sm">Manage registrations</p>
                            </Link>
                        </div>
                    </div>
                )}

                {user.getRole() === "organizer" && (
                    <div className="mb-6">
                        <h3 className="text-xl font-semibold mb-4">Organizer Dashboard</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Link href="/create-event" className="border rounded p-4">
                                <h4 className="text-lg font-semibold mb-2">Create Event</h4>
                                <p className="text-sm">Start a new event</p>
                            </Link>
                            <Link href="/my-events" className="border rounded p-4">
                                <h4 className="text-lg font-semibold mb-2">My Events</h4>
                                <p className="text-sm">Manage your events</p>
                            </Link>
                        </div>
                    </div>
                )}

                {user.getRole() === "administrator" && (
                    <div className="mb-6">
                        <h3 className="text-xl font-semibold mb-4">Administrator Dashboard</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Link href="/admin/events" className="border rounded p-4">
                                <h4 className="text-lg font-semibold mb-2">Manage Events</h4>
                                <p className="text-sm">Oversee all events</p>
                            </Link>
                            <Link href="/admin/users" className="border rounded p-4">
                                <h4 className="text-lg font-semibold mb-2">Manage Users</h4>
                                <p className="text-sm">User management</p>
                            </Link>
                            <Link href="/admin/analytics" className="border rounded p-4">
                                <h4 className="text-lg font-semibold mb-2">Analytics</h4>
                                <p className="text-sm">View reports</p>
                            </Link>
                        </div>
                    </div>
                )}

                <div className="border rounded p-4">
                    <h3 className="text-lg font-semibold mb-3">Quick Links</h3>
                    <div className="flex gap-3">
                        <Link href="/events" className="px-3 py-2 border rounded text-sm">
                            Browse Events
                        </Link>
                        <Link href="/profile" className="px-3 py-2 border rounded text-sm">
                            My Profile
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
