import { NextResponse } from "next/server";
import { getCreditsSnapshot } from "@/lib/daily-credits";
import { prisma } from "@/lib/prisma";
import { requireAuthUser } from "@/lib/require-auth";

const MAX_MESSAGE_CHARS = 2000;

export async function POST(req: Request) {
  const authResult = await requireAuthUser(req);
  if (authResult instanceof NextResponse) return authResult;
  const { uid } = authResult;

  try {
    const body = await req.json();
    const debateId =
      typeof body?.debateId === "string" ? body.debateId.trim() : "";
    const rawContent =
      typeof body?.content === "string" ? body.content.trim() : "";

    if (!debateId) {
      return NextResponse.json(
        { error: "debateId is required" },
        { status: 400 },
      );
    }

    if (!rawContent) {
      return NextResponse.json(
        { error: "Message cannot be empty" },
        { status: 400 },
      );
    }

    if (rawContent.length > MAX_MESSAGE_CHARS) {
      return NextResponse.json(
        {
          error: `Message is too long (max ${MAX_MESSAGE_CHARS} characters)`,
        },
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

    const turn = await prisma.turn.create({
      data: {
        debateId: debate.id,
        role: "USER",
        content: rawContent,
        sequence: debate.turns.length,
      },
    });

    const credits = await getCreditsSnapshot(uid);

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
      { error: "Could not add your message" },
      { status: 500 },
    );
  }
}
