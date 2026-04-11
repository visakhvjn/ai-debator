"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { signInWithGoogle } from "@/components/auth/signInWithGoogle";
import { isFirebaseConfigured } from "@/lib/firebase";

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
          <nav className="flex items-center gap-2 sm:gap-3">
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
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
              >
                <GoogleIcon className="h-4 w-4 text-[#4285F4]" />
                {signingIn ? "Signing in…" : "Sign in with Google"}
              </button>
            )}
          </nav>
        </div>
      </header>

      {signinRequired ? (
        <div
          className="border-b border-amber-200 bg-amber-50 px-4 py-2 text-center text-sm text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-100"
          role="status"
        >
          Sign in to open the debate room.
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
        {/* Hero */}
        <section className="mx-auto max-w-6xl px-4 pb-16 pt-14 text-center sm:px-6 sm:pb-24 sm:pt-20">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-600 dark:text-sky-400">
            Pro vs Contra — live
          </p>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl md:text-6xl dark:text-white">
            Watch two AI agents
            <span className="text-sky-600 dark:text-sky-400"> debate </span>
            any topic
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-600 dark:text-slate-300">
            You pick the subject. We turn it into a fair, neutral claim. Then{" "}
            <strong className="text-slate-800 dark:text-slate-100">Pro</strong>{" "}
            argues for it and{" "}
            <strong className="text-slate-800 dark:text-slate-100">Contra</strong>{" "}
            against it — short turns, real back-and-forth, and a summary when you
            end the session.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-3">
            {user ? (
              <Link
                href="/debate"
                className="inline-flex w-full max-w-xs items-center justify-center rounded-full bg-sky-500 px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-sky-500/25 transition hover:bg-sky-600 sm:w-auto"
              >
                Go to debate room
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => void onGoogleSignIn()}
                disabled={signingIn || !isFirebaseConfigured()}
                className="inline-flex w-full max-w-xs items-center justify-center gap-2 rounded-full bg-sky-500 px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-sky-500/25 transition hover:bg-sky-600 disabled:opacity-50 sm:w-auto"
              >
                <GoogleIcon className="h-5 w-5 text-white" />
                {signingIn ? "Signing in…" : "Get started with Google"}
              </button>
            )}
            <a
              href="#plans"
              className="block text-sm font-semibold text-slate-600 underline-offset-4 hover:underline dark:text-slate-400"
            >
              View plans
            </a>
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
              {[
                {
                  title: "Neutral framing",
                  body: "Biased or emotional prompts are rewritten into a balanced claim so both sides can argue fairly.",
                },
                {
                  title: "Turn-by-turn debate",
                  body: "Pro and Contra alternate with timed pauses so you can read each reply before the next one lands.",
                },
                {
                  title: "Close with a summary",
                  body: "End whenever you like and get bullet takeaways plus a short closing remark on what the exchange suggested.",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="rounded-2xl border border-slate-100 bg-slate-50/80 p-6 dark:border-slate-800 dark:bg-slate-900/80"
                >
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                    {item.body}
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
            <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-sky-50 to-white p-8 dark:border-slate-700 dark:from-sky-950/40 dark:to-slate-900">
              <p className="text-sm font-medium uppercase tracking-wider text-sky-700 dark:text-sky-300">
                Under the hood
              </p>
              <p className="mt-3 text-slate-700 dark:text-slate-200">
                Each run is stored with its turns and optional end-of-debate
                summary. Agents are instructed to stay in role, avoid repeating
                points, and keep language simple so the debate stays easy to
                follow.
              </p>
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
                  Everything you need to try AI Debator and run real debates.
                </p>
                <ul className="mt-8 flex-1 space-y-3 text-sm text-slate-700 dark:text-slate-300">
                  <li className="flex gap-2">
                    <span className="text-emerald-500">●</span>
                    Pro &amp; Contra agents with timed turns
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
                <Link
                  href={user ? "/debate" : "/"}
                  className="mt-8 block w-full rounded-full border border-slate-200 py-3 text-center text-sm font-semibold text-slate-800 transition hover:bg-slate-50 dark:border-slate-600 dark:text-slate-100 dark:hover:bg-slate-800"
                >
                  {user ? "Use Basic" : "Sign in to start"}
                </Link>
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
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              © {new Date().getFullYear()} AI Debator
            </p>
            <div className="flex gap-4 text-sm">
              <Link href="/debate" className="text-sky-600 hover:underline dark:text-sky-400">
                Debate room
              </Link>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
