/**
 * MailRocket Ops — shared presentational primitives.
 *
 * INTEGRATION NOTE: purely presentational, no data fetching. Safe to restyle.
 * Thresholds live in `reputationLevel` — keep them in sync with the server-side
 * deliverability job that flags accounts.
 */
import { Check, Copy } from "lucide-react";
import { useState, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { AccountStatus } from "@/lib/ops-types";

/* ---------------------------------- status --------------------------------- */

export function StatusBadge({ status }: { status: AccountStatus | "disabled" | "active" }) {
  const map: Record<string, string> = {
    active: "border-success/30 bg-success/10 text-success",
    restricted: "border-warning/30 bg-warning/10 text-warning",
    suspended: "border-destructive/30 bg-destructive/10 text-destructive",
    disabled: "border-destructive/30 bg-destructive/10 text-destructive",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-medium capitalize",
        map[status] ?? "border-border bg-muted text-muted-foreground",
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}

export function HealthBadge({ state }: { state: "healthy" | "degraded" | "critical" }) {
  const map = {
    healthy: "border-success/30 bg-success/10 text-success",
    degraded: "border-warning/30 bg-warning/10 text-warning",
    critical: "border-destructive/30 bg-destructive/10 text-destructive",
  } as const;
  return (
    <span className={cn("rounded-md border px-2 py-0.5 text-xs font-medium capitalize", map[state])}>
      {state}
    </span>
  );
}

/* ------------------------------ reputation ------------------------------- */

/** Warn: bounce >= 5% or complaint >= 0.08%. Danger: bounce >= 10% or complaint >= 0.1%. */
export function reputationLevel(bounce: number, complaint: number): "ok" | "warn" | "danger" {
  if (bounce >= 10 || complaint >= 0.1) return "danger";
  if (bounce >= 5 || complaint >= 0.08) return "warn";
  return "ok";
}

export function RateCell({ value, kind }: { value: number; kind: "bounce" | "complaint" }) {
  const level =
    kind === "bounce" ? reputationLevel(value, 0) : reputationLevel(0, value);
  return (
    <span
      className={cn(
        "font-mono text-xs tabular-nums",
        level === "danger" && "text-destructive font-semibold",
        level === "warn" && "text-warning font-medium",
        level === "ok" && "text-muted-foreground",
      )}
    >
      {value.toFixed(kind === "bounce" ? 1 : 2)}%
    </span>
  );
}

/* -------------------------------- copyable -------------------------------- */

export function CopyValue({ value, label }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        void navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 1200);
      }}
      className="group inline-flex max-w-full items-center gap-1.5 rounded-md border border-border/60 bg-muted/40 px-2 py-1 font-mono text-xs text-muted-foreground transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
      aria-label={`Copy ${label ?? value}`}
    >
      <span className="truncate">{value}</span>
      {copied ? (
        <Check className="h-3 w-3 shrink-0 text-success" />
      ) : (
        <Copy className="h-3 w-3 shrink-0 opacity-50 group-hover:opacity-100" />
      )}
    </button>
  );
}

/* --------------------------------- layout --------------------------------- */

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-4">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
        {description ? (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
    </div>
  );
}

export function MetricTile({
  label,
  value,
  hint,
  tone = "default",
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: "default" | "success" | "warning" | "danger" | "brand";
}) {
  const toneClass = {
    default: "text-foreground",
    success: "text-success",
    warning: "text-warning",
    danger: "text-destructive",
    brand: "text-brand",
  }[tone];
  return (
    <Card className="gap-0 rounded-lg border-border bg-card py-0 shadow-none">
      <CardContent className="px-4 py-3">
        <p className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
          {label}
        </p>
        <p className={cn("mt-1 text-2xl font-semibold tabular-nums", toneClass)}>{value}</p>
        {hint ? <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p> : null}
      </CardContent>
    </Card>
  );
}

export function Panel({
  title,
  description,
  actions,
  children,
  id,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  id?: string;
}) {
  return (
    <section id={id} className="rounded-lg border border-border bg-card">
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-3">
        <div>
          <h2 className="text-sm font-semibold tracking-tight">{title}</h2>
          {description ? (
            <p className="text-xs text-muted-foreground">{description}</p>
          ) : null}
        </div>
        {actions}
      </header>
      {children}
    </section>
  );
}

/* --------------------------- list state helpers --------------------------- */

export function LoadingRows({ rows = 6 }: { rows?: number }) {
  return (
    <div className="space-y-2 p-4">
      {Array.from({ length: rows }, (_, i) => (
        <Skeleton key={i} className="h-9 w-full" />
      ))}
    </div>
  );
}

export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="px-4 py-12 text-center">
      <p className="text-sm font-medium">{title}</p>
      {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="px-4 py-10 text-center">
      <p className="text-sm font-medium text-destructive">Request failed</p>
      <p className="mx-auto mt-1 max-w-xl text-xs text-muted-foreground">{message}</p>
      {onRetry ? (
        <Button variant="outline" size="sm" className="mt-4" onClick={onRetry}>
          Retry
        </Button>
      ) : null}
    </div>
  );
}

export function QuotaBar({ used, limit }: { used: number; limit: number }) {
  const pct = Math.min(100, Math.round((used / Math.max(limit, 1)) * 100));
  const tone = pct >= 95 ? "bg-destructive" : pct >= 80 ? "bg-warning" : "bg-brand";
  return (
    <div className="min-w-28">
      <div className="font-mono text-[11px] tabular-nums text-muted-foreground">
        {used.toLocaleString("en-IN")} / {limit.toLocaleString("en-IN")}
      </div>
      <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-muted">
        <div className={cn("h-full rounded-full", tone)} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export function relativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const abs = Math.abs(diff);
  const mins = Math.round(abs / 60000);
  const suffix = diff >= 0 ? "ago" : "from now";
  if (mins < 60) return `${mins}m ${suffix}`;
  const hours = Math.round(mins / 60);
  if (hours < 48) return `${hours}h ${suffix}`;
  const days = Math.round(hours / 24);
  if (days < 60) return `${days}d ${suffix}`;
  return `${Math.round(days / 30)}mo ${suffix}`;
}

export function TimeCell({ iso }: { iso: string }) {
  return (
    <span title={new Date(iso).toUTCString()} className="text-xs text-muted-foreground">
      {relativeTime(iso)}
    </span>
  );
}
