import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Rocket } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";
import { OPERATOR_KEY, applyTheme, setToken } from "@/lib/ops-settings";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in — MailRocket Ops" },
      { name: "description", content: "Internal operator access to the MailRocket ops console." },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Sign in — MailRocket Ops" },
      { property: "og:description", content: "Internal operator access only." },
    ],
  }),
  component: LoginPage,
});

/**
 * INTEGRATION NOTE: mock mode accepts any email with a password >= 8 chars and
 * stores a fake JWT in localStorage.mr_ops_token. With mock mode off this calls
 * POST /internal/admin/v1/auth/login and stores the real token.
 */
function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("priyanshu@mailrocket.in");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    applyTheme();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const session = await api.login(email, password);
      setToken(session.token);
      window.localStorage.setItem(OPERATOR_KEY, JSON.stringify(session.operator));
      toast.success("Signed in", { description: session.operator.email });
      void navigate({ to: "/accounts" });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Sign in failed";
      setError(message);
      toast.error("Sign in failed", { description: message });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm rounded-lg border border-border bg-card p-6">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-brand/15 text-brand">
            <Rocket className="h-4 w-4" />
          </div>
          <div>
            <h1 className="text-base font-semibold tracking-tight">MailRocket Ops</h1>
            <p className="text-xs text-muted-foreground">Internal operator access</p>
          </div>
        </div>

        {error ? (
          <div
            role="alert"
            className="mt-5 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive"
          >
            {error}
          </div>
        ) : null}

        <form className="mt-5 space-y-4" onSubmit={submit}>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={busy}>
            {busy ? "Signing in…" : "Sign in"}
          </Button>
        </form>

        <p className="mt-5 text-center text-[11px] text-muted-foreground">
          Access via SSH tunnel only. Not a public site.
        </p>
      </div>
    </div>
  );
}
