import { create } from "zustand";
import { Ticket } from "../models/event/Ticket";
import { TicketService } from "../services/ticketService";
import { TicketType } from "../models/event/TicketType";
import { createClient } from "../../utils/supabase/client";

const supabase = createClient();

interface TicketState {
    tickets: Ticket[];
    selectedTicket: Ticket | null;
    isLoading: boolean;
    error: string | null;

    // Actions
    fetchAllTickets: () => Promise<void>;
    fetchTicketById: (ticketId: string) => Promise<void>;
    fetchTicketsByAttendeeId: (attendeeId: string) => Promise<void>;
    fetchTicketsByEventId: (eventId: string) => Promise<void>;
    createTicket: (
        eventId: string,
        attendeeId: string,
        ticketType: TicketType,
        price: number
    ) => Promise<Ticket | null>;
    updateTicket: (
        ticketId: string,
        updates: {
            status?: "active" | "cancelled" | "refunded";
            is_checked_in?: boolean;
        }
    ) => Promise<void>;
    checkInTicket: (ticketId: string) => Promise<void>;
    deleteTicket: (ticketId: string) => Promise<void>;
    searchTicketsByType: (searchString: string) => Promise<void>;
    validateQRCode: (qrCode: string) => Promise<Ticket | null>;

    // Real-time subscriptions
    subscribeToRealtime: () => void;
    unsubscribeFromRealtime: () => void;
}

