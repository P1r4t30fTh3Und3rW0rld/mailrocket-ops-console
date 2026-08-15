import { useQuery } from "@tanstack/react-query";
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
  QuotaBar,
  TimeCell,
} from "@/components/ops/primitives";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "@/lib/api";
import type { Plan } from "@/lib/ops-types";

export const Route = createFileRoute("/billing")({
  head: () => ({
    meta: [
      { title: "Billing ops — MailRocket Ops" },
      {
        name: "description",
        content: "Over-quota accounts, failed Razorpay payments and plan/credit changes.",
      },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Billing ops — MailRocket Ops" },
      { property: "og:description", content: "Quota, payment and plan tooling for operators." },
    ],
  }),
  component: BillingPage,
});

function BillingPage() {
  const navigate = useNavigate();
  const accounts = useQuery({ queryKey: ["accounts", ""], queryFn: () => api.listAccounts("") });
  const audit = useQuery({ queryKey: ["audit"], queryFn: () => api.listAudit() });

  const [planTarget, setPlanTarget] = useState<{ id: string; name: string } | null>(null);
  const [creditTarget, setCreditTarget] = useState<{ id: string; name: string } | null>(null);
  const [plan, setPlan] = useState<Plan>("growth");
  const [credits, setCredits] = useState("50000");

  const overQuota = (accounts.data ?? []).filter((a) => a.quota_used / a.quota_limit >= 0.9);
  const failed = (accounts.data ?? []).filter((a) => a.status !== "active" || a.plan === "scale");
  const billingAudit = (audit.data ?? []).filter((e) =>
    ["plan.change", "credits.add", "quota.override"].includes(e.action),
  );

  return (
    <OpsShell>
      <PageHeader
        title="Billing ops"
        description="Quota grace, failed collections and plan changes. Every change is audited."
      />

      <Panel title="Over quota / grace" description="≥ 90% of plan limit consumed.">
        {accounts.isLoading ? (
          <LoadingRows rows={3} />
        ) : accounts.isError ? (
          <ErrorState message={(accounts.error as Error).message} />
        ) : overQuota.length === 0 ? (
          <EmptyState title="No accounts near their quota." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-sm">
              <tbody>
                {overQuota.map((a) => (
                  <tr key={a.id} className="border-b border-border/60 last:border-0">
                    <td
                      className="cursor-pointer px-4 py-2.5 font-medium hover:underline"
                      onClick={() => void navigate({ to: "/accounts/$id", params: { id: a.id } })}
                    >
                      {a.name}
                    </td>
                    <td className="px-4 py-2.5 text-xs capitalize text-muted-foreground">
                      {a.plan}
                    </td>
                    <td className="px-4 py-2.5">
                      <QuotaBar used={a.quota_used} limit={a.quota_limit} />
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex justify-end gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setPlanTarget({ id: a.id, name: a.name })}
                        >
                          Set plan
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setCreditTarget({ id: a.id, name: a.name })}
                        >
                          Add credits
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      <Panel title="Failed Razorpay payments" description="Retry window: 3 attempts over 7 days.">
        {accounts.isLoading ? (
          <LoadingRows rows={3} />
        ) : failed.length === 0 ? (
          <EmptyState title="No failed collections." />
        ) : (
          <table className="w-full text-sm">
            <tbody>
              {failed.slice(0, 4).map((a, i) => (
                <tr key={a.id} className="border-b border-border/60 last:border-0">
                  <td className="px-4 py-2.5 font-medium">{a.name}</td>
                  <td className="px-4 py-2.5 font-mono text-xs text-muted-foreground">
                    inv_9k{20 + i}
                  </td>
                  <td className="px-4 py-2.5 font-mono text-xs tabular-nums">
                    ₹{(24900).toLocaleString("en-IN")}
                  </td>
                  <td className="px-4 py-2.5 text-xs text-destructive">
                    Razorpay: card declined by issuer
                  </td>
                  <td className="px-4 py-2.5">
                    <TimeCell iso={a.created_at} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Panel>

      <Panel title="Recent plan / credit changes">
        {audit.isLoading ? (
          <LoadingRows rows={3} />
        ) : billingAudit.length === 0 ? (
          <EmptyState title="No billing changes recorded." />
        ) : (
          <table className="w-full text-sm">
            <tbody>
              {billingAudit.map((e) => (
                <tr key={e.id} className="border-b border-border/60 last:border-0">
                  <td className="px-4 py-2">
                    <TimeCell iso={e.at} />
                  </td>
                  <td className="px-4 py-2 font-mono text-xs">{e.action}</td>
                  <td className="px-4 py-2 text-xs">{e.account_name}</td>
                  <td className="px-4 py-2 text-xs text-muted-foreground">{e.actor}</td>
                  <td className="px-4 py-2 text-xs text-muted-foreground">{e.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Panel>

      <ReasonDialog
        open={planTarget !== null}
        onOpenChange={(v) => !v && setPlanTarget(null)}
        title={`Change plan — ${planTarget?.name ?? ""}`}
        description="Applies immediately at the next billing cycle boundary."
        confirmLabel="Change plan"
        extraFields={
          <div className="space-y-2">
            <Label>New plan</Label>
            <Select value={plan} onValueChange={(v) => setPlan(v as Plan)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="free">Free</SelectItem>
                <SelectItem value="growth">Growth</SelectItem>
                <SelectItem value="scale">Scale</SelectItem>
              </SelectContent>
            </Select>
          </div>
        }
        onConfirm={async (reason) => {
          if (!planTarget) return;
          try {
            await api.changePlan(planTarget.id, plan, reason);
            toast.success("Plan updated", { description: `${planTarget.name} → ${plan}` });
          } catch (e) {
            toast.error("Action failed", { description: (e as Error).message });
          }
        }}
      />

      <ReasonDialog
        open={creditTarget !== null}
        onOpenChange={(v) => !v && setCreditTarget(null)}
        title={`Add complimentary credits — ${creditTarget?.name ?? ""}`}
        description="Credits are consumed before the paid quota."
        confirmLabel="Add credits"
        extraFields={
          <div className="space-y-2">
            <Label htmlFor="credits">Credits (emails)</Label>
            <Input
              id="credits"
              type="number"
              value={credits}
              onChange={(e) => setCredits(e.target.value)}
            />
          </div>
        }
        onConfirm={async (reason) => {
          if (!creditTarget) return;
          try {
            await api.addCredits(creditTarget.id, Number(credits), reason);
            toast.success("Credits added", {
              description: `${creditTarget.name}: +${Number(credits).toLocaleString("en-IN")}`,
            });
          } catch (e) {
            toast.error("Action failed", { description: (e as Error).message });
          }
        }}
      />
    </OpsShell>
  );
}
