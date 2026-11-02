import { Loader2 } from 'lucide-react';
export default function LoadingSpinner({ text = 'Loading...', fullPage = false }) {
  const content = (
    <div className="flex flex-col items-center justify-center gap-3">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10">
        <Loader2 className="animate-spin w-7 h-7 text-primary" />
      </div>
      {text && <p className="text-muted-foreground text-sm font-medium">{text}</p>}
    </div>
  );
  if (fullPage) {
    return <div className="flex items-center justify-center min-h-[50vh]">{content}</div>;
  }
  return <div className="flex items-center justify-center py-10">{content}</div>;
}
