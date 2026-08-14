/**
 * MailRocket Ops — thin API client.
 *
 * ============================================================================
 * INTEGRATION INSTRUCTIONS (read this before wiring the real `admin-api`)
 * ============================================================================
 * 1. Every network call in the app goes through this file. No component calls
 *    `fetch` directly — keep it that way.
 * 2. Base URL: `VITE_ADMIN_API_URL` (build-time) overridden by the operator's
 *    Settings screen value in `localStorage.mr_ops_api_url`.
 * 3. Auth: `Authorization: Bearer <localStorage.mr_ops_token>`.
 * 4. Mock mode (`localStorage.mr_ops_mock !== "off"`, ON by default) short
 *    circuits every method with fixtures from ./mock-data. To go live, either
 *    toggle it off in /settings or delete the `if (isMockMode())` branches.
 * 5. Server contract (snake_case JSON):
 *      POST /internal/admin/v1/auth/login          { email, password }
 *      GET  /internal/admin/v1/accounts?q=
 *      GET  /internal/admin/v1/accounts/:id
 *      POST /internal/admin/v1/accounts/:id/restrict   { reason }
 *      POST /internal/admin/v1/accounts/:id/suspend    { reason }
 *      POST /internal/admin/v1/accounts/:id/unsuspend  { reason }
 *      GET  /internal/admin/v1/audit?account_id=
 *    Errors: `{ message, code }` + non-2xx HTTP status -> thrown as ApiError.
 * 6. Endpoints marked TODO below have no server route yet; they are mock-only
 *    and will throw in live mode. Implement server-side, then replace the
 *    `notImplemented()` call with a `request()` call using the same signature.
 * 7. All privileged mutations take a `reason` (min 8 chars). The UI enforces
 *    it; the server MUST enforce it too and write an audit row.
 * ============================================================================
 */
import {
  MOCK_ACCOUNTS,
  MOCK_AUDIT,
  MOCK_PLATFORM,
  MOCK_USERS,
  mockAccountDetail,
} from "./mock-data";
import { getApiUrl, getToken, isMockMode } from "./ops-settings";
import type {
  AccountDetail,
  AccountListItem,
  AccountStatus,
  AuditEvent,
  OpsSession,
  OpsUser,
  PlatformStats,
  Plan,
} from "./ops-types";

export class ApiError extends Error {
  code: string;
  status: number;
  constructor(message: string, code = "unknown_error", status = 0) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
  }
}

const delay = (ms = 220) => new Promise((r) => setTimeout(r, ms));

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getToken();
  let res: Response;
  try {
    res = await fetch(`${getApiUrl()}${path}`, {
      ...init,
      headers: {
        "content-type": "application/json",
        ...(token ? { authorization: `Bearer ${token}` } : {}),
        ...(init?.headers ?? {}),
      },
    });
  } catch {
    throw new ApiError(
      `Cannot reach admin-api at ${getApiUrl()}. Check the SSH tunnel or enable Mock mode in Settings.`,
      "network_error",
    );
  }
  const body = (await res.json().catch(() => null)) as
    | ({ message?: string; code?: string } & T)
    | null;
  if (!res.ok) {
    throw new ApiError(body?.message ?? `Request failed (${res.status})`, body?.code, res.status);
  }
  return body as T;
}

function notImplemented(name: string): never {
  throw new ApiError(
    `\`${name}\` has no admin-api endpoint yet. Implement it server-side, then replace notImplemented() in src/lib/api.ts.`,
    "not_implemented",
    501,
  );
}

/** Local mutation overlay so mock actions feel real within a session. */
const mockOverrides = new Map<string, { status: AccountStatus; status_reason: string }>();
const withOverride = (a: AccountListItem): AccountListItem => {
  const o = mockOverrides.get(a.id);
  return o ? { ...a, ...o } : a;
};

