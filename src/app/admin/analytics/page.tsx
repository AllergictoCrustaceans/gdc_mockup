"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useEventStore } from "../../../../lib/stores/eventStore";
import { useTicketStore } from "../../../../lib/stores/ticketStore";
import { useUserStore } from "../../../../lib/stores/userStore";
import Navbar from "../../components/Navbar";
import Link from "next/link";

export default function AdminAnalyticsPage() {
    const router = useRouter();
    const { events, fetchAllEvents } = useEventStore();
    const { tickets, fetchAllTickets } = useTicketStore();
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
        fetchAllTickets();
    }, [isAuthenticated, user, router, fetchAllEvents, fetchAllTickets]);

    if (!user || user.getRole() !== "administrator") {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-lg">Access Denied</div>
            </div>
        );
    }

    // Calculate stats
    const totalEvents = events.length;
    const totalTicketsSold = events.reduce((sum, event) => sum + event.getEventInformation().ticketsSold, 0);
    const totalRevenue = tickets.reduce((sum, ticket) => sum + ticket.getPrice(), 0);
    const checkedInCount = tickets.filter(t => t.isAlreadyCheckedIn()).length;

    return (
        <div className="min-h-screen">
            <Navbar />

            <main className="max-w-7xl mx-auto p-4">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
                    <Link href="/dashboard" className="px-4 py-2 border rounded">
                        Back to Dashboard
                    </Link>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div className="border rounded p-4">
                        <p className="text-sm mb-1">Total Events</p>
                        <p className="text-3xl font-bold">{totalEvents}</p>
                    </div>

                    <div className="border rounded p-4">
                        <p className="text-sm mb-1">Tickets Sold</p>
                        <p className="text-3xl font-bold">{totalTicketsSold}</p>
                    </div>

                    <div className="border rounded p-4">
                        <p className="text-sm mb-1">Total Revenue</p>
                        <p className="text-3xl font-bold">${(totalRevenue / 100).toFixed(2)}</p>
                    </div>

                    <div className="border rounded p-4">
                        <p className="text-sm mb-1">Checked In</p>
                        <p className="text-3xl font-bold">{checkedInCount}</p>
                    </div>
                </div>

                {/* Event Performance */}
                <div className="border rounded p-6">
                    <h2 className="text-xl font-semibold mb-4">Event Performance</h2>
                    <div className="space-y-4">
                        {events.slice(0, 5).map((event) => {
                            const info = event.getEventInformation();
                            const percentage = (info.ticketsSold / info.capacity) * 100;
                            return (
                                <div key={info.id} className="border-b pb-4 last:border-b-0">
                                    <div className="flex justify-between items-center mb-2">
                                        <h3 className="font-semibold">{info.title}</h3>
                                        <span className="text-sm">
                                            {info.ticketsSold} / {info.capacity} tickets
                                        </span>
                                    </div>
                                    <div className="w-full border rounded h-2">
                                        <div
                                            className="bg-green-200 h-full rounded"
                                            style={{ width: `${percentage}%` }}
                                        />
                                    </div>
                                    <p className="text-xs mt-1">{percentage.toFixed(1)}% sold</p>
                                </div>
                            );
                        })}
                        {events.length === 0 && (
                            <p className="text-center py-4">No events to display</p>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
