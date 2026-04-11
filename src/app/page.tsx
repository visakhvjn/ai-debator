import { Suspense } from "react";
import { MarketingHome } from "@/components/marketing/MarketingHome";

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-dvh items-center justify-center bg-slate-50 text-slate-500 dark:bg-slate-950">
          Loading…
        </div>
      }
    >
      <MarketingHome />
    </Suspense>
  );
}
