"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUserStore } from "../../../lib/stores/userStore";
import Link from "next/link";

export default function SignupPage() {
    const router = useRouter();
    const { signUp } = useUserStore();

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "attendee",
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!formData.name || !formData.email || !formData.password) {
            setError("Please fill in all fields");
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        if (formData.password.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }

        setLoading(true);

        try {
            await signUp(formData.email, formData.password, formData.name, formData.role);
            router.push("/dashboard");
        } catch (err: any) {
            console.error('Signup error:', err);
            setError(err.message || "Signup failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <h2 className="text-2xl font-bold text-center mb-6">
                    Create your account
                </h2>

                <form onSubmit={handleSubmit} className="border rounded p-6">
                    {error && (
                        <div className="mb-4 p-3 border border-red-500 rounded text-sm">
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div>
                            <label htmlFor="name" className="block text-sm mb-1">
                                Full Name
                            </label>
                            <input
                                id="name"
                                name="name"
                                type="text"
                                required
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border rounded"
                            />
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm mb-1">
                                Email Address
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border rounded"
                            />
                        </div>

                        <div>
                            <label htmlFor="role" className="block text-sm mb-1">
                                Role
                            </label>
                            <select
                                id="role"
                                name="role"
                                value={formData.role}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border rounded"
                            >
                                <option value="attendee">Attendee</option>
                                <option value="organizer">Event Organizer</option>
                                <option value="speaker">Speaker</option>
                                <option value="vendor">Vendor</option>
                                <option value="administrator">Administrator</option>
                            </select>
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm mb-1">
                                Password
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border rounded"
                            />
                        </div>

                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm mb-1">
                                Confirm Password
                            </label>
                            <input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                required
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border rounded"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full mt-6 px-4 py-2 border rounded disabled:opacity-50"
                    >
                        {loading ? "Creating account..." : "Sign up"}
                    </button>

                    <p className="mt-4 text-center text-sm">
                        Already have an account?{" "}
                        <Link href="/login" className="underline">
                            Log in
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    );
}
