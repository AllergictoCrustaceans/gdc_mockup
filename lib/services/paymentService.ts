import { createClient } from "../../utils/supabase/client";
import { Payment } from "../models/payment/Payment";
import type { Database } from "../types/database.types";
import { displayError } from "../../utils/errorHandler";

type PaymentRow = Database["public"]["Tables"]["payments"]["Row"];
type PaymentInsert = Database["public"]["Tables"]["payments"]["Insert"];
type PaymentUpdate = Database["public"]["Tables"]["payments"]["Update"];

const supabase = createClient();
export class PaymentService {
    static async createPaymentIntent(
        amount: number,
        currency: string = "usd",
        metadata?: Record<string, string>,
    ) {
        try {
            const response = await fetch("/api/create-payment-intent", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    amount: Math.round(amount * 100), // Convert to cents
                    currency,
                    metadata,
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to create payment intent");
            }

            const data = await response.json();
            return { clientSecret: data.clientSecret, error: null };
        } catch (error) {
            console.error("Error creating payment intent:", error);
            return {
                clientSecret: null,
                error: displayError(error, "Failed to create payment intent")
            };
        }
    }
    static async createPayment(
        eventId: string,
        attendeeId: string,
        amount: number,
        currency: string = "usd",
        ticketIds: string[] = [],
        paymentMethod: "card" | "cash" | "other" = "card",
    ) {
        try {
            const paymentData: PaymentInsert = {
                event_id: eventId,
                attendee_id: attendeeId,
                amount,
                currency,
                ticket_ids: ticketIds,
                payment_method: paymentMethod,
                status: "pending",
                completed_at: null,
                stripe_payment_intent_id: null,
            };

            const { data, error } = await supabase
                .from("payments")
                .insert(paymentData)
                .select()
                .single();

            if (error) throw error;
            if (!data) throw new Error("No data returned from insert");

            const payment = new Payment(
                data.id,
                data.amount,
                data.currency,
                data.attendee_id,
                data.event_id,
                data.ticket_ids || [],
                data.payment_method as "card" | "cash" | "other",
            );

            return { payment, error: null };
        } catch (error) {
            console.error("Error creating payment:", error);
            return {
                payment: null,
                error: displayError(error, "Failed to create payment")
            };
        }
    }
    static async updatePaymentStatus(
        paymentId: string,
        status: "pending" | "processing" | "completed" | "failed" | "refunded",
        stripePaymentIntentId?: string,
    ) {
        try {
            const updates: PaymentUpdate = {
                status,
            };

            if (status === "completed") {
                updates.completed_at = new Date().toISOString();
            }

            if (stripePaymentIntentId) {
                updates.stripe_payment_intent_id = stripePaymentIntentId;
            }

            const { data, error } = await supabase
                .from("payments")
                .update(updates)
                .eq("id", paymentId)
                .select()
                .single();

            if (error) throw error;
            if (!data) throw new Error("No data returned from update");

            const payment = new Payment(
                data.id,
                data.amount,
                data.currency,
                data.attendee_id,
                data.event_id,
                data.ticket_ids || [],
                data.payment_method as "card" | "cash" | "other",
            );

            return { payment, error: null };
        } catch (error) {
            console.error("Error updating payment:", error);
            return {
                payment: null,
                error: displayError(error, "Failed to update payment status")
            };
        }
    }
    static async getPaymentById(paymentId: string) {
        try {
            const { data, error } = await supabase
                .from("payments")
                .select("*")
                .eq("id", paymentId)
                .single();

            if (error) throw error;
            if (!data) throw new Error("Payment not found");

            const payment = new Payment(
                data.id,
                data.amount,
                data.currency,
                data.attendee_id,
                data.event_id,
                data.ticket_ids || [],
                data.payment_method as "card" | "cash" | "other",
            );

            return { payment, error: null };
        } catch (error) {
            console.error("Error fetching payment:", error);
            return {
                payment: null,
                error: displayError(error, "Failed to fetch payment")
            };
        }
    }
    static async getPaymentsByAttendee(attendeeId: string) {
        try {
            const { data, error } = await supabase
                .from("payments")
                .select("*")
                .eq("attendee_id", attendeeId)
                .order("created_at", { ascending: false });

            if (error) throw error;

            const payments = data.map((row: PaymentRow) =>
                new Payment(
                    row.id,
                    row.amount,
                    row.currency,
                    row.attendee_id,
                    row.event_id,
                    row.ticket_ids || [],
                    row.payment_method as "card" | "cash" | "other",
                )
            );

            return { payments, error: null };
        } catch (error) {
            console.error("Error fetching payments:", error);
            return {
                payments: [],
                error: displayError(error, "Failed to fetch payments by attendee")
            };
        }
    }
    static async getPaymentsByEvent(eventId: string) {
        try {
            const { data, error } = await supabase
                .from("payments")
                .select("*")
                .eq("event_id", eventId)
                .order("created_at", { ascending: false });

            if (error) throw error;

            const payments = data.map((row: PaymentRow) =>
                new Payment(
                    row.id,
                    row.amount,
                    row.currency,
                    row.attendee_id,
                    row.event_id,
                    row.ticket_ids || [],
                    row.payment_method as "card" | "cash" | "other",
                )
            );

            return { payments, error: null };
        } catch (error) {
            console.error("Error fetching payments:", error);
            return {
                payments: [],
                error: displayError(error, "Failed to fetch payments by event")
            };
        }
    }
    static async mockPayment(
        eventId: string,
        attendeeId: string,
        amount: number,
        ticketIds: string[] = [],
    ) {
        try {
            const { payment, error: createError } = await this.createPayment(
                eventId,
                attendeeId,
                amount,
                "usd",
                ticketIds,
                "card",
            );

            if (createError || !payment) {
                console.error("Failed to create payment:", createError);
                throw createError;
            }

            // Simulate processing delay
            await new Promise((resolve) => setTimeout(resolve, 1000));

            // Update to completed
            const paymentId = payment.getId();

            const { payment: completedPayment, error: updateError } = await this
                .updatePaymentStatus(
                    paymentId,
                    "completed",
                    `mock_pi_${Date.now()}`,
                );

            if (updateError) {
                console.error("Failed to update payment status:", updateError);
                throw new Error(
                    `Failed to update payment status: ${
                        JSON.stringify(updateError)
                    }`,
                );
            }

            return { payment: completedPayment, error: null };
        } catch (error) {
            console.error("Mock payment failed:", error);
            return {
                payment: null,
                error: displayError(error, "Failed to process mock payment")
            };
        }
    }
}
