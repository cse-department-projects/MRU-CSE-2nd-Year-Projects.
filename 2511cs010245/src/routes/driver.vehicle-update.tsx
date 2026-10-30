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
  FormSelect,
  FormTextarea,
  PageHeader,
  SectionCard,
  StatusBadge,
} from "@/components/common/ui";
import { formatDateTime } from "@/lib/format";
import type { VehicleStatus } from "@/data/mockData";

export const Route = createFileRoute("/driver/vehicle-update")({
  head: () => ({
    meta: [
      { title: "Vehicle Update — VMTS" },
      {
        name: "description",
        content: "Driver form for updating start time, vehicle status and remarks.",
      },
      { property: "og:title", content: "Vehicle Update — VMTS" },
      {
        property: "og:description",
        content: "Driver form for updating start time, vehicle status and remarks.",
      },
    ],
  }),
  component: DriverVehicleUpdatePage,
});

function DriverVehicleUpdatePage() {
  const { user, drivers, vehicles, startVehicle, driverUpdateVehicle } = useVmts();
  const driver = drivers.find((d) => d.id === user?.driverId);
  const vehicle = vehicles.find((v) => v.id === driver?.vehicleId);

  const [startTime, setStartTime] = useState(vehicle?.lastStartAt?.replace(" ", "T") ?? "");
  const [status, setStatus] = useState<VehicleStatus>(vehicle?.status ?? "Active");
  const [remarks, setRemarks] = useState(vehicle?.remarks ?? "");
  const [errors, setErrors] = useState<{ startTime?: string }>({});
  const [saved, setSaved] = useState(false);

  if (!vehicle) {
    return (
      <MainLayout pageTitle="Vehicle Update" requiredRole="DRIVER">
        <PageHeader title="Vehicle Update" />
        <EmptyState message="No vehicle is currently assigned to your account." />
      </MainLayout>
    );
  }

  return (
    <MainLayout pageTitle="Vehicle Update" requiredRole="DRIVER">
      <p className="mb-2 text-[13px]">
        <Link to="/driver/dashboard" className="text-primary underline">
          ← Back to dashboard
        </Link>
      </p>
      <PageHeader
        title="Vehicle Update"
        description={`${vehicle.registrationNumber} · ${vehicle.manufacturer} ${vehicle.model}`}
      />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <SectionCard title="Editable Vehicle Inputs">
          <AlertCard tone="info">
            You can update the start timestamp, vehicle status and remarks. Registration and
            assignment details are managed by the administrator.
          </AlertCard>
          <form
            noValidate
            className="mt-4 flex flex-col gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              if (!startTime) {
                setErrors({ startTime: "Start timestamp is required." });
                setSaved(false);
                return;
              }
              setErrors({});
              startVehicle(vehicle.id, startTime, remarks);
              driverUpdateVehicle(vehicle.id, { status, remarks });
              setSaved(true);
            }}
          >
            <FormInput
              label="Start timestamp"
              type="datetime-local"
              required
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              {...(errors.startTime ? { error: errors.startTime } : {})}
            />
            <FormSelect
              label="Vehicle status"
              required
              value={status}
              onChange={(e) => setStatus(e.target.value as VehicleStatus)}
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Maintenance">Maintenance</option>
            </FormSelect>
            <FormTextarea
              label="Remarks (optional)"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Any issue noticed during the trip"
            />
            <div className="flex gap-2">
              <Button type="submit" variant="primary">
                Save Update
              </Button>
            </div>
            {saved && (
              <div role="status">
                <AlertCard tone="info">Vehicle details updated successfully.</AlertCard>
              </div>
            )}
          </form>
        </SectionCard>

        <SectionCard title="Read-only Vehicle Information">
          <DetailList
            items={[
              { label: "Registration", value: vehicle.registrationNumber },
              { label: "Manufacturer", value: vehicle.manufacturer },
              { label: "Model", value: vehicle.model },
              { label: "Year", value: vehicle.year },
              { label: "Current Status", value: <StatusBadge status={vehicle.status} /> },
              { label: "Last Start", value: formatDateTime(vehicle.lastStartAt) },
              { label: "Last Updated", value: formatDateTime(vehicle.lastUpdated) },
              { label: "Driver", value: driver?.name ?? "—" },
            ]}
          />
        </SectionCard>
      </div>
    </MainLayout>
  );
}
