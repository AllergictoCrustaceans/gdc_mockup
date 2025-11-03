import { Analytics } from "./Analytics";

export type ReportType = 'sales' | 'attendance' | 'revenue' | 'comprehensive';
export type ReportFormat = 'json' | 'csv' | 'pdf';

export interface ReportData {
    [key: string]: string | number | Date | Record<string, number>;
}

export class Report {
    protected id: string;
    protected eventId: string;
    protected type: ReportType;
    protected generatedAt: Date;
    protected data: ReportData;

    constructor(id: string, eventId: string, type: ReportType) {
        this.id = id;
        this.eventId = eventId;
        this.type = type;
        this.generatedAt = new Date();
        this.data = {};
    }

    // Generate report from analytics
    public generateFromAnalytics(analytics: Analytics): void {
        const summary = analytics.getAnalyticsSummary();

        switch (this.type) {
            case 'sales':
                this.data = {
                    totalTicketsSold: summary.totalTicketsSold,
                    ticketTypeBreakdown: summary.ticketTypeBreakdown,
                    averageTicketPrice: summary.formattedAverageTicketPrice,
                };
                break;
            case 'attendance':
                this.data = {
                    totalAttendees: summary.totalAttendees,
                    checkedInCount: summary.checkedInCount,
                    attendanceRate: summary.formattedAttendanceRate,
                    remainingAttendees: summary.remainingAttendees,
                };
                break;
            case 'revenue':
                this.data = {
                    totalRevenue: summary.formattedRevenue,
                    revenueByTicketType: summary.revenueByTicketType,
                    averageTicketPrice: summary.formattedAverageTicketPrice,
                };
                break;
            case 'comprehensive':
                this.data = summary;
                break;
        }
    }

    // Export report in different formats
    public exportAsJSON(): string {
        return JSON.stringify({
            reportId: this.id,
            eventId: this.eventId,
            type: this.type,
            generatedAt: this.generatedAt,
            data: this.data,
        }, null, 2);
    }

    public exportAsCSV(): string {
        if (!this.data) return '';

        const headers = Object.keys(this.data).join(',');
        const values = Object.values(this.data).join(',');
        return `${headers}\n${values}`;
    }

    // Getters
    public getId(): string {
        return this.id;
    }

    public getEventId(): string {
        return this.eventId;
    }

    public getType(): ReportType {
        return this.type;
    }

    public getGeneratedAt(): Date {
        return this.generatedAt;
    }

    public getData(): ReportData {
        return this.data;
    }

    public getReportInfo() {
        return {
            id: this.id,
            eventId: this.eventId,
            type: this.type,
            generatedAt: this.generatedAt,
            data: this.data,
        };
    }
}
