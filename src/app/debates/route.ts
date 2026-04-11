import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const debates = await prisma.debate.findMany({
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

    return NextResponse.json({
      debates: debates.map((d) => ({
        id: d.id,
        topic: d.topic,
        status: d.status,
        updatedAt: d.updatedAt.toISOString(),
        turnCount: d._count.turns,
      })),
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to list debates" },
      { status: 500 },
    );
  }
}
