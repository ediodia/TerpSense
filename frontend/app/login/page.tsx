"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { TerpSenseLogo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState<"credentials" | "google" | "microsoft-entra-id" | null>(null);
  const [error, setError] = useState("");

  async function handleCredentialsSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading("credentials");
    const result = await signIn("credentials", { email, password, redirect: false });
    setLoading(null);
    if (result?.error) {
      setError("Incorrect email or password.");
      return;
    }
    router.push("/dashboard");
  }

  async function handleOAuth(provider: "google" | "microsoft-entra-id") {
    setLoading(provider);
    await signIn(provider, { callbackUrl: "/dashboard" });
  }

  return (
    <main className="min-h-screen bg-[#09090b] text-zinc-100 font-sans flex items-center justify-center px-6 py-12 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[600px] bg-emerald-500/10 blur-[140px] pointer-events-none rounded-full" />

      <div className="relative z-10 w-full max-w-sm flex flex-col gap-6">
        <div className="flex flex-col items-center gap-4">
          <TerpSenseLogo size="lg" />
          <p className="text-sm text-zinc-400 text-center">
            Sign in to track your real budget and savings.
          </p>
        </div>

        <Card>
          <div className="flex flex-col gap-2.5">
            <Button
              variant="outline"
              fullWidth
              disabled={loading !== null}
              loading={loading === "google"}
              onClick={() => handleOAuth("google")}
            >
              Continue with Google
            </Button>
            <Button
              variant="outline"
              fullWidth
              disabled={loading !== null}
              loading={loading === "microsoft-entra-id"}
              onClick={() => handleOAuth("microsoft-entra-id")}
            >
              Continue with Microsoft
            </Button>
          </div>

          <div className="flex items-center gap-3 my-5">
            <div className="h-px bg-white/10 flex-1" />
            <span className="text-[11px] font-semibold uppercase tracking-widest text-zinc-600">or</span>
            <div className="h-px bg-white/10 flex-1" />
          </div>

          <form onSubmit={handleCredentialsSubmit} className="flex flex-col gap-3">
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
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition-all"
            />
            {error && <p className="text-red-400 text-xs font-medium">{error}</p>}
            <Button type="submit" fullWidth disabled={loading !== null} loading={loading === "credentials"}>
              Sign in
            </Button>
          </form>
        </Card>

        <p className="text-center text-xs text-zinc-500">
          No account?{" "}
          <Link href="/signup" className="text-emerald-400 font-semibold hover:text-emerald-300">
            Sign up
          </Link>
        </p>
        <Link href="/dashboard" className="text-center text-xs text-zinc-600 hover:text-zinc-400 transition-colors">
          Just exploring? Skip to the mock demo →
        </Link>
      </div>
    </main>
  );
}
