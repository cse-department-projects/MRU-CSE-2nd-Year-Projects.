import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

/**
 * Reusable Quick Actions Widget for dashboards.
 * @param {Object} props
 * @param {Array<{label: string, path: string, icon: React.ElementType, variant?: string}>} props.actions
 */
export default function QuickActionsWidget({ actions }) {
  if (!actions || actions.length === 0) return null;

  return (
    <Card className="card-premium h-full flex flex-col">
      <CardHeader className="pb-3 border-b border-border/50 bg-muted/20">
        <CardTitle className="text-lg font-semibold flex items-center">
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 flex-1 flex flex-col gap-3">
        {actions.map((action, index) => (
          <Button 
            key={index} 
            variant={action.variant || "outline"} 
            className={`w-full justify-start h-12 relative group overflow-hidden animate-fade-in-up stagger-${(index % 5) + 1}`} 
            asChild
          >
            <Link to={action.path}>
              {action.icon && <action.icon className="mr-3 h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />}
              <span className="font-medium">{action.label}</span>
              <ArrowRight className="ml-auto h-4 w-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-primary" />
            </Link>
          </Button>
        ))}
      </CardContent>
    </Card>
  );
}
