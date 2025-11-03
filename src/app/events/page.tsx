"use client";

import { useEffect, useState } from "react";
import { useEventStore } from "../../../lib/stores/eventStore";
import Navbar from "../components/Navbar";
import EventCard from "../components/EventCard";

export default function EventsPage() {
    const { events, fetchAllEvents, isLoading, subscribeToRealtime, unsubscribeFromRealtime } = useEventStore();
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        fetchAllEvents();
        subscribeToRealtime();
        return () => {
            unsubscribeFromRealtime();
        };
    }, []);

    const filteredEvents = events.filter((event) => {
        const info = event.getEventInformation();
        const query = searchQuery.toLowerCase();
        return (
            info.title.toLowerCase().includes(query) ||
            info.description.toLowerCase().includes(query)
        );
    });

    return (
        <div className="min-h-screen">
            <Navbar />

            <div className="max-w-7xl mx-auto p-4">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold mb-4">Browse Events</h1>
                    <input
                        type="text"
                        placeholder="Search events..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full px-3 py-2 border rounded"
                    />
                </div>

                {isLoading && (
                    <div className="text-center py-12">
                        Loading events...
                    </div>
                )}

                {!isLoading && filteredEvents.length === 0 && (
                    <div className="text-center py-12">
                        {searchQuery ? "No events found matching your search." : "No events available yet."}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredEvents.map((event) => (
                        <EventCard key={event.getEventInformation().id} event={event} />
                    ))}
                </div>
            </div>
        </div>
    );
}
