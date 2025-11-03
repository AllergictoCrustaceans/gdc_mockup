import { Ticket } from "../../../lib/models/event/Ticket";
import { TicketType } from "../../../lib/models/event/TicketType";

interface TicketCardProps {
    ticket: Ticket;
    eventTitle?: string;
}

export default function TicketCard({ ticket, eventTitle }: TicketCardProps) {
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

    const formatPrice = (price: number) => {
        return `$${(price / 100).toFixed(2)}`;
    };

    const getTicketTypeName = (type: TicketType) => {
        return TicketType[type];
    };

    return (
        <div className="border rounded p-4">
            <div className="flex justify-between items-start mb-3">
                <div>
                    <h3 className="text-lg font-semibold">
                        Ticket #{ticket.getId().slice(0, 8)}
                    </h3>
                    {eventTitle && (
                        <p className="text-sm mb-1">for {eventTitle}</p>
                    )}
                    <p className="text-sm">Type: {getTicketTypeName(ticket.getTicketType())}</p>
                </div>
                <span className={`text-sm px-2 py-1 border rounded ${ticket.isAlreadyCheckedIn() ? "bg-green-50" : ""}`}>
                    {ticket.isAlreadyCheckedIn() ? "Checked In" : ticket.getStatus()}
                </span>
            </div>

            <div className="text-sm mb-3">
                <div>Price: {formatPrice(ticket.getPrice())}</div>
                <div>Created: {formatDate(ticket.getCreatedAt())}</div>
                {ticket.getCheckedInAt() && (
                    <div>Checked In: {formatDate(ticket.getCheckedInAt())}</div>
                )}
            </div>

            <div className="border-t pt-3">
                <p className="text-xs font-mono break-all">QR: {ticket.getQRCode()}</p>
            </div>
        </div>
    );
}
