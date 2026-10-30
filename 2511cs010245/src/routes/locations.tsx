import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { useVmts } from "@/lib/vmts-store";
import {
  Card,
  DataTable,
  PageHeader,
  StatusBadge,
  Td,
  Tr,
} from "@/components/common/ui";
import { MapPanel } from "@/components/common/MapPanel";
import { formatDateTime } from "@/lib/format";

export const Route = createFileRoute("/locations")({
  head: () => ({
    meta: [
      { title: "Location Tracking — VMTS" },
      {
        name: "description",
        content: "Last known coordinates and status for each vehicle in the fleet.",
      },
      { property: "og:title", content: "Location Tracking — VMTS" },
      {
        property: "og:description",
        content: "Last known coordinates and status for each vehicle in the fleet.",
      },
    ],
  }),
  component: LocationsPage,
});

function LocationsPage() {
  const { vehicles, locations } = useVmts();
  const [selectedId, setSelectedId] = useState<string>(String(vehicles[0]?.id ?? ""));

  const vehicle = vehicles.find((v) => String(v.id) === selectedId) ?? vehicles[0];
  const location = locations.find((l) => l.vehicleId === vehicle?.id);

  return (
    <MainLayout pageTitle="Locations" requiredRole="ADMIN">
      <PageHeader
        title="Location Tracking"
        description="Simulated location data. Live coordinates will be served by the backend API."
      />

      <Card className="mb-5 p-3">
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex min-w-[240px] flex-col gap-1.5">
            <label htmlFor="vehicle-select" className="text-[13px] font-medium">
              Select vehicle
            </label>
            <select
              id="vehicle-select"
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              className="rounded-md border border-input bg-surface px-3 py-2 text-sm"
            >
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.registrationNumber} — {v.manufacturer} {v.model}
                </option>
              ))}
            </select>
          </div>
          {vehicle && (
            <div className="flex flex-col gap-1.5">
              <span className="text-[13px] font-medium">Vehicle status</span>
              <StatusBadge status={vehicle.status} />
            </div>
          )}
        </div>
      </Card>

      <MapPanel
        vehicle={vehicle}
        latitude={location?.latitude ?? 17.385}
        longitude={location?.longitude ?? 78.4867}
        updatedAt={formatDateTime(location?.updatedAt ?? vehicle?.lastUpdated ?? null)}
        {...(location?.place ? { place: location.place } : {})}
      />

      <h2 className="mb-2 mt-5 text-sm font-semibold">All vehicle positions</h2>
      <DataTable
        columns={["Vehicle", "Latitude", "Longitude", "Area", "Vehicle Status", "Last Updated"]}
        isEmpty={vehicles.length === 0}
        empty="No vehicle location data available."
      >
        {vehicles.map((v) => {
          const loc = locations.find((l) => l.vehicleId === v.id);
          return (
            <Tr key={v.id}>
              <Td className="font-medium">{v.registrationNumber}</Td>
              <Td className="tabular-nums">{loc ? loc.latitude.toFixed(4) : "—"}</Td>
              <Td className="tabular-nums">{loc ? loc.longitude.toFixed(4) : "—"}</Td>
              <Td>{loc?.place ?? "—"}</Td>
              <Td>
                <StatusBadge status={v.status} />
              </Td>
              <Td className="whitespace-nowrap">{formatDateTime(loc?.updatedAt ?? null)}</Td>
            </Tr>
          );
        })}
      </DataTable>
    </MainLayout>
  );
}
