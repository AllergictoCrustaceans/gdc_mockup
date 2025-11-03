export class Transaction {
    protected id: string;
    protected paymentId: string;
    protected amount: number;
    protected type: 'charge' | 'refund';
    protected status: 'pending' | 'completed' | 'failed';
    protected timestamp: Date;
    protected metadata?: Record<string, any>;

    constructor(
        id: string,
        paymentId: string,
        amount: number,
        type: 'charge' | 'refund' = 'charge',
    ) {
        this.id = id;
        this.paymentId = paymentId;
        this.amount = amount;
        this.type = type;
        this.status = 'pending';
        this.timestamp = new Date();
    }

    // Status Management
    public complete(): void {
        this.status = 'completed';
    }

    public fail(): void {
        this.status = 'failed';
    }

    // Metadata Management
    public addMetadata(key: string, value: any): void {
        if (!this.metadata) {
            this.metadata = {};
        }
        this.metadata[key] = value;
    }

    public getMetadata(key: string): any {
        return this.metadata?.[key];
    }

    // Getters
    public getId(): string {
        return this.id;
    }

    public getPaymentId(): string {
        return this.paymentId;
    }

    public getAmount(): number {
        return this.amount;
    }

    public getType(): string {
        return this.type;
    }

    public getStatus(): string {
        return this.status;
    }

    public getTimestamp(): Date {
        return this.timestamp;
    }

    // Status Checks
    public isPending(): boolean {
        return this.status === 'pending';
    }

    public isCompleted(): boolean {
        return this.status === 'completed';
    }

    public isFailed(): boolean {
        return this.status === 'failed';
    }

    public isCharge(): boolean {
        return this.type === 'charge';
    }

    public isRefund(): boolean {
        return this.type === 'refund';
    }

    // Get transaction information
    public getTransactionInfo() {
        return {
            id: this.id,
            paymentId: this.paymentId,
            amount: this.amount,
            type: this.type,
            status: this.status,
            timestamp: this.timestamp,
            metadata: this.metadata,
        };
    }
}
