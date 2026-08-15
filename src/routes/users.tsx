import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { OpsShell } from "@/components/ops/OpsShell";
import {
  EmptyState,
  ErrorState,
  LoadingRows,
  PageHeader,
  Panel,
  StatusBadge,
  TimeCell,
} from "@/components/ops/primitives";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { api } from "@/lib/api";

export const Route = createFileRoute("/users")({
  head: () => ({
    meta: [
      { title: "Users — MailRocket Ops" },
      { name: "description", content: "Global user search across MailRocket workspaces." },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Users — MailRocket Ops" },
      { property: "og:description", content: "Find a MailRocket user by email." },
    ],
  }),
  component: UsersPage,
});

function UsersPage() {
  const [term, setTerm] = useState("");
  const query = useQuery({ queryKey: ["users", term], queryFn: () => api.listUsers(term) });

  return (
    <OpsShell>
      <PageHeader title="Users" description="Search across all workspaces by email or name." />

      <Input
        value={term}
        onChange={(e) => setTerm(e.target.value)}
        aria-label="Search users"
        placeholder="Search by email…"
        className="h-9 max-w-md"
      />

      <Panel title={`${query.data?.length ?? 0} users`}>
        {query.isLoading ? (
          <LoadingRows rows={4} />
        ) : query.isError ? (
          <ErrorState message={(query.error as Error).message} onRetry={() => void query.refetch()} />
        ) : (query.data ?? []).length === 0 ? (
          <EmptyState title="No users match that search." hint="Try a full email address." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-sm">
              <thead className="sticky top-0 bg-surface">
                <tr className="border-b border-border text-left text-[11px] tracking-wide text-muted-foreground uppercase">
                  <th className="px-4 py-2 font-medium">Email</th>
                  <th className="px-4 py-2 font-medium">Name</th>
                  <th className="px-4 py-2 font-medium">Accounts</th>
                  <th className="px-4 py-2 font-medium">Last login</th>
                  <th className="px-4 py-2 font-medium">Status</th>
                  <th className="px-4 py-2 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {(query.data ?? []).map((u) => (
                  <tr key={u.id} className="border-b border-border/60 last:border-0">
                    <td className="px-4 py-2.5 font-mono text-xs">{u.email}</td>
                    <td className="px-4 py-2.5">{u.name}</td>
                    <td className="px-4 py-2.5 text-xs text-muted-foreground">
                      {u.accounts.join(", ")}
                    </td>
                    <td className="px-4 py-2.5">
                      <TimeCell iso={u.last_login_at} />
                    </td>
                    <td className="px-4 py-2.5">
                      <StatusBadge status={u.status} />
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex justify-end gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            toast.success("Login disabled", { description: u.email })
                          }
                        >
                          Disable login
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() =>
                            toast.success("Password reset sent", { description: u.email })
                          }
                        >
                          Force reset
                        </Button>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span>
                              <Button size="sm" variant="ghost" disabled>
                                Impersonate
                              </Button>
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>Coming later — heavily audited</TooltipContent>
                        </Tooltip>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </OpsShell>
  );
}
