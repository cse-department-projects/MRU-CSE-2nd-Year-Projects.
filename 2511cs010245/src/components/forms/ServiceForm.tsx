import { useState } from "react";
import { Button, FormInput, FormSelect, FormTextarea } from "@/components/common/ui";
import type { ServiceRecord, ServiceStatus, Vehicle } from "@/data/mockData";

export interface ServiceFormValues {
  vehicleId: string;
  serviceType: string;
  serviceDate: string;
  nextServiceDate: string;
  description: string;
  status: ServiceStatus;
}

export function ServiceForm({
  service,
  vehicles,
  onCancel,
  onSubmit,
}: {
  service?: ServiceRecord | undefined;
  vehicles: Vehicle[];
  onCancel: () => void;
  onSubmit: (values: ServiceFormValues) => void;
}) {
  const [values, setValues] = useState<ServiceFormValues>({
    vehicleId: service ? String(service.vehicleId) : "",
    serviceType: service?.serviceType ?? "",
    serviceDate: service?.serviceDate ?? "",
    nextServiceDate: service?.nextServiceDate ?? "",
    description: service?.description ?? "",
    status: service?.status ?? "Scheduled",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof ServiceFormValues, string>>>({});

  const set = (key: keyof ServiceFormValues, value: string) =>
    setValues((prev) => ({ ...prev, [key]: value }));

  const validate = () => {
    const next: Partial<Record<keyof ServiceFormValues, string>> = {};
    if (!values.vehicleId) next.vehicleId = "Vehicle is required.";
    if (!values.serviceType.trim()) next.serviceType = "Service type is required.";
    if (!values.serviceDate) next.serviceDate = "Service date is required.";
    if (!values.nextServiceDate) next.nextServiceDate = "Next service date is required.";
    else if (values.serviceDate && values.nextServiceDate < values.serviceDate)
      next.nextServiceDate = "Next service date must be after the service date.";
    if (!values.status) next.status = "Status is required.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        if (validate()) onSubmit(values);
      }}
      className="flex flex-col gap-4"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <FormSelect
          label="Vehicle"
          required
          value={values.vehicleId}
          onChange={(e) => set("vehicleId", e.target.value)}
          {...(errors.vehicleId ? { error: errors.vehicleId } : {})}
        >
          <option value="">Select a vehicle</option>
          {vehicles.map((v) => (
            <option key={v.id} value={v.id}>
              {v.registrationNumber} — {v.model}
            </option>
          ))}
        </FormSelect>
        <FormInput
          label="Service Type"
          required
          value={values.serviceType}
          onChange={(e) => set("serviceType", e.target.value)}
          placeholder="Oil Change"
          {...(errors.serviceType ? { error: errors.serviceType } : {})}
        />
        <FormInput
          label="Service Date"
          type="date"
          required
          value={values.serviceDate}
          onChange={(e) => set("serviceDate", e.target.value)}
          {...(errors.serviceDate ? { error: errors.serviceDate } : {})}
        />
        <FormInput
          label="Next Service Date"
          type="date"
          required
          value={values.nextServiceDate}
          onChange={(e) => set("nextServiceDate", e.target.value)}
          {...(errors.nextServiceDate ? { error: errors.nextServiceDate } : {})}
        />
        <FormSelect
          label="Status"
          required
          value={values.status}
          onChange={(e) => set("status", e.target.value)}
          {...(errors.status ? { error: errors.status } : {})}
        >
          <option value="Scheduled">Scheduled</option>
          <option value="Due Soon">Due Soon</option>
          <option value="Overdue">Overdue</option>
          <option value="Completed">Completed</option>
        </FormSelect>
      </div>
      <FormTextarea
        label="Description"
        value={values.description}
        onChange={(e) => set("description", e.target.value)}
      />

      <div className="flex justify-end gap-2 border-t border-border pt-4">
        <Button type="button" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="primary">
          {service ? "Save Changes" : "Create Service"}
        </Button>
      </div>
    </form>
  );
}
