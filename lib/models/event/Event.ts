// display live notifications for schedue changes
// display important announcements with push notifications and email alerts
// display venue upatess

export class Event {
    protected id: string;
    protected title: string;
    protected description: string;
    protected startTime: Date;
    protected endTime: Date;
    protected eventOrganizerId: string;
    protected venueId: string;
    protected capacity: number;
    protected ticketsSold: number;

    constructor(
        id: string,
        title: string,
        description: string,
        startTime: Date,
        endTime: Date,
        eventOrganizerId: string,
        venueId: string,
        capacity: number,
        ticketsSold: number,
    ) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.startTime = startTime;
        this.endTime = endTime;
        this.eventOrganizerId = eventOrganizerId;
        this.venueId = venueId;
        this.capacity = capacity;
        this.ticketsSold = ticketsSold;
    }

    public isSoldOut(): boolean {
        return this.ticketsSold >= this.capacity;
    }

    public getCurrentCapacity(): number {
        return this.capacity - this.ticketsSold;
    }

    public canRegister(): boolean {
        return !this.isSoldOut() && this.startTime > new Date();
    }

    public getEventOrganizer() {
        return this.eventOrganizerId;
    }

    public getVenue() {
        return this.venueId;
    }

    public getEventInformation() {
        return {
            id: this.id,
            title: this.title,
            description: this.description,
            startTime: this.startTime,
            endTime: this.endTime,
            eventOrganizerId: this.eventOrganizerId,
            venueId: this.venueId,
            capacity: this.capacity,
            ticketsSold: this.ticketsSold,
        };
    }

    public getLatestSchedule() {
    }

    public getLatestUpdates(update: string) {
        return update;
    }
}
