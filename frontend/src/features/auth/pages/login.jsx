import React, { useState } from "react";
import { Link } from "react-router-dom";
import AuthShell from "../components/AuthShell";
import AuthInput from "../components/AuthInput";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // UI-only for now (hook up your auth API later).
      await new Promise((r) => setTimeout(r, 650));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Your saved threads and sources are waiting—sign in to keep the conversation going."
      sideBadge="Glad you're here again"
      sideTitle="ModelVerse AI"
      sideSubtitle="Ask anything. We'll weave in what you've already gathered—notes, docs, and past chats—so answers feel familiar, not random."
      highlights={[
        {
          title: "Memory that matters",
          description:
            "Pick up mid-thought; your workspace remembers context across sessions.",
        },
        {
          title: "From scattered to clear",
          description:
            "Turn piles of reading into one place you can query like a colleague who actually read them.",
        },
      ]}
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <AuthInput
          label="Email"
          type="email"
          name="email"
          autoComplete="email"
          placeholder="you@company.com"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <AuthInput
          label="Password"
          type="password"
          name="password"
          autoComplete="current-password"
          placeholder="••••••••"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <div className="flex items-center justify-between gap-4 pt-1">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-white/70">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="h-4 w-4 rounded border-white/20 bg-white/10 text-cyan-300 focus:ring-4 focus:ring-cyan-300/20"
            />
            Remember me
          </label>

          <button
            type="button"
            className="text-sm font-medium text-cyan-200/90 hover:text-cyan-100 hover:underline"
            disabled={isSubmitting}
          >
            Forgot password?
          </button>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className={[
            "group relative w-full overflow-hidden rounded-2xl px-4 py-3 text-sm font-semibold",
            "bg-gradient-to-r from-cyan-400/90 via-indigo-400/90 to-fuchsia-400/90 text-slate-950",
            "shadow-lg shadow-cyan-500/10 transition",
            "hover:-translate-y-0.5 hover:shadow-xl hover:shadow-fuchsia-500/10",
            "focus:outline-none focus:ring-4 focus:ring-cyan-300/20",
            "disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0",
          ].join(" ")}
        >
          <span className="relative z-10">
            {isSubmitting ? "Signing in…" : "Sign in"}
          </span>
          <span className="pointer-events-none absolute inset-0 opacity-0 transition group-hover:opacity-100">
            <span className="absolute -left-1/3 top-0 h-full w-2/3 -skew-x-12 bg-white/20 blur-xl" />
          </span>
        </button>

        <p className="pt-2 text-center text-sm text-white/70">
          Don’t have an account?{" "}
          <Link
            to="/register"
            className="font-semibold text-white hover:underline"
          >
            Create one
          </Link>
        </p>
      </form>
    </AuthShell>
  );
};

export default Login;
