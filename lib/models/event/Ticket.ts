import { TicketType } from "./TicketType";

export class Ticket {
    protected id: string;
    protected eventId: string;
    protected attendeeId: string;
    protected ticketType: TicketType;
    protected price: number;
    protected qrCode: string;
    protected isCheckedIn: boolean;
    protected checkedInAt?: Date;
    protected createdAt: Date;
    protected status: 'active' | 'cancelled' | 'refunded';

    constructor(
        id: string,
        eventId: string,
        attendeeId: string,
        ticketType: TicketType,
        price: number,
        qrCode: string,
        isCheckedIn: boolean = false,
        checkedInAt?: Date,
        createdAt?: Date,
        status: 'active' | 'cancelled' | 'refunded' = 'active'
    ) {
        this.id = id;
        this.eventId = eventId;
        this.attendeeId = attendeeId;
        this.ticketType = ticketType;
        this.price = price;
        this.qrCode = qrCode;
        this.isCheckedIn = isCheckedIn;
        this.checkedInAt = checkedInAt;
        this.createdAt = createdAt || new Date();
        this.status = status;
    }

    // Check-in Management
    public checkIn(): { success: boolean; message: string } {
        if (this.status !== 'active') {
            return {
                success: false,
                message: `Cannot check in: ticket is ${this.status}`,
            };
        }

        if (this.isCheckedIn) {
            return {
                success: false,
                message: 'Ticket already checked in',
            };
        }

        this.isCheckedIn = true;
        this.checkedInAt = new Date();
        return {
            success: true,
            message: 'Check-in successful!',
        };
    }

    public isAlreadyCheckedIn(): boolean {
        return this.isCheckedIn;
    }

    // Status Management
    public cancel(): void {
        this.status = 'cancelled';
    }

    public refund(): void {
        this.status = 'refunded';
    }

    public isActive(): boolean {
        return this.status === 'active';
    }

    public getStatus(): string {
        return this.status;
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

    public getPrice(): number {
        return this.price;
    }

    public getQRCode(): string {
        return this.qrCode;
    }

    public getCheckedInAt(): Date | undefined {
        return this.checkedInAt;
    }

    public getCreatedAt(): Date {
        return this.createdAt;
    }

    // Validation
    public isValid(): boolean {
        return this.status === 'active' && !this.isCheckedIn;
    }

    public canBeRefunded(): boolean {
        return this.status === 'active' && !this.isCheckedIn;
    }

    // Get ticket information
    public getTicketInfo() {
        return {
            id: this.id,
            eventId: this.eventId,
            attendeeId: this.attendeeId,
            ticketType: this.ticketType,
            price: this.price,
            qrCode: this.qrCode,
            isCheckedIn: this.isCheckedIn,
            checkedInAt: this.checkedInAt,
            createdAt: this.createdAt,
            status: this.status,
        };
    }
}
