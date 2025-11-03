// display ticket sales, attendance patterns, revenue tracking, post-event feedback, exportable reports

export interface AnalyticsData {
    totalTicketsSold: number;
    totalRevenue: number;
    totalAttendees: number;
    checkedInCount: number;
    attendanceRate: number;
    ticketTypeBreakdown: Record<string, number>;
    revenueByTicketType: Record<string, number>;
}

export class Analytics {
    protected eventId: string;
    protected data: AnalyticsData;
    protected lastUpdated: Date;

    constructor(eventId: string) {
        this.eventId = eventId;
        this.data = {
            totalTicketsSold: 0,
            totalRevenue: 0,
            totalAttendees: 0,
            checkedInCount: 0,
            attendanceRate: 0,
            ticketTypeBreakdown: {},
            revenueByTicketType: {},
        };
        this.lastUpdated = new Date();
    }

    // Update Analytics Data
    public updateData(data: Partial<AnalyticsData>): void {
        this.data = { ...this.data, ...data };
        this.lastUpdated = new Date();
    }

    public updateTicketSales(count: number): void {
        this.data.totalTicketsSold = count;
        this.lastUpdated = new Date();
    }

    public updateRevenue(amount: number): void {
        this.data.totalRevenue = amount;
        this.lastUpdated = new Date();
    }

    public updateAttendance(checkedIn: number, total: number): void {
        this.data.checkedInCount = checkedIn;
        this.data.totalAttendees = total;
        this.data.attendanceRate = total > 0 ? (checkedIn / total) * 100 : 0;
        this.lastUpdated = new Date();
    }

    public updateTicketTypeBreakdown(breakdown: Record<string, number>): void {
        this.data.ticketTypeBreakdown = breakdown;
        this.lastUpdated = new Date();
    }

    public updateRevenueByTicketType(revenue: Record<string, number>): void {
        this.data.revenueByTicketType = revenue;
        this.lastUpdated = new Date();
    }

    // Getters
    public getEventId(): string {
        return this.eventId;
    }

    public getTotalTicketsSold(): number {
        return this.data.totalTicketsSold;
    }

    public getTotalRevenue(): number {
        return this.data.totalRevenue;
    }

    public getFormattedRevenue(): string {
        return `$${(this.data.totalRevenue / 100).toFixed(2)}`;
    }

    public getCheckedInCount(): number {
        return this.data.checkedInCount;
    }

    public getAttendanceRate(): number {
        return this.data.attendanceRate;
    }

    public getFormattedAttendanceRate(): string {
        return `${this.data.attendanceRate.toFixed(1)}%`;
    }

    public getTicketTypeBreakdown(): Record<string, number> {
        return this.data.ticketTypeBreakdown;
    }

    public getRevenueByTicketType(): Record<string, number> {
        return this.data.revenueByTicketType;
    }

    public getLastUpdated(): Date {
        return this.lastUpdated;
    }

    // Calculations
    public calculateAverageTicketPrice(): number {
        if (this.data.totalTicketsSold === 0) return 0;
        return this.data.totalRevenue / this.data.totalTicketsSold;
    }

    public getFormattedAverageTicketPrice(): string {
        return `$${(this.calculateAverageTicketPrice() / 100).toFixed(2)}`;
    }

    public getRemainingAttendees(): number {
        return this.data.totalAttendees - this.data.checkedInCount;
    }

    // Export Analytics
    public exportToJSON(): string {
        return JSON.stringify({
            eventId: this.eventId,
            analytics: this.data,
            averageTicketPrice: this.calculateAverageTicketPrice(),
            lastUpdated: this.lastUpdated,
        }, null, 2);
    }

    public getAnalyticsSummary() {
        return {
            eventId: this.eventId,
            totalTicketsSold: this.data.totalTicketsSold,
            totalRevenue: this.data.totalRevenue,
            formattedRevenue: this.getFormattedRevenue(),
            checkedInCount: this.data.checkedInCount,
            totalAttendees: this.data.totalAttendees,
            attendanceRate: this.data.attendanceRate,
            formattedAttendanceRate: this.getFormattedAttendanceRate(),
            averageTicketPrice: this.calculateAverageTicketPrice(),
            formattedAverageTicketPrice: this.getFormattedAverageTicketPrice(),
            remainingAttendees: this.getRemainingAttendees(),
            ticketTypeBreakdown: this.data.ticketTypeBreakdown,
            revenueByTicketType: this.data.revenueByTicketType,
            lastUpdated: this.lastUpdated,
        };
    }
}
