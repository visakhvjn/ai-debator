"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { signInWithGoogle } from "@/components/auth/signInWithGoogle";
import { isFirebaseConfigured } from "@/lib/firebase";
import { SampleDebateSnapshot } from "@/components/marketing/SampleDebateSnapshot";

function IconNeutralFraming({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      aria-hidden
    >
      <path strokeLinecap="round" d="M12 4v16" />
      <path strokeLinecap="round" d="M5 10h14" />
      <path
        strokeLinejoin="round"
        d="M8 10v2.5L6 18h6l-2-5.5V10M16 10v2.5L14 18h6l-2-5.5V10"
      />
    </svg>
  );
}

function IconTurnDebate({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5"
      />
    </svg>
  );
}

function IconSummary({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
      />
    </svg>
  );
}

function IconCommunity({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
      />
    </svg>
  );
}

/** Decorative scene: two sides, one topic — no implementation details. */
function DebateSceneIllustration({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 320 240"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-labelledby="debate-scene-title"
    >
      <title id="debate-scene-title">
        Illustration of two viewpoints in conversation around a shared topic
      </title>
      <ellipse
        cx="160"
        cy="200"
        rx="120"
        ry="28"
        className="fill-slate-200/60 dark:fill-slate-800/50"
      />
      <rect
        x="88"
        y="16"
        width="144"
        height="36"
        rx="18"
        className="fill-white stroke-slate-200 dark:fill-slate-800/90 dark:stroke-slate-600"
        strokeWidth="1.5"
      />
      <line
        x1="108"
        y1="30"
        x2="212"
        y2="30"
        className="stroke-slate-300 dark:stroke-slate-500"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <line
        x1="108"
        y1="40"
        x2="180"
        y2="40"
        className="stroke-slate-200 dark:stroke-slate-600"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M52 128 Q160 168 268 128"
        className="stroke-slate-300/80 dark:stroke-slate-600"
        strokeWidth="1.5"
        strokeDasharray="5 8"
        strokeLinecap="round"
      />
      <rect
        x="24"
        y="76"
        width="132"
        height="92"
        rx="14"
        className="fill-sky-100 stroke-sky-300 dark:fill-sky-950/70 dark:stroke-sky-700"
        strokeWidth="1.5"
      />
      <circle cx="56" cy="108" r="18" className="fill-sky-500" />
      <text
        x="56"
        y="114"
        textAnchor="middle"
        className="fill-white text-[13px] font-bold"
        style={{ fontFamily: "system-ui, sans-serif" }}
      >
        P
      </text>
      <line
        x1="44"
        y1="136"
        x2="130"
        y2="136"
        className="stroke-sky-400/50 dark:stroke-sky-600/60"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <line
        x1="44"
        y1="148"
        x2="110"
        y2="148"
        className="stroke-sky-400/40 dark:stroke-sky-600/50"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <line
        x1="44"
        y1="160"
        x2="98"
        y2="160"
        className="stroke-sky-400/35 dark:stroke-sky-600/45"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <rect
        x="164"
        y="76"
        width="132"
        height="92"
        rx="14"
        className="fill-orange-100 stroke-orange-300 dark:fill-orange-950/50 dark:stroke-orange-800"
        strokeWidth="1.5"
      />
      <circle cx="264" cy="108" r="18" className="fill-orange-500" />
      <text
        x="264"
        y="114"
        textAnchor="middle"
        className="fill-white text-[13px] font-bold"
        style={{ fontFamily: "system-ui, sans-serif" }}
      >
        C
      </text>
      <line
        x1="190"
        y1="136"
        x2="276"
        y2="136"
        className="stroke-orange-400/50 dark:stroke-orange-600/60"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <line
        x1="210"
        y1="148"
        x2="276"
        y2="148"
        className="stroke-orange-400/40 dark:stroke-orange-600/50"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <line
        x1="222"
        y1="160"
        x2="276"
        y2="160"
        className="stroke-orange-400/35 dark:stroke-orange-600/45"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      <path
        fill="currentColor"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="currentColor"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="currentColor"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="currentColor"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

export function MarketingHome() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [signInError, setSignInError] = useState<string | null>(null);
  const [signingIn, setSigningIn] = useState(false);

  const signinRequired = searchParams.get("signin") === "required";
  const configureFirebase = searchParams.get("configure") === "firebase";

  const onGoogleSignIn = useCallback(async () => {
    setSignInError(null);
    if (!isFirebaseConfigured()) {
      setSignInError("Firebase is not configured. Add keys to .env.local.");
      return;
    }
    setSigningIn(true);
    try {
      await signInWithGoogle();
      router.push("/debate");
    } catch (e) {
      setSignInError(
        e instanceof Error ? e.message : "Sign-in failed. Try again.",
      );
    } finally {
      setSigningIn(false);
    }
  }, [router]);

  return (
    <div className="min-h-dvh bg-gradient-to-b from-slate-50 via-white to-sky-50/40 text-slate-800 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 dark:text-slate-100">
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/90">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link href="/" className="text-lg font-bold tracking-tight text-sky-600 dark:text-sky-400">
            AI Debator
          </Link>
          <div className="flex min-w-0 flex-1 flex-row-reverse items-center justify-end gap-3 sm:flex-row sm:gap-8">
            <Link
              href="/community"
              className="inline-flex shrink-0 items-center gap-1.5 rounded-lg py-1.5 pl-1 pr-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100/80 hover:text-sky-600 dark:text-slate-300 dark:hover:bg-slate-800/60 dark:hover:text-sky-400 sm:-ml-2"
            >
              <IconCommunity className="h-4 w-4 shrink-0 opacity-90" />
              Community
            </Link>
            <nav className="flex min-w-0 shrink-0 items-center justify-end gap-2 sm:gap-3">
              {loading ? (
                <span className="h-8 w-8 animate-pulse rounded-full bg-slate-200 dark:bg-slate-700" />
              ) : user ? (
                <>
                  <span className="hidden max-w-[10rem] truncate text-sm text-slate-600 dark:text-slate-300 sm:inline">
                    {user.displayName ?? user.email}
                  </span>
                  <Link
                    href="/debate"
                    className="rounded-full bg-sky-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-600"
                  >
                    Open app
                  </Link>
                  <button
                    type="button"
                    onClick={() => void signOut()}
                    className="rounded-full border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
                  >
                    Sign out
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => void onGoogleSignIn()}
                  disabled={signingIn}
                  className="hidden items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50 disabled:opacity-50 sm:inline-flex dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
                >
                  <GoogleIcon className="h-4 w-4 text-[#4285F4]" />
                  {signingIn ? "Signing in…" : "Sign in with Google"}
                </button>
              )}
            </nav>
          </div>
        </div>
      </header>

      {signinRequired ? (
        <div
          className="border-b border-amber-200 bg-amber-50 px-4 py-2 text-center text-sm text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-100"
          role="status"
        >
          Sign in with Google to use the debate room or browse Community.
        </div>
      ) : null}
      {configureFirebase ? (
        <div
          className="border-b border-red-200 bg-red-50 px-4 py-2 text-center text-sm text-red-900 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-100"
          role="alert"
        >
          Add Firebase keys to <code className="rounded bg-red-100 px-1 dark:bg-red-900/60">.env.local</code>{" "}
          (see <code className="rounded bg-red-100 px-1 dark:bg-red-900/60">.env.example</code>).
        </div>
      ) : null}
      {signInError ? (
        <div className="border-b border-red-200 bg-red-50 px-4 py-2 text-center text-sm text-red-800 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-200">
          {signInError}
        </div>
      ) : null}

      <main>
        {/* Hero — two columns: story + sample snapshot */}
        <section className="mx-auto max-w-6xl px-4 pb-16 pt-14 sm:px-6 sm:pb-24 sm:pt-20">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-start lg:gap-16">
            <div className="mx-auto max-w-xl text-center lg:mx-0 lg:max-w-lg lg:text-left">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-600 dark:text-sky-400">
                Pro vs Contra — live
              </p>
              <h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl lg:text-5xl xl:text-6xl dark:text-white">
                Watch two AI agents
                <span className="text-sky-600 dark:text-sky-400"> debate </span>
                any topic
              </h1>
              <p className="mt-6 text-lg leading-relaxed text-slate-600 dark:text-slate-300">
                <strong className="text-slate-800 dark:text-slate-100">
                  AI Debator
                </strong>{" "}
                is a simple debate room: you choose a subject, we rephrase it into
                a balanced claim when needed, then two agents take turns —{" "}
                <strong className="text-slate-800 dark:text-slate-100">Pro</strong>{" "}
                for and{" "}
                <strong className="text-slate-800 dark:text-slate-100">Contra</strong>{" "}
                against. You can chime in, follow along on a steady rhythm, and end
                whenever you want a written summary. Past debates stay in your
                sidebar; you can also share finished ones on Community.
              </p>
              <div className="mt-10 flex flex-row flex-wrap items-center justify-center gap-3 lg:justify-start">
                {user ? (
                  <Link
                    href="/debate"
                    className="inline-flex shrink-0 items-center justify-center rounded-full bg-sky-500 px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-sky-500/25 transition hover:bg-sky-600"
                  >
                    Go to debate room
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={() => void onGoogleSignIn()}
                    disabled={signingIn || !isFirebaseConfigured()}
                    className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-sky-500 px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-sky-500/25 transition hover:bg-sky-600 disabled:opacity-50"
                  >
                    <GoogleIcon className="h-5 w-5 text-white" />
                    {signingIn ? "Signing in…" : "Get started with Google"}
                  </button>
                )}
                <a
                  href="#plans"
                  className="inline-flex shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white/80 px-6 py-3.5 text-sm font-medium text-slate-500 shadow-none transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-700 dark:border-slate-600 dark:bg-slate-900/50 dark:text-slate-400 dark:hover:border-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-300"
                >
                  View plans
                </a>
              </div>
            </div>

            <div className="mx-auto flex w-full max-w-md justify-center lg:mx-0 lg:max-w-none lg:justify-end">
              <div className="w-full max-w-md lg:sticky lg:top-24">
                <SampleDebateSnapshot />
              </div>
            </div>
          </div>
        </section>

        {/* What is AI Debator */}
        <section className="border-y border-slate-200 bg-white py-16 dark:border-slate-800 dark:bg-slate-900/50 sm:py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <h2 className="text-center text-3xl font-bold text-slate-900 dark:text-white">
              What is AI Debator?
            </h2>
            <p className="mx-auto mt-4 max-w-3xl text-center text-lg text-slate-600 dark:text-slate-300">
              AI Debator is a focused chat experience where two specialized
              agents — one supporting your topic and one opposing it — take turns
              making concise arguments. It is built for clarity: neutral framing,
              readable messages, and history you can revisit from the sidebar.
            </p>
            <div className="mt-14 grid gap-10 sm:grid-cols-3">
              {(
                [
                  {
                    title: "Neutral framing",
                    body: "Biased or emotional prompts are rewritten into a balanced claim so both sides can argue fairly.",
                    Icon: IconNeutralFraming,
                  },
                  {
                    title: "Turn-by-turn debate",
                    body: "Pro and Contra alternate with timed pauses so you can read each reply before the next one lands.",
                    Icon: IconTurnDebate,
                  },
                  {
                    title: "Close with a summary",
                    body: "End whenever you like and get bullet takeaways plus a short closing remark on what the exchange suggested.",
                    Icon: IconSummary,
                  },
                ] as const
              ).map(({ title, body, Icon }) => (
                <div
                  key={title}
                  className="rounded-2xl border border-slate-100 bg-slate-50/80 p-6 shadow-sm transition-shadow duration-300 hover:shadow-xl hover:shadow-slate-300/70 dark:border-slate-800 dark:bg-slate-900/80 dark:shadow-none dark:hover:shadow-xl dark:hover:shadow-black/50"
                >
                  <div
                    className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-sky-100 text-sky-600 dark:bg-sky-950/55 dark:text-sky-400"
                    aria-hidden
                  >
                    <Icon className="h-6 w-6 shrink-0" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                    {title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                    {body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Who it is for */}
        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <div className="grid gap-10 md:grid-cols-2 md:items-center">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
                Explore ideas without picking a side first
              </h2>
              <p className="mt-4 text-slate-600 dark:text-slate-300">
                Use AI Debator to stress-test opinions, compare arguments, prep for
                discussions, or simply see a topic from two disciplined angles.
                You stay in control: start the topic, watch the thread, end when
                you are done.
              </p>
              <ul className="mt-6 space-y-3 text-sm text-slate-600 dark:text-slate-400">
                <li className="flex gap-2">
                  <span className="text-sky-500">✓</span>
                  Saved debates and transcripts in your workspace
                </li>
                <li className="flex gap-2">
                  <span className="text-sky-500">✓</span>
                  Mobile-friendly layout with quick actions
                </li>
                <li className="flex gap-2">
                  <span className="text-sky-500">✓</span>
                  Sign in with Google to keep sessions tied to your account
                </li>
              </ul>
            </div>
            <div className="flex flex-col items-center justify-center rounded-3xl border border-slate-200 bg-gradient-to-br from-sky-50 to-white px-6 py-10 dark:border-slate-700 dark:from-sky-950/40 dark:to-slate-900">
              <DebateSceneIllustration className="h-auto w-full max-w-[17.5rem] text-slate-800 dark:text-slate-100" />
              <p className="mt-6 text-center text-sm font-medium text-slate-600 dark:text-slate-400">
                Two perspectives, one thread — you steer the conversation.
              </p>
            </div>
          </div>
        </section>

        {/* Community debates */}
        <section
          id="community-debates"
          className="border-t border-slate-200 bg-gradient-to-b from-slate-50 to-white py-16 dark:border-slate-800 dark:from-slate-900/90 dark:to-slate-950 sm:py-20"
        >
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <h2 className="text-center text-3xl font-bold text-slate-900 dark:text-white">
              Community debates
            </h2>
            <p className="mx-auto mt-4 max-w-3xl text-center text-lg leading-relaxed text-slate-600 dark:text-slate-300">
              When a debate ends, you can choose to make it{" "}
              <strong className="text-slate-800 dark:text-slate-100">public</strong>
              . It then appears on{" "}
              <strong className="text-slate-800 dark:text-slate-100">Community</strong>{" "}
              — a shared library of finished debates other signed-in users can open
              and read. Nothing is public by default; you can take a debate private
              again anytime.
            </p>
            <ul className="mx-auto mt-10 max-w-2xl space-y-4 text-left text-slate-600 dark:text-slate-400">
              <li className="flex gap-3">
                <span className="shrink-0 font-semibold text-sky-600 dark:text-sky-400">
                  ✓
                </span>
                <span>
                  <strong className="text-slate-800 dark:text-slate-200">
                    Learn from real threads
                  </strong>{" "}
                  — skim how Pro and Contra handled a topic you care about, without
                  starting from scratch.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="shrink-0 font-semibold text-sky-600 dark:text-sky-400">
                  ✓
                </span>
                <span>
                  <strong className="text-slate-800 dark:text-slate-200">
                    Share strong work
                  </strong>{" "}
                  — when the back-and-forth turned out well, a public link lets
                  friends, classmates, or teammates read the same transcript and
                  summary you see.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="shrink-0 font-semibold text-sky-600 dark:text-sky-400">
                  ✓
                </span>
                <span>
                  <strong className="text-slate-800 dark:text-slate-200">
                    Stay in control
                  </strong>{" "}
                  — Community only lists debates you explicitly publish after they
                  end. Viewer lines you added stay in the transcript; you can unpublish
                  whenever you like.
                </span>
              </li>
            </ul>
            <p className="mx-auto mt-8 max-w-2xl text-center text-sm text-slate-500 dark:text-slate-500">
              Community is for signed-in users. From the debate room, use the
              sidebar link or publish an ended debate from the summary card.
            </p>
            <div className="mt-8 flex justify-center">
              <Link
                href="/community"
                className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-6 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-sky-300 hover:bg-sky-50 hover:text-sky-800 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-sky-700 dark:hover:bg-sky-950/50 dark:hover:text-sky-200"
              >
                Open Community
              </Link>
            </div>
          </div>
        </section>

        {/* Plans */}
        <section
          id="plans"
          className="border-t border-slate-200 bg-slate-100 py-16 dark:border-slate-800 dark:bg-slate-950/80 sm:py-20"
        >
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <h2 className="text-center text-3xl font-bold text-slate-900 dark:text-white">
              Plans
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-center text-slate-600 dark:text-slate-400">
              Start free. Upgrade when you want stronger models and richer
              debates.
            </p>
            <div className="mt-12 grid gap-8 md:grid-cols-2 md:gap-10">
              {/* Basic */}
              <div className="flex flex-col rounded-3xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">
                  Basic
                </p>
                <p className="mt-2 text-4xl font-bold text-slate-900 dark:text-white">
                  Free
                </p>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                  Run real debates by connecting your own OpenAI API key — no
                  subscription from us on Basic.
                </p>
                <ul className="mt-8 flex-1 space-y-3 text-sm text-slate-700 dark:text-slate-300">
                  <li className="flex gap-2">
                    <span className="text-emerald-500">●</span>
                    Pro &amp; Contra agents with timed turns
                  </li>
                  <li className="flex gap-2">
                    <span className="text-emerald-500">●</span>
                    <span>
                      <strong className="font-semibold text-slate-900 dark:text-white">
                        Your OpenAI API key
                      </strong>
                      — add your key to run the app; usage is billed by OpenAI,
                      not by AI Debator
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-emerald-500">●</span>
                    Neutral topic rewriting from your prompt
                  </li>
                  <li className="flex gap-2">
                    <span className="text-emerald-500">●</span>
                    Debate history &amp; end-of-debate summary
                  </li>
                  <li className="flex gap-2">
                    <span className="text-emerald-500">●</span>
                    Standard model quality &amp; sensible limits
                  </li>
                </ul>
                {user ? (
                  <Link
                    href="/debate"
                    className="mt-8 block w-full rounded-full border border-slate-200 py-3 text-center text-sm font-semibold text-slate-800 transition hover:bg-slate-50 dark:border-slate-600 dark:text-slate-100 dark:hover:bg-slate-800"
                  >
                    Use Basic
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={() => void onGoogleSignIn()}
                    disabled={signingIn || !isFirebaseConfigured()}
                    className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-full border border-slate-200 py-3 text-center text-sm font-semibold text-slate-800 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:text-slate-100 dark:hover:bg-slate-800 dark:disabled:hover:bg-transparent"
                  >
                    <GoogleIcon className="h-4 w-4 text-[#4285F4]" />
                    {signingIn ? "Signing in…" : "Sign in to start"}
                  </button>
                )}
              </div>

              {/* Plus */}
              <div className="relative flex flex-col rounded-3xl border-2 border-sky-500 bg-white p-8 shadow-lg shadow-sky-500/10 dark:border-sky-500 dark:bg-slate-900">
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-sky-500 px-3 py-0.5 text-xs font-bold uppercase tracking-wide text-white">
                  Plus
                </span>
                <p className="text-sm font-semibold uppercase tracking-wider text-sky-600 dark:text-sky-400">
                  Plus
                </p>
                <p className="mt-2 text-4xl font-bold text-slate-900 dark:text-white">
                  Paid
                </p>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                  For power users who want the strongest agents and the deepest
                  debates.
                </p>
                <ul className="mt-8 flex-1 space-y-3 text-sm text-slate-700 dark:text-slate-300">
                  <li className="flex gap-2">
                    <span className="text-sky-500">●</span>
                    <strong className="text-slate-900 dark:text-white">
                      Better agents
                    </strong>{" "}
                    — sharper reasoning and tighter rebuttals
                  </li>
                  <li className="flex gap-2">
                    <span className="text-sky-500">●</span>
                    <strong className="text-slate-900 dark:text-white">
                      Better debates
                    </strong>{" "}
                    — richer context and more nuanced exchanges
                  </li>
                  <li className="flex gap-2">
                    <span className="text-sky-500">●</span>
                    <strong className="text-slate-900 dark:text-white">
                      Better AI models
                    </strong>{" "}
                    — access to premium-tier models when you debate
                  </li>
                  <li className="flex gap-2">
                    <span className="text-sky-500">●</span>
                    <strong className="text-slate-900 dark:text-white">
                      Unlimited points
                    </strong>{" "}
                    — no caps on arguments and summary depth (within fair use)
                  </li>
                </ul>
                <button
                  type="button"
                  disabled
                  className="mt-8 w-full cursor-not-allowed rounded-full bg-sky-500 py-3 text-sm font-semibold text-white opacity-70"
                >
                  Coming soon
                </button>
                <p className="mt-2 text-center text-xs text-slate-500">
                  Billing and upgrades will be available in a future release.
                </p>
              </div>
            </div>
          </div>
        </section>

        <footer className="border-t border-slate-200 bg-white py-10 dark:border-slate-800 dark:bg-slate-900">
          <div className="mx-auto max-w-6xl px-4 text-center sm:px-6 sm:text-left">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              © {new Date().getFullYear()} AI Debator
            </p>
          </div>
        </footer>
      </main>
    </div>
  );
}
