import { TicketType } from "./TicketType";

export class Registration {
    protected id: string;
    protected eventId: string;
    protected attendeeId: string; // References a User
    protected ticketType: TicketType;
    protected registeredAt: Date;
    protected status: "pending" | "confirmed" | "cancelled";
    protected ticketId?: string; // Link to ticket once generated

    constructor(
        id: string,
        eventId: string,
        attendeeId: string,
        ticketType: TicketType,
        registeredAt?: Date,
        status: "pending" | "confirmed" | "cancelled" = "pending",
        ticketId?: string
    ) {
        this.id = id;
        this.eventId = eventId;
        this.attendeeId = attendeeId;
        this.ticketType = ticketType;
        this.registeredAt = registeredAt || new Date();
        this.status = status;
        this.ticketId = ticketId;
    }

    // Status Management
    public confirm(): void {
        this.status = "confirmed";
    }

    public cancel(): void {
        this.status = "cancelled";
    }

    public getStatus(): string {
        return this.status;
    }

    public isPending(): boolean {
        return this.status === "pending";
    }

    public isConfirmed(): boolean {
        return this.status === "confirmed";
    }

    public isCancelled(): boolean {
        return this.status === "cancelled";
    }

    // Ticket Management
    public assignTicket(ticketId: string): void {
        this.ticketId = ticketId;
    }

    public getTicketId(): string | undefined {
        return this.ticketId;
    }

    // Getters
    public getId(): string {
        return this.id;
    }

    public getEventId(): string {
        return this.eventId;
    }

    public getAttendeeId(): string {
        return this.attendeeId;
    }

    public getTicketType(): TicketType {
        return this.ticketType;
    }

    public getRegisteredAt(): Date {
        return this.registeredAt;
    }

    public getRegistrationInfo() {
        return {
            id: this.id,
            eventId: this.eventId,
            attendeeId: this.attendeeId,
            ticketType: this.ticketType,
            status: this.status,
            registeredAt: this.registeredAt,
            ticketId: this.ticketId,
        };
    }
}
