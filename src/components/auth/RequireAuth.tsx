"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, type ReactNode } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { isFirebaseConfigured } from "@/lib/firebase";
import { consumeDebatorLogoutIntent } from "@/lib/logout-intent";

export function RequireAuth({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  /** After intentional logout, skip the next unauthenticated redirect (avoids ?signin=required). */
  const skipSignInRequiredOnce = useRef(false);

  useEffect(() => {
    if (loading) return;
    if (!isFirebaseConfigured()) {
      router.replace("/?configure=firebase");
      return;
    }
    if (!user) {
      if (consumeDebatorLogoutIntent()) {
        skipSignInRequiredOnce.current = true;
        router.replace("/");
        return;
      }
      if (skipSignInRequiredOnce.current) {
        skipSignInRequiredOnce.current = false;
        return;
      }
      router.replace("/?signin=required");
    }
  }, [loading, user, router]);

  if (loading) {
    return (
      <div className="flex h-dvh flex-col items-center justify-center gap-3 bg-slate-100 text-slate-600 dark:bg-slate-950 dark:text-slate-400">
        <span className="h-8 w-8 animate-spin rounded-full border-2 border-sky-300 border-t-sky-600" />
        <p className="text-sm">Signing you in…</p>
      </div>
    );
  }

  if (!isFirebaseConfigured() || !user) {
    return null;
  }

  return <>{children}</>;
}
