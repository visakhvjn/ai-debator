"use client";

import { useAuth } from "@/components/auth/AuthProvider";
import { authedFetch } from "@/lib/client-authed-fetch";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

type ListDebate = {
  id: string;
  topic: string;
  updatedAt: string;
  turnCount: number;
};

export default function CommunityPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [debates, setDebates] = useState<ListDebate[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [listLoading, setListLoading] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace("/?signin=required");
      return;
    }

    let cancelled = false;
    setListLoading(true);
    setError(null);

    void (async () => {
      try {
        const res = await authedFetch("/api/community");
        if (cancelled) return;
        if (res.status === 401) {
          router.replace("/?signin=required");
          return;
        }
        const data = await res.json();
        if (!res.ok) {
          throw new Error(
            typeof data.error === "string" ? data.error : "Could not load list",
          );
        }
        setDebates(Array.isArray(data.debates) ? data.debates : []);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Something went wrong");
          setDebates([]);
        }
      } finally {
        if (!cancelled) setListLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [authLoading, user, router]);

  const formatDate = useCallback((iso: string) => {
    try {
      return new Date(iso).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return "";
    }
  }, []);

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
      <header className="border-b border-slate-200 bg-white px-4 py-6 dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            AI Debator
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
            Community
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            Public, finished debates from people who chose to share them. Sign
            in is required to browse here.
          </p>
          <Link
            href="/debate"
            className="mt-4 inline-block text-sm font-medium text-sky-600 hover:underline dark:text-sky-400"
          >
            Go to your debates →
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-8">
        {listLoading || debates === null ? (
          <p className="text-center text-sm text-slate-500 dark:text-slate-400">
            Loading debates…
          </p>
        ) : error ? (
          <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-4 text-center text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
            {error}
          </p>
        ) : debates.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-slate-300 bg-white/60 px-4 py-8 text-center text-sm text-slate-500 dark:border-slate-600 dark:bg-slate-900/40 dark:text-slate-400">
            No public debates yet. When someone ends a debate and chooses
            &quot;Make public,&quot; it will show up here.
          </p>
        ) : (
          <ul className="space-y-3">
            {debates.map((d) => (
              <li key={d.id}>
                <Link
                  href={`/community/${d.id}`}
                  className="block rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-sky-200 hover:bg-sky-50/40 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-sky-800 dark:hover:bg-sky-950/30"
                >
                  <h2 className="font-medium text-slate-900 dark:text-white">
                    {d.topic}
                  </h2>
                  <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                    {d.turnCount} message{d.turnCount === 1 ? "" : "s"} ·{" "}
                    {formatDate(d.updatedAt)}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
