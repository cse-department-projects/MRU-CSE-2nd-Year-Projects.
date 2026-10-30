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
import { DriverForm, type DriverFormValues } from "@/components/forms/DriverForm";
import { formatDate } from "@/lib/format";
import type { Driver, DriverStatus } from "@/data/mockData";

export const Route = createFileRoute("/drivers/")({
  head: () => ({
    meta: [
      { title: "Drivers — VMTS" },
      {
        name: "description",
        content: "Manage driver records, licenses, vehicle assignment and account status.",
      },
      { property: "og:title", content: "Drivers — VMTS" },
      {
        property: "og:description",
        content: "Manage driver records, licenses, vehicle assignment and account status.",
      },
    ],
  }),
  component: DriversPage,
});

function DriversPage() {
  const { drivers, vehicles, createDriver, updateDriver, deleteDriver } = useVmts();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All statuses");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Driver | undefined>(undefined);
  const [pendingDelete, setPendingDelete] = useState<Driver | null>(null);

  const vehicleReg = (id: number | null) =>
    id ? (vehicles.find((v) => v.id === id)?.registrationNumber ?? "Unassigned") : "Unassigned";

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return drivers.filter((d) => {
      const matchesSearch =
        !q ||
        d.name.toLowerCase().includes(q) ||
        d.email.toLowerCase().includes(q) ||
        d.phone.toLowerCase().includes(q) ||
        d.licenseNumber.toLowerCase().includes(q);
      const matchesStatus = status === "All statuses" || d.status === status;
      return matchesSearch && matchesStatus;
    });
  }, [drivers, search, status]);

  const submit = (values: DriverFormValues) => {
    const payload = {
      name: values.name.trim(),
      email: values.email.trim(),
      phone: values.phone.trim(),
      licenseNumber: values.licenseNumber.trim(),
      licenseStatus: values.licenseStatus,
      vehicleId: values.vehicleId ? Number(values.vehicleId) : null,
      status: values.status as DriverStatus,
    };
    if (editing) updateDriver(editing.id, payload);
    else createDriver(payload);
    setFormOpen(false);
    setEditing(undefined);
  };

  return (
    <MainLayout pageTitle="Drivers" requiredRole="ADMIN">
      <PageHeader
        title="Drivers"
        description="Driver records and vehicle assignments."
        actions={
          <Button
            variant="primary"
            onClick={() => {
              setEditing(undefined);
              setFormOpen(true);
            }}
          >
            Add Driver
          </Button>
        }
      />

      <FilterBar>
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Name, email, phone or license number"
          label="Search drivers"
        />
        <SelectFilter
          label="Status"
          value={status}
          onChange={setStatus}
          options={["All statuses", "Active", "Inactive", "Suspended"]}
        />
      </FilterBar>

      <DataTable
        columns={[
          "Driver Name",
          "License Number",
          "Phone",
          "Email",
          "Assigned Vehicle",
          "Status",
          "Created Date",
          "Actions",
        ]}
        isEmpty={filtered.length === 0}
        empty="No drivers found."
      >
        {filtered.map((d) => (
          <Tr key={d.id}>
            <Td>
              <Link
                to="/drivers/$driverId"
                params={{ driverId: String(d.id) }}
                className="font-medium text-primary underline"
              >
                {d.name}
              </Link>
            </Td>
            <Td>{d.licenseNumber}</Td>
            <Td className="whitespace-nowrap">{d.phone}</Td>
            <Td>{d.email}</Td>
            <Td>{vehicleReg(d.vehicleId)}</Td>
            <Td>
              <StatusBadge status={d.status} />
            </Td>
            <Td className="whitespace-nowrap">{formatDate(d.createdAt)}</Td>
            <Td>
              <div className="flex gap-1.5">
                <Button
                  size="sm"
                  onClick={() =>
                    navigate({ to: "/drivers/$driverId", params: { driverId: String(d.id) } })
                  }
                >
                  View
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    setEditing(d);
                    setFormOpen(true);
                  }}
                >
                  Edit
                </Button>
                <Button size="sm" variant="danger" onClick={() => setPendingDelete(d)}>
                  Delete
                </Button>
              </div>
            </Td>
          </Tr>
        ))}
      </DataTable>

      <Modal
        open={formOpen}
        title={editing ? "Edit Driver" : "Add Driver"}
        onClose={() => {
          setFormOpen(false);
          setEditing(undefined);
        }}
      >
        <DriverForm
          driver={editing}
          vehicles={vehicles}
          onCancel={() => {
            setFormOpen(false);
            setEditing(undefined);
          }}
          onSubmit={submit}
        />
      </Modal>

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Delete driver"
        message={`Are you sure you want to delete ${pendingDelete?.name ?? "this driver"}? This action cannot be undone.`}
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => {
          if (pendingDelete) deleteDriver(pendingDelete.id);
          setPendingDelete(null);
        }}
      />
    </MainLayout>
  );
}
