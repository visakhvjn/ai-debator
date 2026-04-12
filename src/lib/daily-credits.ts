import type { Prisma } from "@prisma/client";
import { SpeakerRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { userHasStoredOpenAiKey } from "@/lib/user-openai-key";

export const DAILY_CREDIT_LIMIT = 50;

export function utcDayStart(d = new Date()): Date {
  return new Date(
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0, 0),
  );
}

/** Start of the next UTC day (when credits renew). */
export function utcNextReset(d = new Date()): Date {
  const start = utcDayStart(d);
  return new Date(start.getTime() + 24 * 60 * 60 * 1000);
}

export async function countUserTurnsToday(userId: string): Promise<number> {
  const since = utcDayStart();
  return prisma.turn.count({
    where: {
      debate: { userId },
      createdAt: { gte: since },
      role: { in: [SpeakerRole.PRO, SpeakerRole.CONTRA] },
    },
  });
}

export type CreditsSnapshot = {
  used: number;
  remaining: number;
  limit: number;
  resetsAt: string;
  /** User saved their own OpenAI key — no daily cap in the app. */
  unlimited: boolean;
};

export async function getCreditsSnapshot(userId: string): Promise<CreditsSnapshot> {
  const unlimited = await userHasStoredOpenAiKey(userId);
  if (unlimited) {
    return {
      used: 0,
      remaining: DAILY_CREDIT_LIMIT,
      limit: DAILY_CREDIT_LIMIT,
      resetsAt: utcNextReset().toISOString(),
      unlimited: true,
    };
  }

  const used = await countUserTurnsToday(userId);
  const remaining = Math.max(0, DAILY_CREDIT_LIMIT - used);
  return {
    used,
    remaining,
    limit: DAILY_CREDIT_LIMIT,
    resetsAt: utcNextReset().toISOString(),
    unlimited: false,
  };
}

const EXHAUSTED_SUMMARY: Prisma.InputJsonValue = {
  bullets: [
    "You've used all 50 messages for today (each Pro or Contra reply counts as one).",
    "Credits reset at midnight UTC — you can start or continue debates then.",
  ],
  closingRemark: "This debate was closed when your daily credits ran out.",
};

/** Ends every active debate for the user with a static summary (no OpenAI). */
export async function endAllActiveDebatesForUser(userId: string): Promise<void> {
  await prisma.debate.updateMany({
    where: { userId, status: "ACTIVE" },
    data: {
      status: "ENDED",
      debateSummary: EXHAUSTED_SUMMARY,
    },
  });
}
