"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useEventStore } from "../../../lib/stores/eventStore";
import { useUserStore } from "../../../lib/stores/userStore";
import { useToast } from "../components/ToastContainer";
import Navbar from "../components/Navbar";
import EventCard from "../components/EventCard";
import Link from "next/link";

export default function MyEventsPage() {
    const router = useRouter();
    const { events, fetchEventsByOrganizer, deleteEvent, isLoading, subscribeToRealtime, unsubscribeFromRealtime } = useEventStore();
    const { user, isAuthenticated } = useUserStore();
    const { showToast } = useToast();
    const [deletingEventId, setDeletingEventId] = useState<string | null>(null);

    useEffect(() => {
        if (!isAuthenticated || !user) {
            router.push("/login");
            return;
        }

        if (user.getRole() === "organizer") {
            fetchEventsByOrganizer(user.getId());
            subscribeToRealtime();

            return () => {
                unsubscribeFromRealtime();
            };
        } else {
            router.push("/dashboard");
        }
    }, [isAuthenticated, user]);

    const handleDeleteEvent = async (eventId: string) => {
        const event = events.find(e => e.getEventInformation().id === eventId);
        const eventTitle = event?.getEventInformation().title || "this event";

        if (!confirm(`Are you sure you want to delete "${eventTitle}"? This action cannot be undone.`)) {
            return;
        }

        setDeletingEventId(eventId);
        try {
            await deleteEvent(eventId);
            if (user) {
                await fetchEventsByOrganizer(user.getId());
            }
        } catch (error) {
            alert("Failed to delete event. Please try again.");
        } finally {
            setDeletingEventId(null);
        }
    };

    if (!user || user.getRole() !== "organizer") {
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
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">My Events</h1>
                    <Link href="/create-event" className="px-4 py-2 border rounded">
                        Create Event
                    </Link>
                </div>

                {isLoading && (
                    <div className="text-center py-12">
                        Loading your events...
                    </div>
                )}

                {!isLoading && events.length === 0 && (
                    <div className="text-center py-12">
                        <div className="mb-4">
                            You haven&apos;t created any events yet.
                        </div>
                        <Link
                            href="/create-event"
                            className="inline-block px-6 py-3 border rounded"
                        >
                            Create Your First Event
                        </Link>
                    </div>
                )}

                {!isLoading && events.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {events.map((event) => (
                            <EventCard
                                key={event.getEventInformation().id}
                                event={event}
                                showEditButton={true}
                                onDelete={handleDeleteEvent}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
