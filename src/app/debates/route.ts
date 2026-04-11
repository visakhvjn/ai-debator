import { NextResponse } from "next/server";
import { getCreditsSnapshot } from "@/lib/daily-credits";
import { prisma } from "@/lib/prisma";
import { requireAuthUser } from "@/lib/require-auth";

export async function GET(req: Request) {
  const authResult = await requireAuthUser(req);
  if (authResult instanceof NextResponse) return authResult;
  const { uid } = authResult;

  try {
    const debates = await prisma.debate.findMany({
      where: { userId: uid },
      orderBy: { updatedAt: "desc" },
      take: 80,
      select: {
        id: true,
        topic: true,
        status: true,
        updatedAt: true,
        _count: { select: { turns: true } },
      },
    });

    const credits = await getCreditsSnapshot(uid);

    return NextResponse.json({
      debates: debates.map((d) => ({
        id: d.id,
        topic: d.topic,
        status: d.status,
        updatedAt: d.updatedAt.toISOString(),
        turnCount: d._count.turns,
      })),
      credits,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to list debates" },
      { status: 500 },
    );
  }
}
