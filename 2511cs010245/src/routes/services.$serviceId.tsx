import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { useVmts } from "@/lib/vmts-store";
import {
  Button,
  DetailList,
  ErrorState,
  Modal,
  PageHeader,
  SectionCard,
  StatusBadge,
} from "@/components/common/ui";
import { ServiceForm, type ServiceFormValues } from "@/components/forms/ServiceForm";
import { formatDate } from "@/lib/format";
import type { ServiceStatus } from "@/data/mockData";

export const Route = createFileRoute("/services/$serviceId")({
  head: () => ({
    meta: [
      { title: "Service Details — VMTS" },
      {
        name: "description",
        content: "Details of a single maintenance record, including schedule and status.",
      },
      { property: "og:title", content: "Service Details — VMTS" },
      {
        property: "og:description",
        content: "Details of a single maintenance record, including schedule and status.",
      },
    ],
  }),
  component: ServiceDetailsPage,
});

function ServiceDetailsPage() {
  const { serviceId } = Route.useParams();
  const { services, vehicles, updateService } = useVmts();
  const [editOpen, setEditOpen] = useState(false);
  const service = services.find((s) => String(s.id) === serviceId);

  if (!service) {
    return (
      <MainLayout pageTitle="Service Details" requiredRole="ADMIN">
        <PageHeader title="Service Details" />
        <ErrorState message="Unable to load service information. The record may have been deleted." />
        <p className="mt-3 text-sm">
          <Link to="/services" className="text-primary underline">
            Back to services
          </Link>
        </p>
      </MainLayout>
    );
  }

  const vehicle = vehicles.find((v) => v.id === service.vehicleId);

  const submit = (values: ServiceFormValues) => {
    updateService(service.id, {
      vehicleId: Number(values.vehicleId),
      serviceType: values.serviceType.trim(),
      serviceDate: values.serviceDate,
      nextServiceDate: values.nextServiceDate,
      description: values.description.trim(),
      status: values.status as ServiceStatus,
    });
    setEditOpen(false);
  };

  return (
    <MainLayout pageTitle="Service Details" requiredRole="ADMIN">
      <p className="mb-2 text-[13px]">
        <Link to="/services" className="text-primary underline">
          ← Back to services
        </Link>
      </p>
      <PageHeader
        title={service.serviceType}
        description={vehicle ? `${vehicle.registrationNumber} · ${vehicle.model}` : "Vehicle removed"}
        actions={
          <Button variant="primary" onClick={() => setEditOpen(true)}>
            Edit Service
          </Button>
        }
      />

      <SectionCard title="Service Record">
        <DetailList
          items={[
            {
              label: "Vehicle",
              value: vehicle ? (
                <Link
                  to="/vehicles/$vehicleId"
                  params={{ vehicleId: String(vehicle.id) }}
                  className="text-primary underline"
                >
                  {vehicle.registrationNumber}
                </Link>
              ) : (
                "—"
              ),
            },
            { label: "Service Type", value: service.serviceType },
            { label: "Service Date", value: formatDate(service.serviceDate) },
            { label: "Next Service Date", value: formatDate(service.nextServiceDate) },
            { label: "Status", value: <StatusBadge status={service.status} /> },
            { label: "Created Date", value: formatDate(service.createdAt) },
            { label: "Last Updated", value: formatDate(service.updatedAt) },
            { label: "Description", value: service.description || "—" },
          ]}
        />
      </SectionCard>

      <Modal open={editOpen} title="Edit Service Record" onClose={() => setEditOpen(false)}>
        <ServiceForm
          service={service}
          vehicles={vehicles}
          onCancel={() => setEditOpen(false)}
          onSubmit={submit}
        />
      </Modal>
    </MainLayout>
  );
}
