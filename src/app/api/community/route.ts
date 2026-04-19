import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuthUser } from "@/lib/require-auth";

export async function GET(req: Request) {
  const authResult = await requireAuthUser(req);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const debates = await prisma.debate.findMany({
      where: { isPublic: true, status: "ENDED" },
      orderBy: { updatedAt: "desc" },
      take: 100,
      select: {
        id: true,
        topic: true,
        updatedAt: true,
        _count: { select: { turns: true } },
      },
    });

    return NextResponse.json({
      debates: debates.map((d) => ({
        id: d.id,
        topic: d.topic,
        updatedAt: d.updatedAt.toISOString(),
        turnCount: d._count.turns,
      })),
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to load community" },
      { status: 500 },
    );
  }
}
