import { create } from "zustand";
import { Registration } from "../models/event/Registration";
import { RegistrationService } from "../services/registrationService";
import { TicketType } from "../models/event/TicketType";
import { createClient } from "../../utils/supabase/client";

const supabase = createClient();

interface RegistrationState {
    registrations: Registration[];
    selectedRegistration: Registration | null;
    isLoading: boolean;
    error: string | null;

    // Actions
    fetchAllRegistrations: () => Promise<void>;
    fetchRegistrationsByAttendeeId: (attendeeId: string) => Promise<void>;
    fetchRegistrationsByEventId: (eventId: string) => Promise<void>;
    fetchRegistrationsByTicketType: (ticketType: string) => Promise<void>;
    createRegistration: (
        eventId: string,
        attendeeId: string,
        ticketType: TicketType
    ) => Promise<Registration | null>;
    updateRegistration: (
        attendeeId: string,
        updates: {
            status?: string;
            ticket_id?: string;
        }
    ) => Promise<void>;
    updateRegistrationById: (
        registrationId: string,
        updates: {
            status?: string;
            ticket_id?: string;
        }
    ) => Promise<void>;
    deleteRegistration: (attendeeId: string) => Promise<void>;
    searchRegistrations: (searchString: string) => Promise<void>;

    // Real-time subscriptions
    subscribeToRealtime: () => void;
    unsubscribeFromRealtime: () => void;
}

