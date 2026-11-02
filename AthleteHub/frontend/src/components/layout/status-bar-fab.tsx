'use client';

import React from 'react';
import { useNavigation } from '@/lib/navigation-store';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  CircleDot,
  Plus,
  UserPlus,
  Download,
  FileUp,
  Building2,
  X,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { toast } from 'sonner';
import { usePermissions } from '@/hooks/usePermissions';

export function StatusBar() {
  return (
    <footer className="fixed bottom-0 left-0 right-0 z-30 h-[28px] glass-panel border-t border-border/40 flex items-center px-4 text-[11px] text-muted-foreground/70 gap-3">
      <span className="flex items-center gap-1.5">
        <CircleDot className="h-2.5 w-2.5 text-emerald-500 animate-pulse" />
        Connected
      </span>
      <span>Production</span>
      <span>v1.0.0</span>
      <span className="ml-auto flex items-center gap-2">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
        All Systems Operational
      </span>
    </footer>
  );
}

export function FloatingActionButton() {
  const navigate = useNavigate();
  const { isRole, can } = usePermissions();

  const isSuperAdmin = isRole('SUPER_ADMIN');
  const isOrgAdmin = isRole('ORG_ADMIN');

  const actions = [
    (isSuperAdmin || isOrgAdmin || can('athlete.create')) && { 
      label: 'Register Athlete', 
      icon: UserPlus, 
      onClick: () => navigate('/dashboard/athletes/new') 
    },
    isSuperAdmin && { 
      label: 'Create Organization', 
      icon: Building2, 
      onClick: () => navigate('/dashboard/organizations/new') 
    },
    (isSuperAdmin || isOrgAdmin) && { 
      label: 'Import Dataset', 
      icon: FileUp, 
      onClick: () => navigate('/dashboard/imports') 
    },
    { 
      label: 'Export Report', 
      icon: Download, 
      onClick: () => toast.success('Platform telemetry & athlete report exported') 
    },
  ].filter(Boolean);

  return (
    <div className="fixed bottom-[40px] right-6 z-50">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="h-11 w-11 rounded-xl bg-foreground text-background shadow-sm hover:shadow-md hover:bg-foreground/90 transition-all flex items-center justify-center">
            <Plus className="h-4 w-4" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" side="top" className="w-56 p-2 gap-1">
          {actions.map((action) => (
            <DropdownMenuItem key={action.label} onClick={action.onClick} className="flex items-center gap-3 py-2.5 px-3 rounded-xl cursor-pointer">
              <action.icon className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">{action.label}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
