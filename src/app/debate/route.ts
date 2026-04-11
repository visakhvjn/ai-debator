import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type StoredSummary = {
  bullets?: string[];
  closingRemark?: string;
};

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id")?.trim();
    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    const debate = await prisma.debate.findUnique({
      where: { id },
      include: {
        turns: { orderBy: { sequence: "asc" } },
      },
    });

    if (!debate) {
      return NextResponse.json({ error: "Debate not found" }, { status: 404 });
    }

    const raw = debate.debateSummary;
    let summaryBullets: string[] | null = null;
    let closingRemark: string | null = null;
    if (raw && typeof raw === "object" && !Array.isArray(raw)) {
      const s = raw as StoredSummary;
      if (Array.isArray(s.bullets)) summaryBullets = s.bullets;
      if (typeof s.closingRemark === "string") closingRemark = s.closingRemark;
    }

    return NextResponse.json({
      debate: {
        id: debate.id,
        topic: debate.topic,
        originalTopic: debate.originalTopic,
        status: debate.status,
        updatedAt: debate.updatedAt.toISOString(),
        turns: debate.turns.map((t) => ({
          turnId: t.id,
          role: t.role,
          content: t.content,
          sequence: t.sequence,
        })),
        summaryBullets,
        closingRemark,
      },
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to load debate" },
      { status: 500 },
    );
  }
}
