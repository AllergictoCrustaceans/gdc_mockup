import { NextResponse } from "next/server";

export const handleApiError = (error: unknown, context: string) => {
    console.error(`Error in ${context}:`, error);
    return NextResponse.json(
        { error: "An unexpected error occurred" },
        { status: 500 },
    );
};

export const verifyAdminRole = (userId?: string | null, isAdmin?: boolean) => {
    if (!userId || !isAdmin) {
        return NextResponse.json(
            { error: "Unauthorized. Only admins can perform this action." },
            { status: 403 },
        );
    }
    return null;
};

export const verifyRequiredField = (value: unknown, fieldName: string) => {
    if (!value) {
        return NextResponse.json(
            { error: `${fieldName} is required` },
            { status: 400 },
        );
    }
    return null;
};

export const handleApiSuccessResponse = <T>(
    data: T,
    status: number = 200,
) => {
    return NextResponse.json(data, { status });
};

export const databaseErrorResponse = (error: { message: string }) => {
    console.error("Database error:", error);
    return NextResponse.json(
        { error: error.message },
        { status: 500 },
    );
};