export const api = {
  async login(email: string, password: string): Promise<OpsSession> {
    if (isMockMode()) {
      await delay(400);
      if (!email.includes("@") || password.length < 8) {
        throw new ApiError("Invalid operator credentials.", "invalid_credentials", 401);
      }
      return {
        object: "ops_session",
        token: `mock.${btoa(email).replace(/=/g, "")}.jwt`,
        operator: { id: "op_1", email, name: email.split("@")[0] ?? "operator" },
      };
    }
    return request<OpsSession>("/internal/admin/v1/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },

  async listAccounts(q = ""): Promise<AccountListItem[]> {
    if (isMockMode()) {
      await delay();
      const term = q.trim().toLowerCase();
      return MOCK_ACCOUNTS.map(withOverride).filter(
        (a) =>
          !term ||
          [a.name, a.owner_email, a.owner_name, a.id, a.primary_domain]
            .join(" ")
            .toLowerCase()
            .includes(term),
      );
    }
    return request<AccountListItem[]>(
      `/internal/admin/v1/accounts?q=${encodeURIComponent(q)}`,
    );
  },

  async getAccount(id: string): Promise<AccountDetail> {
    if (isMockMode()) {
      await delay();
      const detail = mockAccountDetail(id);
      if (!detail) throw new ApiError("Account not found.", "not_found", 404);
      const o = mockOverrides.get(id);
      return o ? { ...detail, ...o } : detail;
    }
    return request<AccountDetail>(`/internal/admin/v1/accounts/${id}`);
  },

  async setAccountStatus(
    id: string,
    action: "restrict" | "suspend" | "unsuspend",
    reason: string,
  ): Promise<{ status: AccountStatus }> {
    if (isMockMode()) {
      await delay(350);
      const status: AccountStatus =
        action === "restrict" ? "restricted" : action === "suspend" ? "suspended" : "active";
      mockOverrides.set(id, { status, status_reason: reason });
      return { status };
    }
    return request<{ status: AccountStatus }>(`/internal/admin/v1/accounts/${id}/${action}`, {
      method: "POST",
      body: JSON.stringify({ reason }),
    });
  },

  async listAudit(accountId?: string): Promise<AuditEvent[]> {
    if (isMockMode()) {
      await delay();
      return accountId ? MOCK_AUDIT.filter((e) => e.account_id === accountId) : MOCK_AUDIT;
    }
    const qs = accountId ? `?account_id=${encodeURIComponent(accountId)}` : "";
    return request<AuditEvent[]>(`/internal/admin/v1/audit${qs}`);
  },

  // --- TODO: no admin-api route yet. Mock-only. -----------------------------
  async listUsers(q = ""): Promise<OpsUser[]> {
    if (isMockMode()) {
      await delay();
      const t = q.trim().toLowerCase();
      return MOCK_USERS.filter((u) => !t || `${u.email} ${u.name}`.toLowerCase().includes(t));
    }
    return notImplemented("listUsers → GET /internal/admin/v1/users?q=");
  },

  async getPlatform(): Promise<PlatformStats> {
    if (isMockMode()) {
      await delay();
      return MOCK_PLATFORM;
    }
    return notImplemented("getPlatform → GET /internal/admin/v1/platform/health");
  },

  async overrideQuota(id: string, limit: number, expiresAt: string, reason: string) {
    if (isMockMode()) {
      await delay(300);
      return { ok: true as const, id, limit, expiresAt, reason };
    }
    return notImplemented("overrideQuota → POST /internal/admin/v1/accounts/:id/quota_override");
  },

  async changePlan(id: string, plan: Plan, reason: string) {
    if (isMockMode()) {
      await delay(300);
      return { ok: true as const, id, plan, reason };
    }
    return notImplemented("changePlan → POST /internal/admin/v1/accounts/:id/plan");
  },

  async revokeKey(id: string, keyId: string, reason: string) {
    if (isMockMode()) {
      await delay(300);
      return { ok: true as const, id, keyId, reason };
    }
    return notImplemented("revokeKey → POST /internal/admin/v1/accounts/:id/keys/:key_id/revoke");
  },

  async addCredits(id: string, amount: number, reason: string) {
    if (isMockMode()) {
      await delay(300);
      return { ok: true as const, id, amount, reason };
    }
    return notImplemented("addCredits → POST /internal/admin/v1/accounts/:id/credits");
  },
};
