"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useRegistrationStore } from "../../../lib/stores/registrationStore";
import { useEventStore } from "../../../lib/stores/eventStore";
import { useUserStore } from "../../../lib/stores/userStore";
import Navbar from "../components/Navbar";
import RegistrationCard from "../components/RegistrationCard";
import Link from "next/link";

export default function MyRegistrationsPage() {
    const router = useRouter();
    const { registrations, fetchRegistrationsByAttendeeId, isLoading } = useRegistrationStore();
    const { events, fetchAllEvents } = useEventStore();
    const { user, isAuthenticated } = useUserStore();

    useEffect(() => {
        if (!isAuthenticated || !user) {
            router.push("/login");
            return;
        }

        fetchRegistrationsByAttendeeId(user.getId());
        fetchAllEvents();
    }, [isAuthenticated, user]);

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
                <h1 className="text-2xl font-bold mb-6">My Registrations</h1>

                {isLoading && (
                    <div className="text-center py-12">
                        Loading registrations...
                    </div>
                )}

                {!isLoading && registrations.length === 0 && (
                    <div className="text-center py-12">
                        <div className="mb-4">
                            You haven&apos;t registered for any events yet.
                        </div>
                        <Link
                            href="/events"
                            className="inline-block px-6 py-3 border rounded"
                        >
                            Browse Events
                        </Link>
                    </div>
                )}

                {!isLoading && registrations.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {registrations.map((registration) => {
                            const regInfo = registration.getRegistrationInfo();
                            const event = events.find((e) => e.getEventInformation().id === regInfo.eventId);
                            const eventTitle = event?.getEventInformation().title;

                            return (
                                <RegistrationCard
                                    key={registration.getId()}
                                    registration={registration}
                                    eventTitle={eventTitle}
                                />
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
