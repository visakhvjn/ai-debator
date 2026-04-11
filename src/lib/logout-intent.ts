/** Session flag: user chose Log out from the debate app (not a missing session). */
export const DEBATOR_LOGOUT_SESSION_KEY = "ai-debator-user-logout";

export function markDebatorLogoutIntent(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(DEBATOR_LOGOUT_SESSION_KEY, "1");
  } catch {
    /* ignore quota / private mode */
  }
}

export function consumeDebatorLogoutIntent(): boolean {
  if (typeof window === "undefined") return false;
  try {
    if (sessionStorage.getItem(DEBATOR_LOGOUT_SESSION_KEY) !== "1") return false;
    sessionStorage.removeItem(DEBATOR_LOGOUT_SESSION_KEY);
    return true;
  } catch {
    return false;
  }
}
