import React, { useState } from "react";
import { Link } from "react-router-dom";
import AuthShell from "../components/AuthShell";
import AuthInput from "../components/AuthInput";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmError, setConfirmError] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setConfirmError("");
    if (password !== confirmPassword) {
      setConfirmError("Passwords do not match.");
      return;
    }
    if (!acceptTerms) {
      return;
    }
    setIsSubmitting(true);
    try {
      await new Promise((r) => setTimeout(r, 650));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthShell
      title="Create your space"
      subtitle="A minute to sign up—a lot longer saved when every question can lean on what you already know."
      sideBadge="New minds welcome"
      sideTitle="ModelVerse AI"
      sideSubtitle="Build a living map of what you learn. Add material over time, and watch questions get sharper as your knowledge grows with you."
      highlights={[
        {
          title: "Curiosity, organized",
          description:
            "Capture ideas once; later, ask across everything without digging through folders.",
        },
        {
          title: "Your voice, amplified",
          description:
            "The more you teach it your world, the less you repeat yourself—and the better the nudges get.",
        },
      ]}
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <AuthInput
          label="Name"
          type="text"
          name="name"
          autoComplete="name"
          placeholder="Jane Doe"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

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
          autoComplete="new-password"
          placeholder="••••••••"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <AuthInput
          label="Confirm password"
          type="password"
          name="confirmPassword"
          autoComplete="new-password"
          placeholder="••••••••"
          required
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          error={confirmError}
        />

        <label className="flex cursor-pointer items-start gap-2 pt-1 text-sm text-white/70">
          <input
            type="checkbox"
            checked={acceptTerms}
            onChange={(e) => setAcceptTerms(e.target.checked)}
            required
            className="mt-0.5 h-4 w-4 shrink-0 rounded border-white/20 bg-white/10 text-cyan-300 focus:ring-4 focus:ring-cyan-300/20"
          />
          <span>
            I agree to the{" "}
            <span className="text-cyan-200/90">terms and conditions</span>
          </span>
        </label>

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
            {isSubmitting ? "Creating account…" : "Sign up"}
          </span>
          <span className="pointer-events-none absolute inset-0 opacity-0 transition group-hover:opacity-100">
            <span className="absolute -left-1/3 top-0 h-full w-2/3 -skew-x-12 bg-white/20 blur-xl" />
          </span>
        </button>

        <p className="pt-2 text-center text-sm text-white/70">
          Already have an account?{" "}
          <Link to="/" className="font-semibold text-white hover:underline">
            Sign in
          </Link>
        </p>
      </form>
    </AuthShell>
  );
};

export default Register;
