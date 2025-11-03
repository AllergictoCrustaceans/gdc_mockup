import Link from "next/link";
import { Event } from "../../../lib/models/event/Event";

interface EventCardProps {
    event: Event;
    showEditButton?: boolean;
    onEdit?: (eventId: string) => void;
    onDelete?: (eventId: string) => void;
}

export default function EventCard({ event, showEditButton = false, onEdit, onDelete }: EventCardProps) {
    const info = event.getEventInformation();
    const availableTickets = info.capacity - info.ticketsSold;
    const isSoldOut = availableTickets <= 0;

    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit",
        }).format(date);
    };

    return (
        <div className="border rounded p-4">
            <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold">{info.title}</h3>
                {isSoldOut && <span className="text-sm px-2 py-1 border rounded">SOLD OUT</span>}
            </div>

            <p className="text-sm mb-3 line-clamp-2">{info.description}</p>

            <div className="text-sm mb-3">
                <div>Date: {formatDate(info.startTime)}</div>
                <div>
                    {availableTickets} / {info.capacity} tickets available
                </div>
            </div>

            <div className="flex gap-2">
                {showEditButton ? (
                    <>
                        <Link
                            href={`/create-event?edit=${info.id}`}
                            className="px-3 py-2 border rounded text-sm"
                        >
                            Edit
                        </Link>
                        {onDelete && (
                            <button
                                onClick={() => onDelete(info.id)}
                                className="px-3 py-2 border rounded text-sm"
                            >
                                Delete
                            </button>
                        )}
                    </>
                ) : (
                    <Link
                        href={`/events/${info.id}`}
                        className={`px-3 py-2 border rounded text-sm ${isSoldOut ? "opacity-50" : ""}`}
                    >
                        {isSoldOut ? "Sold Out" : "View Details"}
                    </Link>
                )}
            </div>
        </div>
    );
}
