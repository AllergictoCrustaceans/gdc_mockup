import { NextRequest, NextResponse } from "next/server";
import { createClient } from "../../../../../utils/supabase/server";
import { createAdminClient } from "../../../../../utils/supabase/admin";

export async function DELETE(request: NextRequest) {
    try {
        // Verify the requesting user is an administrator
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        // Check if user is administrator
        const { data: profile, error: profileError } = await supabase
            .from("user_profiles")
            .select("role")
            .eq("id", user.id)
            .single();

        if (profileError || profile?.role !== "administrator") {
            return NextResponse.json(
                { error: "Forbidden - Admin access required" },
                { status: 403 }
            );
        }

        // Get the user ID to delete from the request body
        const { userId } = await request.json();

        if (!userId) {
            return NextResponse.json(
                { error: "User ID is required" },
                { status: 400 }
            );
        }

        // Don't allow deleting yourself
        if (userId === user.id) {
            return NextResponse.json(
                { error: "Cannot delete your own account from admin panel" },
                { status: 400 }
            );
        }

        // Delete from user_profiles table (cascade will handle related records)
        const { error: profileDeleteError } = await supabase
            .from("user_profiles")
            .delete()
            .eq("id", userId);

        if (profileDeleteError) {
            throw profileDeleteError;
        }

        // Use admin client to delete the auth user
        const adminClient = createAdminClient();
        const { error: authDeleteError } = await adminClient.auth.admin.deleteUser(userId);

        if (authDeleteError) {
            console.error("Error deleting auth user:", authDeleteError);
            // Continue anyway since profile is deleted
        }

        return NextResponse.json(
            { message: "User deleted successfully" },
            { status: 200 }
        );
    } catch (error: any) {
        console.error("Error in delete-user API:", error);
        return NextResponse.json(
            { error: error.message || "Failed to delete user" },
            { status: 500 }
        );
    }
}
