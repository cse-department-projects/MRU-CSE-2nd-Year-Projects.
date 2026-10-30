import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Truck } from "lucide-react";
import { useVmts } from "@/lib/vmts-store";
import { Button, ErrorState, FormInput } from "@/components/common/ui";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sign in — VMTS Vehicle Management & Tracking System" },
      {
        name: "description",
        content:
          "Sign in to VMTS to manage vehicles, drivers, service schedules and vehicle location tracking.",
      },
      { property: "og:title", content: "Sign in — VMTS" },
      {
        property: "og:description",
        content: "Internal fleet management and tracking system login.",
      },
    ],
  }),
  component: LoginPage,
});

/** Home route for a signed-in user, by role. */
export function homeRouteFor(role: "ADMIN" | "DRIVER") {
  return role === "ADMIN" ? "/admin/dashboard" : "/driver/dashboard";
}

function LoginPage() {
  const { login, user, authReady } = useVmts();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (authReady && user) navigate({ to: homeRouteFor(user.role), replace: true });
  }, [authReady, user, navigate]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const next: { email?: string; password?: string } = {};
    if (!email.trim()) next.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
      next.email = "Enter a valid email address.";
    if (!password) next.password = "Password is required.";
    setErrors(next);
    if (Object.keys(next).length > 0) {
      setFormError("");
      return;
    }
    setSubmitting(true);
    const result = await login(email, password);
    setSubmitting(false);
    if (!result.ok || !result.role) {
      setFormError(result.error ?? "Invalid email or password");
      return;
    }
    setFormError("");
    navigate({ to: homeRouteFor(result.role), replace: true });
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex items-center gap-2.5">
          <span
            aria-hidden="true"
            className="flex size-9 items-center justify-center rounded-md bg-primary text-primary-foreground"
          >
            <Truck className="size-5" />
          </span>
          <div>
            <h1 className="text-base font-semibold leading-tight tracking-tight">VMTS</h1>
            <p className="text-[13px] leading-tight text-muted-foreground">
              Vehicle Management &amp; Tracking System
            </p>
          </div>
        </div>

        <form
          onSubmit={onSubmit}
          noValidate
          className="rounded-md border border-border bg-card p-5 shadow-card"
        >
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Sign in
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Use your organisation account to continue.
          </p>

          {formError && (
            <div className="mt-4">
              <ErrorState message={formError} />
            </div>
          )}

          <div className="mt-4 flex flex-col gap-4">
            <FormInput
              label="Email"
              type="email"
              required
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@vmts.com"
              {...(errors.email ? { error: errors.email } : {})}
            />
            <div>
              <FormInput
                label="Password"
                type={showPassword ? "text" : "password"}
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                {...(errors.password ? { error: errors.password } : {})}
              />
              <label className="mt-2 flex items-center gap-2 text-[13px] text-muted-foreground">
                <input
                  type="checkbox"
                  checked={showPassword}
                  onChange={(e) => setShowPassword(e.target.checked)}
                />
                Show password
              </label>
            </div>
            <Button type="submit" variant="primary" className="w-full" disabled={submitting}>
              {submitting ? "Signing in…" : "Login"}
            </Button>
          </div>
        </form>

        <div className="mt-4 rounded-md border border-border bg-secondary/60 p-3 text-[13px] text-muted-foreground">
          <p className="font-medium text-foreground">Demo credentials (seeded in MySQL)</p>
          <p className="mt-1 tabular-nums">Admin: admin@vmts.com / admin123</p>
          <p className="tabular-nums">Driver: driver@vmts.com / driver123</p>
        </div>
      </div>
    </main>
  );
}
