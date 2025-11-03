import { createClient } from "../../utils/supabase/client";
import { Registration } from "../models/event/Registration";
import { TicketType } from "../models/event/TicketType";
import type { Database } from "../types/database.types";
import { displayError } from "../../utils/errorHandler";

export type RegistrationRow =
    Database["public"]["Tables"]["registrations"]["Row"];
export type RegistrationInsert =
    Database["public"]["Tables"]["registrations"]["Insert"];
export type RegistrationUpdate =
    Database["public"]["Tables"]["registrations"]["Update"];

const supabase = createClient();

export class RegistrationService {
    static async createRegistration(
        eventId: string,
        attendeeId: string,
        ticketType: TicketType,
        registeredAt: Date,
        status: "pending" | "confirmed" | "cancelled",
        ticketId?: string,
    ) {
        try {
            const registrationData: RegistrationInsert = {
                event_id: eventId,
                attendee_id: attendeeId,
                ticket_type: TicketType[ticketType], // Convert enum to string
                registered_at: registeredAt.toISOString(),
                status,
                ticket_id: ticketId || null,
            };

            const { data, error } = await supabase.from("registrations")
                .insert(registrationData)
                .select()
                .single();
            if (error) throw error;
            if (!data) {
                throw new Error(
                    "No data returned from INSERT into registrations",
                );
            }

            // Convert string back to TicketType enum
            const ticketTypeEnum =
                TicketType[data.ticket_type as keyof typeof TicketType];

            const registration = new Registration(
                data.id,
                data.event_id,
                data.attendee_id,
                ticketTypeEnum,
                data.registered_at ? new Date(data.registered_at) : undefined,
                data.status as "pending" | "confirmed" | "cancelled",
                data.ticket_id || undefined
            );
            return { registration, error: null };
        } catch (error) {
            console.error("Error posting registration: ", error);
            return {
                registration: null,
                error: displayError(error, "Failed to create registration")
            };
        }
    }

    static async getRegistrationByAttendeeId(attendeeId: string) {
        try {
            const { data, error } = await supabase
                .from("registrations")
                .select("*")
                .eq("attendee_id", attendeeId)
                .order("registered_at", { ascending: false });

            if (error) throw error;
            if (!data) {
                throw new Error(
                    `Registration with specific ID ${attendeeId} not found.`,
                );
            }

            const registrations = data.map((row: RegistrationRow) => {
                const ticketTypeEnum =
                    TicketType[row.ticket_type as keyof typeof TicketType];
                return new Registration(
                    row.id,
                    row.event_id,
                    row.attendee_id,
                    ticketTypeEnum,
                    row.registered_at ? new Date(row.registered_at) : undefined,
                    row.status as "pending" | "confirmed" | "cancelled",
                    row.ticket_id || undefined
                );
            });
            return { registrations, error: null };
        } catch (error) {
            console.error(
                "Error fetching registration by a specific attendee ID:",
                error,
            );
            return {
                registrations: [],
                error: displayError(error, "Failed to fetch registrations")
            };
        }
    }

    static async getRegistrationsByEventId(eventId: string) {
        try {
            const { data, error } = await supabase
                .from("registrations")
                .select("*")
                .eq("event_id", eventId)
                .order("registered_at", { ascending: true });

            if (error) throw error;
            if (!data) {
                throw new Error(
                    `Cannot fetch registrations by specific event ID: ${eventId}`,
                );
            }

            const registrations = data.map((row: RegistrationRow) => {
                const ticketTypeEnum =
                    TicketType[row.ticket_type as keyof typeof TicketType];
                return new Registration(
                    row.id,
                    row.event_id,
                    row.attendee_id,
                    ticketTypeEnum,
                    row.registered_at ? new Date(row.registered_at) : undefined,
                    row.status as "pending" | "confirmed" | "cancelled",
                    row.ticket_id || undefined
                );
            });
            return { registrations, error: null };
        } catch (error) {
            console.error("Failed to fetch registrations by specific event ID");
            return {
                registrations: [],
                error: displayError(error, "Failed to fetch registrations by event")
            };
        }
    }

    static async getRegistrationsByTicketType(ticketType: string) {
        try {
            const { data, error } = await supabase
                .from("registrations")
                .select("*")
                .eq("ticket_type", ticketType)
                .order("registered_at", { ascending: true });

            if (error) throw error;
            if (!data) {
                throw new Error(
                    `Cannot fetch registrations by specific ticket type: ${ticketType}`,
                );
            }

            const registrations = data.map((row: RegistrationRow) => {
                const ticketTypeEnum =
                    TicketType[row.ticket_type as keyof typeof TicketType];
                return new Registration(
                    row.id,
                    row.event_id,
                    row.attendee_id,
                    ticketTypeEnum,
                    row.registered_at ? new Date(row.registered_at) : undefined,
                    row.status as "pending" | "confirmed" | "cancelled",
                    row.ticket_id || undefined
                );
            });
            return { registrations, error: null };
        } catch (error) {
            console.error(
                "Failed to fetch registrations by specific ticket type",
            );
            return {
                registrations: [],
                error: displayError(error, "Failed to fetch registrations by ticket type")
            };
        }
    }

