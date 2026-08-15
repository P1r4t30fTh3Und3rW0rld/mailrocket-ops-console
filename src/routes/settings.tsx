import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { OpsShell } from "@/components/ops/OpsShell";
import { PageHeader, Panel } from "@/components/ops/primitives";
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
import { Switch } from "@/components/ui/switch";
import {
  DEFAULT_API_URL,
  clearSession,
  getApiUrl,
  getOperator,
  getTheme,
  isMockMode,
  setApiUrl,
  setMockMode,
  setTheme,
  type ThemeMode,
} from "@/lib/ops-settings";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — MailRocket Ops" },
      { name: "description", content: "Operator profile, theme, admin-api base URL and mock mode." },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Settings — MailRocket Ops" },
      { property: "og:description", content: "Operator preferences for the MailRocket ops console." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const navigate = useNavigate();
  const operator = getOperator();
  const [theme, setThemeState] = useState<ThemeMode>("dark");
  const [url, setUrl] = useState(DEFAULT_API_URL);
  const [mock, setMock] = useState(true);

  useEffect(() => {
    setThemeState(getTheme());
    setUrl(getApiUrl());
    setMock(isMockMode());
  }, []);

  return (
    <OpsShell>
      <PageHeader title="Settings" description="Local operator preferences. Nothing here is shared." />

      <Panel title="Operator">
        <div className="grid gap-4 p-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="op-name">Name</Label>
            <Input id="op-name" value={operator.name} readOnly />
          </div>
          <div className="space-y-2">
            <Label htmlFor="op-email">Email</Label>
            <Input id="op-email" value={operator.email} readOnly />
          </div>
        </div>
      </Panel>

      <Panel title="Appearance">
        <div className="max-w-xs space-y-2 p-4">
          <Label>Theme</Label>
          <Select
            value={theme}
            onValueChange={(v) => {
              setThemeState(v as ThemeMode);
              setTheme(v as ThemeMode);
            }}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="system">System</SelectItem>
              <SelectItem value="light">Light</SelectItem>
              <SelectItem value="dark">Dark</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Panel>

      <Panel
        title="admin-api connection"
        description="Mock mode returns local fixtures. Turn it off once the tunnel to admin-api is up."
      >
        <div className="space-y-4 p-4">
          <div className="max-w-md space-y-2">
            <Label htmlFor="api-url">API base URL</Label>
            <Input
              id="api-url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onBlur={() => {
                setApiUrl(url.trim());
                toast.success("API base URL saved");
              }}
              className="font-mono text-xs"
            />
            <p className="text-xs text-muted-foreground">
              Default comes from <span className="font-mono">VITE_ADMIN_API_URL</span>, falling
              back to <span className="font-mono">http://127.0.0.1:3010</span>.
            </p>
          </div>
          <div className="flex items-center justify-between rounded-md border border-border px-3 py-2">
            <div>
              <Label htmlFor="mock" className="text-sm">
                Mock mode
              </Label>
              <p className="text-xs text-muted-foreground">
                ON by default. Live mode calls /internal/admin/v1/*.
              </p>
            </div>
            <Switch
              id="mock"
              checked={mock}
              onCheckedChange={(v) => {
                setMock(v);
                setMockMode(v);
                toast.success(v ? "Mock mode enabled" : "Mock mode disabled");
              }}
            />
          </div>
        </div>
      </Panel>

      <Panel title="Session">
        <div className="p-4">
          <Button
            variant="destructive"
            onClick={() => {
              clearSession();
              void navigate({ to: "/login" });
            }}
          >
            Sign out
          </Button>
        </div>
      </Panel>
    </OpsShell>
  );
}
