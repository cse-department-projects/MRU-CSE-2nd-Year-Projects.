import { AlertTriangle } from 'lucide-react';
export default function ErrorState({ title = 'Something went wrong', message = 'We could not load this view right now.', action = null, className = '' }) {
  return (
    <div className={`flex items-center gap-4 p-6 rounded-xl border border-destructive/20 bg-destructive/5 ${className}`}>
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-destructive/20 bg-destructive/10 text-destructive shrink-0">
        <AlertTriangle size={20} />
      </div>
      <div className="flex-1">
        <h3 className="text-base font-bold text-foreground">{title}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{message}</p>
        {action ? <div className="mt-4">{action}</div> : null}
      </div>
    </div>
  );
}
