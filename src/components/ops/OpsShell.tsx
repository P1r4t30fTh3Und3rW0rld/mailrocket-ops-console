/**
 * MailRocket Ops — app chrome (sidebar + header).
 *
 * INTEGRATION NOTES:
 *   - Auth gate is client-side only (`mr_ops_token` presence). Replace
 *     `useEffect` redirect with your real session check when admin-api is wired.
 *   - Keyboard: "/" focuses the global search, Cmd/Ctrl+K opens it, Esc closes.
 *   - Never link to the customer dashboard (app.mailrocket.in) from here.
 */
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  Activity,
  CreditCard,
  Gauge,
  LayoutDashboard,
  Menu,
  Moon,
  Rocket,
  ScrollText,
  Settings as SettingsIcon,
  ShieldAlert,
  Sun,
  Users,
  Building2,
  LogOut,
} from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import {
  applyTheme,
  clearSession,
  getOperator,
  getToken,
  getTheme,
  setTheme,
} from "@/lib/ops-settings";

const NAV = [
  { to: "/", label: "Overview", icon: LayoutDashboard },
  { to: "/accounts", label: "Accounts", icon: Building2 },
  { to: "/deliverability", label: "Deliverability", icon: ShieldAlert },
  { to: "/users", label: "Users", icon: Users },
  { to: "/billing", label: "Billing", icon: CreditCard },
  { to: "/platform", label: "Platform", icon: Activity },
  { to: "/audit", label: "Audit", icon: ScrollText },
  { to: "/settings", label: "Settings", icon: SettingsIcon },
] as const;

function Brand({ collapsed }: { collapsed: boolean }) {
  return (
    <div className="flex items-center gap-2.5 px-3 py-4">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-brand/15 text-brand">
        <Rocket className="h-4 w-4" />
      </div>
      {!collapsed && (
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold tracking-tight">MailRocket Ops</p>
          <p className="text-[10px] tracking-wide text-muted-foreground uppercase">Internal</p>
        </div>
      )}
    </div>
  );
}

function NavList({ collapsed, onNavigate }: { collapsed: boolean; onNavigate?: () => void }) {
  return (
    <nav className="flex flex-col gap-0.5 px-2">
      {NAV.map(({ to, label, icon: Icon }) => (
        <Link
          key={to}
          to={to}
          onClick={onNavigate}
          activeOptions={{ exact: to === "/" }}
          activeProps={{
            className: "bg-sidebar-accent text-sidebar-accent-foreground font-medium",
          }}
          className="flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm text-sidebar-foreground transition-colors hover:bg-sidebar-accent/70 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          title={collapsed ? label : undefined}
        >
          <Icon className="h-4 w-4 shrink-0" />
          {!collapsed && <span className="truncate">{label}</span>}
        </Link>
      ))}
    </nav>
  );
}

export function OpsShell({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [collapsed, setCollapsed] = useState(false);
  const [dark, setDark] = useState(true);
  const [ready, setReady] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const operator = getOperator();

  useEffect(() => {
    applyTheme();
    setDark(document.documentElement.classList.contains("dark"));
    if (!getToken()) {
      void navigate({ to: "/login" });
      return;
    }
    setReady(true);
  }, [navigate]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing = ["INPUT", "TEXTAREA"].includes((e.target as HTMLElement)?.tagName);
      if ((e.key === "/" && !typing) || ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k")) {
        e.preventDefault();
        if (pathname !== "/accounts") void navigate({ to: "/accounts" });
        setTimeout(() => searchRef.current?.focus(), 60);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [navigate, pathname]);

  const toggleTheme = () => {
    const next = dark ? "light" : "dark";
    setTheme(next);
    setDark(!dark);
  };

  if (!ready) {
    return <div className="min-h-screen bg-background" />;
  }

  return (
    <div className="flex min-h-screen bg-background">
      <aside
        className={cn(
          "hidden shrink-0 border-r border-sidebar-border bg-sidebar md:flex md:flex-col",
          collapsed ? "w-16" : "w-56",
        )}
      >
        <Brand collapsed={collapsed} />
        <NavList collapsed={collapsed} />
        <div className="mt-auto border-t border-sidebar-border p-2">
          {!collapsed && (
            <div className="px-1.5 pb-2">
              <p className="truncate text-xs font-medium">{operator.name}</p>
              <p className="truncate text-[11px] text-muted-foreground">{operator.email}</p>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2 text-muted-foreground"
            onClick={() => setCollapsed((c) => !c)}
          >
            <Menu className="h-4 w-4" />
            {!collapsed && "Collapse"}
          </Button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-background/90 px-4 backdrop-blur">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open navigation">
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 bg-sidebar p-0">
              <SheetTitle className="sr-only">Navigation</SheetTitle>
              <Brand collapsed={false} />
              <NavList collapsed={false} />
            </SheetContent>
          </Sheet>

          <div className="relative hidden max-w-sm flex-1 md:block">
            <Input
              ref={searchRef}
              placeholder="Search accounts…"
              aria-label="Global account search"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  void navigate({
                    to: "/accounts",
                    search: { q: (e.target as HTMLInputElement).value },
                  });
                }
              }}
              className="h-8 pr-16 text-sm"
            />
            <kbd className="pointer-events-none absolute top-1.5 right-2 rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
              ⌘K
            </kbd>
          </div>

          <div className="ml-auto flex items-center gap-1">
            <span className="mr-2 hidden rounded-md border border-border bg-muted/50 px-2 py-1 font-mono text-[10px] text-muted-foreground sm:inline">
              region ap-south-1
            </span>
            <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
              {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Sign out"
              onClick={() => {
                clearSession();
                void navigate({ to: "/login" });
              }}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1400px] flex-1 space-y-6 p-4 md:p-6">{children}</main>

        <footer className="border-t border-border px-6 py-3 text-[11px] text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <Gauge className="h-3 w-3" /> Internal tool — access via SSH tunnel only. Grafana
            remains source of truth for deep infra.
          </span>
        </footer>
      </div>
    </div>
  );
}
