/**
 * MailRocket Ops — mock fixtures.
 *
 * INTEGRATION NOTE (agent wiring the real backend):
 *   Nothing outside src/lib/api.ts should import this file. When mock mode is
 *   OFF the API client hits `admin-api` instead and these fixtures are unused.
 *   Deleting this file should only require deleting the mock branches in api.ts.
 */
import type {
  AccountDetail,
  AccountListItem,
  AuditEvent,
  Invoice,
  OpsUser,
  PlatformStats,
  UsageBucket,
} from "./ops-types";

const iso = (daysAgo: number, hour = 9) => {
  const d = new Date(Date.UTC(2026, 7, 14, hour, 12, 0));
  d.setUTCDate(d.getUTCDate() - daysAgo);
  return d.toISOString();
};

interface Seed {
  id: string;
  name: string;
  domain: string;
  owner: string;
  ownerEmail: string;
  plan: AccountListItem["plan"];
  status: AccountListItem["status"];
  reason?: string;
  sent7d: number;
  bounce: number;
  complaint: number;
  used: number;
  limit: number;
  createdDaysAgo: number;
}

const SEEDS: Seed[] = [
  { id: "8f2c1a94-3d61-4f0b-9a77-1c0de2b41f01", name: "Acme Logistics", domain: "acme.in", owner: "Rhea Nair", ownerEmail: "rhea@acme.in", plan: "growth", status: "active", sent7d: 184320, bounce: 1.8, complaint: 0.02, used: 184320, limit: 400000, createdDaysAgo: 412 },
  { id: "b21e6d70-52c4-4c81-8e2f-9a4c7de11c02", name: "PayLocal", domain: "paylocal.io", owner: "Karthik Menon", ownerEmail: "karthik@paylocal.io", plan: "scale", status: "restricted", reason: "Bounce rate above 10% for 36h on transactional stream", sent7d: 921840, bounce: 11.4, complaint: 0.06, used: 921840, limit: 1500000, createdDaysAgo: 688 },
  { id: "c7d80a11-9b34-49aa-b0d1-33f27ea41c03", name: "Nimbus HR", domain: "nimbushr.com", owner: "Aditi Rao", ownerEmail: "aditi@nimbushr.com", plan: "growth", status: "active", sent7d: 64210, bounce: 4.1, complaint: 0.05, used: 64210, limit: 200000, createdDaysAgo: 210 },
  { id: "d3a92f45-1c7e-4bb2-a19c-6f0b83c11c04", name: "Chai Commerce", domain: "chaicommerce.in", owner: "Vikram Shetty", ownerEmail: "vikram@chaicommerce.in", plan: "free", status: "suspended", reason: "Confirmed purchased-list sending, SES complaint spike", sent7d: 0, bounce: 18.9, complaint: 0.42, used: 3000, limit: 3000, createdDaysAgo: 96 },
  { id: "e5b41c07-77aa-4d13-93de-2b8c5aa11c05", name: "Kavach Security", domain: "kavach.security", owner: "Neel Bhatt", ownerEmail: "neel@kavach.security", plan: "scale", status: "active", sent7d: 402118, bounce: 0.9, complaint: 0.01, used: 402118, limit: 1000000, createdDaysAgo: 533 },
  { id: "f0c73b28-64d5-4a99-8c11-7e2d91f11c06", name: "Bolt Kirana", domain: "boltkirana.in", owner: "Simran Kaur", ownerEmail: "simran@boltkirana.in", plan: "growth", status: "active", sent7d: 137902, bounce: 5.6, complaint: 0.09, used: 137902, limit: 150000, createdDaysAgo: 148 },
  { id: "0a1d5e33-2f88-4b45-9d21-4c6b02a11c07", name: "Medhaa Health", domain: "medhaa.health", owner: "Dr. Ishaan Verma", ownerEmail: "ishaan@medhaa.health", plan: "growth", status: "active", sent7d: 51230, bounce: 2.3, complaint: 0.03, used: 51230, limit: 250000, createdDaysAgo: 301 },
  { id: "1b2e6f44-8c19-4e56-a331-5d7c13b11c08", name: "Terrafleet", domain: "terrafleet.co", owner: "Meera Iyer", ownerEmail: "meera@terrafleet.co", plan: "free", status: "active", sent7d: 2140, bounce: 3.4, complaint: 0.0, used: 2140, limit: 3000, createdDaysAgo: 37 },
  { id: "2c3f7a55-9d20-4f67-b442-6e8d24c11c09", name: "Ledgerly", domain: "ledgerly.in", owner: "Arjun Pillai", ownerEmail: "arjun@ledgerly.in", plan: "scale", status: "active", sent7d: 688401, bounce: 6.8, complaint: 0.11, used: 688401, limit: 900000, createdDaysAgo: 754 },
  { id: "3d408b66-0e31-4078-c553-7f9e35d11c10", name: "Zaru Studios", domain: "zaru.studio", owner: "Tanvi Desai", ownerEmail: "tanvi@zaru.studio", plan: "free", status: "restricted", reason: "Complaint rate 0.19% on marketing stream", sent7d: 2980, bounce: 7.2, complaint: 0.19, used: 2980, limit: 3000, createdDaysAgo: 61 },
  { id: "4e519c77-1f42-4189-d664-80af46e11c11", name: "Grameen Loans", domain: "grameenloans.in", owner: "Rohit Sinha", ownerEmail: "rohit@grameenloans.in", plan: "growth", status: "active", sent7d: 92140, bounce: 3.1, complaint: 0.04, used: 92140, limit: 300000, createdDaysAgo: 264 },
  { id: "5f62ad88-2053-429a-e775-91b057f11c12", name: "Orbit Tickets", domain: "orbittickets.in", owner: "Farah Qureshi", ownerEmail: "farah@orbittickets.in", plan: "scale", status: "active", sent7d: 511230, bounce: 9.4, complaint: 0.07, used: 511230, limit: 600000, createdDaysAgo: 480 },
];

