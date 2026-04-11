import { createOpenAI } from "@ai-sdk/openai";
import { generateText } from "ai";
import type { SpeakerRole } from "@prisma/client";

const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function buildTranscript(
  topic: string,
  turns: { role: SpeakerRole; content: string }[],
): string {
  if (turns.length === 0) return "(Debate has not started yet.)";
  return turns
    .map((t) => {
      const who =
        t.role === "PRO"
          ? "Pro (arguing FOR the topic)"
          : "Contra (arguing AGAINST the topic)";
      return `${who}: ${t.content.trim()}`;
    })
    .join("\n\n");
}

/**
 * Turns a possibly biased or emotional user phrase into one neutral,
 * debatable proposition Pro can defend and Contra can fairly oppose.
 */
export async function neutralizeTopicForDebate(
  userTopic: string,
): Promise<string> {
  const { text } = await generateText({
    model: openai("gpt-4o-mini"),
    system: `You rephrase what the user typed into ONE neutral, debatable proposition.

Rules:
- A single clear claim (not a rant, not a question unless it is a balanced yes/no policy choice).
- No loaded, slanted, or inflammatory wording; do not assume who is right.
- Same subject matter as the user — do not switch topics.
- Pro will argue FOR this statement; Contra AGAINST — both must be fair.
- At most 35 words.
- Output ONLY the proposition — no quotes, labels, or "Topic:" prefix.`,
    prompt: `User input:\n"""${userTopic.trim()}"""\n\nNeutral proposition:`,
    maxOutputTokens: 120,
  });

  const out = text
    .trim()
    .replace(/^["']|["']$/g, "")
    .replace(/^(topic|proposition)\s*:\s*/i, "")
    .trim();
  return out || userTopic.trim();
}

/** Keeps replies within a max word count if the model runs over. */
function clampWordCount(text: string, maxWords: number): string {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (words.length <= maxWords) return text.trim();
  return `${words.slice(0, maxWords).join(" ")}…`;
}

export async function generateDebateTurn(params: {
  topic: string;
  role: SpeakerRole;
  priorTurns: { role: SpeakerRole; content: string }[];
}): Promise<string> {
  const { topic, role, priorTurns } = params;
  const transcript = buildTranscript(topic, priorTurns);

  const noRepeatRules =
    "Read the full transcript. Do NOT repeat any idea or example you (your side) already said—use a fresh angle, new reason, or new example each time. Do NOT restate the same claim in different words. You may briefly counter the other side, but your new content must be mostly new information, not repetition.";

  const system =
    role === "PRO"
      ? `You are Pro. Your ONLY job is to SUPPORT and DEFEND the topic below as true or good. You agree with it. Never argue against it or take Contra's side. Write like you're explaining to a curious teenager: very short sentences, only common words, zero jargon. Aim for 50–60 words (about 3–5 sentences). Never go over 60 words. ${noRepeatRules} Do not start with "Pro:" or similar.`
      : `You are Contra. Your ONLY job is to OPPOSE and CHALLENGE the topic below. You disagree with it—argue it is false, harmful, or wrong. Never defend the topic or take Pro's side. Write like you're explaining to a curious teenager: very short sentences, only common words, zero jargon. Aim for 50–60 words (about 3–5 sentences). Never go over 60 words. ${noRepeatRules} Do not start with "Contra:" or similar.`;

  const stance =
    role === "PRO"
      ? "Argue FOR this topic (support it)."
      : "Argue AGAINST this topic (oppose it).";

  const { text } = await generateText({
    model: openai("gpt-4o-mini"),
    system,
    prompt: `The topic to debate: "${topic}"\n\n${stance}\n\nWhat was said so far:\n${transcript}\n\nYour turn: 50–60 words max, easiest words possible. Add something NEW—no repeating your earlier points or theirs word-for-word.`,
    maxOutputTokens: 130,
  });

  return clampWordCount(text, 60);
}

export type DebateSummaryResult = {
  bullets: string[];
  closingRemark: string;
};

function parseSummarySections(raw: string): {
  bullets: string[];
  closingRemark: string;
} {
  const text = raw.trim();
  const splitIdx = text.search(/\n\s*CONCLUSION\s*:/i);
  let bulletsPart = text;
  let conclusionPart = "";

  if (splitIdx >= 0) {
    bulletsPart = text.slice(0, splitIdx).trim();
    conclusionPart = text.slice(splitIdx).replace(/^\s*CONCLUSION\s*:/i, "").trim();
  } else {
    const alt = text.split(/\bCONCLUSION\s*:/i);
    if (alt.length >= 2) {
      bulletsPart = alt[0].replace(/^\s*BULLETS\s*:/i, "").trim();
      conclusionPart = alt.slice(1).join("CONCLUSION:").trim();
    }
  }

  bulletsPart = bulletsPart.replace(/^\s*BULLETS\s*:/i, "").trim();

  const bullets = bulletsPart
    .split("\n")
    .map((line) => line.replace(/^\s*[-*•]\s*/, "").trim())
    .filter((line) => line.length > 0);

  const seen = new Set<string>();
  const deduped = bullets.filter((line) => {
    const key = line.toLowerCase().replace(/\s+/g, " ");
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return {
    bullets: deduped,
    closingRemark: conclusionPart.replace(/^["']|["']$/g, "").trim(),
  };
}

export async function generateDebateSummary(params: {
  topic: string;
  turns: { role: SpeakerRole; content: string }[];
}): Promise<DebateSummaryResult> {
  const { topic, turns } = params;
  if (turns.length === 0) {
    return {
      bullets: ["No arguments were exchanged before the debate ended."],
      closingRemark:
        "With no back-and-forth, there is nothing to weigh—start a debate to see how Pro and Contra compare on this topic.",
    };
  }
  const transcript = buildTranscript(topic, turns);

  const { text } = await generateText({
    model: openai("gpt-4o-mini"),
    system: `You summarize debates in very simple language. Pro supported the topic; Contra opposed it.

You MUST output exactly two labeled sections in this order:

BULLETS:
- (5–8 lines; each line starts with "- "; one distinct point per line; merge overlaps; no duplicates)

CONCLUSION:
(One short paragraph, 2–4 sentences, plain words: what the discussion overall shows, how strong each side seemed, and a balanced closing thought—like what someone might say at the end of a friendly debate. Do not declare a legal "winner" unless one side had no real reply; stay fair.)`,
    prompt: `Topic debated: "${topic}"\n(Pro argued FOR it; Contra argued AGAINST it.)\n\nDebate:\n${transcript}\n\nWrite BULLETS then CONCLUSION as specified.`,
    maxOutputTokens: 500,
  });

  const parsed = parseSummarySections(text);
  if (parsed.bullets.length === 0) {
    parsed.bullets = [
      "The models returned an empty bullet list; check the raw debate above.",
    ];
  }
  if (!parsed.closingRemark) {
    parsed.closingRemark =
      "Both sides raised points worth thinking about; the best takeaway is to weigh their arguments against your own context.";
  }

  return parsed;
}
