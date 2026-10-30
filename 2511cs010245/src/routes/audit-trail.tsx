import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { useVmts } from "@/lib/vmts-store";
import {
  DataTable,
  FilterBar,
  PageHeader,
  SearchBar,
  SelectFilter,
  Td,
  Tr,
} from "@/components/common/ui";
import { formatDateTime } from "@/lib/format";

export const Route = createFileRoute("/audit-trail")({
  head: () => ({
    meta: [
      { title: "Audit Trail — VMTS" },
      {
        name: "description",
        content: "Chronological record of user actions performed in the system.",
      },
      { property: "og:title", content: "Audit Trail — VMTS" },
      {
        property: "og:description",
        content: "Chronological record of user actions performed in the system.",
      },
    ],
  }),
  component: AuditTrailPage,
});

function AuditTrailPage() {
  const { auditLogs } = useVmts();
  const [search, setSearch] = useState("");
  const [action, setAction] = useState("All actions");
  const [role, setRole] = useState("All roles");
  const [fromDate, setFromDate] = useState("");

  const actions = useMemo(
    () => ["All actions", ...Array.from(new Set(auditLogs.map((l) => l.action)))],
    [auditLogs],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return auditLogs.filter((l) => {
      const matchesSearch =
        !q ||
        l.user.toLowerCase().includes(q) ||
        l.entity.toLowerCase().includes(q) ||
        l.reference.toLowerCase().includes(q) ||
        l.action.toLowerCase().includes(q);
      const matchesAction = action === "All actions" || l.action === action;
      const matchesRole = role === "All roles" || l.role === role;
      const matchesDate = !fromDate || l.timestamp.slice(0, 10) >= fromDate;
      return matchesSearch && matchesAction && matchesRole && matchesDate;
    });
  }, [auditLogs, search, action, role, fromDate]);

  return (
    <MainLayout pageTitle="Audit Trail" requiredRole="ADMIN">
      <PageHeader
        title="Audit Trail"
        description="Actions recorded across vehicles, drivers and service records."
      />

      <FilterBar>
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="User, entity or reference"
          label="Search audit records"
        />
        <SelectFilter label="Action" value={action} onChange={setAction} options={actions} />
        <SelectFilter
          label="Role"
          value={role}
          onChange={setRole}
          options={["All roles", "Admin", "Driver"]}
        />
        <div className="flex flex-col gap-1.5">
          <label htmlFor="from-date" className="text-[13px] font-medium">
            From date
          </label>
          <input
            id="from-date"
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="rounded-md border border-input bg-surface px-3 py-2 text-sm"
          />
        </div>
      </FilterBar>

      <DataTable
        columns={["User", "Role", "Action", "Entity", "Reference", "Timestamp"]}
        isEmpty={filtered.length === 0}
        empty="No audit records found."
      >
        {filtered.map((l) => (
          <Tr key={l.id}>
            <Td className="font-medium">{l.user}</Td>
            <Td>{l.role}</Td>
            <Td>{l.action}</Td>
            <Td>{l.entity}</Td>
            <Td className="text-muted-foreground">{l.reference}</Td>
            <Td className="whitespace-nowrap">{formatDateTime(l.timestamp)}</Td>
          </Tr>
        ))}
      </DataTable>
    </MainLayout>
  );
}
