"use client";

import { useAuth } from "@/components/auth/AuthProvider";
import { CreditsModal } from "@/components/debate/CreditsModal";
import { authedFetch } from "@/lib/client-authed-fetch";
import { markDebatorLogoutIntent } from "@/lib/logout-intent";
import { useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

type Turn = {
  turnId: string;
  role: "PRO" | "CONTRA" | "USER";
  content: string;
  sequence: number;
};

function proContraTurnCount(turns: Turn[]): number {
  return turns.filter((t) => t.role === "PRO" || t.role === "CONTRA").length;
}

type SidebarDebate = {
  id: string;
  topic: string;
  status: "ACTIVE" | "ENDED";
  updatedAt: string;
  turnCount: number;
};

type CreditsState = {
  used: number;
  remaining: number;
  limit: number;
  resetsAt: string;
  unlimited?: boolean;
};

function parseCredits(raw: unknown): CreditsState | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  if (
    typeof o.used === "number" &&
    typeof o.remaining === "number" &&
    typeof o.limit === "number" &&
    typeof o.resetsAt === "string"
  ) {
    return {
      used: o.used,
      remaining: o.remaining,
      limit: o.limit,
      resetsAt: o.resetsAt,
      unlimited: o.unlimited === true,
    };
  }
  return null;
}

function formatListTime(iso: string) {
  try {
    const d = new Date(iso);
    const now = new Date();
    const sameDay =
      d.getDate() === now.getDate() &&
      d.getMonth() === now.getMonth() &&
      d.getFullYear() === now.getFullYear();
    if (sameDay) {
      return d.toLocaleTimeString(undefined, {
        hour: "numeric",
        minute: "2-digit",
      });
    }
    return d.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
  } catch {
    return "";
  }
}

function MessageBubble({
  role,
  children,
}: {
  role: "PRO" | "CONTRA";
  children: ReactNode;
}) {
  const isPro = role === "PRO";
  return (
    <div
      className={`flex w-full gap-2 ${isPro ? "justify-start" : "justify-end"}`}
    >
      {isPro ? (
        <div
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sky-100 text-xs font-bold text-sky-700 dark:bg-sky-900/60 dark:text-sky-200"
          aria-hidden
        >
          P
        </div>
      ) : null}
      <div
        className={`max-w-[min(100%,28rem)] rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm ${
          isPro
            ? "rounded-tl-sm border border-sky-100 bg-sky-50 text-slate-800 dark:border-sky-900/50 dark:bg-sky-950/40 dark:text-slate-100"
            : "rounded-tr-sm border border-orange-100 bg-orange-50 text-slate-800 dark:border-orange-900/50 dark:bg-orange-950/35 dark:text-slate-100"
        }`}
      >
        <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          {isPro ? "Pro" : "Contra"}
        </p>
        {children}
      </div>
      {!isPro ? (
        <div
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orange-100 text-xs font-bold text-orange-800 dark:bg-orange-900/60 dark:text-orange-200"
          aria-hidden
        >
          C
        </div>
      ) : null}
    </div>
  );
}

function UserMessageBubble({ children }: { children: ReactNode }) {
  return (
    <div className="flex w-full gap-2 justify-start">
      <div
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet-100 text-xs font-bold text-violet-800 dark:bg-violet-900/60 dark:text-violet-200"
        aria-hidden
      >
        U
      </div>
      <div className="max-w-[min(100%,28rem)] rounded-2xl rounded-tl-sm border border-violet-200 bg-violet-50 px-4 py-2.5 text-sm leading-relaxed text-slate-800 shadow-sm dark:border-violet-800/60 dark:bg-violet-950/35 dark:text-slate-100">
        <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-violet-600 dark:text-violet-300">
          You
        </p>
        {children}
      </div>
    </div>
  );
}

