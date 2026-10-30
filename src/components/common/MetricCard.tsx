import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface MetricCardProps {
  id?: string;
  label: string;
  value: string | number;
  subValue?: string;
  trend?: {
    direction: 'up' | 'down' | 'neutral';
    text: string;
    isGood?: boolean;
  };
  icon?: LucideIcon;
  iconColor?: string;
  iconBg?: string;
  badge?: React.ReactNode;
  onClick?: () => void;
  accentColor?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  id,
  label,
  value,
  subValue,
  trend,
  icon: Icon,
  iconColor = 'text-[#1A73E8]',
  iconBg = 'bg-blue-50',
  badge,
  onClick,
  accentColor
}) => {
  return (
    <div
      id={id || `metric-card-${label.toLowerCase().replace(/\s+/g, '-')}`}
      onClick={onClick}
      className={`g-card p-4 transition-all duration-150 relative overflow-hidden ${
        onClick ? 'cursor-pointer hover:border-[#1A73E8] hover:shadow-sm' : ''
      }`}
    >
      {accentColor && (
        <div 
          className="absolute top-0 left-0 right-0 h-1" 
          style={{ backgroundColor: accentColor }} 
        />
      )}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[12px] font-medium text-[#5F6368] uppercase tracking-wide">
            {label}
          </p>
          <div className="flex items-baseline gap-2 mt-1.5">
            <h3 className="text-2xl font-bold text-[#202124] tracking-tight">
              {value}
            </h3>
            {subValue && (
              <span className="text-xs text-[#5F6368]">
                {subValue}
              </span>
            )}
          </div>
        </div>

        {Icon && (
          <div className={`p-2.5 rounded-lg ${iconBg} ${iconColor} shrink-0`}>
            <Icon size={20} />
          </div>
        )}
      </div>

      <div className="mt-3 flex items-center justify-between text-xs pt-2 border-t border-[#F1F3F4]">
        {trend ? (
          <div className="flex items-center gap-1">
            {trend.direction === 'up' && (
              <TrendingUp 
                size={14} 
                className={trend.isGood ? 'text-[#1E8E3E]' : 'text-[#D93025]'} 
              />
            )}
            {trend.direction === 'down' && (
              <TrendingDown 
                size={14} 
                className={trend.isGood ? 'text-[#1E8E3E]' : 'text-[#D93025]'} 
              />
            )}
            {trend.direction === 'neutral' && (
              <Minus size={14} className="text-[#5F6368]" />
            )}
            <span
              className={`font-medium ${
                trend.isGood === true
                  ? 'text-[#1E8E3E]'
                  : trend.isGood === false
                  ? 'text-[#D93025]'
                  : 'text-[#5F6368]'
              }`}
            >
              {trend.text}
            </span>
          </div>
        ) : (
          <span className="text-[#80868B]">Live Telemetry</span>
        )}

        {badge && <div>{badge}</div>}
      </div>
    </div>
  );
};
