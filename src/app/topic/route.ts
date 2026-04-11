import { NextResponse } from "next/server";
import { neutralizeTopicForDebate } from "@/lib/debate-ai";
import {
  endAllActiveDebatesForUser,
  getCreditsSnapshot,
} from "@/lib/daily-credits";
import { prisma } from "@/lib/prisma";
import { requireAuthUser } from "@/lib/require-auth";
import { resolveOpenAiKeyForUser } from "@/lib/resolve-openai-key";

function normalizeTopicPhrase(s: string): string {
  return s.trim().replace(/\s+/g, " ").toLowerCase();
}

export async function POST(req: Request) {
  const authResult = await requireAuthUser(req);
  if (authResult instanceof NextResponse) return authResult;
  const { uid } = authResult;

  const resolved = await resolveOpenAiKeyForUser(uid);
  if (!resolved) {
    return NextResponse.json(
      {
        error:
          "No OpenAI key available. Add your own key in Credits, or ask the host to set OPENAI_API_KEY.",
      },
      { status: 503 },
    );
  }

  const creditsBefore = await getCreditsSnapshot(uid);
  if (!creditsBefore.unlimited && creditsBefore.remaining <= 0) {
    await endAllActiveDebatesForUser(uid);
    return NextResponse.json(
      {
        error:
          "Daily credits are used up (50 messages per UTC day). Try again after they reset.",
        credits: creditsBefore,
      },
      { status: 429 },
    );
  }

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

    try {
      neutralTopic = await neutralizeTopicForDebate(
        originalTopic,
        resolved.apiKey,
      );
    } catch (e) {
      console.error(e);
      neutralTopic = originalTopic;
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

    const credits = await getCreditsSnapshot(uid);
    return NextResponse.json({
      debateId: debate.id,
      topic: debate.topic,
      originalTopic: debate.originalTopic,
      credits,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to create debate" },
      { status: 500 },
    );
  }
}
