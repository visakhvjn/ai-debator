import { NextResponse } from "next/server";
import { SpeakerRole } from "@prisma/client";
import { generateDebateTurn } from "@/lib/debate-ai";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY is not configured" },
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

    if (!debate) {
      return NextResponse.json({ error: "Debate not found" }, { status: 404 });
    }

    if (debate.status !== "ACTIVE") {
      return NextResponse.json(
        { error: "Debate has ended" },
        { status: 409 },
      );
    }

    const nextRole: SpeakerRole =
      debate.turns.length % 2 === 0 ? "PRO" : "CONTRA";

    const content = await generateDebateTurn({
      topic: debate.topic,
      role: nextRole,
      priorTurns: debate.turns.map((t) => ({
        role: t.role,
        content: t.content,
      })),
    });

    const turn = await prisma.turn.create({
      data: {
        debateId: debate.id,
        role: nextRole,
        content,
        sequence: debate.turns.length,
      },
    });

    return NextResponse.json({
      turnId: turn.id,
      role: turn.role,
      content: turn.content,
      sequence: turn.sequence,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to generate next turn" },
      { status: 500 },
    );
  }
}
