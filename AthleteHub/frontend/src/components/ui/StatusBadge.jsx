export default function StatusBadge({ status }) {
  const getStatusStyles = (statusText) => {
    switch (statusText?.toLowerCase()) {
      case 'active': case 'approved': case 'completed':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'in progress': case 'in_progress':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'inactive': case 'deleted': case 'cancelled': case 'rejected':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'pending': case 'scheduled':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };
  return (
    <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-[0.16em] border ${getStatusStyles(status)}`}>
      {status || 'Unknown'}
    </span>
  );
}
