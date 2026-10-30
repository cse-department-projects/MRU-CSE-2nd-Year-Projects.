import { createFileRoute, redirect } from "@tanstack/react-router";

// Legacy path kept working: the driver dashboard now lives at /driver/dashboard.
export const Route = createFileRoute("/driver/")({
  beforeLoad: () => {
    throw redirect({ to: "/driver/dashboard" });
  },
});