export const MOCK_ACCOUNTS: AccountListItem[] = SEEDS.map((s) => ({
  id: s.id,
  name: s.name,
  status: s.status,
  status_reason: s.reason ?? null,
  data_region: "in",
  created_at: iso(s.createdDaysAgo),
  owner_email: s.ownerEmail,
  owner_name: s.owner,
  plan: s.plan,
  sent_7d: s.sent7d,
  bounce_rate: s.bounce,
  complaint_rate: s.complaint,
  quota_used: s.used,
  quota_limit: s.limit,
  primary_domain: s.domain,
}));

const usageFor = (base: number, points: number, labeler: (i: number) => string): UsageBucket[] =>
  Array.from({ length: points }, (_, i) => {
    const sent = Math.round(base * (0.7 + ((i * 37) % 60) / 100));
    const bounced = Math.round(sent * 0.03);
    const complained = Math.round(sent * 0.0006);
    return {
      label: labeler(i),
      sent,
      delivered: sent - bounced,
      bounced,
      complained,
      suppressed: Math.round(sent * 0.004),
      opened: Math.round(sent * 0.41),
      clicked: Math.round(sent * 0.12),
    };
  });

export function mockAccountDetail(id: string): AccountDetail | null {
  const base = MOCK_ACCOUNTS.find((a) => a.id === id);
  if (!base) return null;
  const daily = base.sent_7d / 7;

  return {
    ...base,
    teams: ["Engineering", "Growth"],
    members: [
      { email: base.owner_email, name: base.owner_name, role: "owner" },
      { email: `ops@${base.primary_domain}`, name: "Ops Bot", role: "developer" },
      { email: `finance@${base.primary_domain}`, name: "Finance", role: "viewer" },
    ],
    domains: [
      { domain: base.primary_domain, verify_status: "verified", sending_enabled: base.status === "active", created_at: base.created_at },
      { domain: `mail.${base.primary_domain}`, verify_status: "verified", sending_enabled: base.status === "active", created_at: base.created_at },
      { domain: `notify.${base.primary_domain}`, verify_status: "pending", sending_enabled: false, created_at: iso(12) },
    ],
    api_keys: [
      { id: "key_1", name: "production", prefix: "mr_live_9fA2", created_at: base.created_at, last_used_at: iso(0, 6), revoked: false },
      { id: "key_2", name: "staging", prefix: "mr_test_41Kq", created_at: iso(120), last_used_at: iso(4), revoked: false },
      { id: "key_3", name: "legacy-cron", prefix: "mr_live_ZZ08", created_at: iso(320), last_used_at: iso(190), revoked: true },
    ],
    usage: {
      "24h": usageFor(daily / 24, 12, (i) => `${String(i * 2).padStart(2, "0")}:00`),
      "7d": usageFor(daily, 7, (i) => ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i]),
      "30d": usageFor(daily, 30, (i) => `D-${29 - i}`),
    },
    reputation_series: Array.from({ length: 14 }, (_, i) => ({
      day: iso(13 - i).slice(5, 10),
      bounce: Math.max(0, +(base.bounce_rate * (0.6 + ((i * 13) % 70) / 100)).toFixed(2)),
      complaint: Math.max(0, +(base.complaint_rate * (0.5 + ((i * 17) % 90) / 100)).toFixed(3)),
    })),
    emails: Array.from({ length: 8 }, (_, i) => {
      const status = (["delivered", "delivered", "bounced", "delivered", "complained", "queued", "failed", "delivered"] as const)[i]!;
      return {
        id: `em_${base.id.slice(0, 8)}${i}${"abcdef"[i % 6]}9k`,
        to: `user${i + 1}@${["gmail.com", "outlook.com", "yahoo.in", "rediffmail.com"][i % 4]}`,
        subject: ["Your OTP code", "Invoice #INR-8821", "Password reset", "Order shipped", "Weekly digest", "Welcome aboard", "Payment failed", "Account verified"][i]!,
        status,
        created_at: iso(0, 12 - i),
        events: [
          { at: iso(0, 12 - i), type: "accepted", detail: "POST /emails accepted, queued to SES" },
          { at: iso(0, 12 - i), type: "sent", detail: "Handed to SES ap-south-1" },
          status === "bounced"
            ? { at: iso(0, 13 - i), type: "bounce", detail: "Permanent — mailbox does not exist (SMTP 550)" }
            : status === "complained"
              ? { at: iso(0, 13 - i), type: "complaint", detail: "Feedback loop report from provider" }
              : { at: iso(0, 13 - i), type: "delivery", detail: "250 OK — accepted by remote MTA" },
        ],
      };
    }),
    billing: {
      plan: base.plan,
      status: base.quota_used / base.quota_limit > 0.95 ? "grace" : base.status === "suspended" ? "past_due" : "active",
      period_end: iso(-11),
      invoices: (base.quota_used / base.quota_limit > 0.9
        ? [
            { id: "inv_9k21", amount_inr: 24900, status: "failed", attempted_at: iso(3), failure_reason: "Razorpay: card declined by issuer" },
            { id: "inv_9k04", amount_inr: 24900, status: "paid", attempted_at: iso(33), failure_reason: null },
          ]
        : [{ id: "inv_8f77", amount_inr: 9900, status: "paid", attempted_at: iso(9), failure_reason: null }]) as Invoice[],
    },
  };
}

