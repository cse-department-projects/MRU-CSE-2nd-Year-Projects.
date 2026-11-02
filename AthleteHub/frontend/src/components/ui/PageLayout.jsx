export function PageLayout({ children, className = '' }) {
  return <section className={`space-y-6 page-enter ${className}`}>{children}</section>;
}
export function PageHeader({ title, subtitle, actions, className = '' }) {
  return (
    <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 ${className}`}>
      <div className="space-y-1">
        <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
        {subtitle ? <p className="text-sm text-muted-foreground">{subtitle}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-3">{actions}</div> : null}
    </div>
  );
}
export function PageSection({ children, className = '' }) {
  return <div className={`space-y-4 ${className}`}>{children}</div>;
}
