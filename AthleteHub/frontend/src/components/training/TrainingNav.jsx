import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { LayoutDashboard, CalendarDays, ActivitySquare, ClipboardCheck } from 'lucide-react';

export default function TrainingNav() {
  const location = useLocation();
  const currentPath = location.pathname;

  const tabs = [
    { name: 'Overview', path: '/dashboard/training', icon: LayoutDashboard },
    { name: 'Plans', path: '/dashboard/training-plans', icon: CalendarDays },
    { name: 'Sessions', path: '/dashboard/training-sessions', icon: ActivitySquare },
    { name: 'Attendance', path: '/dashboard/training/attendance', icon: ClipboardCheck },
  ];

  return (
    <div className="w-full overflow-x-auto custom-scrollbar pb-2 mb-8">
      <div className="inline-flex h-12 items-center justify-center rounded-xl bg-muted p-1 text-muted-foreground w-full sm:w-auto min-w-max">
        {tabs.map((tab) => {
          const isActive = currentPath === tab.path;
          return (
            <Link
              key={tab.path}
              to={tab.path}
              className={cn(
                "inline-flex items-center justify-center whitespace-nowrap rounded-lg px-6 py-2 text-sm font-semibold ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
                isActive
                  ? "bg-background text-foreground shadow-sm ring-1 ring-border/50"
                  : "hover:bg-muted-foreground/10 hover:text-foreground"
              )}
            >
              <tab.icon className={cn("mr-2 h-4 w-4", isActive ? "text-primary" : "text-muted-foreground")} />
              {tab.name}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
