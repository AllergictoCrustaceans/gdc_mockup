"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUserStore } from "../../../lib/stores/userStore";
import Link from "next/link";

export default function LoginPage() {
    const router = useRouter();
    const { signIn } = useUserStore();

    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!formData.email || !formData.password) {
            setError("Please fill in all fields");
            return;
        }

        setLoading(true);

        try {
            await signIn(formData.email, formData.password);
            router.push("/dashboard");
        } catch (err: any) {
            setError(err.message || "Login failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <h2 className="text-2xl font-bold text-center mb-2">
                    Welcome back
                </h2>
                <p className="text-center text-sm mb-6">
                    Log in to your account
                </p>

                <form onSubmit={handleSubmit} className="border rounded p-6">
                    {error && (
                        <div className="mb-4 p-3 border border-red-500 rounded text-sm">
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
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
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full mt-6 px-4 py-2 border rounded disabled:opacity-50"
                    >
                        {loading ? "Logging in..." : "Log in"}
                    </button>

                    <p className="mt-4 text-center text-sm">
                        Don&apos;t have an account?{" "}
                        <Link href="/signup" className="underline">
                            Sign up
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    );
}
