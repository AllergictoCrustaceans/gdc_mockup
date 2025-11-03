import { createClient } from "../../utils/supabase/client";
import { User } from "../models/person/User";
import { EventOrganizer } from "../models/person/EventOrganizer";
import { Attendee } from "../models/person/Attendee";
import type { Database } from "../types/database.types";

type UserProfileInsert =
    Database["public"]["Tables"]["user_profiles"]["Insert"];
type UserProfileUpdate =
    Database["public"]["Tables"]["user_profiles"]["Update"];

const supabase = createClient();

export class UserService {
    // =====================================================
    // AUTHENTICATION
    // =====================================================

    static async signUp(
        email: string,
        password: string,
        name: string,
        role: string,
    ) {
        try {
            // 1. Create auth user
            const { data: authData, error: authError } = await supabase.auth
                .signUp({
                    email,
                    password,
                });

            if (authError) throw authError;
            if (!authData.user) throw new Error("User creation failed");

            // 2. Create user profile
            const profileData: UserProfileInsert = {
                id: authData.user.id,
                name,
                email,
                role,
            };

            const { error: profileError } = await supabase
                .from("user_profiles")
                .insert(profileData);

            if (profileError) throw profileError;

            // 3. Create role-specific record
            await this.createRoleSpecificRecord(authData.user.id, role);

            return { user: authData.user, error: null };
        } catch (error) {
            return { user: null, error };
        }
    }

    static async signIn(email: string, password: string) {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;
            return { user: data.user, session: data.session, error: null };
        } catch (error) {
            return { user: null, session: null, error };
        }
    }

    static async signOut() {
        try {
            const { error } = await supabase.auth.signOut();
            return { error };
        } catch (error) {
            return { error };
        }
    }

    static async getCurrentUser() {
        try {
            const { data: { user }, error } = await supabase.auth.getUser();
            if (error) throw error;
            return { user, error: null };
        } catch (error) {
            return { user: null, error };
        }
    }

    // =====================================================
    // ROLE-SPECIFIC RECORDS
    // =====================================================

    private static async createRoleSpecificRecord(
        userId: string,
        role: string,
    ) {
        switch (role) {
            case "attendee":
                await supabase.from("attendees").insert({ id: userId });
                break;
            case "organizer":
                await supabase.from("event_organizers").insert({ id: userId });
                break;
            case "speaker":
                await supabase.from("speakers").insert({ id: userId });
                break;
            case "vendor":
                await supabase.from("vendors").insert({
                    id: userId,
                    vendor_location: "", // Will be updated later
                });
                break;
            case "administrator":
                await supabase.from("administrators").insert({
                    id: userId,
                    access_level: "standard",
                });
                break;
        }
    }

    // =====================================================
    // USER PROFILE CRUD
    // =====================================================

    static async getUserProfile(userId: string) {
        try {
            const { data, error } = await supabase
                .from("user_profiles")
                .select("*")
                .eq("id", userId)
                .single();

            if (error) throw error;

            // Convert to User class instance
            const user = new User(
                data.name,
                data.email,
                data.id,
                data.role,
            );

            return { user, error: null };
        } catch (error) {
            return { user: null, error };
        }
    }

    static async updateUserProfile(
        userId: string,
        updates: { name?: string; email?: string },
    ) {
        try {
            const profileUpdates: UserProfileUpdate = {};
            if (updates.name !== undefined) profileUpdates.name = updates.name;
            if (updates.email !== undefined) {
                profileUpdates.email = updates.email;
            }

            const { data, error } = await supabase
                .from("user_profiles")
                .update(profileUpdates)
                .eq("id", userId)
                .select()
                .single();

            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            return { data: null, error };
        }
    }

    // =====================================================
    // ATTENDEE OPERATIONS
    // =====================================================

    static async getAttendee(userId: string) {
        try {
            const { data: profile, error: profileError } = await supabase
                .from("user_profiles")
                .select("*")
                .eq("id", userId)
                .single();

            if (profileError) throw profileError;

            const { data: attendeeData, error: attendeeError } = await supabase
                .from("attendees")
                .select("*")
                .eq("id", userId)
                .single();

            if (attendeeError) throw attendeeError;

            // Create Attendee instance
            const attendee = new Attendee(
                profile.name,
                profile.email,
                profile.id,
                profile.role,
            );

            return { attendee, error: null };
        } catch (error) {
            return { attendee: null, error };
        }
    }

    // =====================================================
    // EVENT ORGANIZER OPERATIONS
    // =====================================================

    static async getEventOrganizer(userId: string) {
        try {
            const { data: profile, error: profileError } = await supabase
                .from("user_profiles")
                .select("*")
                .eq("id", userId)
                .single();

            if (profileError) throw profileError;

            const { data: organizerData, error: organizerError } =
                await supabase
                    .from("event_organizers")
                    .select("*")
                    .eq("id", userId)
                    .single();

            if (organizerError) throw organizerError;

            // Create EventOrganizer instance
            const organizer = new EventOrganizer(
                profile.name,
                profile.email,
                profile.id,
                organizerData.company_name || undefined,
            );

            return { organizer, error: null };
        } catch (error) {
            return { organizer: null, error };
        }
    }

    static async updateOrganizerCompany(userId: string, companyName: string) {
        try {
            const { error } = await supabase
                .from("event_organizers")
                .update({ company_name: companyName })
                .eq("id", userId);

            if (error) throw error;
            return { error: null };
        } catch (error) {
            return { error };
        }
    }

    // =====================================================
    // GET USER WITH ROLE-SPECIFIC DATA
    // =====================================================

    static async getUserWithRole(userId: string) {
        try {
            const { data: profile, error: profileError } = await supabase
                .from("user_profiles")
                .select("*")
                .eq("id", userId)
                .single();

            if (profileError) throw profileError;

            // Based on role, fetch role-specific data and return appropriate class
            switch (profile.role) {
                case "attendee":
                    return await this.getAttendee(userId);
                case "organizer":
                    return await this.getEventOrganizer(userId);
                // Add other roles as needed
                default:
                    return { user: null, error: new Error("Unknown role") };
            }
        } catch (error) {
            return { user: null, error };
        }
    }
}
