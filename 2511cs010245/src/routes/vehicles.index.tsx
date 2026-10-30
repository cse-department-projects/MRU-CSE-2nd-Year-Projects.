import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { useVmts } from "@/lib/vmts-store";
import {
  Button,
  ConfirmDialog,
  DataTable,
  FilterBar,
  Modal,
  PageHeader,
  SearchBar,
  SelectFilter,
  StatusBadge,
  Td,
  Tr,
} from "@/components/common/ui";
import { VehicleForm, type VehicleFormValues } from "@/components/forms/VehicleForm";
import { formatDateTime } from "@/lib/format";
import type { Vehicle, VehicleStatus } from "@/data/mockData";

export const Route = createFileRoute("/vehicles/")({
  head: () => ({
    meta: [
      { title: "Vehicles — VMTS" },
      {
        name: "description",
        content: "Manage fleet vehicles: registration, model, assignment and status.",
      },
      { property: "og:title", content: "Vehicles — VMTS" },
      {
        property: "og:description",
        content: "Manage fleet vehicles: registration, model, assignment and status.",
      },
    ],
  }),
  component: VehiclesPage,
});

function VehiclesPage() {
  const { vehicles, drivers, createVehicle, updateVehicle, deleteVehicle } = useVmts();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All statuses");
  const [assignment, setAssignment] = useState("All vehicles");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Vehicle | undefined>(undefined);
  const [pendingDelete, setPendingDelete] = useState<Vehicle | null>(null);

  const driverName = (id: number | null) =>
    id ? (drivers.find((d) => d.id === id)?.name ?? "Unassigned") : "Unassigned";

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return vehicles.filter((v) => {
      const matchesSearch =
        !q ||
        v.registrationNumber.toLowerCase().includes(q) ||
        v.model.toLowerCase().includes(q) ||
        v.manufacturer.toLowerCase().includes(q) ||
        driverName(v.driverId).toLowerCase().includes(q);
      const matchesStatus = status === "All statuses" || v.status === status;
      const matchesAssignment =
        assignment === "All vehicles" ||
        (assignment === "Assigned" ? v.driverId !== null : v.driverId === null);
      return matchesSearch && matchesStatus && matchesAssignment;
    });
  }, [vehicles, drivers, search, status, assignment]);

  const submit = (values: VehicleFormValues) => {
    const payload = {
      registrationNumber: values.registrationNumber.trim().toUpperCase(),
      manufacturer: values.manufacturer.trim(),
      model: values.model.trim(),
      year: Number(values.year),
      driverId: values.driverId ? Number(values.driverId) : null,
      status: values.status as VehicleStatus,
      remarks: values.remarks,
    };
    if (editing) updateVehicle(editing.id, payload);
    else createVehicle(payload);
    setFormOpen(false);
    setEditing(undefined);
  };

  return (
    <MainLayout pageTitle="Vehicles" requiredRole="ADMIN">
      <PageHeader
        title="Vehicles"
        description="All vehicles registered in the system."
        actions={
          <Button
            variant="primary"
            onClick={() => {
              setEditing(undefined);
              setFormOpen(true);
            }}
          >
            Add Vehicle
          </Button>
        }
      />

      <FilterBar>
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Registration, model, manufacturer or driver"
          label="Search vehicles"
        />
        <SelectFilter
          label="Status"
          value={status}
          onChange={setStatus}
          options={["All statuses", "Active", "Inactive", "Maintenance"]}
        />
        <SelectFilter
          label="Assignment"
          value={assignment}
          onChange={setAssignment}
          options={["All vehicles", "Assigned", "Unassigned"]}
        />
      </FilterBar>

      <DataTable
        columns={[
          "Registration Number",
          "Model",
          "Manufacturer",
          "Year",
          "Assigned Driver",
          "Status",
          "Last Updated",
          "Actions",
        ]}
        isEmpty={filtered.length === 0}
        empty="No vehicles found."
      >
        {filtered.map((v) => (
          <Tr key={v.id}>
            <Td>
              <Link
                to="/vehicles/$vehicleId"
                params={{ vehicleId: String(v.id) }}
                className="font-medium text-primary underline"
              >
                {v.registrationNumber}
              </Link>
            </Td>
            <Td>{v.model}</Td>
            <Td>{v.manufacturer}</Td>
            <Td className="tabular-nums">{v.year}</Td>
            <Td>{driverName(v.driverId)}</Td>
            <Td>
              <StatusBadge status={v.status} />
            </Td>
            <Td className="whitespace-nowrap">{formatDateTime(v.lastUpdated)}</Td>
            <Td>
              <div className="flex gap-1.5">
                <Button
                  size="sm"
                  onClick={() =>
                    navigate({ to: "/vehicles/$vehicleId", params: { vehicleId: String(v.id) } })
                  }
                >
                  View
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    setEditing(v);
                    setFormOpen(true);
                  }}
                >
                  Edit
                </Button>
                <Button size="sm" variant="danger" onClick={() => setPendingDelete(v)}>
                  Delete
                </Button>
              </div>
            </Td>
          </Tr>
        ))}
      </DataTable>

      <Modal
        open={formOpen}
        title={editing ? "Edit Vehicle" : "Add Vehicle"}
        onClose={() => {
          setFormOpen(false);
          setEditing(undefined);
        }}
      >
        <VehicleForm
          vehicle={editing}
          drivers={drivers}
          onCancel={() => {
            setFormOpen(false);
            setEditing(undefined);
          }}
          onSubmit={submit}
        />
      </Modal>

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Delete vehicle"
        message={`Are you sure you want to delete ${pendingDelete?.registrationNumber ?? "this vehicle"}? This action cannot be undone.`}
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => {
          if (pendingDelete) deleteVehicle(pendingDelete.id);
          setPendingDelete(null);
        }}
      />
    </MainLayout>
  );
}
