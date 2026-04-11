"use client";

import { authedFetch } from "@/lib/client-authed-fetch";
import { useCallback, useEffect, useState } from "react";

export type ModalCreditsInfo = {
  used: number;
  remaining: number;
  limit: number;
  resetsAt: string;
  unlimited?: boolean;
};

type CreditsModalProps = {
  open: boolean;
  onClose: () => void;
  credits: ModalCreditsInfo | null;
  onUpdated: () => void | Promise<void>;
};

export function CreditsModal({
  open,
  onClose,
  credits,
  onUpdated,
}: CreditsModalProps) {
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [encryptionReady, setEncryptionReady] = useState(true);

  useEffect(() => {
    if (!open) {
      setApiKeyInput("");
      setError(null);
      return;
    }
    void (async () => {
      const res = await authedFetch("/api/user/openai-key");
      if (res.ok) {
        const d = (await res.json()) as { encryptionReady?: boolean };
        setEncryptionReady(d.encryptionReady !== false);
      }
    })();
  }, [open]);

  const save = useCallback(async () => {
    setError(null);
    setSaving(true);
    try {
      const res = await authedFetch("/api/user/openai-key", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey: apiKeyInput }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error || "Could not save key");
      setApiKeyInput("");
      await onUpdated();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save key");
    } finally {
      setSaving(false);
    }
  }, [apiKeyInput, onUpdated, onClose]);

  const removeKey = useCallback(async () => {
    if (
      !window.confirm(
        "Remove your saved OpenAI key? The app will use the default server key again and daily message credits will apply.",
      )
    ) {
      return;
    }
    setError(null);
    setDeleting(true);
    try {
      const res = await authedFetch("/api/user/openai-key", { method: "DELETE" });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error || "Could not remove key");
      await onUpdated();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not remove key");
    } finally {
      setDeleting(false);
    }
  }, [onUpdated, onClose]);

  if (!open) return null;

  const unlimited = credits?.unlimited === true;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/50 backdrop-blur-[1px]"
        onClick={onClose}
        aria-label="Close dialog"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="credits-modal-title"
        className="relative z-10 max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-700 dark:bg-slate-900 sm:rounded-2xl"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <h2
            id="credits-modal-title"
            className="text-lg font-bold text-slate-900 dark:text-white"
          >
            Credits &amp; your OpenAI key
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Close"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18 18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/60">
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
            {unlimited ? "Unlimited (your key)" : "Today’s balance"}
          </p>
          {credits ? (
            unlimited ? (
              <p className="mt-1 text-2xl font-bold text-sky-600 dark:text-sky-400">
                Unlimited
              </p>
            ) : (
              <p className="mt-1 text-2xl font-bold tabular-nums text-slate-900 dark:text-white">
                {credits.remaining}
                <span className="text-base font-normal text-slate-500 dark:text-slate-400">
                  {" "}
                  / {credits.limit} left
                </span>
              </p>
            )
          ) : (
            <p className="mt-1 text-sm text-slate-500">Loading…</p>
          )}
          <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            Each <strong className="text-slate-800 dark:text-slate-100">Pro</strong>{" "}
            or <strong className="text-slate-800 dark:text-slate-100">Contra</strong>{" "}
            message counts as <strong>one credit</strong>. When you run out, you
            cannot start new debates or send more messages until the next UTC day.
            Unused credits do not roll over; your allowance refreshes every day at{" "}
            <strong>midnight UTC</strong>.
          </p>
        </div>

        <section className="mt-6">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
            Unlimited messages with your own OpenAI key
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            Add your personal OpenAI API key so requests are billed to your
            OpenAI account instead of using the app’s shared quota. While your key
            is active, daily credits do not apply — you can run debates as long as
            your key stays valid and within OpenAI’s limits.
          </p>

          {!encryptionReady ? (
            <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-100">
              Saving keys is disabled: the server must set{" "}
              <code className="rounded bg-amber-100 px-1 dark:bg-amber-900/60">
                ENCRYPTION_MASTER_KEY
              </code>{" "}
              (see <code className="rounded bg-amber-100 px-1 dark:bg-amber-900/60">.env.example</code>
              ).
            </p>
          ) : (
            <>
              <label
                htmlFor="user-openai-key"
                className="mt-3 block text-xs font-medium text-slate-500 dark:text-slate-400"
              >
                Secret key
              </label>
              <input
                id="user-openai-key"
                type="password"
                autoComplete="new-password"
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                placeholder="Paste from your OpenAI account settings"
                disabled={saving}
                className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/25 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-sky-400"
              />
              <p className="mt-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                Your key is encrypted with a server secret before storage. Even if
                the database were exposed, the raw key is not readable without that
                secret. We use it only to call OpenAI on your behalf for your
                debates — we do not share it or use it for anything else.
              </p>
              <button
                type="button"
                onClick={() => void save()}
                disabled={saving || !apiKeyInput.trim() || !encryptionReady}
                className="mt-3 w-full rounded-xl bg-sky-500 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? "Saving…" : "Save key"}
              </button>
            </>
          )}
        </section>

        {unlimited ? (
          <div className="mt-6 border-t border-slate-200 pt-4 dark:border-slate-700">
            <p className="text-sm text-slate-600 dark:text-slate-300">
              You are using your saved OpenAI key. Remove it to return to the
              default server key and daily credits.
            </p>
            <button
              type="button"
              onClick={() => void removeKey()}
              disabled={deleting}
              className="mt-2 w-full rounded-xl border border-red-200 bg-red-50 py-2.5 text-sm font-semibold text-red-800 transition hover:bg-red-100 disabled:opacity-50 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200 dark:hover:bg-red-950/70"
            >
              {deleting ? "Removing…" : "Remove my OpenAI key"}
            </button>
          </div>
        ) : null}

        {error ? (
          <p
            className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-200"
            role="alert"
          >
            {error}
          </p>
        ) : null}
      </div>
    </div>
  );
}
