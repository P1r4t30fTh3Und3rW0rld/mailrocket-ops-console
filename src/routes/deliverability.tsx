import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { OpsShell } from "@/components/ops/OpsShell";
import { ReasonDialog } from "@/components/ops/ReasonDialog";
import {
  EmptyState,
  ErrorState,
  LoadingRows,
  PageHeader,
  Panel,
  RateCell,
  StatusBadge,
  reputationLevel,
} from "@/components/ops/primitives";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";

export const Route = createFileRoute("/deliverability")({
  head: () => ({
    meta: [
      { title: "Deliverability queue — MailRocket Ops" },
      {
        name: "description",
        content: "Accounts over bounce or complaint thresholds in the last 24 hours.",
      },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Deliverability queue — MailRocket Ops" },
      {
        property: "og:description",
        content: "Daily reputation review queue for MailRocket operators.",
      },
    ],
  }),
  component: DeliverabilityPage,
});

function DeliverabilityPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [target, setTarget] = useState<{ id: string; name: string } | null>(null);
  const [reviewed, setReviewed] = useState<string[]>([]);

  const query = useQuery({ queryKey: ["accounts", ""], queryFn: () => api.listAccounts("") });
  const rows = (query.data ?? []).filter(
    (a) => reputationLevel(a.bounce_rate, a.complaint_rate) !== "ok",
  );

  return (
    <OpsShell>
      <PageHeader
        title="Deliverability"
        description="Warn at bounce ≥ 5% or complaint ≥ 0.08%. Restrict at bounce ≥ 10% or complaint ≥ 0.1%."
      />

      <Panel title={`${rows.length} accounts flagged`} description="Reviewed daily.">
        {query.isLoading ? (
          <LoadingRows rows={4} />
        ) : query.isError ? (
          <ErrorState message={(query.error as Error).message} onRetry={() => void query.refetch()} />
        ) : rows.length === 0 ? (
          <EmptyState title="No reputation risks right now." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[960px] text-sm">
              <thead className="sticky top-0 bg-surface">
                <tr className="border-b border-border text-left text-[11px] tracking-wide text-muted-foreground uppercase">
                  <th className="px-4 py-2 font-medium">Workspace</th>
                  <th className="px-4 py-2 font-medium">Owner</th>
                  <th className="px-4 py-2 text-right font-medium">Bounce</th>
                  <th className="px-4 py-2 text-right font-medium">Complaint</th>
                  <th className="px-4 py-2 text-right font-medium">Sent 24h</th>
                  <th className="px-4 py-2 font-medium">Suggested action</th>
                  <th className="px-4 py-2 font-medium">Status</th>
                  <th className="px-4 py-2 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((a) => {
                  const level = reputationLevel(a.bounce_rate, a.complaint_rate);
                  return (
                    <tr key={a.id} className="border-b border-border/60 last:border-0">
                      <td
                        className="cursor-pointer px-4 py-2.5 font-medium hover:underline"
                        onClick={() =>
                          void navigate({ to: "/accounts/$id", params: { id: a.id } })
                        }
                      >
                        {a.name}
                      </td>
                      <td className="px-4 py-2.5 text-xs text-muted-foreground">
                        {a.owner_email}
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        <RateCell value={a.bounce_rate} kind="bounce" />
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        <RateCell value={a.complaint_rate} kind="complaint" />
                      </td>
                      <td className="px-4 py-2.5 text-right font-mono text-xs tabular-nums">
                        {Math.round(a.sent_7d / 7).toLocaleString("en-IN")}
                      </td>
                      <td className="px-4 py-2.5 text-xs">
                        {reviewed.includes(a.id)
                          ? "Reviewed today"
                          : level === "danger"
                            ? "Restrict sending"
                            : "Email customer, monitor 24h"}
                      </td>
                      <td className="px-4 py-2.5">
                        <StatusBadge status={a.status} />
                      </td>
                      <td className="px-4 py-2.5">
                        <div className="flex justify-end gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={a.status !== "active"}
                            onClick={() => setTarget({ id: a.id, name: a.name })}
                          >
                            Restrict
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setReviewed((r) => [...r, a.id]);
                              toast.success("Marked reviewed", { description: a.name });
                            }}
                          >
                            Mark reviewed
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      <ReasonDialog
        open={target !== null}
        onOpenChange={(v) => !v && setTarget(null)}
        destructive
        title={`Restrict ${target?.name ?? ""}`}
        description="Blocks new sends immediately. The customer keeps dashboard access."
        confirmLabel="Restrict sending"
        onConfirm={async (reason) => {
          if (!target) return;
          try {
            await api.setAccountStatus(target.id, "restrict", reason);
            await qc.invalidateQueries({ queryKey: ["accounts"] });
            toast.success("Account restricted", { description: target.name });
          } catch (e) {
            toast.error("Action failed", { description: (e as Error).message });
          }
        }}
      />
    </OpsShell>
  );
}
