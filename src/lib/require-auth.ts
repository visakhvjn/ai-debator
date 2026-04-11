import { NextResponse } from "next/server";
import { verifyFirebaseIdToken } from "@/lib/verify-firebase-id-token";

export async function requireAuthUser(
  req: Request,
): Promise<{ uid: string } | NextResponse> {
  const raw = req.headers.get("authorization");
  const match = raw?.match(/^Bearer\s+(.+)$/i);
  const token = match?.[1]?.trim();
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await verifyFirebaseIdToken(token);
  if (!user) {
    return NextResponse.json(
      { error: "Invalid or expired session" },
      { status: 401 },
    );
  }

  return { uid: user.uid };
}