export const useRegistrationStore = create<RegistrationState>((set, get) => ({
    registrations: [],
    selectedRegistration: null,
    isLoading: false,
    error: null,

    // Fetch all registrations
    fetchAllRegistrations: async () => {
        set({ isLoading: true, error: null });
        try {
            const { registrations, error } = await RegistrationService.getAllRegistrations();
            if (error) throw error;

            set({
                registrations,
                isLoading: false,
                error: null,
            });
        } catch (error: unknown) {
            set({
                isLoading: false,
                error: error instanceof Error ? error.message : "Failed to fetch registrations",
            });
        }
    },

    // Fetch registrations by attendee ID
    fetchRegistrationsByAttendeeId: async (attendeeId: string) => {
        set({ isLoading: true, error: null });
        try {
            const { registrations, error } = await RegistrationService.getRegistrationByAttendeeId(attendeeId);
            if (error) throw error;

            set({
                registrations,
                isLoading: false,
                error: null,
            });
        } catch (error: unknown) {
            set({
                registrations: [],
                isLoading: false,
                error: error instanceof Error ? error.message : "Failed to fetch registration by attendee ID",
            });
        }
    },

    // Fetch registrations by event ID
    fetchRegistrationsByEventId: async (eventId: string) => {
        set({ isLoading: true, error: null });
        try {
            const { registrations, error } = await RegistrationService.getRegistrationsByEventId(eventId);
            if (error) throw error;

            set({
                registrations,
                isLoading: false,
                error: null,
            });
        } catch (error: unknown) {
            set({
                isLoading: false,
                error: error instanceof Error ? error.message : "Failed to fetch registrations by event ID",
            });
        }
    },

    // Fetch registrations by ticket type
    fetchRegistrationsByTicketType: async (ticketType: string) => {
        set({ isLoading: true, error: null });
        try {
            const { registrations, error } = await RegistrationService.getRegistrationsByTicketType(ticketType);
            if (error) throw error;

            set({
                registrations,
                isLoading: false,
                error: null,
            });
        } catch (error: unknown) {
            set({
                isLoading: false,
                error: error instanceof Error ? error.message : "Failed to fetch registrations by ticket type",
            });
        }
    },

    // Create registration
    createRegistration: async (eventId: string, attendeeId: string, ticketType: TicketType) => {
        set({ isLoading: true, error: null });
        try {
            const { registration, error } = await RegistrationService.createRegistration(
                eventId,
                attendeeId,
                ticketType,
                new Date(),
                "pending"
            );

            if (error || !registration) throw error;

            set((state) => ({
                registrations: [...state.registrations, registration],
                isLoading: false,
                error: null,
            }));

            return registration;
        } catch (error: unknown) {
            set({
                isLoading: false,
                error: error instanceof Error ? error.message : "Failed to create registration",
            });
            return null;
        }
    },

    // Update registration
    updateRegistration: async (attendeeId: string, updates: { status?: string; ticket_id?: string }) => {
        set({ isLoading: true, error: null });
        try {
            const { registration, error } = await RegistrationService.updateRegistrationByAttendeeId(
                attendeeId,
                updates
            );

            if (error || !registration) throw error;

            set((state) => ({
                registrations: state.registrations.map((reg) =>
                    reg.getAttendeeId() === attendeeId ? registration : reg
                ),
                selectedRegistration:
                    state.selectedRegistration?.getAttendeeId() === attendeeId
                        ? registration
                        : state.selectedRegistration,
                isLoading: false,
                error: null,
            }));
        } catch (error: unknown) {
            set({
                isLoading: false,
                error: error instanceof Error ? error.message : "Failed to update registration",
            });
        }
    },

    // Update registration by ID
    updateRegistrationById: async (registrationId: string, updates: { status?: string; ticket_id?: string }) => {
        set({ isLoading: true, error: null });
        try {
            const { registration, error } = await RegistrationService.updateRegistrationById(
                registrationId,
                updates
            );

            if (error || !registration) throw error;

            set((state) => ({
                registrations: state.registrations.map((reg) =>
                    reg.getId() === registrationId ? registration : reg
                ),
                selectedRegistration:
                    state.selectedRegistration?.getId() === registrationId
                        ? registration
                        : state.selectedRegistration,
                isLoading: false,
                error: null,
            }));
        } catch (error: unknown) {
            set({
                isLoading: false,
                error: error instanceof Error ? error.message : "Failed to update registration",
            });
        }
    },

    // Delete registration
    deleteRegistration: async (attendeeId: string) => {
        set({ isLoading: true, error: null });
        try {
            await RegistrationService.deleteRegistrationByAttendeeId(attendeeId);

            set((state) => ({
                registrations: state.registrations.filter((reg) =>
                    reg.getAttendeeId() !== attendeeId
                ),
                selectedRegistration:
                    state.selectedRegistration?.getAttendeeId() === attendeeId
                        ? null
                        : state.selectedRegistration,
                isLoading: false,
                error: null,
            }));
        } catch (error: unknown) {
            set({
                isLoading: false,
                error: error instanceof Error ? error.message : "Failed to delete registration",
            });
        }
    },

    // Search registrations
    searchRegistrations: async (searchString: string) => {
        set({ isLoading: true, error: null });
        try {
            const { registrations, error } = await RegistrationService.searchRegistrations(searchString);
            if (error) throw error;

            set({
                registrations,
                isLoading: false,
                error: null,
            });
        } catch (error: unknown) {
            set({
                isLoading: false,
                error: error instanceof Error ? error.message : "Failed to search registrations",
            });
        }
    },

    // Real-time subscription
    subscribeToRealtime: () => {
        const channel = supabase
            .channel("registrations-changes")
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "registrations" },
                (payload) => {
                    const { eventType, new: newRecord, old: oldRecord } = payload;

                    if (eventType === "INSERT" && newRecord) {
                        const ticketTypeEnum = TicketType[newRecord.ticket_type as keyof typeof TicketType];
                        const registration = new Registration(
                            newRecord.id,
                            newRecord.event_id,
                            newRecord.attendee_id,
                            ticketTypeEnum
                        );
                        set((state) => ({
                            registrations: [...state.registrations, registration],
                        }));
                    } else if (eventType === "UPDATE" && newRecord) {
                        const ticketTypeEnum = TicketType[newRecord.ticket_type as keyof typeof TicketType];
                        const registration = new Registration(
                            newRecord.id,
                            newRecord.event_id,
                            newRecord.attendee_id,
                            ticketTypeEnum
                        );
                        set((state) => ({
                            registrations: state.registrations.map((reg) =>
                                reg.getId() === newRecord.id ? registration : reg
                            ),
                        }));
                    } else if (eventType === "DELETE" && oldRecord) {
                        set((state) => ({
                            registrations: state.registrations.filter((reg) =>
                                reg.getId() !== oldRecord.id
                            ),
                        }));
                    }
                }
            )
            .subscribe();

        return channel;
    },

    unsubscribeFromRealtime: () => {
        supabase.channel("registrations-changes").unsubscribe();
    },
}));
