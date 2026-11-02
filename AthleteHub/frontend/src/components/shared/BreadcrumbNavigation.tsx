import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

export function BreadcrumbNavigation({ className }) {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  // Don't show breadcrumbs on root dashboard page
  if (pathnames.length === 1 && pathnames[0] === 'dashboard') {
    return null;
  }

  // Formatting utility
  const formatSegment = (segment) => {
    // If it's a numeric ID or matches ATH..., etc., we could format it
    if (/^[0-9]+$/.test(segment)) return `#${segment}`;
    return segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');
  };

  return (
    <nav className={cn("flex text-sm font-medium text-muted-foreground", className)} aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2">
        <li>
          <Link to="/dashboard" className="hover:text-foreground transition-colors flex items-center">
            <Home className="h-4 w-4" />
            <span className="sr-only">Home</span>
          </Link>
        </li>
        
        {pathnames.map((segment, index) => {
          // Skip 'dashboard' as we already have Home icon
          if (segment === 'dashboard') return null;

          const isLast = index === pathnames.length - 1;
          const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;

          return (
            <li key={routeTo} className="flex items-center">
              <ChevronRight className="h-4 w-4 mx-1 opacity-50" />
              {isLast ? (
                <span className="text-foreground font-semibold cursor-default" aria-current="page">
                  {formatSegment(segment)}
                </span>
              ) : (
                <Link to={routeTo} className="hover:text-foreground transition-colors">
                  {formatSegment(segment)}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
