"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useEventStore } from "../../../../lib/stores/eventStore";
import { useRegistrationStore } from "../../../../lib/stores/registrationStore";
import { useUserStore } from "../../../../lib/stores/userStore";
import { TicketType } from "../../../../lib/models/event/TicketType";
import { PaymentService } from "../../../../lib/services/paymentService";
import { TicketService } from "../../../../lib/services/ticketService";
import Navbar from "../../components/Navbar";
import Link from "next/link";

export default function EventDetailPage() {
    const params = useParams();
    const router = useRouter();
    const eventId = params.id as string;

    const { selectedEvent, fetchEventById, isLoading: eventLoading } = useEventStore();
    const { registrations, createRegistration, updateRegistrationById, fetchRegistrationsByAttendeeId, isLoading: registrationLoading } = useRegistrationStore();
    const { user, isAuthenticated } = useUserStore();

    const [selectedTicketType, setSelectedTicketType] = useState<TicketType>(TicketType.core);
    const [registrationError, setRegistrationError] = useState("");
    const [registrationSuccess, setRegistrationSuccess] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [isAlreadyRegistered, setIsAlreadyRegistered] = useState(false);

    useEffect(() => {
        fetchEventById(eventId);
    }, [eventId]);

    useEffect(() => {
        if (user) {
            fetchRegistrationsByAttendeeId(user.getId());
        }
    }, [user]);

    useEffect(() => {
        if (registrations && eventId) {
            const existingRegistration = registrations.find(
                (reg) => reg.getEventId() === eventId
            );
            setIsAlreadyRegistered(!!existingRegistration);
        }
    }, [registrations, eventId]);

    const event = selectedEvent;

    const getTicketPrice = (ticketType: TicketType) => {
        const prices: Record<number, number> = {
            0: 5000,
            1: 2500,
            2: 3000,
            3: 2000,
            4: 1500,
            5: 7500,
            6: 10000,
        };
        return prices[ticketType as number] || 1500;
    };

    const handleRegister = async () => {
        setRegistrationError("");
        setRegistrationSuccess(false);
        setProcessing(true);

        if (!isAuthenticated || !user) {
            router.push("/login");
            return;
        }

        try {
            const registration = await createRegistration(
                eventId,
                user.getId(),
                selectedTicketType
            );

            if (!registration) {
                throw new Error("Failed to create registration");
            }

            const price = getTicketPrice(selectedTicketType);
            const { payment, error: paymentError } = await PaymentService.mockPayment(
                eventId,
                user.getId(),
                price,
                []
            );

            if (paymentError || !payment) {
                throw new Error("Payment processing failed");
            }

            const { ticket, error: ticketError } = await TicketService.createTicket(
                eventId,
                user.getId(),
                selectedTicketType,
                price
            );

            if (ticketError || !ticket) {
                throw new Error("Failed to generate ticket");
            }

            await updateRegistrationById(registration.getId(), {
                status: "confirmed",
                ticket_id: ticket.getId(),
            });

            setRegistrationSuccess(true);

            setTimeout(() => {
                router.push(`/my-tickets?new=${ticket.getId()}`);
            }, 2000);
        } catch (err: any) {
            setRegistrationError(err.message || "Registration failed");
        } finally {
            setProcessing(false);
        }
    };

    if (eventLoading) {
        return (
            <div className="min-h-screen">
                <Navbar />
                <div className="max-w-7xl mx-auto p-4 text-center py-12">
                    Loading event details...
                </div>
            </div>
        );
    }

    if (!event) {
        return (
            <div className="min-h-screen">
                <Navbar />
                <div className="max-w-7xl mx-auto p-4 text-center py-12">
                    <h2 className="text-xl font-bold mb-4">Event Not Found</h2>
                    <Link href="/events" className="px-4 py-2 border rounded">
                        Back to Events
                    </Link>
                </div>
            </div>
        );
    }

    const info = event.getEventInformation();
    const availableTickets = info.capacity - info.ticketsSold;
    const isSoldOut = availableTickets <= 0;

    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit",
        }).format(date);
    };

    return (
        <div className="min-h-screen">
            <Navbar />

            <main className="max-w-7xl mx-auto p-4">
                <div className="mb-4">
                    <Link href="/events" className="px-3 py-2 border rounded text-sm">
                        Back to Events
                    </Link>
                </div>

                <div className="border rounded p-6 mb-6">
                    <div className="flex justify-between items-start mb-4">
                        <h1 className="text-3xl font-bold">
                            {info.title}
                        </h1>
                        {isSoldOut && (
                            <span className="text-sm px-3 py-1 border rounded">
                                SOLD OUT
                            </span>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="border rounded p-4">
                            <h2 className="text-xl font-semibold mb-3">About This Event</h2>
                            <p className="text-sm">{info.description}</p>
                        </div>

                        <div className="border rounded p-4">
                            <h2 className="text-xl font-semibold mb-3">Date & Time</h2>
                            <div className="space-y-2 text-sm">
                                <div>
                                    <span className="font-semibold">Starts:</span> {formatDate(info.startTime)}
                                </div>
                                <div>
                                    <span className="font-semibold">Ends:</span> {formatDate(info.endTime)}
                                </div>
                            </div>
                        </div>

                        <div className="border rounded p-4">
                            <h2 className="text-xl font-semibold mb-3">Availability</h2>
                            <div className="mb-2 text-sm">
                                <span>
                                    {availableTickets} of {info.capacity} tickets remaining
                                </span>
                            </div>
                            <div className="w-full border rounded h-2">
                                <div
                                    className="bg-green-200 h-full rounded"
                                    style={{
                                        width: `${(info.ticketsSold / info.capacity) * 100}%`,
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                    {!isSoldOut && (

                        <div className="lg:col-span-1">
                            <div className="border rounded p-4">
                                <h2 className="text-xl font-semibold mb-4">Register for This Event</h2>

                                {isAlreadyRegistered && !registrationSuccess ? (
                                    <div className="border rounded p-3 mb-4 text-sm">
                                        <p className="mb-2">You&apos;re already registered for this event!</p>
                                        <Link href="/my-registrations" className="text-sm underline">
                                            View your registrations
                                        </Link>
                                    </div>
                                ) : (
                                    <>
                                        {/* Ticket Type */}
                                        <div className="mb-4">
                                            <label className="block text-sm mb-2 font-semibold">
                                                Select Ticket Type
                                            </label>
                                            <select
                                                value={selectedTicketType}
                                                onChange={(e) => setSelectedTicketType(Number(e.target.value) as TicketType)}
                                                disabled={isAlreadyRegistered}
                                                className="w-full px-3 py-2 border rounded"
                                            >
                                                <option value={TicketType.allAccess}>All Access - ${(getTicketPrice(TicketType.allAccess) / 100).toFixed(2)}</option>
                                                <option value={TicketType.core}>Core - ${(getTicketPrice(TicketType.core) / 100).toFixed(2)}</option>
                                                <option value={TicketType.exhibitor}>Exhibitor - ${(getTicketPrice(TicketType.exhibitor) / 100).toFixed(2)}</option>
                                                <option value={TicketType.speaker}>Speaker - ${(getTicketPrice(TicketType.speaker) / 100).toFixed(2)}</option>
                                                <option value={TicketType.vendor}>Vendor - ${(getTicketPrice(TicketType.vendor) / 100).toFixed(2)}</option>
                                                <option value={TicketType.eventOrganizer}>Event Organizer - ${(getTicketPrice(TicketType.eventOrganizer) / 100).toFixed(2)}</option>
                                                <option value={TicketType.administrator}>Administrator - ${(getTicketPrice(TicketType.administrator) / 100).toFixed(2)}</option>
                                            </select>
                                        </div>

                                        {registrationSuccess && (
                                            <div className="mb-4 p-3 border border-green-500 rounded text-sm">
                                                Registration successful! Payment processed. Redirecting to your ticket...
                                            </div>
                                        )}

                                        {registrationError && (
                                            <div className="mb-4 p-3 border border-red-500 rounded text-sm">
                                                {registrationError}
                                            </div>
                                        )}

                                        <button
                                            onClick={handleRegister}
                                            disabled={processing || registrationSuccess || isAlreadyRegistered}
                                            className="w-full px-4 py-3 border rounded disabled:opacity-50 mb-3"
                                        >
                                            {processing
                                                ? "Processing Registration & Payment..."
                                                : registrationSuccess
                                                    ? "Registration Complete!"
                                                    : "Register Now"}
                                        </button>

                                        {!isAuthenticated && (
                                            <p className="text-xs text-center">
                                                You&apos;ll be redirected to log in
                                            </p>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