export const MOCK_AUDIT: AuditEvent[] = [
  { id: "aud_01", at: iso(0, 5), actor: "priyanshu@mailrocket.in", action: "account.restrict", account_id: SEEDS[1]!.id, account_name: "PayLocal", reason: "Bounce rate above 10% for 36h on transactional stream", ip: "10.4.0.19", before: { status: "active" }, after: { status: "restricted" } },
  { id: "aud_02", at: iso(1, 18), actor: "priyanshu@mailrocket.in", action: "account.suspend", account_id: SEEDS[3]!.id, account_name: "Chai Commerce", reason: "Confirmed purchased-list sending, SES complaint spike", ip: "10.4.0.19", before: { status: "restricted" }, after: { status: "suspended" } },
  { id: "aud_03", at: iso(1, 11), actor: "ops@mailrocket.in", action: "quota.override", account_id: SEEDS[5]!.id, account_name: "Bolt Kirana", reason: "Diwali burst approved by founder, 72h window", ip: "10.4.0.22", before: { quota_limit: 150000 }, after: { quota_limit: 400000, expires_at: iso(-3) } },
  { id: "aud_04", at: iso(2, 9), actor: "priyanshu@mailrocket.in", action: "account.unsuspend", account_id: SEEDS[9]!.id, account_name: "Zaru Studios", reason: "Customer removed scraped list and enabled double opt-in", ip: "10.4.0.19", before: { status: "suspended" }, after: { status: "restricted" } },
  { id: "aud_05", at: iso(3, 15), actor: "ops@mailrocket.in", action: "apikey.revoke", account_id: SEEDS[0]!.id, account_name: "Acme Logistics", reason: "Key leaked in public GitHub repository", ip: "10.4.0.22", before: { key_prefix: "mr_live_ZZ08", revoked: false }, after: { revoked: true } },
  { id: "aud_06", at: iso(4, 10), actor: "priyanshu@mailrocket.in", action: "plan.change", account_id: SEEDS[8]!.id, account_name: "Ledgerly", reason: "Upgraded to scale after annual contract signature", ip: "10.4.0.19", before: { plan: "growth" }, after: { plan: "scale" } },
  { id: "aud_07", at: iso(5, 13), actor: "ops@mailrocket.in", action: "credits.add", account_id: SEEDS[6]!.id, account_name: "Medhaa Health", reason: "Goodwill credit for ap-south-1 delivery incident", ip: "10.4.0.22", before: { credits: 0 }, after: { credits: 50000 } },
  { id: "aud_08", at: iso(6, 8), actor: "priyanshu@mailrocket.in", action: "deliverability.review", account_id: SEEDS[11]!.id, account_name: "Orbit Tickets", reason: "Reviewed bounce spike, cause was one stale ticketing list", ip: "10.4.0.19", before: { flagged: true }, after: { flagged: false, reviewed_at: iso(6) } },
  { id: "aud_09", at: iso(8, 16), actor: "priyanshu@mailrocket.in", action: "user.disable_login", account_id: SEEDS[3]!.id, account_name: "Chai Commerce", reason: "Fraud investigation, login frozen pending KYC", ip: "10.4.0.19", before: { login_enabled: true }, after: { login_enabled: false } },
];

