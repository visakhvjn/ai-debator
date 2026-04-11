import { NextResponse } from "next/server";
import { generateDebateSummary } from "@/lib/debate-ai";
import { prisma } from "@/lib/prisma";
import { requireAuthUser } from "@/lib/require-auth";
import { openAiErrorUserMessage } from "@/lib/end-debate-on-openai-error";
import { resolveOpenAiKeyForUser } from "@/lib/resolve-openai-key";

export async function POST(req: Request) {
  const authResult = await requireAuthUser(req);
  if (authResult instanceof NextResponse) return authResult;
  const { uid } = authResult;

  const resolved = await resolveOpenAiKeyForUser(uid);
  if (!resolved) {
    return NextResponse.json(
      {
        error:
          "No OpenAI key available. Add your own key in Credits, or ask the host to set OPENAI_API_KEY.",
      },
      { status: 503 },
    );
  }

  try {
    const body = await req.json();
    const debateId =
      typeof body?.debateId === "string" ? body.debateId.trim() : "";

    if (!debateId) {
      return NextResponse.json(
        { error: "debateId is required" },
        { status: 400 },
      );
    }

    const debate = await prisma.debate.findUnique({
      where: { id: debateId },
      include: {
        turns: { orderBy: { sequence: "asc" } },
      },
    });

    if (!debate || debate.userId !== uid) {
      return NextResponse.json({ error: "Debate not found" }, { status: 404 });
    }

    let bullets: string[];
    let closingRemark: string;
    try {
      const result = await generateDebateSummary({
        topic: debate.topic,
        turns: debate.turns.map((t) => ({
          role: t.role,
          content: t.content,
        })),
        apiKey: resolved.apiKey,
      });
      bullets = result.bullets;
      closingRemark = result.closingRemark;
    } catch (e) {
      console.error(e);
      const detail = openAiErrorUserMessage(e);
      bullets = [
        "We could not generate a summary because the AI request failed.",
        detail,
      ];
      closingRemark =
        "The debate is still closed. Fix your API key under Credits (or the server key) and start again if you like.";
      await prisma.debate.update({
        where: { id: debateId },
        data: {
          status: "ENDED",
          debateSummary: {
            bullets,
            closingRemark,
          },
        },
      });
      return NextResponse.json({ summary: bullets, closingRemark });
    }

    await prisma.debate.update({
      where: { id: debateId },
      data: {
        status: "ENDED",
        debateSummary: {
          bullets,
          closingRemark,
        },
      },
    });

    return NextResponse.json({ summary: bullets, closingRemark });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to end debate" },
      { status: 500 },
    );
  }
}
