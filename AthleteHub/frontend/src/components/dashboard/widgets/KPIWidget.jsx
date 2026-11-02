import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Reusable KPI Widget for role-based dashboards.
 * @param {Object} props
 * @param {string} props.title
 * @param {string|number} props.value
 * @param {React.ElementType} props.icon
 * @param {string} [props.color='primary'] e.g., 'primary', 'blue', 'emerald', 'amber', 'purple'
 */
export default function KPIWidget({ title, value, icon: Icon, color = 'primary', className }) {
  const colorMap = {
    primary: { text: 'text-primary', bg: 'bg-primary/10', iconClass: 'text-primary' },
    blue: { text: 'text-blue-500', bg: 'bg-blue-500/10', iconClass: 'text-blue-500' },
    emerald: { text: 'text-emerald-500', bg: 'bg-emerald-500/10', iconClass: 'text-emerald-500' },
    amber: { text: 'text-amber-500', bg: 'bg-amber-500/10', iconClass: 'text-amber-500' },
    purple: { text: 'text-purple-500', bg: 'bg-purple-500/10', iconClass: 'text-purple-500' },
  };

  const selectedColor = colorMap[color] || colorMap.primary;

  return (
    <Card className={cn("card-premium border-border/50 group overflow-hidden", className)}>
      <CardContent className="p-6 flex items-center gap-4 relative h-full">
        {/* World-class inner glow on hover */}
        <div className={cn("absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-500", selectedColor.bg)} />
        
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
           <Icon className={cn("h-16 w-16", selectedColor.iconClass)} />
        </div>
        <div className={cn("p-3 rounded-2xl shrink-0 z-10 group-hover:scale-110 transition-transform", selectedColor.bg, selectedColor.text)}>
          <Icon size={24} />
        </div>
        <div className="z-10 flex-1 min-w-0">
          <p className="text-muted-foreground text-xs font-semibold uppercase tracking-wider label-caps">{title}</p>
          <p className="text-3xl font-bold mt-1 tracking-tight font-mono-telemetry text-foreground">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}