export const MOCK_USERS: OpsUser[] = SEEDS.slice(0, 9).map((s, i) => ({
  id: `usr_${i + 1}`,
  email: s.ownerEmail,
  name: s.owner,
  accounts: [s.name],
  last_login_at: iso(i),
  status: s.status === "suspended" ? "disabled" : "active",
}));

export const MOCK_PLATFORM: PlatformStats = {
  queues: [
    { name: "mr-send", depth: 1284, dlq: 0, lag_seconds: 3, state: "healthy" },
    { name: "mr-events", depth: 8420, dlq: 12, lag_seconds: 41, state: "degraded" },
    { name: "mr-webhooks", depth: 220, dlq: 0, lag_seconds: 2, state: "healthy" },
    { name: "mr-suppressions", depth: 18, dlq: 0, lag_seconds: 1, state: "healthy" },
  ],
  accept_error_rate: 0.34,
  clickhouse_insert_failures: 2,
  accepted_24h: 1284903,
  bounce_rate: 4.2,
  complaint_rate: 0.06,
  accepts_7d: Array.from({ length: 7 }, (_, i) => ({
    day: ["Fri", "Sat", "Sun", "Mon", "Tue", "Wed", "Thu"][i]!,
    accepted: [1104000, 812000, 738000, 1290400, 1341200, 1288100, 1284903][i]!,
  })),
};
