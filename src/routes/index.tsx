import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { OpsShell } from "@/components/ops/OpsShell";
import {
  EmptyState,
  ErrorState,
  LoadingRows,
  MetricTile,
  PageHeader,
  Panel,
  RateCell,
  StatusBadge,
  TimeCell,
  reputationLevel,
} from "@/components/ops/primitives";
import { api } from "@/lib/api";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Overview — MailRocket Ops" },
      {
        name: "description",
        content:
          "Platform pulse for MailRocket: accepts, reputation, queue depth and accounts needing attention.",
      },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Overview — MailRocket Ops" },
      { property: "og:description", content: "Internal platform pulse for MailRocket." },
    ],
  }),
  component: OverviewPage,
});

function OverviewPage() {
  const navigate = useNavigate();
  const accounts = useQuery({ queryKey: ["accounts", ""], queryFn: () => api.listAccounts("") });
  const platform = useQuery({ queryKey: ["platform"], queryFn: () => api.getPlatform() });
  const audit = useQuery({ queryKey: ["audit"], queryFn: () => api.listAudit() });

  const list = accounts.data ?? [];
  const dlq = (platform.data?.queues ?? []).reduce((n, q) => n + q.dlq, 0);
  const attention = list.filter(
    (a) =>
      reputationLevel(a.bounce_rate, a.complaint_rate) !== "ok" ||
      a.quota_used / a.quota_limit >= 0.95,
  );

  return (
    <OpsShell>
      <PageHeader title="Overview" description="Platform pulse — ap-south-1, last 24 hours." />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-6">
        <MetricTile label="Accounts" value={String(list.length)} hint="total workspaces" />
        <MetricTile
          label="Restricted"
          value={String(list.filter((a) => a.status === "restricted").length)}
          tone="warning"
        />
        <MetricTile
          label="Suspended"
          value={String(list.filter((a) => a.status === "suspended").length)}
          tone="danger"
        />
        <MetricTile
          label="Accepted 24h"
          value={(platform.data?.accepted_24h ?? 0).toLocaleString("en-IN")}
          tone="brand"
        />
        <MetricTile
          label="Bounce %"
          value={`${platform.data?.bounce_rate ?? 0}%`}
          tone={(platform.data?.bounce_rate ?? 0) >= 5 ? "warning" : "default"}
        />
        <MetricTile
          label="DLQ depth"
          value={String(dlq)}
          tone={dlq > 0 ? "danger" : "success"}
          hint={dlq > 0 ? "drain required" : "clear"}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Panel
            title="Needs attention"
            description="Reputation or quota risk in the last 24h."
          >
            {accounts.isLoading ? (
              <LoadingRows rows={4} />
            ) : accounts.isError ? (
              <ErrorState message={(accounts.error as Error).message} />
            ) : attention.length === 0 ? (
              <EmptyState title="Nothing needs attention right now." />
            ) : (
              <table className="w-full text-sm">
                <tbody>
                  {attention.map((a) => (
                    <tr
                      key={a.id}
                      onClick={() => void navigate({ to: "/accounts/$id", params: { id: a.id } })}
                      className="cursor-pointer border-b border-border/60 last:border-0 hover:bg-muted/50"
                    >
                      <td className="px-4 py-2.5 font-medium">{a.name}</td>
                      <td className="px-4 py-2.5 text-xs text-muted-foreground">
                        {a.owner_email}
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        <RateCell value={a.bounce_rate} kind="bounce" />
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        <RateCell value={a.complaint_rate} kind="complaint" />
                      </td>
                      <td className="px-4 py-2.5">
                        <StatusBadge status={a.status} />
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        <ArrowRight className="ml-auto h-3.5 w-3.5 text-muted-foreground" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Panel>
        </div>

        <Panel title="Accepts, last 7 days">
          <div className="h-52 p-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={platform.data?.accepts_7d ?? []}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
                <YAxis
                  tick={{ fontSize: 11 }}
                  stroke="var(--muted-foreground)"
                  tickFormatter={(v: number) => `${Math.round(v / 1000)}k`}
                />
                <Tooltip
                  contentStyle={{
                    background: "var(--popover)",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                    fontSize: 12,
                    color: "var(--popover-foreground)",
                  }}
                />
                <Bar dataKey="accepted" fill="var(--chart-1)" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>

      <Panel title="Recent audit events" description="Last 8 privileged actions.">
        {audit.isLoading ? (
          <LoadingRows rows={4} />
        ) : (
          <table className="w-full text-sm">
            <tbody>
              {(audit.data ?? []).slice(0, 8).map((e) => (
                <tr key={e.id} className="border-b border-border/60 last:border-0">
                  <td className="px-4 py-2">
                    <TimeCell iso={e.at} />
                  </td>
                  <td className="px-4 py-2 font-mono text-xs">{e.action}</td>
                  <td className="px-4 py-2 text-xs">{e.account_name ?? "—"}</td>
                  <td className="px-4 py-2 text-xs text-muted-foreground">{e.actor}</td>
                  <td className="max-w-md truncate px-4 py-2 text-xs text-muted-foreground">
                    {e.reason}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Panel>
    </OpsShell>
  );
}
