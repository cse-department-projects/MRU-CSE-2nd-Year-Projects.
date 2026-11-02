import { FileX } from 'lucide-react';
import { Button } from './button';

export default function EmptyState({ 
  icon: Icon = FileX, 
  title = "No results found", 
  description = "Get started by creating your first entry.", 
  actionLabel, 
  onAction 
}) {
  return (
    <div className="flex flex-col items-center justify-center p-12 lg:p-24 text-center bg-card/50 border border-border border-dashed rounded-3xl min-h-[400px]">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-[1.5rem] border border-border bg-muted shadow-sm ring-4 ring-background">
        <Icon size={32} className="text-muted-foreground" />
      </div>
      <h3 className="text-xl font-bold text-foreground tracking-tight mb-2">{title}</h3>
      <p className="max-w-md text-base text-muted-foreground font-medium mb-8">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button onClick={onAction} className="rounded-full px-8 font-bold shadow-md shadow-primary/20">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
