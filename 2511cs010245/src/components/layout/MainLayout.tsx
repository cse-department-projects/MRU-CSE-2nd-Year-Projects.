import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import {
  CalendarClock,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  MapPin,
  Menu,
  PencilLine,
  Truck,
  Users,
  X,
} from "lucide-react";
import { useVmts } from "@/lib/vmts-store";
import { cn } from "@/lib/utils";

const adminNav = [
  { label: "Dashboard", to: "/admin/dashboard", icon: LayoutDashboard, group: "Overview" },
  { label: "Vehicles", to: "/vehicles", icon: Truck, group: "Fleet" },
  { label: "Drivers", to: "/drivers", icon: Users, group: "Fleet" },
  { label: "Services", to: "/services", icon: CalendarClock, group: "Fleet" },
  { label: "Locations", to: "/locations", icon: MapPin, group: "Tracking" },
  { label: "Audit Trail", to: "/audit-trail", icon: ClipboardList, group: "System" },
] as const;

const driverNav = [
  { label: "My Dashboard", to: "/driver/dashboard", icon: LayoutDashboard, group: "Overview" },
  { label: "Vehicle Update", to: "/driver/vehicle-update", icon: PencilLine, group: "Overview" },
] as const;

function Toasts() {
  const { toasts, dismissToast } = useVmts();
  if (toasts.length === 0) return null;
  return (
    <div aria-live="polite" className="fixed bottom-4 right-4 z-50 flex w-[320px] max-w-[calc(100vw-2rem)] flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            "flex items-start justify-between gap-3 rounded-md border px-3 py-2 text-sm shadow-card",
            t.tone === "error"
              ? "border-danger/40 bg-danger-surface text-danger"
              : "border-success/40 bg-success-surface text-success",
          )}
        >
          <span>{t.message}</span>
          <button type="button" onClick={() => dismissToast(t.id)} aria-label="Dismiss message">
            <X className="size-4" aria-hidden="true" />
          </button>
        </div>
      ))}
    </div>
  );
}

export function MainLayout({
  pageTitle,
  children,
  requiredRole,
}: {
  pageTitle: string;
  children: ReactNode;
  requiredRole?: "ADMIN" | "DRIVER";
}) {
  const { user, authReady, logout, loading, dataError, refresh } = useVmts();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!authReady) return;
    if (!user) {
      navigate({ to: "/", replace: true });
      return;
    }
    if (requiredRole && user.role !== requiredRole) {
      navigate({
        to: user.role === "ADMIN" ? "/admin/dashboard" : "/driver/dashboard",
        replace: true,
      });
    }
  }, [authReady, user, requiredRole, navigate]);

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  if (!authReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">Loading your session…</p>
      </div>
    );
  }

  if (!user || (requiredRole && user.role !== requiredRole)) return null;

  const nav = user.role === "ADMIN" ? adminNav : driverNav;
  const groups = [...new Set(nav.map((i) => i.group))];
  const initials = user.name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-3 border-b border-border bg-surface px-3 sm:px-4">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            className="rounded-md border border-input p-1.5 text-muted-foreground hover:bg-secondary lg:hidden"
            aria-expanded={sidebarOpen}
            aria-controls="vmts-sidebar"
            onClick={() => setSidebarOpen((v) => !v)}
          >
            <Menu className="size-4" aria-hidden="true" />
            <span className="sr-only">Toggle navigation</span>
          </button>
          <div className="flex min-w-0 items-center gap-2.5">
            <span
              aria-hidden="true"
              className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground"
            >
              <Truck className="size-4" />
            </span>
            <div className="min-w-0 leading-tight">
              <p className="text-sm font-semibold tracking-tight">VMTS</p>
              <p className="hidden truncate text-xs text-muted-foreground sm:block">
                Vehicle Management &amp; Tracking System
              </p>
            </div>
          </div>
          <span
            className="hidden truncate border-l border-border pl-3 text-sm text-muted-foreground md:inline"
            aria-current="page"
          >
            {pageTitle}
          </span>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden text-right leading-tight sm:block">
            <p className="text-[13px] font-medium">{user.name}</p>
            <p className="text-xs text-muted-foreground">
              {user.role === "ADMIN" ? "Administrator" : "Driver"}
            </p>
          </div>
          <span
            aria-hidden="true"
            className="flex size-8 items-center justify-center rounded-full border border-border bg-secondary text-[11px] font-semibold text-secondary-foreground"
          >
            {initials}
          </span>
          <button
            type="button"
            onClick={() => {
              logout();
              navigate({ to: "/", replace: true });
            }}
            className="inline-flex items-center gap-1.5 rounded-md border border-input bg-surface px-2.5 py-1.5 text-[13px] font-medium hover:bg-secondary"
          >
            <LogOut className="size-4" aria-hidden="true" />
            <span className="hidden sm:inline">Logout</span>
            <span className="sr-only sm:hidden">Logout</span>
          </button>
        </div>
      </header>

      <div className="flex">
        <nav
          id="vmts-sidebar"
          aria-label="Main navigation"
          className={cn(
            "fixed inset-y-14 left-0 z-20 w-60 shrink-0 overflow-y-auto border-r border-border bg-surface px-3 py-4 transition-transform lg:sticky lg:top-14 lg:h-[calc(100vh-3.5rem)] lg:translate-x-0",
            sidebarOpen ? "translate-x-0" : "-translate-x-full",
          )}
        >
          {groups.map((group) => (
            <div key={group} className="mb-5 last:mb-0">
              <p className="px-3 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                {group}
              </p>
              <ul className="flex flex-col gap-0.5">
                {nav
                  .filter((item) => item.group === group)
                  .map((item) => (
                    <li key={item.to}>
                      <Link
                        to={item.to}
                        className="group flex items-center gap-2.5 rounded-md border-l-2 border-transparent px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground data-[status=active]:border-primary data-[status=active]:bg-accent data-[status=active]:font-medium data-[status=active]:text-accent-foreground"
                      >
                        <item.icon className="size-4 shrink-0" aria-hidden="true" />
                        {item.label}
                      </Link>
                    </li>
                  ))}
            </ul>
            </div>
          ))}
          <p className="mt-6 border-t border-border px-3 pt-3 text-[11px] leading-relaxed text-muted-foreground">
            Connected to the VMTS server.
          </p>
        </nav>

        {sidebarOpen && (
          <button
            type="button"
            aria-label="Close navigation"
            className="fixed inset-0 top-14 z-10 bg-foreground/30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6">
          {dataError && (
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-md border border-danger/40 bg-danger-surface px-3 py-2 text-sm text-danger">
              <span>{dataError}</span>
              <button
                type="button"
                onClick={() => void refresh()}
                className="rounded-md border border-danger/40 px-2.5 py-1 text-[13px] font-medium hover:bg-danger/10"
              >
                Retry
              </button>
            </div>
          )}
          {loading && !dataError && (
            <p className="mb-4 text-sm text-muted-foreground">Loading data from the server…</p>
          )}
          {children}
        </main>
      </div>
      <Toasts />
    </div>
  );
}
