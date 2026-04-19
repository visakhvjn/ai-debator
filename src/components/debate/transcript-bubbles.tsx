import type { ReactNode } from "react";

export function MessageBubble({
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

export function UserMessageBubble({
  children,
  label = "You",
}: {
  children: ReactNode;
  label?: "You" | "Viewer";
}) {
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
          {label}
        </p>
        {children}
      </div>
    </div>
  );
}

export function ThinkingRow({ role }: { role: "PRO" | "CONTRA" }) {
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

export function ReadOnlyTranscript({
  turns,
  userLabel = "Viewer",
}: {
  turns: { id: string; role: "PRO" | "CONTRA" | "USER"; content: string }[];
  userLabel?: "You" | "Viewer";
}) {
  return (
    <div className="space-y-4">
      {turns.map((t) =>
        t.role === "USER" ? (
          <UserMessageBubble key={t.id} label={userLabel}>
            <p className="whitespace-pre-wrap">{t.content}</p>
          </UserMessageBubble>
        ) : (
          <MessageBubble key={t.id} role={t.role}>
            <p className="whitespace-pre-wrap">{t.content}</p>
          </MessageBubble>
        ),
      )}
    </div>
  );
}
