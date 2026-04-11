import { NextResponse } from "next/server";
import { SpeakerRole } from "@prisma/client";
import { generateDebateTurn } from "@/lib/debate-ai";
import {
  endAllActiveDebatesForUser,
  getCreditsSnapshot,
} from "@/lib/daily-credits";
import { prisma } from "@/lib/prisma";
import { requireAuthUser } from "@/lib/require-auth";
import {
  endActiveDebateWithOpenAiError,
  openAiErrorUserMessage,
} from "@/lib/end-debate-on-openai-error";
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

    if (debate.status !== "ACTIVE") {
      return NextResponse.json(
        { error: "Debate has ended" },
        { status: 409 },
      );
    }

    const creditsBefore = await getCreditsSnapshot(uid);
    if (!creditsBefore.unlimited && creditsBefore.remaining <= 0) {
      await endAllActiveDebatesForUser(uid);
      return NextResponse.json(
        {
          error:
            "Daily credits are used up (50 messages per UTC day). This debate has been closed.",
          credits: creditsBefore,
        },
        { status: 429 },
      );
    }

    const nextRole: SpeakerRole =
      debate.turns.length % 2 === 0 ? "PRO" : "CONTRA";

    let content: string;
    try {
      content = await generateDebateTurn({
        topic: debate.topic,
        role: nextRole,
        priorTurns: debate.turns.map((t) => ({
          role: t.role,
          content: t.content,
        })),
        apiKey: resolved.apiKey,
      });
    } catch (e) {
      console.error(e);
      await endActiveDebateWithOpenAiError(debateId, e);
      const credits = await getCreditsSnapshot(uid);
      return NextResponse.json(
        {
          error: openAiErrorUserMessage(e),
          credits,
        },
        { status: 502 },
      );
    }

    const turn = await prisma.turn.create({
      data: {
        debateId: debate.id,
        role: nextRole,
        content,
        sequence: debate.turns.length,
      },
    });

    const credits = await getCreditsSnapshot(uid);
    if (!credits.unlimited && credits.remaining <= 0) {
      await endAllActiveDebatesForUser(uid);
    }

    return NextResponse.json({
      turnId: turn.id,
      role: turn.role,
      content: turn.content,
      sequence: turn.sequence,
      credits,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Something went wrong while processing the next turn." },
      { status: 500 },
    );
  }
}
