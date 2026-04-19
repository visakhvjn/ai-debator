import { NextResponse } from "next/server";
import {
  getCommunityDebateById,
  parseDebateSummary,
} from "@/lib/get-community-debate";
import { requireAuthUser } from "@/lib/require-auth";

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  const authResult = await requireAuthUser(req);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const { id } = await context.params;
    const debate = await getCommunityDebateById(id);
    if (!debate) {
      return NextResponse.json({ error: "Debate not found" }, { status: 404 });
    }

    const { summaryBullets, closingRemark } = parseDebateSummary(
      debate.debateSummary,
    );

    return NextResponse.json({
      debate: {
        id: debate.id,
        topic: debate.topic,
        turns: debate.turns.map((t) => ({
          id: t.id,
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