function ThinkingRow({ role }: { role: "PRO" | "CONTRA" }) {
  const isPro = role === "PRO";
  return (
    <div
      className={`flex w-full gap-2 ${isPro ? "justify-start" : "justify-end"}`}
    >
      {isPro ? (
        <div
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sky-100 text-xs font-bold text-sky-700 dark:bg-sky-900/60 dark:text-sky-200"
          aria-hidden
        >
          P
        </div>
      ) : null}
      <div
        className={`flex max-w-[min(100%,28rem)] items-center gap-2 rounded-2xl border border-dashed px-4 py-2.5 text-sm ${
          isPro
            ? "rounded-tl-sm border-sky-200 bg-sky-50/80 text-sky-900 dark:border-sky-800 dark:bg-sky-950/30 dark:text-sky-200"
            : "rounded-tr-sm border-orange-200 bg-orange-50/80 text-orange-900 dark:border-orange-800 dark:bg-orange-950/30 dark:text-orange-200"
        }`}
      >
        <span className="inline-flex h-2 w-2 animate-pulse rounded-full bg-current opacity-70" />
        {isPro ? "Pro is thinking…" : "Contra is thinking…"}
      </div>
      {!isPro ? (
        <div
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orange-100 text-xs font-bold text-orange-800 dark:bg-orange-900/60 dark:text-orange-200"
          aria-hidden
        >
          C
        </div>
      ) : null}
    </div>
  );
}

