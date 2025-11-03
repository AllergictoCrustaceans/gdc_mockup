export class ClientFacingError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "ClientFacingError";
    }
}

export const displayError = (
    error: unknown,
    genericMessage: string = "Something went wrong.",
): string => {
    if (error instanceof ClientFacingError) {
        return error.message;
    }

    if (error instanceof Error) {
        if (process.env.NODE_ENV === "development") {
            return error.message;
        }
        return genericMessage;
    }

    return genericMessage;
};
