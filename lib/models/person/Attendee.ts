// Browse events
// purchase tickets
// receive QR code
// manage their own registrations

import { User } from "./User";

export class Attendee extends User {
    protected registration: string[];
    protected tickets: string[];
    constructor(
        name: string,
        email: string,
        id: string,
        role: string,
    ) {
        super(name, email, id, role);
        this.registration = [];
        this.tickets = [];
    }

    public addRegistration(registrationId: string): void {
        this.registration.push(registrationId);
    }

    public addTicket(ticketId: string): void {
        this.tickets.push(ticketId);
    }

    public getRegistrations(): string[] {
        return this.registration;
    }

    public getTickets(): string[] {
        return this.tickets;
    }
}
