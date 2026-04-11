import { NextResponse } from "next/server";
import { neutralizeTopicForDebate } from "@/lib/debate-ai";
import { prisma } from "@/lib/prisma";
import { requireAuthUser } from "@/lib/require-auth";

function normalizeTopicPhrase(s: string): string {
  return s.trim().replace(/\s+/g, " ").toLowerCase();
}

export async function POST(req: Request) {
  const authResult = await requireAuthUser(req);
  if (authResult instanceof NextResponse) return authResult;
  const { uid } = authResult;

  try {
    const body = await req.json();
    const originalTopic =
      typeof body?.topic === "string" ? body.topic.trim() : "";

    if (!originalTopic) {
      return NextResponse.json(
        { error: "topic is required" },
        { status: 400 },
      );
    }

    let neutralTopic = originalTopic;

    if (process.env.OPENAI_API_KEY) {
      try {
        neutralTopic = await neutralizeTopicForDebate(originalTopic);
      } catch (e) {
        console.error(e);
        neutralTopic = originalTopic;
      }
    }

    const topic = neutralTopic.trim() || originalTopic;
    const sameWording =
      normalizeTopicPhrase(topic) === normalizeTopicPhrase(originalTopic);

    const debate = await prisma.debate.create({
      data: {
        userId: uid,
        topic,
        originalTopic: sameWording ? null : originalTopic,
      },
    });

    return NextResponse.json({
      debateId: debate.id,
      topic: debate.topic,
      originalTopic: debate.originalTopic,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to create debate" },
      { status: 500 },
    );
  }
}
