// Thin REST client for the VMTS Spring Boot backend.
// Base URL comes from VITE_API_BASE_URL (see .env.example); defaults to the
// local Spring Boot server on port 8080.

import type {
  AuditLog,
  Driver,
  ServiceRecord,
  Vehicle,
  VehicleLocation,
} from "@/data/mockData";

export const API_BASE_URL: string =
  (import.meta.env["VITE_API_BASE_URL"] as string | undefined) ?? "http://localhost:8081";

const TOKEN_KEY = "vmts.token";

export function getToken(): string | null {
  try {
    return window.localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token: string | null) {
  try {
    if (token) window.localStorage.setItem(TOKEN_KEY, token);
    else window.localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* storage unavailable */
  }
}

export class ApiError extends Error {
  status: number;
  fieldErrors: Record<string, string>;

  constructor(status: number, message: string, fieldErrors: Record<string, string> = {}) {
    super(message);
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

async function request<T>(
  path: string,
  options: { method?: string; body?: unknown } = {},
): Promise<T> {
  const headers: Record<string, string> = { Accept: "application/json" };
  if (options.body !== undefined) headers["Content-Type"] = "application/json";
  const token = getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method: options.method ?? "GET",
      headers,
      ...(options.body !== undefined ? { body: JSON.stringify(options.body) } : {}),
    });
  } catch {
    throw new ApiError(
      0,
      "Cannot reach the VMTS server. Start the Spring Boot backend and try again.",
    );
  }

  if (response.status === 204) return undefined as T;

  const text = await response.text();
  const data = text ? (JSON.parse(text) as unknown) : null;

  if (!response.ok) {
    const payload = (data ?? {}) as { message?: string; fieldErrors?: Record<string, string> };
    throw new ApiError(
      response.status,
      payload.message ?? "Request failed. Please try again.",
      payload.fieldErrors ?? {},
    );
  }
  return data as T;
}

/* ---------------------------------------------------------------- auth --- */

export interface ApiUser {
  id: number;
  name: string;
  email: string;
  role: "ADMIN" | "DRIVER";
  driverId: number | null;
}

export const authApi = {
  login: (email: string, password: string) =>
    request<{ token: string; user: ApiUser }>("/api/auth/login", {
      method: "POST",
      body: { email: email.trim(), password },
    }),
  me: () => request<ApiUser>("/api/auth/me"),
};

/* ------------------------------------------------------------ resources --- */

export type VehicleInput = Omit<Vehicle, "id" | "lastUpdated" | "lastStartAt">;
export type DriverInput = Omit<Driver, "id" | "createdAt" | "lastActivity">;
export type ServiceInput = Omit<ServiceRecord, "id" | "createdAt" | "updatedAt">;

export const vehiclesApi = {
  list: () => request<Vehicle[]>("/api/vehicles"),
  create: (input: VehicleInput) => request<Vehicle>("/api/vehicles", { method: "POST", body: input }),
  update: (id: number, input: VehicleInput) =>
    request<Vehicle>(`/api/vehicles/${id}`, { method: "PUT", body: input }),
  remove: (id: number) => request<void>(`/api/vehicles/${id}`, { method: "DELETE" }),
};

export const driversApi = {
  list: () => request<Driver[]>("/api/drivers"),
  create: (input: DriverInput) => request<Driver>("/api/drivers", { method: "POST", body: input }),
  update: (id: number, input: DriverInput) =>
    request<Driver>(`/api/drivers/${id}`, { method: "PUT", body: input }),
  remove: (id: number) => request<void>(`/api/drivers/${id}`, { method: "DELETE" }),
};

export const servicesApi = {
  list: () => request<ServiceRecord[]>("/api/services"),
  create: (input: ServiceInput) => request<ServiceRecord>("/api/services", { method: "POST", body: input }),
  update: (id: number, input: ServiceInput) =>
    request<ServiceRecord>(`/api/services/${id}`, { method: "PUT", body: input }),
  remove: (id: number) => request<void>(`/api/services/${id}`, { method: "DELETE" }),
};

export const locationsApi = {
  list: () => request<VehicleLocation[]>("/api/locations"),
};

export const auditApi = {
  list: () => request<AuditLog[]>("/api/audit-logs"),
};

export const driverPortalApi = {
  vehicle: () => request<Vehicle>("/api/driver/vehicle"),
  services: () => request<ServiceRecord[]>("/api/driver/services"),
  updateStatus: (status: Vehicle["status"], remarks: string) =>
    request<Vehicle>("/api/driver/vehicle/status", { method: "PUT", body: { status, remarks } }),
  start: (startTime: string, remarks: string) =>
    request<Vehicle>("/api/driver/vehicle/start", {
      method: "POST",
      body: { startTime, remarks },
    }),
};
