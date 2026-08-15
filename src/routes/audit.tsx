import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";

import { OpsShell } from "@/components/ops/OpsShell";
import {
  EmptyState,
  ErrorState,
  LoadingRows,
  PageHeader,
  Panel,
  TimeCell,
} from "@/components/ops/primitives";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "@/lib/api";

export const Route = createFileRoute("/audit")({
  head: () => ({
    meta: [
      { title: "Audit log — MailRocket Ops" },
      {
        name: "description",
        content: "Global log of privileged operator actions with reasons and before/after state.",
      },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Audit log — MailRocket Ops" },
      { property: "og:description", content: "Every privileged action, with reason and actor." },
    ],
  }),
  component: AuditPage,
});

function AuditPage() {
  const query = useQuery({ queryKey: ["audit"], queryFn: () => api.listAudit() });
  const [action, setAction] = useState("all");
  const [term, setTerm] = useState("");
  const [open, setOpen] = useState<string | null>(null);

  const actions = useMemo(
    () => Array.from(new Set((query.data ?? []).map((e) => e.action))),
    [query.data],
  );

  const rows = (query.data ?? []).filter(
    (e) =>
      (action === "all" || e.action === action) &&
      (!term ||
        `${e.actor} ${e.account_id ?? ""} ${e.account_name ?? ""} ${e.reason}`
          .toLowerCase()
          .includes(term.toLowerCase())),
  );

  return (
    <OpsShell>
      <PageHeader
        title="Audit"
        description="Immutable record of privileged operator actions. Expand a row for the JSON diff."
      />

      <div className="flex flex-wrap gap-2">
        <Input
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          aria-label="Filter audit log"
          placeholder="Filter by actor, account id or reason…"
          className="h-9 max-w-md"
        />
        <Select value={action} onValueChange={setAction}>
          <SelectTrigger className="h-9 w-56" aria-label="Filter by action type">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All actions</SelectItem>
            {actions.map((a) => (
              <SelectItem key={a} value={a}>
                {a}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Panel title={`${rows.length} events`}>
        {query.isLoading ? (
          <LoadingRows rows={6} />
        ) : query.isError ? (
          <ErrorState message={(query.error as Error).message} onRetry={() => void query.refetch()} />
        ) : rows.length === 0 ? (
          <EmptyState title="No audit events match those filters." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px] text-sm">
              <thead className="sticky top-0 bg-surface">
                <tr className="border-b border-border text-left text-[11px] tracking-wide text-muted-foreground uppercase">
                  <th className="w-8 px-4 py-2" />
                  <th className="px-4 py-2 font-medium">Time</th>
                  <th className="px-4 py-2 font-medium">Actor</th>
                  <th className="px-4 py-2 font-medium">Action</th>
                  <th className="px-4 py-2 font-medium">Account</th>
                  <th className="px-4 py-2 font-medium">Reason</th>
                  <th className="px-4 py-2 font-medium">IP</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((e) => (
                  <>
                    <tr
                      key={e.id}
                      onClick={() => setOpen(open === e.id ? null : e.id)}
                      className="cursor-pointer border-b border-border/60 hover:bg-muted/50"
                    >
                      <td className="px-4 py-2.5 text-muted-foreground">
                        {open === e.id ? (
                          <ChevronDown className="h-3.5 w-3.5" />
                        ) : (
                          <ChevronRight className="h-3.5 w-3.5" />
                        )}
                      </td>
                      <td className="px-4 py-2.5">
                        <TimeCell iso={e.at} />
                      </td>
                      <td className="px-4 py-2.5 text-xs">{e.actor}</td>
                      <td className="px-4 py-2.5 font-mono text-xs">{e.action}</td>
                      <td className="px-4 py-2.5 text-xs">{e.account_name ?? "—"}</td>
                      <td className="max-w-sm truncate px-4 py-2.5 text-xs text-muted-foreground">
                        {e.reason}
                      </td>
                      <td className="px-4 py-2.5 font-mono text-xs text-muted-foreground">
                        {e.ip}
                      </td>
                    </tr>
                    {open === e.id ? (
                      <tr key={`${e.id}-json`} className="border-b border-border/60 bg-muted/30">
                        <td colSpan={7} className="px-4 py-3">
                          <div className="grid gap-3 md:grid-cols-2">
                            <div>
                              <p className="mb-1 text-[11px] tracking-wide text-muted-foreground uppercase">
                                Before
                              </p>
                              <pre className="overflow-x-auto rounded-md border border-border bg-background p-3 font-mono text-[11px]">
                                {JSON.stringify(e.before, null, 2)}
                              </pre>
                            </div>
                            <div>
                              <p className="mb-1 text-[11px] tracking-wide text-muted-foreground uppercase">
                                After
                              </p>
                              <pre className="overflow-x-auto rounded-md border border-border bg-background p-3 font-mono text-[11px]">
                                {JSON.stringify(e.after, null, 2)}
                              </pre>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ) : null}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </OpsShell>
  );
}
