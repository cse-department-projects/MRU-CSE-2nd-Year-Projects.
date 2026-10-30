import { useState } from "react";
import { Button, FormInput, FormSelect } from "@/components/common/ui";
import type { Driver, DriverStatus, Vehicle } from "@/data/mockData";

export interface DriverFormValues {
  name: string;
  email: string;
  phone: string;
  licenseNumber: string;
  licenseStatus: Driver["licenseStatus"];
  vehicleId: string;
  status: DriverStatus;
  password: string;
}

export function DriverForm({
  driver,
  vehicles,
  onCancel,
  onSubmit,
}: {
  driver?: Driver | undefined;
  vehicles: Vehicle[];
  onCancel: () => void;
  onSubmit: (values: DriverFormValues) => void;
}) {
  const [values, setValues] = useState<DriverFormValues>({
    name: driver?.name ?? "",
    email: driver?.email ?? "",
    phone: driver?.phone ?? "",
    licenseNumber: driver?.licenseNumber ?? "",
    licenseStatus: driver?.licenseStatus ?? "Valid",
    vehicleId: driver?.vehicleId ? String(driver.vehicleId) : "",
    status: driver?.status ?? "Active",
    password: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof DriverFormValues, string>>>({});

  const set = (key: keyof DriverFormValues, value: string) =>
    setValues((prev) => ({ ...prev, [key]: value }));

  const validate = () => {
    const next: Partial<Record<keyof DriverFormValues, string>> = {};
    if (!values.name.trim()) next.name = "Name is required.";
    if (!values.email.trim()) next.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim()))
      next.email = "Enter a valid email address.";
    if (!values.phone.trim()) next.phone = "Phone number is required.";
    if (!values.licenseNumber.trim()) next.licenseNumber = "License number is required.";
    if (!values.status) next.status = "Status is required.";
    if (!driver && !values.password) next.password = "Password is required for a new driver.";
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
          label="Name"
          required
          value={values.name}
          onChange={(e) => set("name", e.target.value)}
          {...(errors.name ? { error: errors.name } : {})}
        />
        <FormInput
          label="Email"
          type="email"
          required
          value={values.email}
          onChange={(e) => set("email", e.target.value)}
          {...(errors.email ? { error: errors.email } : {})}
        />
        <FormInput
          label="Phone"
          required
          value={values.phone}
          onChange={(e) => set("phone", e.target.value)}
          placeholder="+91 98490 11223"
          {...(errors.phone ? { error: errors.phone } : {})}
        />
        <FormInput
          label="License Number"
          required
          value={values.licenseNumber}
          onChange={(e) => set("licenseNumber", e.target.value.toUpperCase())}
          {...(errors.licenseNumber ? { error: errors.licenseNumber } : {})}
        />
        <FormSelect
          label="License Status"
          value={values.licenseStatus}
          onChange={(e) => set("licenseStatus", e.target.value)}
        >
          <option value="Valid">Valid</option>
          <option value="Expiring Soon">Expiring Soon</option>
          <option value="Expired">Expired</option>
        </FormSelect>
        <FormSelect
          label="Assigned Vehicle"
          value={values.vehicleId}
          onChange={(e) => set("vehicleId", e.target.value)}
        >
          <option value="">Unassigned</option>
          {vehicles.map((v) => (
            <option key={v.id} value={v.id}>
              {v.registrationNumber} — {v.model}
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
          <option value="Suspended">Suspended</option>
        </FormSelect>
        {!driver && (
          <FormInput
            label="Password"
            type="password"
            required
            value={values.password}
            onChange={(e) => set("password", e.target.value)}
            hint="Mock value only. Real credential handling comes with the backend."
            {...(errors.password ? { error: errors.password } : {})}
          />
        )}
      </div>

      <div className="flex justify-end gap-2 border-t border-border pt-4">
        <Button type="button" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="primary">
          {driver ? "Save Changes" : "Create Driver"}
        </Button>
      </div>
    </form>
  );
}
