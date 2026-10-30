import { createFileRoute, Link } from "@tanstack/react-router";
import { MainLayout } from "@/components/layout/MainLayout";
import { useVmts } from "@/lib/vmts-store";
import {
  DetailList,
  ErrorState,
  PageHeader,
  SectionCard,
  StatusBadge,
} from "@/components/common/ui";
import { formatDate, formatDateTime } from "@/lib/format";

export const Route = createFileRoute("/drivers/$driverId")({
  head: () => ({
    meta: [
      { title: "Driver Details — VMTS" },
      {
        name: "description",
        content: "Driver profile, license details, vehicle assignment and account activity.",
      },
      { property: "og:title", content: "Driver Details — VMTS" },
      {
        property: "og:description",
        content: "Driver profile, license details, vehicle assignment and account activity.",
      },
    ],
  }),
  component: DriverDetailsPage,
});

function DriverDetailsPage() {
  const { driverId } = Route.useParams();
  const { drivers, vehicles } = useVmts();
  const driver = drivers.find((d) => String(d.id) === driverId);

  if (!driver) {
    return (
      <MainLayout pageTitle="Driver Details" requiredRole="ADMIN">
        <PageHeader title="Driver Details" />
        <ErrorState message="Unable to load driver information. The record may have been deleted." />
        <p className="mt-3 text-sm">
          <Link to="/drivers" className="text-primary underline">
            Back to drivers
          </Link>
        </p>
      </MainLayout>
    );
  }

  const vehicle = vehicles.find((v) => v.id === driver.vehicleId);

  return (
    <MainLayout pageTitle="Driver Details" requiredRole="ADMIN">
      <p className="mb-2 text-[13px]">
        <Link to="/drivers" className="text-primary underline">
          ← Back to drivers
        </Link>
      </p>
      <PageHeader
        title={driver.name}
        description={`Driver record · ${driver.licenseNumber}`}
        actions={<StatusBadge status={driver.status} />}
      />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <SectionCard title="Personal Information">
          <DetailList
            items={[
              { label: "Name", value: driver.name },
              { label: "Email", value: driver.email },
              { label: "Phone", value: driver.phone },
            ]}
          />
        </SectionCard>

        <SectionCard title="License Information">
          <DetailList
            items={[
              { label: "License Number", value: driver.licenseNumber },
              { label: "License Status", value: <StatusBadge status={driver.licenseStatus} /> },
            ]}
          />
        </SectionCard>

        <SectionCard title="Vehicle Assignment">
          {vehicle ? (
            <DetailList
              items={[
                {
                  label: "Assigned Vehicle",
                  value: (
                    <Link
                      to="/vehicles/$vehicleId"
                      params={{ vehicleId: String(vehicle.id) }}
                      className="text-primary underline"
                    >
                      {vehicle.manufacturer} {vehicle.model}
                    </Link>
                  ),
                },
                { label: "Registration Number", value: vehicle.registrationNumber },
                { label: "Vehicle Status", value: <StatusBadge status={vehicle.status} /> },
                { label: "Last Start", value: formatDateTime(vehicle.lastStartAt) },
              ]}
            />
          ) : (
            <p className="text-sm text-muted-foreground">No vehicle assigned to this driver.</p>
          )}
        </SectionCard>

        <SectionCard title="Account Information">
          <DetailList
            items={[
              { label: "Account Status", value: <StatusBadge status={driver.status} /> },
              { label: "Created Date", value: formatDate(driver.createdAt) },
              { label: "Last Activity", value: formatDateTime(driver.lastActivity) },
            ]}
          />
        </SectionCard>
      </div>
    </MainLayout>
  );
}
