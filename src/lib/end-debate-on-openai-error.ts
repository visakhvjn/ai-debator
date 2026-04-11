import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

const MAX_DETAIL = 400;

/** Strip key-like tokens so errors never echo secrets (even partially). */
export function redactSecretsFromMessage(text: string): string {
  return text
    .replace(/\bsk-[a-zA-Z0-9_-]{8,}\b/g, "[redacted]")
    .replace(/\bBearer\s+sk-[a-zA-Z0-9_-]{8,}\b/gi, "Bearer [redacted]")
    .replace(/api[_-]?key\s*[:=]\s*\S+/gi, "api key: [redacted]");
}

/** Short, user-visible explanation (no stack traces, no key material). */
export function openAiErrorUserMessage(err: unknown): string {
  if (err instanceof Error && err.message) {
    let m = err.message.replace(/\s+/g, " ").trim();
    m = redactSecretsFromMessage(m);
    if (m.length > MAX_DETAIL) m = `${m.slice(0, MAX_DETAIL)}…`;
    return m;
  }
  return "The AI request failed. Check your OpenAI API key and account billing.";
}

/**
 * Marks an ACTIVE debate ENDED with a summary that explains the API/key failure.
 */
export async function endActiveDebateWithOpenAiError(
  debateId: string,
  err: unknown,
): Promise<void> {
  const detail = openAiErrorUserMessage(err);
  const debateSummary: Prisma.InputJsonValue = {
    bullets: [
      "This debate ended because the AI request failed (often an invalid key, quota, or network issue).",
      detail,
    ],
    closingRemark:
      "Fix your OpenAI key under Credits, or ask the host to check the server key, then start a new debate.",
  };
  await prisma.debate.updateMany({
    where: { id: debateId, status: "ACTIVE" },
    data: {
      status: "ENDED",
      debateSummary,
    },
  });
}
