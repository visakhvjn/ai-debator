"use client";

import { useAuth } from "@/components/auth/AuthProvider";
import { ReadOnlyTranscript } from "@/components/debate/transcript-bubbles";
import { authedFetch } from "@/lib/client-authed-fetch";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type Turn = {
  id: string;
  role: "PRO" | "CONTRA" | "USER";
  content: string;
  sequence: number;
};

type DebatePayload = {
  id: string;
  topic: string;
  turns: Turn[];
  summaryBullets: string[] | null;
  closingRemark: string | null;
};

export default function CommunityDebatePage() {
  const router = useRouter();
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : "";
  const { user, loading: authLoading } = useAuth();
  const [debate, setDebate] = useState<DebatePayload | null>(null);
  const [debateMissing, setDebateMissing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace("/?signin=required");
      return;
    }
    if (!id) {
      setDebateMissing(true);
      return;
    }

    let cancelled = false;
    setDetailLoading(true);
    setError(null);
    setDebateMissing(false);
    setDebate(null);

    void (async () => {
      try {
        const res = await authedFetch(`/api/community/${encodeURIComponent(id)}`);
        if (cancelled) return;
        if (res.status === 401) {
          router.replace("/?signin=required");
          return;
        }
        if (res.status === 404) {
          setDebateMissing(true);
          return;
        }
        const data = await res.json();
        if (!res.ok) {
          throw new Error(
            typeof data.error === "string" ? data.error : "Could not load debate",
          );
        }
        const d = data.debate as DebatePayload | undefined;
        if (!d?.topic || !Array.isArray(d.turns)) {
          setDebateMissing(true);
          return;
        }
        setDebate(d);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Something went wrong");
        }
      } finally {
        if (!cancelled) setDetailLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [authLoading, user, id, router]);

  useEffect(() => {
    if (debate?.topic) {
      document.title = `${debate.topic.length > 60 ? `${debate.topic.slice(0, 57)}…` : debate.topic} | AI Debator`;
    }
  }, [debate?.topic]);

  if (authLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-slate-100 text-slate-500 dark:bg-slate-950 dark:text-slate-400">
        Loading…
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-dvh bg-slate-100 text-slate-800 dark:bg-slate-950 dark:text-slate-100">
      <header className="border-b border-slate-200 bg-white px-4 py-4 dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto flex max-w-2xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href="/community"
            className="text-sm font-medium text-sky-600 hover:underline dark:text-sky-400"
          >
            ← Community
          </Link>
          <Link
            href="/debate"
            className="text-sm font-medium text-slate-600 hover:underline dark:text-slate-300"
          >
            Start your own →
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-8">
        {detailLoading ? (
          <p className="text-center text-sm text-slate-500 dark:text-slate-400">
            Loading debate…
          </p>
        ) : error ? (
          <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-4 text-center text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
            {error}
          </p>
        ) : debateMissing ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center dark:border-slate-700 dark:bg-slate-900">
            <p className="text-sm text-slate-600 dark:text-slate-300">
              This debate is not available. It may be private or the link is
              wrong.
            </p>
            <Link
              href="/community"
              className="mt-4 inline-block text-sm font-medium text-sky-600 hover:underline dark:text-sky-400"
            >
              Back to Community
            </Link>
          </div>
        ) : debate ? (
          <>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Public debate
            </p>
            <h1 className="mt-1 text-xl font-semibold tracking-tight text-slate-900 dark:text-white">
              {debate.topic}
            </h1>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Read-only transcript. Pro and Contra are AI speakers.
            </p>

            <div className="mt-8">
              <ReadOnlyTranscript
                turns={debate.turns.map((t) => ({
                  id: t.id,
                  role: t.role,
                  content: t.content,
                }))}
                userLabel="Viewer"
              />
            </div>

            {debate.summaryBullets && debate.summaryBullets.length > 0 ? (
              <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Summary
                </h2>
                <ul className="mt-3 list-none space-y-2 text-sm text-slate-700 dark:text-slate-200">
                  {debate.summaryBullets.map((line, i) => (
                    <li
                      key={i}
                      className="relative pl-3 before:absolute before:left-0 before:top-2 before:h-1 before:w-1 before:rounded-full before:bg-sky-400"
                    >
                      {line}
                    </li>
                  ))}
                </ul>
                {debate.closingRemark?.trim() ? (
                  <div className="mt-4 rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                      What the debate concludes
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-slate-700 dark:text-slate-200">
                      {debate.closingRemark.trim()}
                    </p>
                  </div>
                ) : null}
              </section>
            ) : null}
          </>
        ) : null}
      </main>
    </div>
  );
}
