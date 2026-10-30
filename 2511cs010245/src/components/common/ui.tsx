import type { ReactNode, ButtonHTMLAttributes, InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import { useEffect, useId, useRef } from "react";
import { cn } from "@/lib/utils";

/* ---------------- Button ---------------- */

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md";
};

export function Button({ variant = "secondary", size = "md", className, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-md border font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-60",
        size === "sm" ? "px-2.5 py-1 text-[13px]" : "px-3.5 py-2 text-sm",
        variant === "primary" &&
          "border-primary bg-primary text-primary-foreground shadow-card hover:bg-primary/90",
        variant === "secondary" &&
          "border-input bg-surface text-foreground shadow-card hover:bg-secondary",
        variant === "danger" &&
          "border-destructive bg-destructive text-destructive-foreground hover:bg-destructive/90",
        variant === "ghost" && "border-transparent bg-transparent text-foreground hover:bg-secondary",
        className,
      )}
      {...props}
    />
  );
}

/* ---------------- Form fields ---------------- */

interface FieldWrap {
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
}

export function FormInput({
  label,
  error,
  hint,
  required,
  className,
  ...props
}: FieldWrap & InputHTMLAttributes<HTMLInputElement>) {
  const id = useId();
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-[13px] font-medium text-foreground">
        {label} {required && <span aria-hidden="true" className="text-danger">*</span>}
      </label>
      <input
        id={id}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-err` : hint ? `${id}-hint` : undefined}
        className={cn(
          "h-9 rounded-md border bg-surface px-3 text-sm text-foreground transition-colors placeholder:text-muted-foreground focus-visible:border-ring",
          error ? "border-danger" : "border-input",
          className,
        )}
        {...props}
      />
      {hint && !error && (
        <p id={`${id}-hint`} className="text-xs text-muted-foreground">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-err`} role="alert" className="text-xs font-medium text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

