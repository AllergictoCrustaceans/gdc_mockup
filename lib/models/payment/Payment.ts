export class Payment {
    protected id: string;
    protected amount: number;
    protected currency: string;
    protected attendeeId: string;
    protected eventId: string;
    protected ticketIds: string[];
    protected paymentMethod: "card" | "cash" | "other";
    protected status: "pending" | "processing" | "completed" | "failed" | "refunded";
    protected stripePaymentIntentId?: string;
    protected createdAt: Date;
    protected completedAt?: Date;

    constructor(
        id: string,
        amount: number,
        currency: string,
        attendeeId: string,
        eventId: string,
        ticketIds: string[],
        paymentMethod: "card" | "cash" | "other",
        status: "pending" | "processing" | "completed" | "failed" | "refunded" = "pending",
        stripePaymentIntentId?: string,
        createdAt?: Date,
        completedAt?: Date
    ) {
        this.id = id;
        this.amount = amount;
        this.currency = currency;
        this.attendeeId = attendeeId;
        this.eventId = eventId;
        this.ticketIds = ticketIds;
        this.paymentMethod = paymentMethod;
        this.status = status;
        this.stripePaymentIntentId = stripePaymentIntentId;
        this.createdAt = createdAt || new Date();
        this.completedAt = completedAt;
    }

    public getId(): string {
        return this.id;
    }

    public getAmount(): number {
        return this.amount;
    }

    public getCurrency(): string {
        return this.currency;
    }

    public getAttendeeId(): string {
        return this.attendeeId;
    }

    public getEventId(): string {
        return this.eventId;
    }

    public getTicketIds(): string[] {
        return this.ticketIds;
    }

    public getPaymentMethod(): "card" | "cash" | "other" {
        return this.paymentMethod;
    }

    public getStatus(): "pending" | "processing" | "completed" | "failed" | "refunded" {
        return this.status;
    }

    public getStripePaymentIntentId(): string | undefined {
        return this.stripePaymentIntentId;
    }

    public getCreatedAt(): Date {
        return this.createdAt;
    }

    public getCompletedAt(): Date | undefined {
        return this.completedAt;
    }

    public setStatus(status: "pending" | "processing" | "completed" | "failed" | "refunded"): void {
        this.status = status;
    }

    public setCompletedAt(date: Date): void {
        this.completedAt = date;
    }

    public setStripePaymentIntentId(id: string): void {
        this.stripePaymentIntentId = id;
    }

    public getPaymentInfo() {
        return {
            id: this.id,
            amount: this.amount,
            currency: this.currency,
            attendeeId: this.attendeeId,
            eventId: this.eventId,
            ticketIds: this.ticketIds,
            paymentMethod: this.paymentMethod,
            status: this.status,
            stripePaymentIntentId: this.stripePaymentIntentId,
            createdAt: this.createdAt,
            completedAt: this.completedAt,
        };
    }
}