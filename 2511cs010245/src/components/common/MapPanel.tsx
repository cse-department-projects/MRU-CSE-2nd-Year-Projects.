import { useMemo } from "react";
import type { Vehicle } from "@/data/mockData";
import { Card } from "@/components/common/ui";

/**
 * Simulated map surface. Real GPS/map integration is out of MVP scope; the
 * marker position is derived deterministically from the coordinates so the
 * placeholder still reflects the selected vehicle.
 */
export function MapPanel({
  vehicle,
  latitude,
  longitude,
  updatedAt,
  place,
}: {
  vehicle: Vehicle | undefined;
  latitude: number;
  longitude: number;
  updatedAt: string;
  place?: string;
}) {
  const { left, top } = useMemo(() => {
    const l = ((longitude % 1) * 100 + 100) % 100;
    const t = ((latitude % 1) * 100 + 100) % 100;
    return { left: Math.min(88, Math.max(8, l)), top: Math.min(84, Math.max(10, t)) };
  }, [latitude, longitude]);

  return (
    <Card>
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <h2 className="text-sm font-semibold">Vehicle Location</h2>
        <span className="text-xs text-muted-foreground">Simulated map view</span>
      </div>
      <div
        role="img"
        aria-label={`Simulated map showing ${vehicle?.registrationNumber ?? "vehicle"} at latitude ${latitude}, longitude ${longitude}`}
        className="relative h-[280px] w-full overflow-hidden bg-secondary"
        style={{
          backgroundImage:
            "linear-gradient(to right, var(--border) 1px, transparent 1px), linear-gradient(to bottom, var(--border) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      >
        <div
          className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1"
          style={{ left: `${left}%`, top: `${top}%` }}
        >
          <span className="h-3 w-3 rounded-full border-2 border-surface bg-primary" />
          <span className="rounded-md border border-border bg-surface px-2 py-0.5 text-xs font-medium">
            {vehicle?.registrationNumber ?? "—"}
          </span>
        </div>
      </div>
      <dl className="grid gap-x-6 gap-y-3 border-t border-border p-4 sm:grid-cols-4">
        <div>
          <dt className="text-xs uppercase tracking-wide text-muted-foreground">Vehicle</dt>
          <dd className="mt-0.5 text-sm">{vehicle?.registrationNumber ?? "—"}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-muted-foreground">Latitude</dt>
          <dd className="mt-0.5 text-sm tabular-nums">{latitude.toFixed(4)}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-muted-foreground">Longitude</dt>
          <dd className="mt-0.5 text-sm tabular-nums">{longitude.toFixed(4)}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-muted-foreground">Last Updated</dt>
          <dd className="mt-0.5 text-sm">{updatedAt}</dd>
        </div>
        {place && (
          <div className="sm:col-span-4">
            <dt className="text-xs uppercase tracking-wide text-muted-foreground">Approximate Area</dt>
            <dd className="mt-0.5 text-sm">{place}</dd>
          </div>
        )}
      </dl>
    </Card>
  );
}
