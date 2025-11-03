import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-2xl mx-auto p-8 text-center">
        <h1 className="text-4xl font-bold mb-8">
          Games Developers Conference 2026
        </h1>

        <div className="flex gap-4 justify-center">
          <Link
            className="px-6 py-3 border rounded"
            href="/signup">
            Signup
          </Link>
          <Link
            className="px-6 py-3 border rounded"
            href="/login">
            Login
          </Link>
        </div>
      </div>
    </div>
  );
}
