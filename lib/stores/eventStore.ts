import { create } from "zustand";
import { EventService } from "../services/eventService";
import { Event } from "../models/event/Event";
import { createClient } from "../../utils/supabase/client";

const supabase = createClient();

let globalShowToast:
    | ((
        message: string,
        type: "success" | "info" | "warning" | "error",
    ) => void)
    | null = null;

let activeChannel: ReturnType<typeof supabase.channel> | null = null;

export function setToastFunction(
    showToast: (
        message: string,
        type: "success" | "info" | "warning" | "error",
    ) => void,
) {
    globalShowToast = showToast;
}

interface EventState {
    events: Event[];
    selectedEvent: Event | null;
    isLoading: boolean;
    error: string | null;
    fetchAllEvents: () => Promise<void>;
    fetchEventById: (eventId: string) => Promise<void>;
    fetchEventsByOrganizer: (organizerId: string) => Promise<void>;
    createEvent: (
        title: string,
        description: string,
        startTime: Date,
        endTime: Date,
        organizerId: string,
        venueId: string | null,
        capacity: number,
    ) => Promise<Event | null>;
    updateEvent: (eventId: string, updates: {
        title?: string;
        description?: string;
        start_time?: Date;
        end_time?: Date;
        venue_id?: string;
        capacity?: number;
    }) => Promise<void>;
    deleteEvent: (eventId: string) => Promise<void>;
    searchEvents: (searchTerm: string) => Promise<void>;
    selectEvent: (event: Event | null) => void;
    clearError: () => void;
    subscribeToRealtime: () => void;
    unsubscribeFromRealtime: () => void;
}

