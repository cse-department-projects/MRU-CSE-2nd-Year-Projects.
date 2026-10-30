import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { useVmts } from "@/lib/vmts-store";
import {
  AlertCard,
  Button,
  DetailList,
  EmptyState,
  FormInput,
  PageHeader,
  SectionCard,
  StatusBadge,
} from "@/components/common/ui";
import { formatDate, formatDateTime } from "@/lib/format";

export const Route = createFileRoute("/driver/dashboard")({
  head: () => ({
    meta: [
      { title: "Driver Dashboard — VMTS" },
      {
        name: "description",
        content: "Driver view of the assigned vehicle, start log and service schedule.",
      },
      { property: "og:title", content: "Driver Dashboard — VMTS" },
      {
        property: "og:description",
        content: "Driver view of the assigned vehicle, start log and service schedule.",
      },
    ],
  }),
  component: DriverDashboardPage,
});

function localNow() {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function DriverDashboardPage() {
  const { user, drivers, vehicles, services, startVehicle } = useVmts();
  const driver = drivers.find((d) => d.id === user?.driverId);
  const vehicle = vehicles.find((v) => v.id === driver?.vehicleId);

  const [startTime, setStartTime] = useState(localNow());
  const [error, setError] = useState("");
  const [confirmed, setConfirmed] = useState(false);

  const upcoming = services
    .filter((s) => s.vehicleId === vehicle?.id && s.status !== "Completed")
    .sort((a, b) => a.nextServiceDate.localeCompare(b.nextServiceDate))[0];

  return (
    <MainLayout pageTitle="Driver Dashboard" requiredRole="DRIVER">
      <PageHeader
        title={`Welcome, ${driver?.name ?? user?.name ?? "Driver"}`}
        description="Your assigned vehicle and daily start log."
      />

      {!vehicle ? (
        <EmptyState message="No vehicle is currently assigned to your account. Contact the fleet administrator." />
      ) : (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <SectionCard title="Assigned Vehicle">
            <DetailList
              items={[
                { label: "Registration", value: vehicle.registrationNumber },
                { label: "Model", value: `${vehicle.manufacturer} ${vehicle.model}` },
                { label: "Year", value: vehicle.year },
                { label: "Status", value: <StatusBadge status={vehicle.status} /> },
                { label: "Last Start Time", value: formatDateTime(vehicle.lastStartAt) },
                { label: "Last Updated", value: formatDateTime(vehicle.lastUpdated) },
              ]}
            />
            {upcoming && (
              <div className="mt-4">
                <AlertCard tone={upcoming.status === "Overdue" ? "danger" : "warning"}>
                  {upcoming.serviceType} due on {formatDate(upcoming.nextServiceDate)} —{" "}
                  {upcoming.status}.
                </AlertCard>
              </div>
            )}
          </SectionCard>

          <SectionCard title="Vehicle Start">
            <form
              noValidate
              onSubmit={(e) => {
                e.preventDefault();
                if (!startTime) {
                  setError("Start timestamp is required.");
                  setConfirmed(false);
                  return;
                }
                setError("");
                startVehicle(vehicle.id, startTime, "");
                setConfirmed(true);
              }}
              className="flex flex-col gap-4"
            >
              <FormInput
                label="Start timestamp"
                type="datetime-local"
                required
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                {...(error ? { error } : {})}
              />
              <div>
                <Button type="submit" variant="primary">
                  Start Vehicle
                </Button>
              </div>
              {confirmed && !error && (
                <div role="status">
                  <AlertCard tone="info">Vehicle started successfully.</AlertCard>
                </div>
              )}
            </form>

            <div className="mt-5 border-t border-border pt-4">
              <DetailList
                items={[
                  { label: "Last Start Time", value: formatDateTime(vehicle.lastStartAt) },
                  { label: "Current Vehicle Status", value: <StatusBadge status={vehicle.status} /> },
                ]}
              />
              <p className="mt-4 text-sm">
                <Link to="/driver/vehicle-update" className="text-primary underline">
                  Update vehicle details →
                </Link>
              </p>
            </div>
          </SectionCard>
        </div>
      )}
    </MainLayout>
  );
}
