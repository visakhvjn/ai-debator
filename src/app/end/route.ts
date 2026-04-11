import { NextResponse } from "next/server";
import { generateDebateSummary } from "@/lib/debate-ai";
import { prisma } from "@/lib/prisma";
import { requireAuthUser } from "@/lib/require-auth";

export async function POST(req: Request) {
  const authResult = await requireAuthUser(req);
  if (authResult instanceof NextResponse) return authResult;
  const { uid } = authResult;

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

    if (!debate || debate.userId !== uid) {
      return NextResponse.json({ error: "Debate not found" }, { status: 404 });
    }

    const { bullets, closingRemark } = await generateDebateSummary({
      topic: debate.topic,
      turns: debate.turns.map((t) => ({
        role: t.role,
        content: t.content,
      })),
    });

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
