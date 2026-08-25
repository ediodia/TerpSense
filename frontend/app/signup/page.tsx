"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { TerpSenseLogo } from "@/components/dashboard/TerpSenseLogo";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { registerUser } from "@/lib/api";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    try {
      await registerUser(name, email, password);
      const result = await signIn("credentials", { email, password, redirect: false });
      if (result?.error) {
        setError("Account created, but sign-in failed — try logging in.");
        router.push("/login");
        return;
      }
      router.push("/onboarding-personal");
    } catch (err) {
      setError(err instanceof Error && err.message.includes("409")
        ? "An account with this email already exists."
        : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#09090b] text-zinc-100 font-sans flex items-center justify-center px-6 py-12 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[600px] bg-emerald-500/10 blur-[140px] pointer-events-none rounded-full" />

      <div className="relative z-10 w-full max-w-sm flex flex-col gap-6">
        <div className="flex flex-col items-center gap-4">
          <TerpSenseLogo />
          <p className="text-sm text-zinc-400 text-center">
            Create an account to set up your real budget.
          </p>
        </div>

        <Card>
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <input
              type="text"
              required
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition-all"
            />
            <input
              type="email"
              required
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition-all"
            />
            <input
              type="password"
              required
              placeholder="Password (min. 8 characters)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition-all"
            />
            {error && <p className="text-red-400 text-xs font-medium">{error}</p>}
            <Button type="submit" fullWidth loading={loading}>
              Create account
            </Button>
          </form>
        </Card>

        <p className="text-center text-xs text-zinc-500">
          Already have an account?{" "}
          <Link href="/login" className="text-emerald-400 font-semibold hover:text-emerald-300">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
