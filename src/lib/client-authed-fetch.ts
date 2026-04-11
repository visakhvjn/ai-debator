import { getAuth } from "firebase/auth";
import { getFirebaseApp, isFirebaseConfigured } from "@/lib/firebase";

export async function getFirebaseIdToken(): Promise<string | null> {
  if (!isFirebaseConfigured() || typeof window === "undefined") return null;
  try {
    const auth = getAuth(getFirebaseApp());
    const u = auth.currentUser;
    if (!u) return null;
    return u.getIdToken();
  } catch {
    return null;
  }
}

/** Attaches `Authorization: Bearer <Firebase ID token>` when the user is signed in. */
export async function authedFetch(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  const token = await getFirebaseIdToken();
  const headers = new Headers(init?.headers);
  if (token) headers.set("Authorization", `Bearer ${token}`);
  return fetch(input, { ...init, headers });
}
