"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useEventStore } from "../../../../lib/stores/eventStore";
import { useUserStore } from "../../../../lib/stores/userStore";
import Navbar from "../../components/Navbar";
import Link from "next/link";

export default function AdminEventsPage() {
    const router = useRouter();
    const { events, fetchAllEvents, deleteEvent, isLoading } = useEventStore();
    const { user, isAuthenticated } = useUserStore();

    useEffect(() => {
        if (!isAuthenticated || !user) {
            router.push("/login");
            return;
        }

        if (user.getRole() !== "administrator") {
            router.push("/dashboard");
            return;
        }

        fetchAllEvents();
    }, [isAuthenticated, user, router, fetchAllEvents]);

    const handleDelete = async (eventId: string) => {
        if (confirm("Are you sure you want to delete this event?")) {
            await deleteEvent(eventId);
            await fetchAllEvents();
        }
    };

    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit",
        }).format(date);
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
                    <h1 className="text-2xl font-bold">Manage Events</h1>
                    <Link href="/dashboard" className="px-4 py-2 border rounded">
                        Back to Dashboard
                    </Link>
                </div>

                {isLoading && (
                    <div className="text-center py-12">
                        Loading events...
                    </div>
                )}

                {!isLoading && events.length === 0 && (
                    <div className="text-center py-12">
                        No events found.
                    </div>
                )}

                {!isLoading && events.length > 0 && (
                    <div className="border rounded overflow-hidden">
                        <table className="min-w-full">
                            <thead className="border-b">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase">
                                        Event
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase">
                                        Date
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase">
                                        Tickets
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase">
                                        Capacity
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-semibold uppercase">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {events.map((event) => {
                                    const info = event.getEventInformation();
                                    return (
                                        <tr key={info.id} className="border-b last:border-b-0">
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-semibold">
                                                    {info.title}
                                                </div>
                                                <div className="text-sm">
                                                    {info.description.substring(0, 60)}...
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm">
                                                    {formatDate(info.startTime)}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm">
                                                    {info.ticketsSold} sold
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm mb-1">
                                                    {info.capacity}
                                                </div>
                                                <div className="w-full border rounded h-2">
                                                    <div
                                                        className="bg-green-200 h-full rounded"
                                                        style={{
                                                            width: `${(info.ticketsSold / info.capacity) * 100}%`,
                                                        }}
                                                    />
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right text-sm">
                                                <Link
                                                    href={`/events/${info.id}`}
                                                    className="underline mr-4"
                                                >
                                                    View
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(info.id)}
                                                    className="underline"
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </main>
        </div>
    );
}
