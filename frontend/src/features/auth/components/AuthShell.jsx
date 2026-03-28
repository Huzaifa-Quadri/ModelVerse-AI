import React from "react";

const defaultHighlights = [
  {
    title: "Your knowledge, alive",
    description:
      "Connect what you read, write, and save—then ask in your own words.",
  },
  {
    title: "Answers with context",
    description:
      "Responses grounded in your material, not generic filler.",
  },
];

export default function AuthShell({
  title,
  subtitle,
  sideBadge = "A calmer way to think with AI",
  sideTitle = "ModelVerse AI",
  sideSubtitle = "Where your ideas meet answers that actually remember you.",
  highlights = defaultHighlights,
  children,
}) {
  const cards = highlights?.length ? highlights : defaultHighlights;

  return (
    <div className="auth-bg relative min-h-dvh overflow-hidden bg-slate-950 text-white">
      <div className="pointer-events-none absolute inset-0 opacity-60">
        <div className="absolute -left-32 -top-32 h-[28rem] w-[28rem] rounded-full bg-fuchsia-500/30 blur-3xl" />
        <div className="absolute -right-40 top-1/3 h-[30rem] w-[30rem] rounded-full bg-cyan-400/25 blur-3xl" />
        <div className="absolute bottom-[-12rem] left-1/2 h-[26rem] w-[26rem] -translate-x-1/2 rounded-full bg-indigo-500/25 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-dvh max-w-6xl items-stretch px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid w-full grid-cols-1 items-center gap-8 lg:grid-cols-2 lg:gap-12">
          {/* Form: left on large screens */}
          <div className="order-2 flex justify-center lg:order-1 lg:justify-start">
            <div className="auth-card w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/40 backdrop-blur-xl sm:p-8">
              <div className="mb-6">
                <h2 className="text-2xl font-semibold tracking-tight">
                  {title}
                </h2>
                {subtitle ? (
                  <p className="mt-2 text-sm text-white/70">{subtitle}</p>
                ) : null}
              </div>
              {children}
            </div>
          </div>

          {/* Hero: right on large screens */}
          <div className="order-1 hidden lg:order-2 lg:block">
            <div className="auth-card relative rounded-3xl border border-white/10 bg-white/5 p-10 shadow-2xl shadow-black/40 backdrop-blur-xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80">
                <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
                {sideBadge}
              </div>

              <h1 className="mt-6 text-4xl font-semibold tracking-tight">
                {sideTitle}
              </h1>
              <p className="mt-4 max-w-md text-lg leading-relaxed text-white/70">
                {sideSubtitle}
              </p>

              <div className="mt-10 grid grid-cols-2 gap-4 text-sm text-white/70">
                {cards.slice(0, 2).map((item, i) => (
                  <div
                    key={i}
                    className="rounded-2xl border border-white/10 bg-white/5 p-4"
                  >
                    <div className="font-medium text-white">{item.title}</div>
                    <div className="mt-1 leading-snug">{item.description}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
