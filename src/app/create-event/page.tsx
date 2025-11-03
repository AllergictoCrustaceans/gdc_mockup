"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEventStore } from "../../../lib/stores/eventStore";
import { useUserStore } from "../../../lib/stores/userStore";
import { Suspense } from "react";
import Navbar from "../components/Navbar";

// TODO: Wow this is getting long. Refactor
function CreateEventContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const editEventId = searchParams.get("edit");

    const { events, selectedEvent, createEvent, updateEvent, fetchEventById, isLoading } = useEventStore();
    const { user, isAuthenticated } = useUserStore();

    const isEditMode = !!editEventId;
    const eventToEdit = isEditMode
        ? (selectedEvent?.getEventInformation().id === editEventId
            ? selectedEvent
            : events.find(e => e.getEventInformation().id === editEventId))
        : null;

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        startDate: "",
        startTime: "",
        endDate: "",
        endTime: "",
        capacity: "",
    });
    const [error, setError] = useState("");

    useEffect(() => {
        if (!isAuthenticated || !user) {
            router.push("/login");
            return;
        }

        if (user.getRole() !== "organizer") {
            router.push("/dashboard");
            return;
        }

        if (isEditMode && editEventId) {
            fetchEventById(editEventId);
        }
    }, [isAuthenticated, user, isEditMode, editEventId]);

    useEffect(() => {
        if (isEditMode && eventToEdit) {
            const info = eventToEdit.getEventInformation();
            const startDate = new Date(info.startTime);
            const endDate = new Date(info.endTime);

            setFormData({
                title: info.title,
                description: info.description,
                startDate: startDate.toISOString().split('T')[0],
                startTime: startDate.toTimeString().slice(0, 5),
                endDate: endDate.toISOString().split('T')[0],
                endTime: endDate.toTimeString().slice(0, 5),
                capacity: info.capacity.toString(),
            });
        }
    }, [isEditMode, eventToEdit]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!formData.title || !formData.description || !formData.startDate || !formData.capacity) {
            setError("Please fill in all required fields");
            return;
        }

        if (!user) {
            setError("User not authenticated");
            return;
        }

        try {
            const startDateTime = new Date(`${formData.startDate}T${formData.startTime || "00:00"}`);
            const endDateTime = new Date(`${formData.endDate || formData.startDate}T${formData.endTime || "23:59"}`);
            const capacity = parseInt(formData.capacity);

            if (isNaN(capacity) || capacity <= 0) {
                setError("Capacity must be a positive number");
                return;
            }

            if (isEditMode && editEventId) {
                await updateEvent(editEventId, {
                    title: formData.title,
                    description: formData.description,
                    start_time: startDateTime,
                    end_time: endDateTime,
                    capacity: capacity,
                });
                router.push("/my-events");
            } else {
                const event = await createEvent(
                    formData.title,
                    formData.description,
                    startDateTime,
                    endDateTime,
                    user.getId(),
                    null,
                    capacity
                );

                if (event) {
                    router.push("/my-events");
                } else {
                    setError("Failed to create event");
                }
            }
        } catch (err: any) {
            setError(err.message || (isEditMode ? "Failed to update event" : "Failed to create event"));
        }
    };

    if (!user || user.getRole() !== "organizer") {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }

    if (isEditMode && !eventToEdit) {
        return <div className="min-h-screen flex items-center justify-center">Loading event data...</div>;
    }

    return (
        <div className="min-h-screen">
            <Navbar />
            {/* TODO: Should be a separate component */}
            {/* Create Event Form */}
            <div className="max-w-2xl mx-auto p-4">
                <h1 className="text-2xl font-bold mb-6">
                    {isEditMode ? "Edit Event" : "Create New Event"}
                </h1>

                <form onSubmit={handleSubmit} className="border rounded p-6">
                    {error && (
                        <div className="mb-4 p-3 border border-red-500 rounded text-sm">
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div>
                            <label htmlFor="title" className="block text-sm mb-1">
                                Event Title *
                            </label>
                            <input
                                type="text"
                                id="title"
                                name="title"
                                required
                                value={formData.title}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border rounded"
                                placeholder="e.g., Tech Conference 2025"
                            />
                        </div>

                        <div>
                            <label htmlFor="description" className="block text-sm mb-1">
                                Description *
                            </label>
                            <textarea
                                id="description"
                                name="description"
                                required
                                value={formData.description}
                                onChange={handleChange}
                                rows={4}
                                className="w-full px-3 py-2 border rounded"
                                placeholder="Describe your event..."
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="startDate" className="block text-sm mb-1">
                                    Start Date *
                                </label>
                                <input
                                    type="date"
                                    id="startDate"
                                    name="startDate"
                                    required
                                    value={formData.startDate}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border rounded"
                                />
                            </div>
                            <div>
                                <label htmlFor="startTime" className="block text-sm mb-1">
                                    Start Time
                                </label>
                                <input
                                    type="time"
                                    id="startTime"
                                    name="startTime"
                                    value={formData.startTime}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border rounded"
                                />
                            </div>
                            <div>
                                <label htmlFor="endDate" className="block text-sm mb-1">
                                    End Date
                                </label>
                                <input
                                    type="date"
                                    id="endDate"
                                    name="endDate"
                                    value={formData.endDate}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border rounded"
                                />
                            </div>
                            <div>
                                <label htmlFor="endTime" className="block text-sm mb-1">
                                    End Time
                                </label>
                                <input
                                    type="time"
                                    id="endTime"
                                    name="endTime"
                                    value={formData.endTime}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border rounded"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="capacity" className="block text-sm mb-1">
                                Capacity *
                            </label>
                            <input
                                type="number"
                                id="capacity"
                                name="capacity"
                                required
                                min="1"
                                value={formData.capacity}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border rounded"
                                placeholder="e.g., 100"
                            />
                        </div>
                    </div>

                    <div className="flex gap-3 mt-6">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex-1 px-4 py-2 border rounded disabled:opacity-50"
                        >
                            {isLoading ? (isEditMode ? "Updating..." : "Creating...") : (isEditMode ? "Update Event" : "Create Event")}
                        </button>
                        <button
                            type="button"
                            onClick={() => router.push("/my-events")}
                            className="px-4 py-2 border rounded"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function CreateEventPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
            <CreateEventContent />
        </Suspense>
    );
}
