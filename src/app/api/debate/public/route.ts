import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuthUser } from "@/lib/require-auth";

export async function POST(req: Request) {
  const authResult = await requireAuthUser(req);
  if (authResult instanceof NextResponse) return authResult;
  const { uid } = authResult;

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
    const rawPublic = body?.isPublic;
    if (typeof rawPublic !== "boolean") {
      return NextResponse.json(
        { error: "isPublic must be a boolean" },
        { status: 400 },
      );
    }
    const wantPublic = rawPublic;

    const debate = await prisma.debate.findUnique({
      where: { id: debateId },
      select: { id: true, userId: true, status: true },
    });

    if (!debate || debate.userId !== uid) {
      return NextResponse.json({ error: "Debate not found" }, { status: 404 });
    }

    if (debate.status !== "ENDED") {
      return NextResponse.json(
        {
          error:
            "Only a finished debate can be shared. End the debate first so the summary is saved.",
        },
        { status: 400 },
      );
    }

    await prisma.debate.update({
      where: { id: debateId },
      data: { isPublic: wantPublic },
    });

    return NextResponse.json({ isPublic: wantPublic });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to update sharing" },
      { status: 500 },
    );
  }
}
