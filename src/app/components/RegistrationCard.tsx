import { Registration } from "../../../lib/models/event/Registration";
import { TicketType } from "../../../lib/models/event/TicketType";
import Link from "next/link";

interface RegistrationCardProps {
    registration: Registration;
    eventTitle?: string;
}

export default function RegistrationCard({ registration, eventTitle }: RegistrationCardProps) {
    const regInfo = registration.getRegistrationInfo();

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

    const getTicketTypeName = (type: TicketType) => {
        return TicketType[type];
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "confirmed":
                return "bg-green-50";
            case "pending":
                return "bg-yellow-50";
            case "cancelled":
                return "bg-red-50";
            default:
                return "";
        }
    };

    return (
        <div className="border rounded p-4">
            <div className="flex justify-between items-start mb-3">
                <div>
                    <h3 className="text-lg font-semibold">
                        {eventTitle || `Event ID: ${regInfo.eventId.slice(0, 8)}`}
                    </h3>
                    <p className="text-sm">Type: {getTicketTypeName(regInfo.ticketType)}</p>
                </div>
                <span className={`text-sm px-2 py-1 border rounded ${getStatusColor(regInfo.status)}`}>
                    {regInfo.status}
                </span>
            </div>

            <div className="text-sm mb-3">
                <div>Registered: {formatDate(regInfo.registeredAt)}</div>
                {regInfo.ticketId && (
                    <div>Ticket ID: {regInfo.ticketId.slice(0, 8)}</div>
                )}
            </div>

            <div className="flex gap-2">
                <Link
                    href={`/events/${regInfo.eventId}`}
                    className="px-3 py-2 border rounded text-sm"
                >
                    View Event
                </Link>
                {regInfo.ticketId && (
                    <Link
                        href={`/my-tickets?selected=${regInfo.ticketId}`}
                        className="px-3 py-2 border rounded text-sm"
                    >
                        View Ticket
                    </Link>
                )}
            </div>
        </div>
    );
}
