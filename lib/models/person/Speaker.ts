import { User } from "./User";

export class Speaker extends User {
    protected bio?: string;
    protected expertise: string[];
    protected speakingSessions: string[]; // Event IDs
    protected company?: string;
    protected website?: string;

    constructor(
        name: string,
        email: string,
        id: string,
        expertise: string[] = [],
        bio?: string,
        company?: string,
        website?: string,
    ) {
        super(name, email, id, 'speaker');
        this.expertise = expertise;
        this.bio = bio;
        this.company = company;
        this.website = website;
        this.speakingSessions = [];
    }

    // Session Management
    public addSession(eventId: string): void {
        if (!this.speakingSessions.includes(eventId)) {
            this.speakingSessions.push(eventId);
        }
    }

    public removeSession(eventId: string): void {
        this.speakingSessions = this.speakingSessions.filter(id => id !== eventId);
    }

    public getSessions(): string[] {
        return this.speakingSessions;
    }

    public getSessionCount(): number {
        return this.speakingSessions.length;
    }

    // Expertise Management
    public addExpertise(topic: string): void {
        if (!this.expertise.includes(topic)) {
            this.expertise.push(topic);
        }
    }

    public removeExpertise(topic: string): void {
        this.expertise = this.expertise.filter(e => e !== topic);
    }

    public getExpertise(): string[] {
        return this.expertise;
    }

    public hasExpertiseIn(topic: string): boolean {
        return this.expertise.includes(topic);
    }

    // Profile Management
    public updateBio(bio: string): void {
        this.bio = bio;
    }

    public updateCompany(company: string): void {
        this.company = company;
    }

    public updateWebsite(website: string): void {
        this.website = website;
    }

    public getBio(): string | undefined {
        return this.bio;
    }

    public getCompany(): string | undefined {
        return this.company;
    }

    public getWebsite(): string | undefined {
        return this.website;
    }

    // Get speaker info
    public getSpeakerInfo() {
        return {
            ...this.getBasicInformation(),
            bio: this.bio,
            expertise: this.expertise,
            sessionCount: this.getSessionCount(),
            company: this.company,
            website: this.website,
        };
    }
}
