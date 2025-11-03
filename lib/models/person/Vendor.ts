import { User } from "./User";

export type Product = {
    id: string;
    productName: string;
    productPrice: number;
    productQuantity: number;
    description?: string;
};

export class Vendor extends User {
    protected vendorLocation: string;
    protected products: Product[];
    protected eventsParticipating: string[]; // Event IDs
    protected companyName?: string;

    constructor(
        name: string,
        email: string,
        id: string,
        vendorLocation: string,
        companyName?: string,
    ) {
        super(name, email, id, 'vendor');
        this.vendorLocation = vendorLocation;
        this.companyName = companyName;
        this.products = [];
        this.eventsParticipating = [];
    }

    // Product Management
    public addProduct(product: Product): void {
        this.products.push(product);
    }

    public removeProduct(productId: string): void {
        this.products = this.products.filter(p => p.id !== productId);
    }

    public updateProduct(productId: string, updates: Partial<Product>): void {
        this.products = this.products.map(p =>
            p.id === productId ? { ...p, ...updates } : p
        );
    }

    public getProducts(): Product[] {
        return this.products;
    }

    public getProduct(productId: string): Product | undefined {
        return this.products.find(p => p.id === productId);
    }

    public getProductCount(): number {
        return this.products.length;
    }

    // Event Participation
    public addEvent(eventId: string): void {
        if (!this.eventsParticipating.includes(eventId)) {
            this.eventsParticipating.push(eventId);
        }
    }

    public removeEvent(eventId: string): void {
        this.eventsParticipating = this.eventsParticipating.filter(id => id !== eventId);
    }

    public getEvents(): string[] {
        return this.eventsParticipating;
    }

    // Location & Company
    public getVendorLocation(): string {
        return this.vendorLocation;
    }

    public updateVendorLocation(location: string): void {
        this.vendorLocation = location;
    }

    public getCompanyName(): string | undefined {
        return this.companyName;
    }

    public updateCompanyName(companyName: string): void {
        this.companyName = companyName;
    }

    // Get vendor information
    public getVendorInformation() {
        return {
            ...this.getBasicInformation(),
            vendorLocation: this.vendorLocation,
            companyName: this.companyName,
            products: this.products,
            productCount: this.getProductCount(),
            eventsParticipating: this.eventsParticipating,
        };
    }
}
