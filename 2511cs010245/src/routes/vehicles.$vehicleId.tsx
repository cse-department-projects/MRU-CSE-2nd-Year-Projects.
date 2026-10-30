import { createFileRoute, Link } from "@tanstack/react-router";
import { MainLayout } from "@/components/layout/MainLayout";
import { useVmts } from "@/lib/vmts-store";
import {
  DataTable,
  DetailList,
  ErrorState,
  PageHeader,
  SectionCard,
  StatusBadge,
  Td,
  Tr,
} from "@/components/common/ui";
import { MapPanel } from "@/components/common/MapPanel";
import { formatDate, formatDateTime } from "@/lib/format";

export const Route = createFileRoute("/vehicles/$vehicleId")({
  head: () => ({
    meta: [
      { title: "Vehicle Details — VMTS" },
      {
        name: "description",
        content: "Vehicle information, assigned driver, service history and last known location.",
      },
      { property: "og:title", content: "Vehicle Details — VMTS" },
      {
        property: "og:description",
        content: "Vehicle information, assigned driver, service history and last known location.",
      },
    ],
  }),
  component: VehicleDetailsPage,
});

function VehicleDetailsPage() {
  const { vehicleId } = Route.useParams();
  const { vehicles, drivers, services, locations } = useVmts();
  const vehicle = vehicles.find((v) => String(v.id) === vehicleId);

  if (!vehicle) {
    return (
      <MainLayout pageTitle="Vehicle Details" requiredRole="ADMIN">
        <PageHeader title="Vehicle Details" />
        <ErrorState message="Unable to load vehicle information. The record may have been deleted." />
        <p className="mt-3 text-sm">
          <Link to="/vehicles" className="text-primary underline">
            Back to vehicles
          </Link>
        </p>
      </MainLayout>
    );
  }

  const driver = drivers.find((d) => d.id === vehicle.driverId);
  const vehicleServices = services
    .filter((s) => s.vehicleId === vehicle.id)
    .sort((a, b) => b.serviceDate.localeCompare(a.serviceDate));
  const lastService = vehicleServices.find((s) => s.status === "Completed") ?? vehicleServices[0];
  const nextService = vehicleServices
    .filter((s) => s.status !== "Completed")
    .sort((a, b) => a.nextServiceDate.localeCompare(b.nextServiceDate))[0];
  const location = locations.find((l) => l.vehicleId === vehicle.id);

  return (
    <MainLayout pageTitle="Vehicle Details" requiredRole="ADMIN">
      <p className="mb-2 text-[13px]">
        <Link to="/vehicles" className="text-primary underline">
          ← Back to vehicles
        </Link>
      </p>
      <PageHeader
        title={vehicle.registrationNumber}
        description={`${vehicle.manufacturer} ${vehicle.model} · ${vehicle.year}`}
        actions={<StatusBadge status={vehicle.status} />}
      />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <SectionCard title="Vehicle Information">
          <DetailList
            items={[
              { label: "Registration Number", value: vehicle.registrationNumber },
              { label: "Manufacturer", value: vehicle.manufacturer },
              { label: "Model", value: vehicle.model },
              { label: "Year", value: vehicle.year },
              { label: "Status", value: <StatusBadge status={vehicle.status} /> },
              { label: "Last Updated", value: formatDateTime(vehicle.lastUpdated) },
              { label: "Last Start", value: formatDateTime(vehicle.lastStartAt) },
              { label: "Remarks", value: vehicle.remarks || "—" },
            ]}
          />
        </SectionCard>

        <SectionCard title="Driver Information">
          {driver ? (
            <DetailList
              items={[
                {
                  label: "Driver Name",
                  value: (
                    <Link
                      to="/drivers/$driverId"
                      params={{ driverId: String(driver.id) }}
                      className="text-primary underline"
                    >
                      {driver.name}
                    </Link>
                  ),
                },
                { label: "License Number", value: driver.licenseNumber },
                { label: "License Status", value: <StatusBadge status={driver.licenseStatus} /> },
                { label: "Phone", value: driver.phone },
                { label: "Email", value: driver.email },
                { label: "Driver Status", value: <StatusBadge status={driver.status} /> },
              ]}
            />
          ) : (
            <p className="text-sm text-muted-foreground">No driver assigned to this vehicle.</p>
          )}
        </SectionCard>

        <SectionCard title="Service Information" className="lg:col-span-2">
          <DetailList
            items={[
              { label: "Last Service Date", value: formatDate(lastService?.serviceDate) },
              { label: "Next Service Date", value: formatDate(nextService?.nextServiceDate) },
              {
                label: "Service Status",
                value: nextService ? <StatusBadge status={nextService.status} /> : "—",
              },
              { label: "Total Records", value: vehicleServices.length },
            ]}
          />
          <div className="mt-4">
            <DataTable
              columns={["Service Type", "Service Date", "Next Service", "Status"]}
              isEmpty={vehicleServices.length === 0}
              empty="No service records found for this vehicle."
            >
              {vehicleServices.map((s) => (
                <Tr key={s.id}>
                  <Td>
                    <Link
                      to="/services/$serviceId"
                      params={{ serviceId: String(s.id) }}
                      className="text-primary underline"
                    >
                      {s.serviceType}
                    </Link>
                  </Td>
                  <Td>{formatDate(s.serviceDate)}</Td>
                  <Td>{formatDate(s.nextServiceDate)}</Td>
                  <Td>
                    <StatusBadge status={s.status} />
                  </Td>
                </Tr>
              ))}
            </DataTable>
          </div>
        </SectionCard>

        <div className="lg:col-span-2">
          <MapPanel
            vehicle={vehicle}
            latitude={location?.latitude ?? 17.385}
            longitude={location?.longitude ?? 78.4867}
            updatedAt={formatDateTime(location?.updatedAt ?? vehicle.lastUpdated)}
            {...(location?.place ? { place: location.place } : {})}
          />
        </div>
      </div>
    </MainLayout>
  );
}