    static async getAllRegistrations() {
        try {
            const { data, error } = await supabase
                .from("registrations")
                .select("*")
                .order("registered_at", { ascending: true });

            if (error) throw error;

            const registrations = data.map((row: RegistrationRow) => {
                const ticketTypeEnum =
                    TicketType[row.ticket_type as keyof typeof TicketType];
                return new Registration(
                    row.id,
                    row.event_id,
                    row.attendee_id,
                    ticketTypeEnum,
                    row.registered_at ? new Date(row.registered_at) : undefined,
                    row.status as "pending" | "confirmed" | "cancelled",
                    row.ticket_id || undefined
                );
            });
            return { registrations, error: null };
        } catch (error) {
            console.error(`Error fetching all registrations`, error);
            return {
                registrations: [],
                error: displayError(error, "Failed to fetch all registrations")
            };
        }
    }

    static async updateRegistrationByAttendeeId(
        attendeeId: string,
        updates: {
            attendee_id?: string | undefined;
            event_id?: string | undefined;
            id?: string | undefined;
            registered_at?: string | null | undefined;
            status?: string | undefined;
            ticket_id?: string | null | undefined;
            ticket_type?: string | undefined;
        },
    ) {
        try {
            const dbUpdates: RegistrationUpdate = {};

            if (updates.event_id !== undefined) {
                dbUpdates.event_id = updates.event_id;
            }
            if (updates.attendee_id !== undefined) {
                dbUpdates.attendee_id = updates.attendee_id;
            }
            if (updates.ticket_type !== undefined) {
                dbUpdates.ticket_type = updates.ticket_type;
            }
            if (updates.status !== undefined) {
                dbUpdates.status = updates.status;
            }
            if (updates.ticket_id !== undefined) {
                dbUpdates.ticket_id = updates.ticket_id;
            }
            if (updates.registered_at !== undefined) {
                dbUpdates.registered_at = updates.registered_at;
            }

            const { data, error } = await supabase
                .from("registrations")
                .update(dbUpdates)
                .eq("attendee_id", attendeeId)
                .select();

            if (error) throw error;
            if (!data || data.length === 0) throw new Error(`No data returned from update`);

            // Return the first updated registration
            const firstRecord = data[0];
            const ticketTypeEnum =
                TicketType[firstRecord.ticket_type as keyof typeof TicketType];

            const registration = new Registration(
                firstRecord.id,
                firstRecord.event_id,
                firstRecord.attendee_id,
                ticketTypeEnum,
                firstRecord.registered_at ? new Date(firstRecord.registered_at) : undefined,
                firstRecord.status as "pending" | "confirmed" | "cancelled",
                firstRecord.ticket_id || undefined
            );
            return { registration, error: null };
        } catch (error) {
            console.error("Error updating registration: ", error);
            return {
                registration: null,
                error: displayError(error, "Failed to update registration")
            };
        }
    }

    static async updateRegistrationById(
        registrationId: string,
        updates: {
            status?: string;
            ticket_id?: string;
        },
    ) {
        try {
            const dbUpdates: RegistrationUpdate = {};

            if (updates.status !== undefined) {
                dbUpdates.status = updates.status;
            }
            if (updates.ticket_id !== undefined) {
                dbUpdates.ticket_id = updates.ticket_id;
            }

            const { data, error } = await supabase
                .from("registrations")
                .update(dbUpdates)
                .eq("id", registrationId)
                .select()
                .single();

            if (error) throw error;
            if (!data) throw new Error(`No data returned from update`);

            const ticketTypeEnum =
                TicketType[data.ticket_type as keyof typeof TicketType];

            const registration = new Registration(
                data.id,
                data.event_id,
                data.attendee_id,
                ticketTypeEnum,
                data.registered_at ? new Date(data.registered_at) : undefined,
                data.status as "pending" | "confirmed" | "cancelled",
                data.ticket_id || undefined
            );
            return { registration, error: null };
        } catch (error) {
            console.error("Error updating registration: ", error);
            return {
                registration: null,
                error: displayError(error, "Failed to update registration")
            };
        }
    }

    static async deleteRegistrationByAttendeeId(attendeeId: string) {
        try {
            const { error } = await supabase
                .from("registrations")
                .delete()
                .eq("attendee_id", attendeeId);

            if (error) throw error;

            return { success: true, error: null };
        } catch (error) {
            console.error(
                `Error deleting registration with attendee ID: ${attendeeId}`,
            );
            return {
                success: false,
                error: displayError(error, "Failed to delete registration")
            };
        }
    }

    static async searchRegistrations(searchString: string) {
        try {
            const { data, error } = await supabase
                .from("registrations")
                .select("*")
                .or(`event_id.ilike.%${searchString}%,ticket_type.ilike.%${searchString}%`)
                .order("registered_at", { ascending: true });
            if (error) throw error;

            const registrations = data.map((row: RegistrationRow) => {
                const ticketTypeEnum =
                    TicketType[row.ticket_type as keyof typeof TicketType];
                return new Registration(
                    row.id,
                    row.event_id,
                    row.attendee_id,
                    ticketTypeEnum,
                );
            });

            return { registrations, error: null };
        } catch (error) {
            console.error(`Error searching up registration(s)`, error);
            return {
                registrations: [],
                error: displayError(error, "Failed to search registrations")
            };
        }
    }
}
