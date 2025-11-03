export class User {
    protected name: string;
    protected email: string;
    protected id: string;
    protected role: string;

    constructor(
        name: string,
        email: string,
        id: string,
        role: string,
    ) {
        this.name = name;
        this.email = email;
        this.id = id;
        this.role = role;
    }

    public getBasicInformation() {
        return {
            name: this.name,
            email: this.email,
            id: this.id,
            role: this.role,
        };
    }

    public updateBasicInformation(name: string, email: string, role: string) {
        this.name = name;
        this.email = email;
        this.role = role;
        return {
            name: this.name,
            email: this.email,
            role: this.role,
        };
    }

    public getId(): string {
        return this.id;
    }

    public getRole(): string {
        return this.role;
    }
}
