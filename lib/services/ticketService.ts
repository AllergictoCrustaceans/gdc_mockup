import { Database } from "../types/database.types";
import { createClient } from "../../utils/supabase/client";
import { Ticket } from "../models/event/Ticket";
import { TicketType } from "../models/event/TicketType";
import { displayError } from "../../utils/errorHandler";

const supabase = createClient();

export type TicketRow = Database["public"]["Tables"]["tickets"]["Row"];
export type TicketUpdate = Database["public"]["Tables"]["tickets"]["Update"];
export type TicketInsert = Database["public"]["Tables"]["tickets"]["Insert"];
export class TicketService {
    static async createTicket(
        eventId: string,
        attendeeId: string,
        ticketType: TicketType,
        price: number,
    ) {
        try {
            const qrCodeData = this.generateQRCode(eventId, attendeeId);

            const ticketData: TicketInsert = {
                attendee_id: attendeeId,
                event_id: eventId,
                ticket_type: TicketType[ticketType],
                price: price,
                is_checked_in: false,
                status: "active",
                qr_code: qrCodeData,
            };

            const { data, error } = await supabase
                .from("tickets")
                .insert(ticketData)
                .select()
                .single();

            if (error) throw error;
            if (!data) throw new Error("No data returned from insert.");

            const ticketTypeEnum =
                TicketType[data.ticket_type as keyof typeof TicketType];

            const ticket = new Ticket(
                data.id,
                data.event_id,
                data.attendee_id,
                ticketTypeEnum,
                data.price,
                data.qr_code,
                data.is_checked_in ?? undefined,
                data.checked_in_at ? new Date(data.checked_in_at) : undefined,
                data.created_at ? new Date(data.created_at) : undefined,
                data.status as "active" | "cancelled" | "refunded",
            );
            return { ticket, error: null };
        } catch (error) {
            console.error("Error insert ticket.", error);
            return {
                ticket: null,
                error: displayError(error, "Failed to create ticket"),
            };
        }
    }

    static async getTicketByTicketId(ticketId: string) {
        try {
            const { data, error } = await supabase
                .from("tickets")
                .select("*")
                .eq("id", ticketId)
                .single();

            if (error) throw error;
            if (!data) {
                throw new Error(
                    `Cannot fetch ticket by ID: ${ticketId}`,
                );
            }

            const ticketTypeEnum =
                TicketType[data.ticket_type as keyof typeof TicketType];

            const ticket = new Ticket(
                data.id,
                data.event_id,
                data.attendee_id,
                ticketTypeEnum,
                data.price,
                data.qr_code,
                data.is_checked_in ?? undefined,
                data.checked_in_at ? new Date(data.checked_in_at) : undefined,
                data.created_at ? new Date(data.created_at) : undefined,
                data.status as "active" | "cancelled" | "refunded",
            );

            return { ticket, error: null };
        } catch (error) {
            console.error("Failed to fetch ticket by ticket ID:", error);
            return {
                ticket: null,
                error: displayError(error, "Failed to fetch ticket"),
            };
        }
    }

    static async getTickets() {
        try {
            const { data, error } = await supabase
                .from("tickets")
                .select("*")
                .order("created_at", { ascending: true });

            if (error) throw error;

            const tickets = data.map((row: TicketRow) => {
                const ticketTypeEnum =
                    TicketType[row.ticket_type as keyof typeof TicketType];
                return new Ticket(
                    row.id,
                    row.event_id,
                    row.attendee_id,
                    ticketTypeEnum,
                    row.price,
                    row.qr_code,
                    row.is_checked_in ?? undefined,
                    row.checked_in_at ? new Date(row.checked_in_at) : undefined,
                    row.created_at ? new Date(row.created_at) : undefined,
                    row.status as "active" | "cancelled" | "refunded",
                );
            });
            return { tickets: tickets, error: null };
        } catch (error) {
            console.error(`Error fetching all tickets`, error);
            return {
                tickets: [],
                error: displayError(error, "Failed to fetch tickets"),
            };
        }
    }

