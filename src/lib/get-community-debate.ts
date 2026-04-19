import { prisma } from "@/lib/prisma";
import { isMongoObjectId } from "@/lib/mongo-object-id";

type StoredSummary = {
  bullets?: string[];
  closingRemark?: string;
};

export async function getCommunityDebateById(id: string) {
  const trimmed = id.trim();
  if (!isMongoObjectId(trimmed)) return null;

  return prisma.debate.findFirst({
    where: {
      id: trimmed,
      isPublic: true,
      status: "ENDED",
    },
    include: {
      turns: { orderBy: { sequence: "asc" } },
    },
  });
}

export function parseDebateSummary(raw: unknown): {
  summaryBullets: string[] | null;
  closingRemark: string | null;
} {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return { summaryBullets: null, closingRemark: null };
  }
  const s = raw as StoredSummary;
  const summaryBullets = Array.isArray(s.bullets) ? s.bullets : null;
  const closingRemark =
    typeof s.closingRemark === "string" ? s.closingRemark : null;
  return { summaryBullets, closingRemark };
}
