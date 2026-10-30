import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  ApiError,
  auditApi,
  authApi,
  driverPortalApi,
  driversApi,
  getToken,
  locationsApi,
  servicesApi,
  setToken,
  vehiclesApi,
  type ApiUser,
} from "@/api/client";
import type {
  AuditLog,
  Driver,
  ServiceRecord,
  Vehicle,
  VehicleLocation,
} from "@/data/mockData";

export interface SessionUser {
  id: number;
  name: string;
  email: string;
  role: "ADMIN" | "DRIVER";
  driverId?: number | undefined;
}

interface Toast {
  id: number;
  message: string;
  tone: "success" | "error";
}

interface VmtsContextValue {
  user: SessionUser | null;
  /** False until the stored session has been checked against the API. */
  authReady: boolean;
  login: (
    email: string,
    password: string,
  ) => Promise<{ ok: boolean; error?: string; role?: "ADMIN" | "DRIVER" }>;
  logout: () => void;

  /** True while the signed-in user's data is being loaded from the API. */
  loading: boolean;
  /** Set when the backend is unreachable or returned an error. */
  dataError: string | null;
  refresh: () => Promise<void>;

  vehicles: Vehicle[];
  drivers: Driver[];
  services: ServiceRecord[];
  locations: VehicleLocation[];
  auditLogs: AuditLog[];

  createVehicle: (input: Omit<Vehicle, "id" | "lastUpdated" | "lastStartAt">) => Promise<void>;
  updateVehicle: (id: number, input: Partial<Vehicle>) => Promise<void>;
  deleteVehicle: (id: number) => Promise<void>;

  createDriver: (input: Omit<Driver, "id" | "createdAt" | "lastActivity">) => Promise<void>;
  updateDriver: (id: number, input: Partial<Driver>) => Promise<void>;
  deleteDriver: (id: number) => Promise<void>;

  createService: (input: Omit<ServiceRecord, "id" | "createdAt" | "updatedAt">) => Promise<void>;
  updateService: (id: number, input: Partial<ServiceRecord>) => Promise<void>;
  deleteService: (id: number) => Promise<void>;

  startVehicle: (vehicleId: number, timestamp: string, remarks: string) => Promise<void>;
  driverUpdateVehicle: (
    vehicleId: number,
    input: { status: Vehicle["status"]; remarks: string },
  ) => Promise<void>;

  toasts: Toast[];
  notify: (message: string, tone?: Toast["tone"]) => void;
  dismissToast: (id: number) => void;
}

const VmtsContext = createContext<VmtsContextValue | null>(null);

const toSession = (u: ApiUser): SessionUser => ({
  id: u.id,
  name: u.name,
  email: u.email,
  role: u.role,
  driverId: u.driverId ?? undefined,
});

const messageOf = (err: unknown) =>
  err instanceof ApiError ? err.message : "Something went wrong. Please try again.";