export function FormSelect({
  label,
  error,
  required,
  children,
  className,
  ...props
}: FieldWrap & SelectHTMLAttributes<HTMLSelectElement>) {
  const id = useId();
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-[13px] font-medium text-foreground">
        {label} {required && <span aria-hidden="true" className="text-danger">*</span>}
      </label>
      <select
        id={id}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-err` : undefined}
        className={cn(
          "h-9 rounded-md border bg-surface px-2.5 text-sm text-foreground transition-colors focus-visible:border-ring",
          error ? "border-danger" : "border-input",
          className,
        )}
        {...props}
      >
        {children}
      </select>
      {error && (
        <p id={`${id}-err`} role="alert" className="text-xs font-medium text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

export function FormTextarea({
  label,
  error,
  required,
  className,
  ...props
}: FieldWrap & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const id = useId();
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-[13px] font-medium text-foreground">
        {label} {required && <span aria-hidden="true" className="text-danger">*</span>}
      </label>
      <textarea
        id={id}
        rows={3}
        aria-invalid={!!error}
        className={cn(
          "rounded-md border bg-surface px-3 py-2 text-sm text-foreground",
          error ? "border-danger" : "border-input",
          className,
        )}
        {...props}
      />
      {error && (
        <p role="alert" className="text-xs font-medium text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

/* ---------------- Status badge ---------------- */

const toneMap: Record<string, string> = {
  Active: "border-success/30 bg-success-surface text-success",
  Completed: "border-success/30 bg-success-surface text-success",
  Valid: "border-success/30 bg-success-surface text-success",
  "Due Soon": "border-warning/30 bg-warning-surface text-warning",
  "Expiring Soon": "border-warning/30 bg-warning-surface text-warning",
  Maintenance: "border-warning/30 bg-warning-surface text-warning",
  Overdue: "border-danger/30 bg-danger-surface text-danger",
  Expired: "border-danger/30 bg-danger-surface text-danger",
  Suspended: "border-danger/30 bg-danger-surface text-danger",
  Scheduled: "border-info/30 bg-info-surface text-info",
  Inactive: "border-border-strong bg-secondary text-muted-foreground",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-md border px-2 py-0.5 text-xs font-medium",
        toneMap[status] ?? "border-border-strong bg-secondary text-muted-foreground",
      )}
    >
      <span aria-hidden="true" className="size-1.5 rounded-full bg-current opacity-70" />
      {status}
    </span>
  );
}

/* ---------------- Card / sections ---------------- */

export function Card({ children, className }: { children: ReactNode; className?: string | undefined }) {
  return (
    <div className={cn("rounded-md border border-border bg-card shadow-card", className)}>{children}</div>
  );
}

export function SectionCard({
  title,
  action,
  children,
  className,
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string | undefined;
}) {
  return (
    <Card className={className}>
      <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
        <h2 className="text-[13px] font-semibold uppercase tracking-wide text-muted-foreground">{title}</h2>
        {action}
      </div>
      <div className="p-4">{children}</div>
    </Card>
  );
}

export function SummaryCard({
  label,
  value,
  tone = "neutral",
  note,
}: {
  label: string;
  value: string | number;
  tone?: "neutral" | "warning" | "danger" | "success";
  note?: string;
}) {
  const valueTone =
    tone === "warning"
      ? "text-warning"
      : tone === "danger"
        ? "text-danger"
        : tone === "success"
          ? "text-success"
          : "text-foreground";
  return (
    <Card className="px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className={cn("mt-1.5 text-[22px] font-semibold leading-none tabular-nums", valueTone)}>
        {value}
      </p>
      {note && <p className="mt-1 text-xs text-muted-foreground">{note}</p>}
    </Card>
  );
}

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 className="text-lg font-semibold tracking-tight text-foreground">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

/* ---------------- Table ---------------- */

export function DataTable({
  columns,
  children,
  empty,
  isEmpty,
}: {
  columns: string[];
  children: ReactNode;
  empty: string;
  isEmpty: boolean;
}) {
  return (
    <div className="overflow-x-auto rounded-md border border-border bg-card shadow-card">
      <table className="w-full min-w-[560px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-border bg-secondary/70 text-left">
            {columns.map((c) => (
              <th
                key={c}
                scope="col"
                className="whitespace-nowrap px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground"
              >
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {isEmpty ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-12 text-center text-sm text-muted-foreground">
                {empty}
              </td>
            </tr>
          ) : (
            children
          )}
        </tbody>
      </table>
    </div>
  );
}

export function Td({ children, className }: { children?: ReactNode; className?: string }) {
  return <td className={cn("border-b border-border px-4 py-3 align-middle", className)}>{children}</td>;
}

export function Tr({ children }: { children: ReactNode }) {
  return <tr className="transition-colors last:[&>td]:border-b-0 hover:bg-secondary/60">{children}</tr>;
}

/* ---------------- Modal / confirm ---------------- */

export function Modal({
  open,
  title,
  onClose,
  children,
  footer,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    ref.current?.focus();
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-foreground/40 p-4 sm:items-center">
      <div
        ref={ref}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="w-full max-w-lg rounded-md border border-border bg-card shadow-sm"
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h2 className="text-sm font-semibold">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="rounded-md px-2 py-1 text-muted-foreground hover:bg-secondary"
          >
            ✕
          </button>
        </div>
        <div className="px-4 py-4">{children}</div>
        {footer && (
          <div className="flex justify-end gap-2 border-t border-border px-4 py-3">{footer}</div>
        )}
      </div>
    </div>
  );
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Delete",
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <Modal
      open={open}
      title={title}
      onClose={onCancel}
      footer={
        <>
          <Button onClick={onCancel}>Cancel</Button>
          <Button variant="danger" onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <p className="text-sm text-foreground">{message}</p>
    </Modal>
  );
}

/* ---------------- States ---------------- */

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-md border border-dashed border-border-strong px-4 py-10 text-center text-sm text-muted-foreground">
      {message}
    </div>
  );
}

export function LoadingState({ message = "Loading…" }: { message?: string }) {
  return (
    <div role="status" className="px-4 py-10 text-center text-sm text-muted-foreground">
      {message}
    </div>
  );
}

export function ErrorState({ message }: { message: string }) {
  return (
    <div role="alert" className="rounded-md border border-danger/40 bg-danger-surface px-4 py-3 text-sm text-danger">
      {message}
    </div>
  );
}

export function AlertCard({
  tone = "info",
  children,
}: {
  tone?: "info" | "warning" | "danger";
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-md border px-3 py-2 text-sm",
        tone === "info" && "border-info/30 bg-info-surface text-info",
        tone === "warning" && "border-warning/30 bg-warning-surface text-warning",
        tone === "danger" && "border-danger/30 bg-danger-surface text-danger",
      )}
    >
      {children}
    </div>
  );
}

/* ---------------- Detail list ---------------- */

export function DetailList({ items }: { items: { label: string; value: ReactNode }[] }) {
  return (
    <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
      {items.map((item) => (
        <div key={item.label}>
          <dt className="text-xs uppercase tracking-wide text-muted-foreground">{item.label}</dt>
          <dd className="mt-0.5 text-sm text-foreground">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}

/* ---------------- Search / filter bar ---------------- */

export function FilterBar({ children }: { children: ReactNode }) {
  return (
    <div className="mb-4 flex flex-wrap items-end gap-3 rounded-md border border-border bg-card p-3">
      {children}
    </div>
  );
}

export function SearchBar({
  value,
  onChange,
  placeholder,
  label = "Search",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  label?: string;
}) {
  const id = useId();
  return (
    <div className="flex min-w-[200px] flex-1 flex-col gap-1.5">
      <label htmlFor={id} className="text-[13px] font-medium">
        {label}
      </label>
      <input
        id={id}
        type="search"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-md border border-input bg-surface px-3 py-2 text-sm placeholder:text-muted-foreground"
      />
    </div>
  );
}

export function SelectFilter({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  const id = useId();
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-[13px] font-medium">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="min-w-[150px] rounded-md border border-input bg-surface px-3 py-2 text-sm"
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}
