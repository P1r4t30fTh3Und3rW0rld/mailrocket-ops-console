/**
 * MailRocket Ops — shared domain types.
 *
 * INTEGRATION NOTE (agent wiring the real backend):
 *   These types mirror the snake_case JSON returned by `admin-api`
 *   (`/internal/admin/v1/*`). Keep field names in sync with the server; the UI
 *   reads these shapes directly with no camelCase mapping layer.
 */

export type AccountStatus = "active" | "restricted" | "suspended";
export type Plan = "free" | "growth" | "scale";

export interface Operator {
  id: string;
  email: string;
  name: string;
}

export interface OpsSession {
  object: "ops_session";
  token: string;
  operator: Operator;
}

/** GET /internal/admin/v1/accounts */
export interface AccountListItem {
  id: string;
  name: string;
  status: AccountStatus;
  status_reason: string | null;
  data_region: "in";
  created_at: string;
  owner_email: string;
  owner_name: string;
  plan: Plan;
  sent_7d: number;
  bounce_rate: number; // percent, e.g. 6.2
  complaint_rate: number; // percent, e.g. 0.09
  quota_used: number;
  quota_limit: number;
  primary_domain: string;
}

export interface Member {
  email: string;
  name: string;
  role: "owner" | "admin" | "developer" | "viewer";
}

export interface DomainRecord {
  domain: string;
  verify_status: "verified" | "pending" | "failed";
  sending_enabled: boolean;
  created_at: string;
}

export interface ApiKey {
  id: string;
  name: string;
  prefix: string; // e.g. mr_live_9fA2
  created_at: string;
  last_used_at: string | null;
  revoked: boolean;
}

export interface UsageBucket {
  label: string;
  sent: number;
  delivered: number;
  bounced: number;
  complained: number;
  suppressed: number;
  opened: number;
  clicked: number;
}

export interface EmailRecord {
  id: string;
  to: string;
  subject: string;
  status: "delivered" | "bounced" | "complained" | "queued" | "failed";
  created_at: string;
  events: { at: string; type: string; detail: string }[];
}

export interface Invoice {
  id: string;
  amount_inr: number;
  status: "failed" | "paid" | "pending";
  attempted_at: string;
  failure_reason: string | null;
}

export interface AuditEvent {
  id: string;
  at: string;
  actor: string;
  action: string;
  account_id: string | null;
  account_name: string | null;
  reason: string;
  ip: string;
  before: Record<string, unknown>;
  after: Record<string, unknown>;
}

/** GET /internal/admin/v1/accounts/:id */
export interface AccountDetail extends AccountListItem {
  members: Member[];
  teams: string[];
  domains: DomainRecord[];
  api_keys: ApiKey[];
  usage: Record<"24h" | "7d" | "30d", UsageBucket[]>;
  reputation_series: { day: string; bounce: number; complaint: number }[];
  emails: EmailRecord[];
  billing: {
    plan: Plan;
    status: "active" | "past_due" | "grace";
    period_end: string;
    invoices: Invoice[];
  };
}

export interface OpsUser {
  id: string;
  email: string;
  name: string;
  accounts: string[];
  last_login_at: string;
  status: "active" | "disabled";
}

export interface QueueHealth {
  name: string;
  depth: number;
  dlq: number;
  lag_seconds: number;
  state: "healthy" | "degraded" | "critical";
}

export interface PlatformStats {
  queues: QueueHealth[];
  accept_error_rate: number;
  clickhouse_insert_failures: number;
  accepts_7d: { day: string; accepted: number }[];
  accepted_24h: number;
  bounce_rate: number;
  complaint_rate: number;
}
