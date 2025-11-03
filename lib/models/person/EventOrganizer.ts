// CRUD Events
// CRUD Ticket Types and pricing
// CRUD Venue details
// CRUD schedules
// CRUD Speakers/performers

import { User } from "./User";

export class EventOrganizer extends User {
    protected companyName?: string;
    protected eventsManaging: string[]; // Store event IDs
    protected venuesManaging: string[]; // Store venue IDs

    constructor(
        name: string,
        email: string,
        id: string,
        companyName?: string,
    ) {
        super(name, email, id, "organizer");
        this.companyName = companyName;
        this.eventsManaging = [];
        this.venuesManaging = [];
    }

    // Event Management Methods
    public addEvent(eventId: string): void {
        if (!this.eventsManaging.includes(eventId)) {
            this.eventsManaging.push(eventId);
        }
    }

    public removeEvent(eventId: string): void {
        this.eventsManaging = this.eventsManaging.filter((id) =>
            id !== eventId
        );
    }

    public getEvents(): string[] {
        return this.eventsManaging;
    }

    public getEventCount(): number {
        return this.eventsManaging.length;
    }

    // Venue Management Methods
    public addVenue(venueId: string): void {
        if (!this.venuesManaging.includes(venueId)) {
            this.venuesManaging.push(venueId);
        }
    }

    public removeVenue(venueId: string): void {
        this.venuesManaging = this.venuesManaging.filter(id => id !== venueId);
    }

    public getVenues(): string[] {
        return this.venuesManaging;
    }

    // Company Info Methods
    public getCompanyName(): string | undefined {
        return this.companyName;
    }

    public updateCompanyName(companyName: string): void {
        this.companyName = companyName;
    }

    // Get organizer info including company
    public getOrganizerInfo() {
        return {
            ...this.getBasicInformation(),
            companyName: this.companyName,
            eventCount: this.eventsManaging.length,
            venueCount: this.venuesManaging.length,
        };
    }
}
