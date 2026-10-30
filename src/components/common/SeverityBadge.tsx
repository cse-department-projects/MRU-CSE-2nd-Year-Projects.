import React from 'react';
import { SeverityLevel } from '../../types';
import { AlertCircle, AlertTriangle, Info, CheckCircle2 } from 'lucide-react';

interface SeverityBadgeProps {
  severity: SeverityLevel;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  pulse?: boolean;
  className?: string;
}

export const SeverityBadge: React.FC<SeverityBadgeProps> = ({
  severity,
  size = 'md',
  showIcon = true,
  pulse = false,
  className = '',
}) => {
  const config = {
    critical: {
      bg: 'bg-red-50',
      text: 'text-[#D93025]',
      border: 'border-red-200',
      label: 'CRITICAL',
      icon: AlertCircle,
      dotColor: 'bg-[#D93025]'
    },
    high: {
      bg: 'bg-amber-50',
      text: 'text-[#E37400]',
      border: 'border-amber-200',
      label: 'HIGH RISK',
      icon: AlertTriangle,
      dotColor: 'bg-[#E37400]'
    },
    moderate: {
      bg: 'bg-yellow-50',
      text: 'text-[#B06000]',
      border: 'border-yellow-200',
      label: 'MODERATE',
      icon: Info,
      dotColor: 'bg-[#F9AB00]'
    },
    low: {
      bg: 'bg-emerald-50',
      text: 'text-[#1E8E3E]',
      border: 'border-emerald-200',
      label: 'LOW RISK',
      icon: CheckCircle2,
      dotColor: 'bg-[#1E8E3E]'
    }
  }[severity] || {
    bg: 'bg-gray-50',
    text: 'text-gray-700',
    border: 'border-gray-200',
    label: severity.toUpperCase(),
    icon: Info,
    dotColor: 'bg-gray-500'
  };

  const IconComponent = config.icon;

  const sizeClasses = {
    sm: 'text-[10px] px-1.5 py-0.5 gap-1 font-semibold tracking-wider',
    md: 'text-[11px] px-2 py-0.5 gap-1.5 font-semibold tracking-wider',
    lg: 'text-xs px-2.5 py-1 gap-1.5 font-bold tracking-wider'
  }[size];

  const iconSizes = {
    sm: 11,
    md: 13,
    lg: 15
  }[size];

  return (
    <span
      id={`severity-badge-${severity}`}
      className={`inline-flex items-center rounded-full border ${config.bg} ${config.text} ${config.border} ${sizeClasses} ${className} uppercase whitespace-nowrap`}
    >
      {showIcon && <IconComponent size={iconSizes} className="shrink-0" />}
      {pulse && (
        <span className="relative flex h-2 w-2 mr-0.5">
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${config.dotColor}`}></span>
          <span className={`relative inline-flex rounded-full h-2 w-2 ${config.dotColor}`}></span>
        </span>
      )}
      <span>{config.label}</span>
    </span>
  );
};