export function VmtsProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dataError, setDataError] = useState<string | null>(null);

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [services, setServices] = useState<ServiceRecord[]>([]);
  const [locations, setLocations] = useState<VehicleLocation[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const notify = useCallback((message: string, tone: Toast["tone"] = "success") => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, tone }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }, []);

  const dismissToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  /** Loads everything the signed-in role is allowed to see. */
  const load = useCallback(async (session: SessionUser) => {
    setLoading(true);
    setDataError(null);
    try {
      if (session.role === "ADMIN") {
        const [v, d, s, l, a] = await Promise.all([
          vehiclesApi.list(),
          driversApi.list(),
          servicesApi.list(),
          locationsApi.list(),
          auditApi.list(),
        ]);
        setVehicles(v);
        setDrivers(d);
        setServices(s);
        setLocations(l);
        setAuditLogs(a);
      } else {
        // Drivers may only read their own vehicle and its service history.
        const [vehicle, s, l] = await Promise.all([
          driverPortalApi.vehicle().catch(() => null),
          driverPortalApi.services().catch(() => [] as ServiceRecord[]),
          locationsApi.list().catch(() => [] as VehicleLocation[]),
        ]);
        setVehicles(vehicle ? [vehicle] : []);
        setDrivers([
          {
            id: session.driverId ?? 0,
            name: session.name,
            email: session.email,
            phone: "",
            licenseNumber: "",
            licenseStatus: "Valid",
            vehicleId: vehicle ? vehicle.id : null,
            status: "Active",
            createdAt: "",
            lastActivity: "",
          },
        ]);
        setServices(s);
        setLocations(l);
        setAuditLogs([]);
      }
    } catch (err) {
      setDataError(messageOf(err));
    } finally {
      setLoading(false);
    }
  }, []);

  // Restore the session from the stored token after mount.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!getToken()) {
        setAuthReady(true);
        return;
      }
      try {
        const me = await authApi.me();
        if (cancelled) return;
        const session = toSession(me);
        setUser(session);
        await load(session);
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) setToken(null);
        else if (!cancelled) setDataError(messageOf(err));
      } finally {
        if (!cancelled) setAuthReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [load]);

  const login: VmtsContextValue["login"] = useCallback(
    async (email, password) => {
      try {
        const { token, user: apiUser } = await authApi.login(email, password);
        setToken(token);
        const session = toSession(apiUser);
        setUser(session);
        await load(session);
        return { ok: true, role: session.role };
      } catch (err) {
        setToken(null);
        if (err instanceof ApiError && err.status === 401) {
          return { ok: false, error: "Invalid email or password" };
        }
        return { ok: false, error: messageOf(err) };
      }
    },
    [load],
  );

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    setVehicles([]);
    setDrivers([]);
    setServices([]);
    setLocations([]);
    setAuditLogs([]);
    setDataError(null);
  }, []);

  const refresh = useCallback(async () => {
    if (user) await load(user);
  }, [user, load]);

  /** Runs an API mutation, then reloads and shows a toast. */
  const mutate = useCallback(
    async (action: () => Promise<unknown>, successMessage: string) => {
      try {
        await action();
        notify(successMessage);
        if (user) await load(user);
      } catch (err) {
        notify(messageOf(err), "error");
      }
    },
    [notify, user, load],
  );

  const value = useMemo<VmtsContextValue>(
    () => ({
      user,
      authReady,
      loading,
      dataError,
      refresh,
      login,
      logout,
      vehicles,
      drivers,
      services,
      locations,
      auditLogs,
      toasts,
      notify,
      dismissToast,

      createVehicle: (input) =>
        mutate(() => vehiclesApi.create(input), "Vehicle created successfully."),
      updateVehicle: (id, input) => {
        const current = vehicles.find((v) => v.id === id);
        if (!current) return Promise.resolve();
        const merged = { ...current, ...input };
        return mutate(
          () =>
            vehiclesApi.update(id, {
              registrationNumber: merged.registrationNumber,
              manufacturer: merged.manufacturer,
              model: merged.model,
              year: merged.year,
              driverId: merged.driverId,
              status: merged.status,
              remarks: merged.remarks,
            }),
          "Vehicle details updated successfully.",
        );
      },
      deleteVehicle: (id) =>
        mutate(() => vehiclesApi.remove(id), "Vehicle deleted successfully."),

      createDriver: (input) =>
        mutate(() => driversApi.create(input), "Driver created successfully."),
      updateDriver: (id, input) => {
        const current = drivers.find((d) => d.id === id);
        if (!current) return Promise.resolve();
        const merged = { ...current, ...input };
        return mutate(
          () =>
            driversApi.update(id, {
              name: merged.name,
              email: merged.email,
              phone: merged.phone,
              licenseNumber: merged.licenseNumber,
              licenseStatus: merged.licenseStatus,
              vehicleId: merged.vehicleId,
              status: merged.status,
            }),
          "Driver details updated successfully.",
        );
      },
      deleteDriver: (id) =>
        mutate(() => driversApi.remove(id), "Driver deleted successfully."),

      createService: (input) =>
        mutate(() => servicesApi.create(input), "Service record created successfully."),
      updateService: (id, input) => {
        const current = services.find((s) => s.id === id);
        if (!current) return Promise.resolve();
        const merged = { ...current, ...input };
        return mutate(
          () =>
            servicesApi.update(id, {
              vehicleId: merged.vehicleId,
              serviceType: merged.serviceType,
              serviceDate: merged.serviceDate,
              nextServiceDate: merged.nextServiceDate,
              description: merged.description,
              status: merged.status,
            }),
          "Service record updated successfully.",
        );
      },
      deleteService: (id) =>
        mutate(() => servicesApi.remove(id), "Service record deleted successfully."),

      startVehicle: (_vehicleId, timestamp, remarks) =>
        mutate(() => driverPortalApi.start(timestamp, remarks), "Vehicle started successfully."),
      driverUpdateVehicle: (_vehicleId, input) =>
        mutate(
          () => driverPortalApi.updateStatus(input.status, input.remarks),
          "Vehicle details updated successfully.",
        ),
    }),
    [
      user,
      authReady,
      loading,
      dataError,
      refresh,
      login,
      logout,
      vehicles,
      drivers,
      services,
      locations,
      auditLogs,
      toasts,
      notify,
      dismissToast,
      mutate,
    ],
  );

  return <VmtsContext.Provider value={value}>{children}</VmtsContext.Provider>;
}

export function useVmts() {
  const ctx = useContext(VmtsContext);
  if (!ctx) throw new Error("useVmts must be used within VmtsProvider");
  return ctx;
}
