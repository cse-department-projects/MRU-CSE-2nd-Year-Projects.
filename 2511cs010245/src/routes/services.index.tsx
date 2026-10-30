import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { useVmts } from "@/lib/vmts-store";
import {
  AlertCard,
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
import { ServiceForm, type ServiceFormValues } from "@/components/forms/ServiceForm";
import { formatDate } from "@/lib/format";
import type { ServiceRecord, ServiceStatus } from "@/data/mockData";

export const Route = createFileRoute("/services/")({
  head: () => ({
    meta: [
      { title: "Services — VMTS" },
      {
        name: "description",
        content: "Maintenance and service records with due-date tracking for every vehicle.",
      },
      { property: "og:title", content: "Services — VMTS" },
      {
        property: "og:description",
        content: "Maintenance and service records with due-date tracking for every vehicle.",
      },
    ],
  }),
  component: ServicesPage,
});

function ServicesPage() {
  const { services, vehicles, createService, updateService, deleteService } = useVmts();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [vehicleFilter, setVehicleFilter] = useState("All vehicles");
  const [statusFilter, setStatusFilter] = useState("All statuses");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<ServiceRecord | undefined>(undefined);
  const [pendingDelete, setPendingDelete] = useState<ServiceRecord | null>(null);

  const reg = (id: number) => vehicles.find((v) => v.id === id)?.registrationNumber ?? "—";

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return services.filter((s) => {
      const matchesSearch =
        !q ||
        s.serviceType.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        reg(s.vehicleId).toLowerCase().includes(q);
      const matchesVehicle = vehicleFilter === "All vehicles" || reg(s.vehicleId) === vehicleFilter;
      const matchesStatus = statusFilter === "All statuses" || s.status === statusFilter;
      return matchesSearch && matchesVehicle && matchesStatus;
    });
  }, [services, vehicles, search, vehicleFilter, statusFilter]);

  const overdueCount = services.filter((s) => s.status === "Overdue").length;

  const submit = (values: ServiceFormValues) => {
    const payload = {
      vehicleId: Number(values.vehicleId),
      serviceType: values.serviceType.trim(),
      serviceDate: values.serviceDate,
      nextServiceDate: values.nextServiceDate,
      description: values.description.trim(),
      status: values.status as ServiceStatus,
    };
    if (editing) updateService(editing.id, payload);
    else createService(payload);
    setFormOpen(false);
    setEditing(undefined);
  };

  return (
    <MainLayout pageTitle="Services" requiredRole="ADMIN">
      <PageHeader
        title="Services"
        description="Maintenance records and upcoming service schedule."
        actions={
          <Button
            variant="primary"
            onClick={() => {
              setEditing(undefined);
              setFormOpen(true);
            }}
          >
            Add Service
          </Button>
        }
      />

      {overdueCount > 0 && (
        <div className="mb-4">
          <AlertCard tone="danger">
            {overdueCount} service {overdueCount === 1 ? "record is" : "records are"} overdue and
            need immediate attention.
          </AlertCard>
        </div>
      )}

      <FilterBar>
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Service type, description or vehicle"
          label="Search services"
        />
        <SelectFilter
          label="Vehicle"
          value={vehicleFilter}
          onChange={setVehicleFilter}
          options={["All vehicles", ...vehicles.map((v) => v.registrationNumber)]}
        />
        <SelectFilter
          label="Status"
          value={statusFilter}
          onChange={setStatusFilter}
          options={["All statuses", "Scheduled", "Due Soon", "Overdue", "Completed"]}
        />
      </FilterBar>

      <DataTable
        columns={[
          "Vehicle",
          "Service Type",
          "Service Date",
          "Next Service Date",
          "Description",
          "Status",
          "Actions",
        ]}
        isEmpty={filtered.length === 0}
        empty="No service records found."
      >
        {filtered.map((s) => (
          <Tr key={s.id}>
            <Td className="font-medium">{reg(s.vehicleId)}</Td>
            <Td>
              <Link
                to="/services/$serviceId"
                params={{ serviceId: String(s.id) }}
                className="text-primary underline"
              >
                {s.serviceType}
              </Link>
            </Td>
            <Td className="whitespace-nowrap">{formatDate(s.serviceDate)}</Td>
            <Td className="whitespace-nowrap">{formatDate(s.nextServiceDate)}</Td>
            <Td className="max-w-[260px] text-muted-foreground">{s.description || "—"}</Td>
            <Td>
              <StatusBadge status={s.status} />
            </Td>
            <Td>
              <div className="flex gap-1.5">
                <Button
                  size="sm"
                  onClick={() =>
                    navigate({ to: "/services/$serviceId", params: { serviceId: String(s.id) } })
                  }
                >
                  View
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    setEditing(s);
                    setFormOpen(true);
                  }}
                >
                  Edit
                </Button>
                <Button size="sm" variant="danger" onClick={() => setPendingDelete(s)}>
                  Delete
                </Button>
              </div>
            </Td>
          </Tr>
        ))}
      </DataTable>

      <Modal
        open={formOpen}
        title={editing ? "Edit Service Record" : "Add Service Record"}
        onClose={() => {
          setFormOpen(false);
          setEditing(undefined);
        }}
      >
        <ServiceForm
          service={editing}
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
        title="Delete service record"
        message="Are you sure you want to delete this service record? This action cannot be undone."
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => {
          if (pendingDelete) deleteService(pendingDelete.id);
          setPendingDelete(null);
        }}
      />
    </MainLayout>
  );
}
