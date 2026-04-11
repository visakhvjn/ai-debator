import { getDecryptedOpenAiKeyForUser } from "@/lib/user-openai-key";

export type ResolvedOpenAiKey = {
  apiKey: string;
  /** When true, daily message credits do not apply (user pays OpenAI). */
  unlimitedCredits: boolean;
};

/**
 * Prefer the user's stored key; otherwise the platform env key.
 */
export async function resolveOpenAiKeyForUser(
  userId: string,
): Promise<ResolvedOpenAiKey | null> {
  const userKey = await getDecryptedOpenAiKeyForUser(userId);
  if (userKey) {
    return { apiKey: userKey, unlimitedCredits: true };
  }
  const envKey = process.env.OPENAI_API_KEY?.trim();
  if (envKey) {
    return { apiKey: envKey, unlimitedCredits: false };
  }
  return null;
}