export const useEventStore = create<EventState>((set, get) => ({
    events: [],
    selectedEvent: null,
    isLoading: false,
    error: null,
    fetchAllEvents: async () => {
        set({ isLoading: true, error: null });
        try {
            const { events, error } = await EventService.getAllEvents();

            if (error) throw error;

            set({
                events,
                isLoading: false,
                error: null,
            });
        } catch (error: unknown) {
            set({
                isLoading: false,
                error: error instanceof Error ? error.message : "Failed to fetch events",
            });
        }
    },
    fetchEventById: async (eventId) => {
        set({ isLoading: true, error: null });
        try {
            const { event, error } = await EventService.getEventById(eventId);

            if (error) throw error;

            set({
                selectedEvent: event,
                isLoading: false,
                error: null,
            });
        } catch (error: unknown) {
            set({
                selectedEvent: null,
                isLoading: false,
                error: error instanceof Error ? error.message : "Failed to fetch event",
            });
        }
    },
    fetchEventsByOrganizer: async (organizerId) => {
        set({ isLoading: true, error: null });
        try {
            const { events, error } = await EventService.getEventsByOrganizer(
                organizerId,
            );

            if (error) throw error;

            set({
                events,
                isLoading: false,
                error: null,
            });
        } catch (error: unknown) {
            set({
                isLoading: false,
                error: error instanceof Error ? error.message : "Failed to fetch organizer events",
            });
        }
    },
    createEvent: async (
        title,
        description,
        startTime,
        endTime,
        organizerId,
        venueId,
        capacity,
    ) => {
        set({ isLoading: true, error: null });
        try {
            const { event, error } = await EventService.createEvent(
                title,
                description,
                startTime,
                endTime,
                organizerId,
                venueId,
                capacity,
            );

            if (error || !event) throw error;

            set((state) => ({
                events: [...state.events, event],
                isLoading: false,
                error: null,
            }));

            if (globalShowToast) {
                globalShowToast(`Event created: ${title}`, "success");
            }

            return event;
        } catch (error: unknown) {
            set({
                isLoading: false,
                error: error instanceof Error ? error.message : "Failed to create event",
            });
            return null;
        }
    },
    updateEvent: async (eventId, updates) => {
        set({ isLoading: true, error: null });
        try {
            const { event, error } = await EventService.updateEvent(
                eventId,
                updates,
            );

            if (error || !event) throw error;

            const eventInfo = event.getEventInformation();

            set((state) => ({
                events: state.events.map((e) =>
                    e.getEventInformation().id === eventId ? event : e
                ),
                selectedEvent:
                    state.selectedEvent?.getEventInformation().id === eventId
                        ? event
                        : state.selectedEvent,
                isLoading: false,
                error: null,
            }));

            if (globalShowToast) {
                globalShowToast(`Event updated: ${eventInfo.title}`, "info");
            }
        } catch (error: unknown) {
            set({
                isLoading: false,
                error: error instanceof Error ? error.message : "Failed to update event",
            });
        }
    },

    deleteEvent: async (eventId) => {
        set({ isLoading: true, error: null });
        try {
            const { success, error } = await EventService.deleteEvent(eventId);

            if (error) throw error;

            set((state) => ({
                events: state.events.filter((e) =>
                    e.getEventInformation().id !== eventId
                ),
                selectedEvent:
                    state.selectedEvent?.getEventInformation().id === eventId
                        ? null
                        : state.selectedEvent,
                isLoading: false,
                error: null,
            }));

            if (globalShowToast) {
                globalShowToast(`Event deleted successfully`, "warning");
            }
        } catch (error: unknown) {
            set({
                isLoading: false,
                error: error instanceof Error ? error.message : "Failed to delete event",
            });
        }
    },
    searchEvents: async (searchTerm) => {
        set({ isLoading: true, error: null });
        try {
            const { events, error } = await EventService.searchEvents(
                searchTerm,
            );

            if (error) throw error;

            set({
                events,
                isLoading: false,
                error: null,
            });
        } catch (error: unknown) {
            set({
                isLoading: false,
                error: error instanceof Error ? error.message : "Failed to search events",
            });
        }
    },
    selectEvent: (event) => set({ selectedEvent: event }),
    clearError: () => set({ error: null }),
    subscribeToRealtime: () => {
        if (activeChannel) {
            return;
        }
        activeChannel = supabase
            .channel("events-changes")
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "events",
                },
                (payload) => {
                    const { eventType, new: newRecord, old: oldRecord } =
                        payload;

                    if (eventType === "INSERT") {
                        const event = new Event(
                            newRecord.id,
                            newRecord.title,
                            newRecord.description || "",
                            new Date(newRecord.start_time),
                            new Date(newRecord.end_time),
                            newRecord.event_organizer_id,
                            newRecord.venue_id || "",
                            newRecord.capacity,
                            newRecord.tickets_sold || 0,
                        );
                        set((state) => ({
                            events: [...state.events, event],
                        }));

                        if (globalShowToast) {
                            globalShowToast(
                                `New event created: ${newRecord.title}`,
                                "success",
                            );
                        }
                    } else if (eventType === "UPDATE") {
                        const event = new Event(
                            newRecord.id,
                            newRecord.title,
                            newRecord.description || "",
                            new Date(newRecord.start_time),
                            new Date(newRecord.end_time),
                            newRecord.event_organizer_id,
                            newRecord.venue_id || "",
                            newRecord.capacity,
                            newRecord.tickets_sold || 0,
                        );
                        set((state) => ({
                            events: state.events.map((e) =>
                                e.getEventInformation().id === newRecord.id
                                    ? event
                                    : e
                            ),
                        }));

                        if (globalShowToast) {
                            globalShowToast(
                                `Event updated: ${newRecord.title}`,
                                "info",
                            );
                        }
                    } else if (eventType === "DELETE") {
                        set((state) => ({
                            events: state.events.filter((e) =>
                                e.getEventInformation().id !== oldRecord.id
                            ),
                        }));

                        if (globalShowToast) {
                            globalShowToast(`Event deleted`, "warning");
                        }
                    }
                },
            )
            .subscribe();
    },

    unsubscribeFromRealtime: () => {
        if (activeChannel) {
            activeChannel.unsubscribe();
            activeChannel = null;
        }
    },
}));
