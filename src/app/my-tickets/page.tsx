"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTicketStore } from "../../../lib/stores/ticketStore";
import { useEventStore } from "../../../lib/stores/eventStore";
import { useUserStore } from "../../../lib/stores/userStore";
import { QRCodeSVG } from "qrcode.react";
import Navbar from "../components/Navbar";
import TicketCard from "../components/TicketCard";
import Link from "next/link";

// TODO: Refactor-- page is getting long
function MyTicketsContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const newTicketId = searchParams.get("new");
    const selectedTicketId = searchParams.get("selected");

    const { tickets, fetchTicketsByAttendeeId, checkInTicket, isLoading, subscribeToRealtime, unsubscribeFromRealtime } = useTicketStore();
    const { events, fetchAllEvents } = useEventStore();
    const { user, isAuthenticated } = useUserStore();

    const [selectedTicket, setSelectedTicket] = useState<string | null>(null);
    const [scanning, setScanning] = useState(false);
    const [scanMessage, setScanMessage] = useState("");

    useEffect(() => {
        if (!isAuthenticated || !user) {
            router.push("/login");
            return;
        }

        fetchTicketsByAttendeeId(user.getId());
        fetchAllEvents();
        subscribeToRealtime();

        return () => {
            unsubscribeFromRealtime();
        };
    }, [isAuthenticated, user, router, fetchTicketsByAttendeeId, fetchAllEvents, subscribeToRealtime, unsubscribeFromRealtime]);

    useEffect(() => {
        const ticketId = newTicketId || selectedTicketId;
        if (ticketId) {
            setSelectedTicket(ticketId);
        }
    }, [newTicketId, selectedTicketId]);

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                Loading...
            </div>
        );
    }

    const selectedTicketObj = tickets.find((t) => t.getId() === selectedTicket);
    const selectedEvent = selectedTicketObj
        ? events.find((e) => e.getEventInformation().id === selectedTicketObj.getEventId())
        : null;

    const handleScanTicket = async () => {
        if (!selectedTicketObj) return;

        if (selectedTicketObj.isAlreadyCheckedIn()) {
            setScanMessage("This ticket has already been scanned!");
            setTimeout(() => setScanMessage(""), 3000);
            return;
        }

        setScanning(true);
        setScanMessage("");

        try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            await checkInTicket(selectedTicketObj.getId());

            setScanMessage("Ticket scanned successfully! Welcome to the event.");

            if (user) {
                await fetchTicketsByAttendeeId(user.getId());
            }

            setTimeout(() => setScanMessage(""), 5000);
        } catch (error: any) {
            setScanMessage("Scan failed: " + (error.message || "Unknown error"));
            setTimeout(() => setScanMessage(""), 5000);
        } finally {
            setScanning(false);
        }
    };

    const formatDate = (date: Date | undefined) => {
        if (!date) return "N/A";
        return new Intl.DateTimeFormat("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit",
        }).format(date);
    };

    return (
        <div className="min-h-screen">
            <Navbar />

            <div className="max-w-7xl mx-auto p-4">
                <h1 className="text-2xl font-bold mb-6">My Tickets</h1>

                {isLoading && (
                    <div className="text-center py-12">
                        Loading tickets...
                    </div>
                )}

                {!isLoading && tickets.length === 0 && (
                    <div className="text-center py-12">
                        <div className="mb-4">You don&apos;t have any tickets yet.</div>
                        <Link
                            href="/events"
                            className="inline-block px-6 py-3 border rounded"
                        >
                            Browse Events
                        </Link>
                    </div>
                )}

                {!isLoading && tickets.length > 0 && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-1">
                            <h2 className="text-lg font-semibold mb-4">Your Tickets ({tickets.length})</h2>
                            <div className="space-y-3">
                                {tickets.map((ticket) => {
                                    const event = events.find((e) => e.getEventInformation().id === ticket.getEventId());
                                    const eventTitle = event?.getEventInformation().title;

                                    return (
                                        // TODO: Turn into a reusable component? 
                                        <div
                                            key={ticket.getId()}
                                            onClick={() => setSelectedTicket(ticket.getId())}
                                            className={`cursor-pointer ${selectedTicket === ticket.getId()
                                                ? "ring-2 ring-blue-500"
                                                : ""
                                                }`}
                                        >
                                            <TicketCard ticket={ticket} eventTitle={eventTitle} />
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="lg:col-span-2">
                            {selectedTicketObj && selectedEvent ? (
                                // TODO: Definitely turn into a separate component
                                <div className="border rounded p-6">
                                    <h2 className="text-xl font-bold mb-2">
                                        {selectedEvent.getEventInformation().title}
                                    </h2>
                                    <p className="text-sm mb-6">
                                        {formatDate(selectedEvent.getEventInformation().startTime)}
                                    </p>

                                    <div className="flex justify-center mb-6">
                                        <div className="p-4 border rounded">
                                            <QRCodeSVG
                                                value={selectedTicketObj.getQRCode()}
                                                size={200}
                                                level="H"
                                                includeMargin={true}
                                            />
                                        </div>
                                    </div>

                                    <div className="text-center mb-6">
                                        <p className="text-xs font-mono break-all">
                                            {selectedTicketObj.getId()}
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 mb-6">
                                        <div className="border rounded p-3">
                                            <p className="text-xs mb-1">Type</p>
                                            <p className="text-sm font-semibold">
                                                {selectedTicketObj.getTicketInfo().ticketType}
                                            </p>
                                        </div>
                                        <div className="border rounded p-3">
                                            <p className="text-xs mb-1">Price</p>
                                            <p className="text-sm font-semibold">
                                                ${(selectedTicketObj.getPrice() / 100).toFixed(2)}
                                            </p>
                                        </div>
                                        <div className="border rounded p-3">
                                            <p className="text-xs mb-1">Status</p>
                                            <p className="text-sm font-semibold">
                                                {selectedTicketObj.getTicketInfo().isCheckedIn
                                                    ? "Checked In"
                                                    : "Valid"}
                                            </p>
                                        </div>
                                        <div className="border rounded p-3">
                                            <p className="text-xs mb-1">Purchased</p>
                                            <p className="text-sm font-semibold">
                                                {formatDate(selectedTicketObj.getCreatedAt())}
                                            </p>
                                        </div>
                                    </div>

                                    {selectedTicketObj.isAlreadyCheckedIn() && selectedTicketObj.getCheckedInAt() && (
                                        <div className="border rounded p-3 mb-4">
                                            <p className="text-sm">
                                                Checked in at {formatDate(selectedTicketObj.getCheckedInAt()!)}
                                            </p>
                                        </div>
                                    )}

                                    {!selectedTicketObj.isAlreadyCheckedIn() && (
                                        <div className="border rounded p-3 mb-4">
                                            <p className="text-sm">
                                                Click &quot;Scan Ticket&quot; below to simulate check-in at event entrance
                                            </p>
                                        </div>
                                    )}

                                    {scanMessage && (
                                        <div className="mb-4 rounded p-3 border">
                                            <p className="text-sm">{scanMessage}</p>
                                        </div>
                                    )}

                                    {!selectedTicketObj.isAlreadyCheckedIn() && (
                                        <button
                                            onClick={handleScanTicket}
                                            disabled={scanning}
                                            className="w-full px-4 py-3 border rounded disabled:opacity-50 mb-3"
                                        >
                                            {scanning ? "Scanning..." : "Scan Ticket (Demo Check-In)"}
                                        </button>
                                    )}

                                    <button
                                        onClick={() => window.print()}
                                        className="w-full px-4 py-3 border rounded"
                                    >
                                        Print Ticket
                                    </button>
                                </div>
                            ) : (
                                <div className="border rounded p-12 text-center">
                                    <p>Select a ticket to view details</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function MyTicketsPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                Loading...
            </div>
        }>
            <MyTicketsContent />
        </Suspense>
    );
}
