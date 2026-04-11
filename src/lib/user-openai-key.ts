import { decryptSecret, encryptSecret, isEncryptionConfigured } from "@/lib/encrypt-secret";
import { prisma } from "@/lib/prisma";

export async function getDecryptedOpenAiKeyForUser(
  userId: string,
): Promise<string | null> {
  const row = await prisma.userSettings.findUnique({
    where: { id: userId },
    select: { openaiKeyEnc: true },
  });
  if (!row?.openaiKeyEnc) return null;
  try {
    const key = decryptSecret(row.openaiKeyEnc).trim();
    return key.length > 0 ? key : null;
  } catch {
    return null;
  }
}

export async function userHasStoredOpenAiKey(userId: string): Promise<boolean> {
  const row = await prisma.userSettings.findUnique({
    where: { id: userId },
    select: { openaiKeyEnc: true },
  });
  return Boolean(row?.openaiKeyEnc);
}

export async function saveEncryptedOpenAiKey(
  userId: string,
  plainKey: string,
): Promise<void> {
  if (!isEncryptionConfigured()) {
    throw new Error("ENCRYPTION_MASTER_KEY is not configured on the server");
  }
  const trimmed = plainKey.trim();
  if (trimmed.length < 8) {
    throw new Error("API key is too short");
  }
  const enc = encryptSecret(trimmed);
  await prisma.userSettings.upsert({
    where: { id: userId },
    create: { id: userId, openaiKeyEnc: enc },
    update: { openaiKeyEnc: enc },
  });
}

export async function clearUserOpenAiKey(userId: string): Promise<void> {
  await prisma.userSettings.deleteMany({ where: { id: userId } });
}
