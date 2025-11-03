import { NextRequest, NextResponse } from "next/server";
import { createClient } from "../../../../../utils/supabase/server";
import { createAdminClient } from "../../../../../utils/supabase/admin";

export async function DELETE(request: NextRequest) {
    try {
        // Verify the requesting user is authenticated
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const userId = user.id;

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

        // Sign out the user
        await supabase.auth.signOut();

        return NextResponse.json(
            { message: "Account deleted successfully" },
            { status: 200 }
        );
    } catch (error: any) {
        console.error("Error in delete-account API:", error);
        return NextResponse.json(
            { error: error.message || "Failed to delete account" },
            { status: 500 }
        );
    }
}
