import { createClient } from "../../utils/supabase/client";
import { Event } from "../models/event/Event";
import type { Database } from "../types/database.types";
import { ClientFacingError, displayError } from "../../utils/errorHandler";

type EventRow = Database["public"]["Tables"]["events"]["Row"];
type EventInsert = Database["public"]["Tables"]["events"]["Insert"];
type EventUpdate = Database["public"]["Tables"]["events"]["Update"];

const supabase = createClient();

export class EventService {
    static async createEvent(
        title: string,
        description: string,
        startTime: Date,
        endTime: Date,
        organizerId: string,
        venueId: string | null,
        capacity: number,
    ) {
        try {
            const eventData: EventInsert = {
                title,
                description,
                start_time: startTime.toISOString(),
                end_time: endTime.toISOString(),
                event_organizer_id: organizerId,
                venue_id: venueId,
                capacity,
                tickets_sold: 0,
            };

            const { data, error } = await supabase
                .from("events")
                .insert(eventData)
                .select()
                .single();

            if (error) throw error;
            if (!data) throw new Error("No data returned from insert");

            const event = new Event(
                data.id,
                data.title,
                data.description || "",
                new Date(data.start_time),
                new Date(data.end_time),
                data.event_organizer_id,
                data.venue_id || "",
                data.capacity,
                data.tickets_sold || 0,
            );

            return { event, error: null };
        } catch (error) {
            console.error("Error creating event:", error);
            return {
                event: null,
                error: displayError(error, "Failed to create event"),
            };
        }
    }
    static async getEventById(eventId: string) {
        try {
            const { data, error } = await supabase
                .from("events")
                .select("*")
                .eq("id", eventId)
                .single();

            if (error) throw error;
            if (!data) throw new Error("Event not found");

            const event = new Event(
                data.id,
                data.title,
                data.description || "",
                new Date(data.start_time),
                new Date(data.end_time),
                data.event_organizer_id,
                data.venue_id || "",
                data.capacity,
                data.tickets_sold || 0,
            );

            return { event, error: null };
        } catch (error) {
            console.error("Error fetching event:", error);
            return {
                event: null,
                error: displayError(error, "Failed to fetch event"),
            };
        }
    }
    static async getAllEvents() {
        try {
            const { data, error } = await supabase
                .from("events")
                .select("*")
                .order("start_time", { ascending: true });

            if (error) throw error;

            const events = data.map((row: EventRow) =>
                new Event(
                    row.id,
                    row.title,
                    row.description || "",
                    new Date(row.start_time),
                    new Date(row.end_time),
                    row.event_organizer_id,
                    row.venue_id || "",
                    row.capacity,
                    row.tickets_sold || 0,
                )
            );

            return { events, error: null };
        } catch (error) {
            console.error("Error fetching events:", error);
            return {
                events: [],
                error: displayError(error, "Failed to fetch events"),
            };
        }
    }
    static async getEventsByOrganizer(organizerId: string) {
        try {
            const { data, error } = await supabase
                .from("events")
                .select("*")
                .eq("event_organizer_id", organizerId)
                .order("start_time", { ascending: true });

            if (error) throw error;

            const events = data.map((row: EventRow) =>
                new Event(
                    row.id,
                    row.title,
                    row.description || "",
                    new Date(row.start_time),
                    new Date(row.end_time),
                    row.event_organizer_id,
                    row.venue_id || "",
                    row.capacity,
                    row.tickets_sold || 0,
                )
            );

            return { events, error: null };
        } catch (error) {
            console.error("Error fetching organizer events:", error);
            return {
                events: [],
                error: displayError(error, "Failed to fetch organizer events"),
            };
        }
    }
    static async updateEvent(
        eventId: string,
        updates: {
            title?: string;
            description?: string;
            start_time?: Date;
            end_time?: Date;
            venue_id?: string;
            capacity?: number;
        },
    ) {
        try {
            const dbUpdates: EventUpdate = {};

            if (updates.title !== undefined) dbUpdates.title = updates.title;
            if (updates.description !== undefined) {
                dbUpdates.description = updates.description;
            }
            if (updates.start_time) {
                dbUpdates.start_time = updates.start_time.toISOString();
            }
            if (updates.end_time) {
                dbUpdates.end_time = updates.end_time.toISOString();
            }
            if (updates.venue_id !== undefined) {
                dbUpdates.venue_id = updates.venue_id;
            }
            if (updates.capacity !== undefined) {
                dbUpdates.capacity = updates.capacity;
            }

            const { data, error } = await supabase
                .from("events")
                .update(dbUpdates)
                .eq("id", eventId)
                .select()
                .single();

            if (error) throw error;
            if (!data) throw new Error("No data returned from update");

            const event = new Event(
                data.id,
                data.title,
                data.description || "",
                new Date(data.start_time),
                new Date(data.end_time),
                data.event_organizer_id,
                data.venue_id || "",
                data.capacity,
                data.tickets_sold || 0,
            );

            return { event, error: null };
        } catch (error) {
            console.error("Error updating event:", error);
            return {
                event: null,
                error: displayError(error, "Failed to update event"),
            };
        }
    }
    static async deleteEvent(eventId: string) {
        try {
            const { error } = await supabase
                .from("events")
                .delete()
                .eq("id", eventId);

            if (error) throw error;

            return { success: true, error: null };
        } catch (error) {
            console.error("Error deleting event:", error);
            return {
                success: false,
                error: displayError(error, "Failed to delete event"),
            };
        }
    }
    static async incrementTicketsSold(eventId: string) {
        try {
            // Get current event
            const { event, error: fetchError } = await this.getEventById(
                eventId,
            );
            if (fetchError || !event) throw fetchError;

            if (event.isSoldOut()) {
                throw new ClientFacingError("Event is sold out!");
            }

            const { data: currentData, error: fetchDbError } = await supabase
                .from("events")
                .select("tickets_sold")
                .eq("id", eventId)
                .single();

            if (fetchDbError) throw fetchDbError;
            if (!currentData) throw new Error("Event not found");

            const updateData: EventUpdate = {
                tickets_sold: (currentData.tickets_sold || 0) + 1,
            };

            const { error } = await supabase
                .from("events")
                .update(updateData)
                .eq("id", eventId);

            if (error) throw error;

            return { success: true, error: null };
        } catch (error) {
            console.error("Error incrementing tickets:", error);
            return {
                success: false,
                error: displayError(error, "Failed to increment tickets"),
            };
        }
    }
    static async searchEvents(searchTerm: string) {
        try {
            const { data, error } = await supabase
                .from("events")
                .select("*")
                .or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
                .order("start_time", { ascending: true });

            if (error) throw error;

            const events = data.map((row: EventRow) =>
                new Event(
                    row.id,
                    row.title,
                    row.description || "",
                    new Date(row.start_time),
                    new Date(row.end_time),
                    row.event_organizer_id,
                    row.venue_id || "",
                    row.capacity,
                    row.tickets_sold || 0,
                )
            );

            return { events, error: null };
        } catch (error) {
            console.error("Error searching events:", error);
            return {
                events: [],
                error: displayError(error, "Failed to search events"),
            };
        }
    }
}