export const useTicketStore = create<TicketState>((set, get) => ({
    tickets: [],
    selectedTicket: null,
    isLoading: false,
    error: null,

    // Fetch all tickets
    fetchAllTickets: async () => {
        set({ isLoading: true, error: null });
        try {
            const { tickets, error } = await TicketService.getTickets();
            if (error) throw error;

            set({
                tickets,
                isLoading: false,
                error: null,
            });
        } catch (error: unknown) {
            set({
                isLoading: false,
                error: error instanceof Error ? error.message : "Failed to fetch tickets",
            });
        }
    },

    // Fetch ticket by ID
    fetchTicketById: async (ticketId: string) => {
        set({ isLoading: true, error: null });
        try {
            const { ticket, error } = await TicketService.getTicketByTicketId(ticketId);
            if (error) throw error;

            set({
                selectedTicket: ticket,
                isLoading: false,
                error: null,
            });
        } catch (error: unknown) {
            set({
                selectedTicket: null,
                isLoading: false,
                error: error instanceof Error ? error.message : "Failed to fetch ticket",
            });
        }
    },

    // Fetch tickets by attendee ID
    fetchTicketsByAttendeeId: async (attendeeId: string) => {
        set({ isLoading: true, error: null });
        try {
            // For now, fetch all and filter (you can add this method to service later)
            const { tickets, error } = await TicketService.getTickets();
            if (error) throw error;

            const filtered = tickets.filter(t => t.getAttendeeId() === attendeeId);

            set({
                tickets: filtered,
                isLoading: false,
                error: null,
            });
        } catch (error: unknown) {
            set({
                isLoading: false,
                error: error instanceof Error ? error.message : "Failed to fetch tickets by attendee",
            });
        }
    },

    // Fetch tickets by event ID
    fetchTicketsByEventId: async (eventId: string) => {
        set({ isLoading: true, error: null });
        try {
            // For now, fetch all and filter (you can add this method to service later)
            const { tickets, error } = await TicketService.getTickets();
            if (error) throw error;

            const filtered = tickets.filter(t => t.getEventId() === eventId);

            set({
                tickets: filtered,
                isLoading: false,
                error: null,
            });
        } catch (error: unknown) {
            set({
                isLoading: false,
                error: error instanceof Error ? error.message : "Failed to fetch tickets by event",
            });
        }
    },

    // Create ticket
    createTicket: async (eventId: string, attendeeId: string, ticketType: TicketType, price: number) => {
        set({ isLoading: true, error: null });
        try {
            const { ticket, error } = await TicketService.createTicket(
                eventId,
                attendeeId,
                ticketType,
                price
            );

            if (error || !ticket) throw error;

            set((state) => ({
                tickets: [...state.tickets, ticket],
                isLoading: false,
                error: null,
            }));

            return ticket;
        } catch (error: unknown) {
            set({
                isLoading: false,
                error: error instanceof Error ? error.message : "Failed to create ticket",
            });
            return null;
        }
    },

    // Update ticket
    updateTicket: async (ticketId: string, updates: { status?: "active" | "cancelled" | "refunded"; is_checked_in?: boolean }) => {
        set({ isLoading: true, error: null });
        try {
            const { ticket, error } = await TicketService.updateTicket(ticketId, updates);
            if (error || !ticket) throw error;

            set((state) => ({
                tickets: state.tickets.map((t) =>
                    t.getId() === ticketId ? ticket : t
                ),
                selectedTicket:
                    state.selectedTicket?.getId() === ticketId
                        ? ticket
                        : state.selectedTicket,
                isLoading: false,
                error: null,
            }));
        } catch (error: unknown) {
            set({
                isLoading: false,
                error: error instanceof Error ? error.message : "Failed to update ticket",
            });
        }
    },

    // Check in ticket
    checkInTicket: async (ticketId: string) => {
        set({ isLoading: true, error: null });
        try {
            const { success, error } = await TicketService.checkInTicket(ticketId);
            if (error || !success) throw error;

            // Refresh the ticket after check-in
            const { ticket, error: fetchError } = await TicketService.getTicketByTicketId(ticketId);
            if (fetchError) throw fetchError;

            if (ticket) {
                set((state) => ({
                    tickets: state.tickets.map((t) =>
                        t.getId() === ticketId ? ticket : t
                    ),
                    selectedTicket:
                        state.selectedTicket?.getId() === ticketId
                            ? ticket
                            : state.selectedTicket,
                    isLoading: false,
                    error: null,
                }));
            }
        } catch (error: unknown) {
            set({
                isLoading: false,
                error: error instanceof Error ? error.message : "Failed to check in ticket",
            });
            throw error;
        }
    },

    // Delete ticket
    deleteTicket: async (ticketId: string) => {
        set({ isLoading: true, error: null });
        try {
            const result = await TicketService.deleteTicketByTicketId(ticketId);
            if (result && result.error) throw result.error;

            set((state) => ({
                tickets: state.tickets.filter((t) => t.getId() !== ticketId),
                selectedTicket:
                    state.selectedTicket?.getId() === ticketId
                        ? null
                        : state.selectedTicket,
                isLoading: false,
                error: null,
            }));
        } catch (error: unknown) {
            set({
                isLoading: false,
                error: error instanceof Error ? error.message : "Failed to delete ticket",
            });
        }
    },

    // Search tickets by type
    searchTicketsByType: async (searchString: string) => {
        set({ isLoading: true, error: null });
        try {
            const { tickets, error } = await TicketService.searchByTicketType(searchString);
            if (error) throw error;

            set({
                tickets,
                isLoading: false,
                error: null,
            });
        } catch (error: unknown) {
            set({
                isLoading: false,
                error: error instanceof Error ? error.message : "Failed to search tickets",
            });
        }
    },

    // Validate QR code
    validateQRCode: async (qrCode: string) => {
        set({ isLoading: true, error: null });
        try {
            const { ticket, valid, error } = await TicketService.validateQRCode(qrCode);
            if (error || !valid || !ticket) throw error;

            set({
                selectedTicket: ticket,
                isLoading: false,
                error: null,
            });

            return ticket;
        } catch (error: unknown) {
            set({
                isLoading: false,
                error: error instanceof Error ? error.message : "Invalid QR code",
            });
            return null;
        }
    },

    // Real-time subscription
    subscribeToRealtime: () => {
        const channel = supabase
            .channel("tickets-changes")
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "tickets" },
                (payload) => {
                    const { eventType, new: newRecord, old: oldRecord } = payload;

                    if (eventType === "INSERT" && newRecord) {
                        const ticketTypeEnum = TicketType[newRecord.ticket_type as keyof typeof TicketType];
                        const ticket = new Ticket(
                            newRecord.id,
                            newRecord.event_id,
                            newRecord.attendee_id,
                            ticketTypeEnum,
                            newRecord.price,
                            newRecord.qr_code,
                            newRecord.is_checked_in,
                            newRecord.checked_in_at ? new Date(newRecord.checked_in_at) : undefined,
                            newRecord.created_at ? new Date(newRecord.created_at) : undefined,
                            newRecord.status
                        );
                        set((state) => ({
                            tickets: [...state.tickets, ticket],
                        }));
                    } else if (eventType === "UPDATE" && newRecord) {
                        const ticketTypeEnum = TicketType[newRecord.ticket_type as keyof typeof TicketType];
                        const ticket = new Ticket(
                            newRecord.id,
                            newRecord.event_id,
                            newRecord.attendee_id,
                            ticketTypeEnum,
                            newRecord.price,
                            newRecord.qr_code,
                            newRecord.is_checked_in,
                            newRecord.checked_in_at ? new Date(newRecord.checked_in_at) : undefined,
                            newRecord.created_at ? new Date(newRecord.created_at) : undefined,
                            newRecord.status
                        );
                        set((state) => ({
                            tickets: state.tickets.map((t) =>
                                t.getId() === newRecord.id ? ticket : t
                            ),
                        }));
                    } else if (eventType === "DELETE" && oldRecord) {
                        set((state) => ({
                            tickets: state.tickets.filter((t) =>
                                t.getId() !== oldRecord.id
                            ),
                        }));
                    }
                }
            )
            .subscribe();

        return channel;
    },

    unsubscribeFromRealtime: () => {
        supabase.channel("tickets-changes").unsubscribe();
    },
}));