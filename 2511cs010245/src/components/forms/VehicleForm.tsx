import { useState } from "react";
import { Button, FormInput, FormSelect } from "@/components/common/ui";
import type { Driver, Vehicle, VehicleStatus } from "@/data/mockData";

export interface VehicleFormValues {
  registrationNumber: string;
  manufacturer: string;
  model: string;
  year: string;
  driverId: string;
  status: VehicleStatus;
  remarks: string;
}

export function VehicleForm({
  vehicle,
  drivers,
  onCancel,
  onSubmit,
}: {
  vehicle?: Vehicle | undefined;
  drivers: Driver[];
  onCancel: () => void;
  onSubmit: (values: VehicleFormValues) => void;
}) {
  const [values, setValues] = useState<VehicleFormValues>({
    registrationNumber: vehicle?.registrationNumber ?? "",
    manufacturer: vehicle?.manufacturer ?? "",
    model: vehicle?.model ?? "",
    year: vehicle ? String(vehicle.year) : "",
    driverId: vehicle?.driverId ? String(vehicle.driverId) : "",
    status: vehicle?.status ?? "Active",
    remarks: vehicle?.remarks ?? "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof VehicleFormValues, string>>>({});

  const set = (key: keyof VehicleFormValues, value: string) =>
    setValues((prev) => ({ ...prev, [key]: value }));

  const validate = () => {
    const next: Partial<Record<keyof VehicleFormValues, string>> = {};
    if (!values.registrationNumber.trim())
      next.registrationNumber = "Registration number is required.";
    else if (!/^[A-Z]{2}[0-9]{2}[A-Z]{1,2}[0-9]{4}$/.test(values.registrationNumber.trim().toUpperCase()))
      next.registrationNumber = "Use a valid format, for example TS09AB1234.";
    if (!values.manufacturer.trim()) next.manufacturer = "Manufacturer is required.";
    if (!values.model.trim()) next.model = "Model is required.";
    const year = Number(values.year);
    if (!values.year.trim()) next.year = "Year is required.";
    else if (!Number.isInteger(year) || year < 1990 || year > 2026)
      next.year = "Enter a valid year between 1990 and 2026.";
    if (values.driverId && !drivers.some((d) => String(d.id) === values.driverId))
      next.driverId = "Select a valid driver.";
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
        <FormInput
          label="Registration Number"
          required
          value={values.registrationNumber}
          onChange={(e) => set("registrationNumber", e.target.value.toUpperCase())}
          placeholder="TS09AB1234"
          {...(errors.registrationNumber ? { error: errors.registrationNumber } : {})}
        />
        <FormInput
          label="Manufacturer"
          required
          value={values.manufacturer}
          onChange={(e) => set("manufacturer", e.target.value)}
          {...(errors.manufacturer ? { error: errors.manufacturer } : {})}
        />
        <FormInput
          label="Model"
          required
          value={values.model}
          onChange={(e) => set("model", e.target.value)}
          {...(errors.model ? { error: errors.model } : {})}
        />
        <FormInput
          label="Year"
          required
          inputMode="numeric"
          value={values.year}
          onChange={(e) => set("year", e.target.value)}
          placeholder="2022"
          {...(errors.year ? { error: errors.year } : {})}
        />
        <FormSelect
          label="Assigned Driver"
          value={values.driverId}
          onChange={(e) => set("driverId", e.target.value)}
          {...(errors.driverId ? { error: errors.driverId } : {})}
        >
          <option value="">Unassigned</option>
          {drivers.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </FormSelect>
        <FormSelect
          label="Status"
          required
          value={values.status}
          onChange={(e) => set("status", e.target.value)}
          {...(errors.status ? { error: errors.status } : {})}
        >
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
          <option value="Maintenance">Maintenance</option>
        </FormSelect>
      </div>

      <div className="flex justify-end gap-2 border-t border-border pt-4">
        <Button type="button" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="primary">
          {vehicle ? "Save Changes" : "Create Vehicle"}
        </Button>
      </div>
    </form>
  );
}
