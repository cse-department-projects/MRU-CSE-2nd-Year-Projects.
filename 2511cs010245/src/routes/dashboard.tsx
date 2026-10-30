import { createFileRoute, redirect } from "@tanstack/react-router";

// Legacy path kept working: the admin dashboard now lives at /admin/dashboard.
export const Route = createFileRoute("/dashboard")({
  beforeLoad: () => {
    throw redirect({ to: "/admin/dashboard" });
  },
});
