import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { OpsShell } from "@/components/ops/OpsShell";
import {
  EmptyState,
  ErrorState,
  LoadingRows,
  PageHeader,
  Panel,
  QuotaBar,
  RateCell,
  StatusBadge,
  TimeCell,
} from "@/components/ops/primitives";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "@/lib/api";
import type { AccountStatus, Plan } from "@/lib/ops-types";

export const Route = createFileRoute("/accounts/")({
  validateSearch: (search: Record<string, unknown>): { q?: string } =>
    typeof search["q"] === "string" && search["q"] ? { q: search["q"] } : {},
  head: () => ({
    meta: [
      { title: "Accounts — MailRocket Ops" },
      {
        name: "description",
        content: "Search and triage MailRocket customer accounts, quotas and sending status.",
      },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Accounts — MailRocket Ops" },
      { property: "og:description", content: "Internal account triage for MailRocket." },
    ],
  }),
  component: AccountsPage,
});

function AccountsPage() {
  const navigate = useNavigate();
  const { q = "" } = Route.useSearch();
  const [term, setTerm] = useState(q);
  const [status, setStatus] = useState<AccountStatus | "all">("all");
  const [plan, setPlan] = useState<Plan | "all">("all");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => setTerm(q), [q]);

  const query = useQuery({
    queryKey: ["accounts", term],
    queryFn: () => api.listAccounts(term),
  });

  const rows = useMemo(
    () =>
      (query.data ?? []).filter(
        (a) => (status === "all" || a.status === status) && (plan === "all" || a.plan === plan),
      ),
    [query.data, status, plan],
  );

  return (
    <OpsShell>
      <PageHeader
        title="Accounts"
        description="Primary triage surface. Press / to focus search."
      />

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-64 flex-1">
          <Search className="absolute top-2.5 left-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            ref={inputRef}
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            onBlur={() => void navigate({ to: "/accounts", search: { q: term } })}
            aria-label="Search accounts"
            placeholder="Search email, workspace, account id, domain, key prefix…"
            className="h-9 pl-8"
          />
        </div>
        <Select value={status} onValueChange={(v) => setStatus(v as AccountStatus | "all")}>
          <SelectTrigger className="h-9 w-40" aria-label="Filter by status">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="restricted">Restricted</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
          </SelectContent>
        </Select>
        <Select value={plan} onValueChange={(v) => setPlan(v as Plan | "all")}>
          <SelectTrigger className="h-9 w-36" aria-label="Filter by plan">
            <SelectValue placeholder="Plan" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All plans</SelectItem>
            <SelectItem value="free">Free</SelectItem>
            <SelectItem value="growth">Growth</SelectItem>
            <SelectItem value="scale">Scale</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Panel
        title={`${rows.length} account${rows.length === 1 ? "" : "s"}`}
        description="Click a row to open the account detail."
      >
        {query.isLoading ? (
          <LoadingRows />
        ) : query.isError ? (
          <ErrorState
            message={(query.error as Error).message}
            onRetry={() => void query.refetch()}
          />
        ) : rows.length === 0 ? (
          <EmptyState
            title="No accounts match those filters"
            hint="Clear the search term or reset status and plan filters."
          />
        ) : (
          <div className="max-h-[70vh] overflow-auto">
            <table className="w-full min-w-[1100px] border-collapse text-sm">
              <thead className="sticky top-0 z-10 bg-surface">
                <tr className="border-b border-border text-left text-[11px] tracking-wide text-muted-foreground uppercase">
                  <th className="px-4 py-2 font-medium">Workspace</th>
                  <th className="px-4 py-2 font-medium">Owner</th>
                  <th className="px-4 py-2 font-medium">Plan</th>
                  <th className="px-4 py-2 font-medium">Created</th>
                  <th className="px-4 py-2 text-right font-medium">Sent 7d</th>
                  <th className="px-4 py-2 text-right font-medium">Bounce</th>
                  <th className="px-4 py-2 text-right font-medium">Complaint</th>
                  <th className="px-4 py-2 font-medium">Quota</th>
                  <th className="px-4 py-2 font-medium">Status</th>
                  <th className="px-4 py-2 font-medium">Region</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((a) => (
                  <tr
                    key={a.id}
                    tabIndex={0}
                    onClick={() => void navigate({ to: "/accounts/$id", params: { id: a.id } })}
                    onKeyDown={(e) => {
                      if (e.key === "Enter")
                        void navigate({ to: "/accounts/$id", params: { id: a.id } });
                    }}
                    className="cursor-pointer border-b border-border/60 transition-colors hover:bg-muted/50 focus-visible:bg-muted focus-visible:outline-none"
                  >
                    <td className="px-4 py-2.5">
                      <div className="font-medium">{a.name}</div>
                      <div className="font-mono text-[11px] text-muted-foreground">
                        {a.primary_domain}
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-muted-foreground">{a.owner_email}</td>
                    <td className="px-4 py-2.5 capitalize">{a.plan}</td>
                    <td className="px-4 py-2.5">
                      <TimeCell iso={a.created_at} />
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono text-xs tabular-nums">
                      {a.sent_7d.toLocaleString("en-IN")}
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <RateCell value={a.bounce_rate} kind="bounce" />
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <RateCell value={a.complaint_rate} kind="complaint" />
                    </td>
                    <td className="px-4 py-2.5">
                      <QuotaBar used={a.quota_used} limit={a.quota_limit} />
                    </td>
                    <td className="px-4 py-2.5">
                      <StatusBadge status={a.status} />
                    </td>
                    <td className="px-4 py-2.5 font-mono text-xs text-muted-foreground">
                      {a.data_region}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      <div className="flex justify-end">
        <Button variant="ghost" size="sm" onClick={() => void query.refetch()}>
          Refresh
        </Button>
      </div>
    </OpsShell>
  );
}
