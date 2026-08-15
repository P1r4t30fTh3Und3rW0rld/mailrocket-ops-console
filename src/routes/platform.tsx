import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { OpsShell } from "@/components/ops/OpsShell";
import {
  ErrorState,
  HealthBadge,
  LoadingRows,
  MetricTile,
  PageHeader,
  Panel,
} from "@/components/ops/primitives";
import { api } from "@/lib/api";

export const Route = createFileRoute("/platform")({
  head: () => ({
    meta: [
      { title: "Platform health — MailRocket Ops" },
      {
        name: "description",
        content: "Queue depth, DLQs, consumer lag and accept-path error rate for MailRocket.",
      },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Platform health — MailRocket Ops" },
      { property: "og:description", content: "Queues, lag and accept-path errors at a glance." },
    ],
  }),
  component: PlatformPage,
});

function PlatformPage() {
  const query = useQuery({ queryKey: ["platform"], queryFn: () => api.getPlatform() });
  const data = query.data;
  const dlq = (data?.queues ?? []).reduce((n, q) => n + q.dlq, 0);

  return (
    <OpsShell>
      <PageHeader
        title="Platform health"
        description="Grafana remains source of truth for deep infra. This is the ops-level summary."
      />

      {query.isLoading ? (
        <LoadingRows rows={4} />
      ) : query.isError ? (
        <ErrorState message={(query.error as Error).message} onRetry={() => void query.refetch()} />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <MetricTile
              label="POST /emails errors"
              value={`${data?.accept_error_rate ?? 0}%`}
              tone={(data?.accept_error_rate ?? 0) > 1 ? "danger" : "success"}
              hint="rolling 15m"
            />
            <MetricTile
              label="Total DLQ"
              value={String(dlq)}
              tone={dlq > 0 ? "danger" : "success"}
            />
            <MetricTile
              label="ClickHouse insert failures"
              value={String(data?.clickhouse_insert_failures ?? 0)}
              tone={(data?.clickhouse_insert_failures ?? 0) > 0 ? "warning" : "success"}
            />
            <MetricTile
              label="Accepted 24h"
              value={(data?.accepted_24h ?? 0).toLocaleString("en-IN")}
              tone="brand"
            />
          </div>

          <Panel title="SQS queues" description="Depth, DLQ and consumer lag per queue.">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-sm">
                <thead className="sticky top-0 bg-surface">
                  <tr className="border-b border-border text-left text-[11px] tracking-wide text-muted-foreground uppercase">
                    <th className="px-4 py-2 font-medium">Queue</th>
                    <th className="px-4 py-2 text-right font-medium">Depth</th>
                    <th className="px-4 py-2 text-right font-medium">DLQ</th>
                    <th className="px-4 py-2 text-right font-medium">Lag (s)</th>
                    <th className="px-4 py-2 font-medium">State</th>
                  </tr>
                </thead>
                <tbody>
                  {(data?.queues ?? []).map((q) => (
                    <tr key={q.name} className="border-b border-border/60 last:border-0">
                      <td className="px-4 py-2.5 font-mono text-xs">{q.name}</td>
                      <td className="px-4 py-2.5 text-right font-mono text-xs tabular-nums">
                        {q.depth.toLocaleString("en-IN")}
                      </td>
                      <td
                        className={`px-4 py-2.5 text-right font-mono text-xs tabular-nums ${
                          q.dlq > 0 ? "font-semibold text-destructive" : "text-muted-foreground"
                        }`}
                      >
                        {q.dlq}
                      </td>
                      <td className="px-4 py-2.5 text-right font-mono text-xs tabular-nums">
                        {q.lag_seconds}
                      </td>
                      <td className="px-4 py-2.5">
                        <HealthBadge state={q.state} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>
        </>
      )}
    </OpsShell>
  );
}