export default function Home() {
  const router = useRouter();
  const { signOut } = useAuth();
  const [logoutBusy, setLogoutBusy] = useState(false);

  const [sidebarDebates, setSidebarDebates] = useState<SidebarDebate[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingDebate, setLoadingDebate] = useState(false);

  const [topicInput, setTopicInput] = useState("");
  const [debateId, setDebateId] = useState<string | null>(null);
  const [currentTopic, setCurrentTopic] = useState("");
  const [originalUserTopic, setOriginalUserTopic] = useState<string | null>(
    null,
  );
  const [messages, setMessages] = useState<Turn[]>([]);
  const [thinking, setThinking] = useState<"PRO" | "CONTRA" | null>(null);
  const [ended, setEnded] = useState(false);
  const [summary, setSummary] = useState<string[] | null>(null);
  const [closingRemark, setClosingRemark] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [topicBusy, setTopicBusy] = useState(false);
  const [endBusy, setEndBusy] = useState(false);
  const [credits, setCredits] = useState<CreditsState | null>(null);
  const [creditsModalOpen, setCreditsModalOpen] = useState(false);
  const [interjectInput, setInterjectInput] = useState("");
  const [interjectBusy, setInterjectBusy] = useState(false);

  const endedRef = useRef(false);
  endedRef.current = ended;
  const creditsRef = useRef<CreditsState | null>(null);
  creditsRef.current = credits;

  const debateActive = Boolean(debateId && !ended && !summary);
  const outOfCredits =
    credits !== null && !credits.unlimited && credits.remaining <= 0;

  const handleLogout = useCallback(async () => {
    setLogoutBusy(true);
    try {
      if (debateActive && debateId) {
        setEnded(true);
        setThinking(null);
        try {
          await authedFetch("/end", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ debateId }),
          });
        } catch {
          /* still sign out */
        }
      }
      markDebatorLogoutIntent();
      await signOut();
      router.replace("/");
      router.refresh();
    } finally {
      setLogoutBusy(false);
    }
  }, [router, signOut, debateActive, debateId]);

  const messagesScrollRef = useRef<HTMLDivElement>(null);
  const summarySectionRef = useRef<HTMLDivElement>(null);

  const refreshDebates = useCallback(async () => {
    try {
      const res = await authedFetch("/debates");
      if (res.status === 401) {
        router.replace("/?signin=required");
        return;
      }
      const data = await res.json();
      if (!res.ok) return;
      setSidebarDebates(data.debates ?? []);
      const c = parseCredits(data.credits);
      if (c) setCredits(c);
    } catch {
      /* ignore */
    } finally {
      setLoadingList(false);
    }
  }, [router]);

  useEffect(() => {
    void refreshDebates();
  }, [refreshDebates]);

  const loadDebate = useCallback(async (id: string) => {
    setLoadingDebate(true);
    setError(null);
    setThinking(null);
    try {
      const res = await authedFetch(
        `/api/debate?id=${encodeURIComponent(id)}`,
      );
      if (res.status === 401) {
        router.replace("/?signin=required");
        return;
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not load debate");
      const c = parseCredits(data.credits);
      if (c) setCredits(c);
      const d = data.debate;
      setSelectedId(d.id);
      setDebateId(d.id);
      setCurrentTopic(d.topic);
      setOriginalUserTopic(
        typeof d.originalTopic === "string" && d.originalTopic.trim()
          ? d.originalTopic.trim()
          : null,
      );
      setMessages(d.turns ?? []);
      setInterjectInput("");
      const isEnded = d.status === "ENDED";
      setEnded(isEnded);
      if (isEnded && d.summaryBullets?.length) {
        setSummary(d.summaryBullets);
        setClosingRemark(
          typeof d.closingRemark === "string" ? d.closingRemark : null,
        );
      } else {
        setSummary(null);
        setClosingRemark(null);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
      setSelectedId(null);
      setDebateId(null);
      setMessages([]);
      setCurrentTopic("");
      setOriginalUserTopic(null);
    } finally {
      setLoadingDebate(false);
    }
  }, [router]);

  const startNewChat = useCallback(() => {
    if (debateActive) return;
    setSelectedId(null);
    setDebateId(null);
    setCurrentTopic("");
    setOriginalUserTopic(null);
    setMessages([]);
    setEnded(false);
    setSummary(null);
    setClosingRemark(null);
    setThinking(null);
    setError(null);
    setEndBusy(false);
    setInterjectInput("");
  }, [debateActive]);

  const startDebate = useCallback(async () => {
    if (debateActive) {
      setError("End the current debate before starting a new one.");
      return;
    }
    if (credits !== null && !credits.unlimited && credits.remaining <= 0) {
      setError(
        "You've used today's messages (50 per UTC day). Credits reset at midnight UTC.",
      );
      return;
    }
    const topic = topicInput.trim();
    if (!topic) {
      setError("Type a topic to start.");
      return;
    }
    setError(null);
    setSummary(null);
    setClosingRemark(null);
    setTopicBusy(true);
    try {
      const res = await authedFetch("/topic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic }),
      });
      if (res.status === 401) {
        router.replace("/?signin=required");
        return;
      }
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 429) {
          const c = parseCredits(data.credits);
          if (c) setCredits(c);
        }
        throw new Error(data.error || "Could not start debate");
      }
      const cAfter = parseCredits(data.credits);
      if (cAfter) setCredits(cAfter);
      const id = data.debateId as string;
      setDebateId(id);
      setSelectedId(id);
      setCurrentTopic(data.topic ?? topic);
      setOriginalUserTopic(
        typeof data.originalTopic === "string" && data.originalTopic.trim()
          ? data.originalTopic.trim()
          : null,
      );
      setMessages([]);
      setEnded(false);
      setTopicInput("");
      await refreshDebates();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setTopicBusy(false);
    }
  }, [topicInput, refreshDebates, debateActive, router, credits]);

  const endDebate = useCallback(async () => {
    if (!debateId) return;
    setError(null);
    setEndBusy(true);
    setThinking(null);
    setEnded(true);
    try {
      const res = await authedFetch("/end", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ debateId }),
      });
      if (res.status === 401) {
        setEnded(false);
        router.replace("/?signin=required");
        return;
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not end debate");
      setSummary(data.summary ?? []);
      setClosingRemark(
        typeof data.closingRemark === "string" ? data.closingRemark : "",
      );
      await refreshDebates();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
      setClosingRemark(null);
      setEnded(false);
    } finally {
      setEndBusy(false);
    }
  }, [debateId, refreshDebates, router]);

  useEffect(() => {
    if (!debateId || ended) return undefined;

    const ac = new AbortController();

    const run = async () => {
      if (
        creditsRef.current !== null &&
        !creditsRef.current.unlimited &&
        creditsRef.current.remaining <= 0
      ) {
        setThinking(null);
        if (debateId) void loadDebate(debateId);
        return;
      }

      const pc = proContraTurnCount(messages);
      const nextRole: "PRO" | "CONTRA" =
        pc % 2 === 0 ? "PRO" : "CONTRA";
      setThinking(nextRole);

      try {
        await new Promise<void>((resolve, reject) => {
          const t = setTimeout(resolve, 10000);
          ac.signal.addEventListener(
            "abort",
            () => {
              clearTimeout(t);
              reject(new DOMException("Aborted", "AbortError"));
            },
            { once: true },
          );
        });
      } catch (e) {
        if ((e as DOMException).name === "AbortError") return;
        throw e;
      }

      if (ac.signal.aborted || endedRef.current) return;

      if (
        creditsRef.current !== null &&
        !creditsRef.current.unlimited &&
        creditsRef.current.remaining <= 0
      ) {
        setThinking(null);
        if (debateId) void loadDebate(debateId);
        return;
      }

      const res = await authedFetch("/next", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ debateId }),
        signal: ac.signal,
      });

      if (res.status === 401) {
        if (!ac.signal.aborted) router.replace("/?signin=required");
        return;
      }

      const data = await res.json();
      if (!res.ok) {
        if (!ac.signal.aborted) {
          if (data.credits) {
            const c = parseCredits(data.credits);
            if (c) setCredits(c);
          }
          setThinking(null);
          if (debateId) await loadDebate(debateId);
          setError(
            typeof data.error === "string" && data.error.trim()
              ? data.error.trim()
              : "Failed to get the next reply",
          );
        }
        return;
      }

      if (ac.signal.aborted || endedRef.current) return;

      const cNext = parseCredits(data.credits);
      if (cNext) setCredits(cNext);

      setThinking(null);
      setMessages((m) => [
        ...m,
        {
          turnId: data.turnId,
          role: data.role,
          content: data.content,
          sequence: data.sequence,
        },
      ]);

      if (
        cNext &&
        !cNext.unlimited &&
        cNext.remaining <= 0 &&
        debateId
      ) {
        await loadDebate(debateId);
      }
    };

    void run();

    return () => {
      ac.abort();
    };
  }, [debateId, messages.length, ended, router, loadDebate]);

  const sendInterjection = useCallback(async () => {
    if (!debateId || !debateActive) return;
    const text = interjectInput.trim();
    if (!text) return;
    setError(null);
    setInterjectBusy(true);
    try {
      const res = await authedFetch("/interject", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ debateId, content: text }),
      });
      if (res.status === 401) {
        router.replace("/?signin=required");
        return;
      }
      const data = await res.json();
      if (!res.ok) {
        throw new Error(
          typeof data.error === "string" && data.error.trim()
            ? data.error.trim()
            : "Could not send your message",
        );
      }
      const c = parseCredits(data.credits);
      if (c) setCredits(c);
      setInterjectInput("");
      setMessages((m) => [
        ...m,
        {
          turnId: data.turnId,
          role: data.role as Turn["role"],
          content: data.content,
          sequence: data.sequence,
        },
      ]);
      await refreshDebates();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setInterjectBusy(false);
    }
  }, [
    debateId,
    debateActive,
    interjectInput,
    router,
    refreshDebates,
  ]);

  const isNewChat = selectedId === null;
  const showComposer = isNewChat && !loadingDebate;

  useEffect(() => {
    const el = messagesScrollRef.current;
    if (!el) return;
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
      });
    });
    return () => cancelAnimationFrame(id);
  }, [messages, thinking, summary, endBusy]);

  useEffect(() => {
    if (!summary?.length) return;
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        summarySectionRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
        });
      });
    });
    return () => cancelAnimationFrame(id);
  }, [summary]);

  return (
    <div className="flex h-dvh max-h-dvh min-h-0 w-full flex-1 items-stretch overflow-hidden bg-slate-100 text-slate-800 dark:bg-slate-950 dark:text-slate-100">
      {/* Sidebar — past debates (tablet/desktop only) */}
      <aside className="hidden h-dvh max-h-dvh min-h-0 w-72 shrink-0 flex-col overflow-hidden border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 md:flex">
        <div className="shrink-0 border-b border-slate-200 px-4 py-3 dark:border-slate-800">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h1 className="text-lg font-semibold tracking-tight">AI Debate</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Pro vs Contra
              </p>
            </div>
            {credits ? (
              <button
                type="button"
                onClick={() => setCreditsModalOpen(true)}
                title={
                  credits.unlimited
                    ? "Your OpenAI key — unlimited messages. Click for details."
                    : `${credits.remaining} message${credits.remaining === 1 ? "" : "s"} left today (each Pro or Contra reply uses 1). Resets ${new Date(credits.resetsAt).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })} UTC. Click for details.`
                }
                className={`shrink-0 cursor-pointer rounded-lg border px-2.5 py-1.5 text-right transition hover:opacity-90 active:scale-[0.98] ${
                  credits.unlimited
                    ? "border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/40"
                    : credits.remaining <= 5
                      ? "border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/40"
                      : "border-sky-200 bg-sky-50 dark:border-sky-800 dark:bg-sky-950/50"
                }`}
              >
                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Credits
                </p>
                <p className="text-base font-bold leading-tight text-slate-900 dark:text-white">
                  {credits.unlimited ? (
                    <span className="text-sm font-bold text-emerald-700 dark:text-emerald-300">
                      Unlimited
                    </span>
                  ) : (
                    <>
                      <span className="tabular-nums">{credits.remaining}</span>
                      <span className="text-xs font-normal text-slate-500 dark:text-slate-400">
                        /{credits.limit}
                      </span>
                    </>
                  )}
                </p>
              </button>
            ) : (
              <span className="shrink-0 text-xs text-slate-400" aria-hidden>
                …
              </span>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={startNewChat}
          disabled={debateActive || outOfCredits}
          title={
            debateActive
              ? "End the current debate before starting a new one"
              : outOfCredits
                ? "No credits left today — resets at midnight UTC"
                : undefined
          }
          className="mx-3 mt-3 shrink-0 rounded-xl bg-sky-500 px-3 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:bg-sky-500 dark:bg-sky-600 dark:hover:bg-sky-500 dark:disabled:hover:bg-sky-600"
        >
          New debate
        </button>
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-y-contain px-2 pb-4 [-webkit-overflow-scrolling:touch]">
          <p className="px-2 py-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Recent
          </p>
          {loadingList ? (
            <p className="px-2 text-sm text-slate-400">Loading…</p>
          ) : sidebarDebates.length === 0 ? (
            <p className="px-2 text-sm text-slate-400">No debates yet.</p>
          ) : (
            <ul className="space-y-1">
              {sidebarDebates.map((d) => (
                <li key={d.id}>
                  <button
                    type="button"
                    onClick={() => void loadDebate(d.id)}
                    className={`flex w-full flex-col rounded-xl px-3 py-2.5 text-left text-sm transition hover:bg-slate-100 dark:hover:bg-slate-800 ${
                      selectedId === d.id
                        ? "bg-sky-50 ring-1 ring-sky-200 dark:bg-sky-950/50 dark:ring-sky-800"
                        : ""
                    }`}
                  >
                    <span className="line-clamp-2 font-medium text-slate-800 dark:text-slate-100">
                      {d.topic}
                    </span>
                    <span className="mt-1 flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                      <span
                        className={
                          d.status === "ACTIVE"
                            ? "text-emerald-600 dark:text-emerald-400"
                            : ""
                        }
                      >
                        {d.status === "ACTIVE" ? "Live" : "Ended"}
                      </span>
                      <span>·</span>
                      <span>{formatListTime(d.updatedAt)}</span>
                      {d.turnCount > 0 ? (
                        <>
                          <span>·</span>
                          <span>{d.turnCount} msgs</span>
                        </>
                      ) : null}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
          </div>
        </div>
      </aside>

      {/* Main chat */}
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex shrink-0 items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <h2 className="truncate text-base font-semibold text-slate-900 dark:text-slate-50">
                {isNewChat
                  ? "New debate"
                  : currentTopic || "Debate"}
              </h2>
              {credits ? (
                <button
                  type="button"
                  onClick={() => setCreditsModalOpen(true)}
                  className={`shrink-0 rounded-md border px-2 py-0.5 text-xs font-bold tabular-nums md:hidden ${
                    credits.unlimited
                      ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200"
                      : credits.remaining <= 5
                        ? "border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-100"
                        : "border-sky-200 bg-sky-50 text-sky-900 dark:border-sky-800 dark:bg-sky-950/50 dark:text-sky-100"
                  }`}
                  title="Credits — tap for details"
                >
                  {credits.unlimited ? "∞" : `${credits.remaining}/${credits.limit}`}
                </button>
              ) : null}
            </div>
            {!isNewChat && originalUserTopic ? (
              <p className="mt-0.5 line-clamp-2 text-xs text-slate-500 dark:text-slate-400">
                <span className="font-medium text-slate-600 dark:text-slate-300">
                  Your wording:{" "}
                </span>
                {originalUserTopic}
              </p>
            ) : null}
            {!isNewChat && debateActive ? (
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Agents reply every 10 seconds — add your take anytime below
              </p>
            ) : null}
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {debateActive ? (
              <button
                type="button"
                onClick={endDebate}
                disabled={endBusy}
                className="hidden rounded-xl border border-orange-200 bg-orange-50 px-4 py-2 text-sm font-semibold text-orange-900 transition hover:bg-orange-100 disabled:opacity-50 dark:border-orange-800 dark:bg-orange-950/40 dark:text-orange-100 dark:hover:bg-orange-950/70 md:inline-flex"
              >
                {endBusy ? "Summarising…" : "End debate"}
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => void handleLogout()}
              disabled={logoutBusy}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              {logoutBusy ? "Signing out…" : "Log out"}
            </button>
          </div>
        </header>

        {error ? (
          <div
            className="shrink-0 border-b border-red-100 bg-red-50 px-4 py-2 text-sm text-red-800 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-200"
            role="alert"
          >
            {error}
          </div>
        ) : null}

        {endBusy ? (
          <div
            className="flex shrink-0 items-center gap-3 border-b border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900"
            aria-live="polite"
            aria-busy="true"
          >
            <span className="h-6 w-6 shrink-0 animate-spin rounded-full border-2 border-sky-200 border-t-sky-600 dark:border-slate-600 dark:border-t-sky-400" />
            <div>
              <p className="text-sm font-medium text-slate-800 dark:text-slate-100">
                Summarising the debate
              </p>
              <p className="text-xs text-slate-500">Just a moment…</p>
            </div>
          </div>
        ) : null}

        <div
          ref={messagesScrollRef}
          className="min-h-0 flex-1 overflow-y-auto bg-slate-50/80 p-3 sm:p-4 dark:bg-slate-950/50 md:pb-4"
        >
          {loadingDebate ? (
            <p className="text-center text-sm text-slate-500">Loading…</p>
          ) : isNewChat && messages.length === 0 ? (
            <div className="flex h-full min-h-[12rem] flex-col items-center justify-center px-4 text-center">
              <p className="max-w-sm text-sm text-slate-500 dark:text-slate-400">
                Type a topic below (even if it is one-sided). We rephrase it into
                a neutral claim, then Pro argues for it and Contra against—short
                messages every 10 seconds.
              </p>
            </div>
          ) : (
            <div className="mx-auto flex max-w-3xl flex-col gap-3">
              {messages.map((m) =>
                m.role === "USER" ? (
                  <UserMessageBubble key={m.turnId}>
                    <p className="whitespace-pre-wrap">{m.content}</p>
                  </UserMessageBubble>
                ) : (
                  <MessageBubble key={m.turnId} role={m.role}>
                    <p className="whitespace-pre-wrap">{m.content}</p>
                  </MessageBubble>
                ),
              )}
              {thinking ? <ThinkingRow role={thinking} /> : null}

              {summary && summary.length > 0 ? (
                <div
                  ref={summarySectionRef}
                  className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900"
                >
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Summary
                  </h3>
                  <ul className="mt-3 list-none space-y-2 text-sm text-slate-700 dark:text-slate-200">
                    {summary.map((line, i) => (
                      <li
                        key={i}
                        className="relative pl-3 before:absolute before:left-0 before:top-2 before:h-1 before:w-1 before:rounded-full before:bg-sky-400"
                      >
                        {line}
                      </li>
                    ))}
                  </ul>
                  {closingRemark?.trim() ? (
                    <div className="mt-4 rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                        What the debate concludes
                      </p>
                      <p className="mt-1 text-sm leading-relaxed text-slate-700 dark:text-slate-200">
                        {closingRemark.trim()}
                      </p>
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>
          )}
        </div>

        {/* Composer */}
        {showComposer ? (
          <div className="shrink-0 border-t border-slate-200 bg-white px-3 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] dark:border-slate-800 dark:bg-slate-900 md:pb-3">
            {outOfCredits ? (
              <p
                className="mb-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-center text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-100"
                role="status"
              >
                Daily credits used (50 messages per UTC day). Resets at{" "}
                {credits
                  ? new Date(credits.resetsAt).toLocaleTimeString(undefined, {
                      hour: "numeric",
                      minute: "2-digit",
                      timeZone: "UTC",
                      timeZoneName: "short",
                    })
                  : "midnight UTC"}
                .
              </p>
            ) : null}
            <form
              className="flex w-full items-stretch gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                void startDebate();
              }}
            >
              <label htmlFor="topic-chat" className="sr-only">
                Topic
              </label>
              <input
                id="topic-chat"
                type="text"
                value={topicInput}
                onChange={(e) => setTopicInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    void startDebate();
                  }
                }}
                placeholder="Type a topic and press Enter or Send…"
                disabled={topicBusy || outOfCredits}
                className="h-11 min-w-0 flex-1 rounded-2xl border border-slate-600 bg-slate-900 px-4 text-sm text-slate-100 caret-sky-300 outline-none placeholder:text-slate-400 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/35 disabled:opacity-50 dark:border-slate-500 dark:bg-slate-950 dark:text-slate-50 dark:placeholder:text-slate-500 dark:focus:border-sky-400 dark:focus:ring-sky-400/30"
              />
              <button
                type="submit"
                disabled={topicBusy || outOfCredits || !topicInput.trim()}
                className="h-11 shrink-0 rounded-2xl bg-sky-500 px-5 text-sm font-semibold text-white transition hover:bg-sky-600 disabled:opacity-40"
              >
                {topicBusy ? "Preparing…" : "Send"}
              </button>
            </form>
          </div>
        ) : selectedId && ended ? (
          <div className="shrink-0 border-t border-slate-200 bg-slate-50 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] text-center dark:border-slate-800 dark:bg-slate-900 md:pb-3">
            <button
              type="button"
              onClick={startNewChat}
              className="text-sm font-medium text-sky-600 hover:underline dark:text-sky-400"
            >
              Start another debate
            </button>
          </div>
        ) : selectedId && debateActive ? (
          <div className="shrink-0 border-t border-slate-200 bg-white px-3 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] dark:border-slate-800 dark:bg-slate-900 md:pb-3">
            <p className="mb-2 text-center text-[11px] text-slate-500 dark:text-slate-400">
              <span className="hidden md:inline">
                Your message is woven in when it fits the topic — Pro and Contra
                stay in character.
              </span>
              <span className="md:hidden">
                Chime in anytime; agents pick it up when it fits.
              </span>
            </p>
            <form
              className="flex w-full items-stretch gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                void sendInterjection();
              }}
            >
              <label htmlFor="interject-chat" className="sr-only">
                Your message to the debate
              </label>
              <input
                id="interject-chat"
                type="text"
                value={interjectInput}
                onChange={(e) => setInterjectInput(e.target.value)}
                placeholder="Jump into the debate…"
                disabled={interjectBusy}
                className="h-11 min-w-0 flex-1 rounded-2xl border border-slate-600 bg-slate-900 px-4 text-sm text-slate-100 caret-violet-300 outline-none placeholder:text-slate-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/35 disabled:opacity-50 dark:border-slate-500 dark:bg-slate-950 dark:text-slate-50 dark:placeholder:text-slate-500 dark:focus:border-violet-400 dark:focus:ring-violet-400/30"
              />
              <button
                type="submit"
                disabled={interjectBusy || !interjectInput.trim()}
                className="h-11 shrink-0 rounded-2xl bg-violet-600 px-5 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:opacity-40"
              >
                {interjectBusy ? "Sending…" : "Send"}
              </button>
            </form>
          </div>
        ) : null}
      </div>

      {/* Mobile: floating New / End (sidebar hidden) */}
      <div
        className="pointer-events-none fixed left-4 z-40 flex flex-col gap-3 md:hidden"
        style={{
          bottom: debateActive
            ? "max(10rem, calc(env(safe-area-inset-bottom, 0px) + 8.5rem))"
            : "max(5.5rem, calc(env(safe-area-inset-bottom, 0px) + 4.5rem))",
        }}
      >
        {debateActive ? (
          <button
            type="button"
            onClick={endDebate}
            disabled={endBusy}
            aria-label={endBusy ? "Summarising debate" : "End debate"}
            className="pointer-events-auto flex h-14 w-14 items-center justify-center rounded-full border border-orange-300 bg-orange-500 text-white shadow-lg shadow-orange-500/30 transition hover:bg-orange-600 disabled:opacity-50 dark:border-orange-700 dark:bg-orange-600 dark:hover:bg-orange-500"
          >
            {endBusy ? (
              <span className="h-6 w-6 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-7 w-7"
                aria-hidden
              >
                <path
                  fillRule="evenodd"
                  d="M4.5 7.5a3 3 0 0 1 3-3h9a3 3 0 0 1 3 3v9a3 3 0 0 1-3 3h-9a3 3 0 0 1-3-3v-9Zm4.5-.75a.75.75 0 0 0-.75.75v7.5c0 .414.336.75.75.75h7.5a.75.75 0 0 0 .75-.75v-7.5a.75.75 0 0 0-.75-.75h-7.5Z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </button>
        ) : null}
        <button
          type="button"
          onClick={startNewChat}
          disabled={debateActive || outOfCredits}
          aria-label="New debate"
          title={
            debateActive
              ? "End the current debate before starting a new one"
              : outOfCredits
                ? "No credits left today"
                : "New debate"
          }
          className="pointer-events-auto flex h-14 w-14 items-center justify-center rounded-full bg-sky-500 text-white shadow-lg shadow-sky-500/30 transition hover:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="h-7 w-7"
            aria-hidden
          >
            <path d="M12 4.5a.75.75 0 0 1 .75.75v6h6a.75.75 0 0 1 0 1.5h-6v6a.75.75 0 0 1-1.5 0v-6h-6a.75.75 0 0 1 0-1.5h6v-6A.75.75 0 0 1 12 4.5Z" />
          </svg>
        </button>
      </div>

      <CreditsModal
        open={creditsModalOpen}
        onClose={() => setCreditsModalOpen(false)}
        credits={credits}
        onUpdated={() => void refreshDebates()}
      />
    </div>
  );
}
