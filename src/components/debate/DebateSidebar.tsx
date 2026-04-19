"use client";

import Link from "next/link";

export type DebateSidebarItem = {
  id: string;
  topic: string;
  status: "ACTIVE" | "ENDED";
  updatedAt: string;
  turnCount: number;
};

type CreditsSnapshot = {
  unlimited?: boolean;
  remaining: number;
  limit: number;
  resetsAt: string;
};

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

function IconClose({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      aria-hidden
    >
      <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

export function DebateSidebar({
  credits,
  loadingList,
  debates,
  selectedId,
  onSelectDebate,
  onNewDebate,
  onOpenCredits,
  debateActive,
  outOfCredits,
  showClose,
  onClose,
}: {
  credits: CreditsSnapshot | null;
  loadingList: boolean;
  debates: DebateSidebarItem[];
  selectedId: string | null;
  onSelectDebate: (id: string) => void;
  onNewDebate: () => void;
  onOpenCredits: () => void;
  debateActive: boolean;
  outOfCredits: boolean;
  showClose?: boolean;
  onClose?: () => void;
}) {
  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-white dark:bg-slate-900">
      {showClose && onClose ? (
        <div className="flex shrink-0 items-center justify-end border-b border-slate-200 px-2 py-2 dark:border-slate-800 md:hidden">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="rounded-lg p-2 text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <IconClose className="h-5 w-5" />
          </button>
        </div>
      ) : null}

      <div className="shrink-0 border-b border-slate-200 px-4 py-3 dark:border-slate-800">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h1 className="text-lg font-semibold tracking-tight">AI Debate</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Pro vs Contra
            </p>
            <Link
              href="/community"
              onClick={() => onClose?.()}
              className="mt-1 inline-block text-xs font-medium text-sky-600 hover:underline dark:text-sky-400"
            >
              Community
            </Link>
          </div>
          {credits ? (
            <button
              type="button"
              onClick={onOpenCredits}
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
        onClick={() => {
          onNewDebate();
          onClose?.();
        }}
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
          ) : debates.length === 0 ? (
            <p className="px-2 text-sm text-slate-400">No debates yet.</p>
          ) : (
            <ul className="space-y-1">
              {debates.map((d) => (
                <li key={d.id}>
                  <button
                    type="button"
                    onClick={() => onSelectDebate(d.id)}
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
    </div>
  );
}

export function IconMenu({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      aria-hidden
    >
      <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}
