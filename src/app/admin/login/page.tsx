"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function LoginForm() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const params = useSearchParams();
  const from = params.get("from") || "/admin";

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        setError("Invalid password");
        return;
      }
      router.replace(from);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="w-full max-w-md bg-white dark:bg-slate-800 border-4 border-black dark:border-white rounded-2xl shadow-[6px_6px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_rgba(255,255,255,1)] p-8 space-y-4"
    >
      <h1 className="text-3xl font-black uppercase">Admin Login</h1>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        autoFocus
        className="w-full border-2 border-black dark:border-white rounded-lg p-3 bg-transparent font-mono"
      />
      {error && <div className="text-red-700 dark:text-red-300 font-bold">{error}</div>}
      <button
        type="submit"
        disabled={loading || !password}
        className="w-full bg-black text-white dark:bg-white dark:text-black font-black uppercase py-3 rounded-lg disabled:opacity-50"
      >
        {loading ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-yellow-50 dark:bg-slate-900 p-4">
      <Suspense fallback={<div className="font-black">Loading...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