    static async updateTicket(
        ticketId: string,
        updates: {
            status?: "active" | "cancelled" | "refunded";
            is_checked_in?: boolean;
        },
    ) {
        try {
            const dbUpdates: TicketUpdate = {};

            if (updates.status !== undefined) {
                dbUpdates.status = updates.status;
            }
            if (updates.is_checked_in !== undefined) {
                dbUpdates.is_checked_in = updates.is_checked_in;
            }

            const { data, error } = await supabase
                .from("tickets")
                .update(dbUpdates)
                .eq("id", ticketId)
                .select()
                .single();

            if (error) throw error;
            if (!data) throw new Error("No data returned from update");

            const ticketTypeEnum =
                TicketType[data.ticket_type as keyof typeof TicketType];

            const ticket = new Ticket(
                data.id,
                data.event_id,
                data.attendee_id,
                ticketTypeEnum,
                data.price,
                data.qr_code,
                data.is_checked_in ?? undefined,
                data.checked_in_at ? new Date(data.checked_in_at) : undefined,
                data.created_at ? new Date(data.created_at) : undefined,
                data.status as "active" | "cancelled" | "refunded",
            );

            return { ticket, error: null };
        } catch (error) {
            console.error("Error updating ticket:", error);
            return {
                ticket: null,
                error: displayError(error, "Failed to update ticket"),
            };
        }
    }

    static async deleteTicketByTicketId(ticketId: string) {
        try {
            const { error } = await supabase
                .from("tickets")
                .delete()
                .eq("ticket_id", ticketId);

            if (error) throw error;

            return { success: true, error: null };
        } catch (error) {
            console.error(
                `Error deleting ticket with ticket ID: ${ticketId}`,
            );
            return {
                success: false,
                error: displayError(error, "Failed to delete ticket"),
            };
        }
    }

    static async searchByTicketType(searchString: string) {
        try {
            const { data, error } = await supabase
                .from("tickets")
                .select("*")
                .or(`ticket_type.ilike.%${searchString}%`)
                .order("created_at", { ascending: true });
            if (error) throw error;

            const tickets = data.map((row: TicketRow) => {
                const ticketTypeEnum =
                    TicketType[row.ticket_type as keyof typeof TicketType];
                return new Ticket(
                    row.id,
                    row.event_id,
                    row.attendee_id,
                    ticketTypeEnum,
                    row.price,
                    row.qr_code,
                    row.is_checked_in ?? undefined,
                    row.checked_in_at ? new Date(row.checked_in_at) : undefined,
                    row.created_at ? new Date(row.created_at) : undefined,
                    row.status as "active" | "cancelled" | "refunded",
                );
            });

            return { tickets: tickets, error: null };
        } catch (error) {
            console.error(`Error searching up ticket(s)`, error);
            return {
                tickets: [],
                error: displayError(error, "Failed to search tickets"),
            };
        }
    }

    static generateQRCode(eventId: string, attendeeId: string): string {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 15);
        return `TICKET-${eventId}-${attendeeId}-${timestamp}-${random}`;
    }

    static async validateQRCode(qrCodeData: string) {
        try {
            const { data, error } = await supabase
                .from("tickets")
                .select("*")
                .eq("qr_code", qrCodeData)
                .single();

            if (error) throw error;
            if (!data) throw new Error("Invalid QR code");

            const ticketTypeEnum =
                TicketType[data.ticket_type as keyof typeof TicketType];

            const ticket = new Ticket(
                data.id,
                data.event_id,
                data.attendee_id,
                ticketTypeEnum,
                data.price,
                data.qr_code,
                data.is_checked_in ?? undefined,
                data.checked_in_at ? new Date(data.checked_in_at) : undefined,
                data.created_at ? new Date(data.created_at) : undefined,
                data.status as "active" | "cancelled" | "refunded",
            );

            return { ticket, valid: true, error: null };
        } catch (error) {
            console.error("QR code validation failed:", error);
            return {
                ticket: null,
                valid: false,
                error: displayError(error, "Invalid QR code"),
            };
        }
    }

    static async checkInTicket(ticketId: string) {
        try {
            const { data, error } = await supabase
                .from("tickets")
                .update({
                    is_checked_in: true,
                    // Status remains 'active' after check-in
                    // Only changes to 'cancelled' or 'refunded' for those actions
                })
                .eq("id", ticketId)
                .select()
                .single();

            if (error) throw error;

            return { success: true, error: null };
        } catch (error) {
            console.error("Error checking in ticket:", error);
            return {
                success: false,
                error: displayError(error, "Failed to check in ticket"),
            };
        }
    }
}
