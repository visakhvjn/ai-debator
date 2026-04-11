import { NextResponse } from "next/server";
import { isEncryptionConfigured } from "@/lib/encrypt-secret";
import { requireAuthUser } from "@/lib/require-auth";
import {
  clearUserOpenAiKey,
  saveEncryptedOpenAiKey,
  userHasStoredOpenAiKey,
} from "@/lib/user-openai-key";

export async function GET(request: Request) {
  const authResult = await requireAuthUser(request);
  if (authResult instanceof NextResponse) return authResult;
  const { uid } = authResult;

  const hasKey = await userHasStoredOpenAiKey(uid);
  return NextResponse.json({
    hasKey,
    encryptionReady: isEncryptionConfigured(),
  });
}

export async function PUT(req: Request) {
  const authResult = await requireAuthUser(req);
  if (authResult instanceof NextResponse) return authResult;
  const { uid } = authResult;

  if (!isEncryptionConfigured()) {
    return NextResponse.json(
      {
        error:
          "Server is not configured to store API keys securely (ENCRYPTION_MASTER_KEY).",
      },
      { status: 503 },
    );
  }

  try {
    const body = await req.json();
    const apiKey =
      typeof body?.apiKey === "string" ? body.apiKey.trim() : "";

    if (!apiKey || apiKey.length < 20) {
      return NextResponse.json(
        { error: "Enter a valid OpenAI API key." },
        { status: 400 },
      );
    }

    await saveEncryptedOpenAiKey(uid, apiKey);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    const message =
      e instanceof Error ? e.message : "Could not save API key";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const authResult = await requireAuthUser(request);
  if (authResult instanceof NextResponse) return authResult;
  const { uid } = authResult;

  await clearUserOpenAiKey(uid);
  return NextResponse.json({ ok: true });
}
