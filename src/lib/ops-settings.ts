/**
 * MailRocket Ops — client-side operator settings (localStorage only).
 *
 * INTEGRATION NOTE (agent wiring the real backend):
 *   - `mr_ops_token` is the only auth artefact the UI knows about. Replace
 *     `setToken` with whatever your session mechanism is (cookie, SSH-tunnel
 *     header, mTLS) and every screen keeps working.
 *   - `mr_ops_mock` MUST be flipped to "off" once admin-api is reachable.
 *   - Nothing here is secure: it's a local operator preference store.
 */

export const TOKEN_KEY = "mr_ops_token";
export const OPERATOR_KEY = "mr_ops_operator";
const API_URL_KEY = "mr_ops_api_url";
const MOCK_KEY = "mr_ops_mock";
const THEME_KEY = "mr_ops_theme";

export const DEFAULT_API_URL =
  (typeof import.meta !== "undefined" && import.meta.env?.["VITE_ADMIN_API_URL"]) ||
  "http://127.0.0.1:3010";

const read = (k: string) => (typeof window === "undefined" ? null : window.localStorage.getItem(k));
const write = (k: string, v: string) => {
  if (typeof window !== "undefined") window.localStorage.setItem(k, v);
};

export const getToken = () => read(TOKEN_KEY);
export const setToken = (t: string) => write(TOKEN_KEY, t);
export const clearSession = () => {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem(OPERATOR_KEY);
};

export const getApiUrl = () => read(API_URL_KEY) || DEFAULT_API_URL;
export const setApiUrl = (u: string) => write(API_URL_KEY, u);

/** Mock mode is ON by default until the operator explicitly turns it off. */
export const isMockMode = () => read(MOCK_KEY) !== "off";
export const setMockMode = (on: boolean) => write(MOCK_KEY, on ? "on" : "off");

export type ThemeMode = "system" | "light" | "dark";
export const getTheme = (): ThemeMode => (read(THEME_KEY) as ThemeMode | null) ?? "dark";
export const setTheme = (t: ThemeMode) => {
  write(THEME_KEY, t);
  applyTheme(t);
};

export function applyTheme(mode: ThemeMode = getTheme()) {
  if (typeof document === "undefined") return;
  const dark =
    mode === "dark" ||
    (mode === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.classList.toggle("dark", dark);
}

export function getOperator(): { name: string; email: string } {
  const raw = read(OPERATOR_KEY);
  if (raw) {
    try {
      return JSON.parse(raw) as { name: string; email: string };
    } catch {
      /* ignore */
    }
  }
  return { name: "Priyanshu", email: "priyanshu@mailrocket.in" };
}
