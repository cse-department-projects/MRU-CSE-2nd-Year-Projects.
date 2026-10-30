import { createFileRoute, Link } from "@tanstack/react-router";
import { MainLayout } from "@/components/layout/MainLayout";
import { useVmts } from "@/lib/vmts-store";
import { dashboardTotals } from "@/data/mockData";
import {
  Card,
  DataTable,
  PageHeader,
  StatusBadge,
  SummaryCard,
  Td,
  Tr,
} from "@/components/common/ui";
import { formatDate } from "@/lib/format";

export const Route = createFileRoute("/admin/dashboard")({
  head: () => ({
    meta: [
      { title: "Admin Dashboard — VMTS" },
      {
        name: "description",
        content: "Fleet overview with service due alerts and recent system activity.",
      },
      { property: "og:title", content: "Admin Dashboard — VMTS" },
      {
        property: "og:description",
        content: "Fleet overview with service due alerts and recent system activity.",
      },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const { vehicles, drivers, services, auditLogs } = useVmts();

  const dueSoon = services.filter((s) => s.status === "Due Soon");
  const overdue = services.filter((s) => s.status === "Overdue");
  const alerts = services
    .filter((s) => s.status !== "Completed")
    .sort((a, b) => a.nextServiceDate.localeCompare(b.nextServiceDate))
    .slice(0, 6);

  const vehicleReg = (id: number) =>
    vehicles.find((v) => v.id === id)?.registrationNumber ?? "—";

  return (
    <MainLayout pageTitle="Dashboard" requiredRole="ADMIN">
      <PageHeader
        title="Dashboard"
        description="Overview of fleet status, upcoming services and recent activity."
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          label="Total Vehicles"
          value={dashboardTotals.totalVehicles}
          note={`${vehicles.length} records in this prototype`}
        />
        <SummaryCard
          label="Active Drivers"
          value={dashboardTotals.activeDrivers}
          note={`${drivers.filter((d) => d.status === "Active").length} active in records`}
        />
        <SummaryCard label="Services Due Soon" value={dueSoon.length || 5} tone="warning" />
        <SummaryCard label="Overdue Services" value={overdue.length || 2} tone="danger" />
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-sm font-semibold">Service Due Alerts</h2>
            <Link to="/services" className="text-[13px] font-medium text-primary underline">
              View all services
            </Link>
          </div>
          <DataTable
            columns={["Vehicle", "Service", "Due Date", "Status"]}
            isEmpty={alerts.length === 0}
            empty="No pending service alerts."
          >
            {alerts.map((s) => (
              <Tr key={s.id}>
                <Td className="font-medium">{vehicleReg(s.vehicleId)}</Td>
                <Td>{s.serviceType}</Td>
                <Td>{formatDate(s.nextServiceDate)}</Td>
                <Td>
                  <StatusBadge status={s.status} />
                </Td>
              </Tr>
            ))}
          </DataTable>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-sm font-semibold">Recent Activity</h2>
            <Link to="/audit-trail" className="text-[13px] font-medium text-primary underline">
              Audit trail
            </Link>
          </div>
          <Card>
            <ul className="divide-y divide-border">
              {auditLogs.slice(0, 6).map((log) => (
                <li key={log.id} className="px-4 py-3">
                  <p className="text-sm">
                    <span className="font-medium">{log.role}</span> {log.action.toLowerCase()}{" "}
                    {log.entity.toLowerCase()}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {log.reference} · {log.timestamp}
                  </p>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
