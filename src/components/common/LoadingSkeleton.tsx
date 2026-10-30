import React from 'react';
import { AlertCircle, RefreshCw, Inbox } from 'lucide-react';

export const LoadingSkeleton: React.FC<{ rows?: number; height?: string; className?: string }> = ({
  rows = 4,
  height = 'h-10',
  className = ''
}) => {
  return (
    <div className={`space-y-3 animate-pulse ${className}`}>
      {Array.from({ length: rows }).map((_, i) => (
        <div 
          key={i} 
          className={`w-full bg-[#E8EAED] rounded ${height} ${i % 2 === 0 ? 'opacity-80' : 'opacity-50'}`} 
        />
      ))}
    </div>
  );
};

export const CardSkeleton: React.FC<{ count?: number }> = ({ count = 4 }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="g-card p-4 h-32 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="h-3 w-24 bg-[#E8EAED] rounded" />
            <div className="h-7 w-32 bg-[#E8EAED] rounded" />
          </div>
          <div className="h-3 w-full bg-[#F1F3F4] rounded" />
        </div>
      ))}
    </div>
  );
};

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Unable to retrieve telemetry feed',
  message = 'An issue occurred while communicating with the telemetry grid or sensor services.',
  onRetry,
  className = ''
}) => {
  return (
    <div className={`g-card p-8 text-center flex flex-col items-center justify-center ${className}`}>
      <div className="w-12 h-12 rounded-full bg-red-50 text-[#D93025] flex items-center justify-center mb-3">
        <AlertCircle size={24} />
      </div>
      <h4 className="text-base font-semibold text-[#202124] mb-1">{title}</h4>
      <p className="text-sm text-[#5F6368] max-w-md mb-4">{message}</p>
      {onRetry && (
        <button
          id="btn-error-retry"
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-[#1A73E8] hover:bg-[#1557B0] rounded-md transition-colors shadow-xs"
        >
          <RefreshCw size={14} />
          Retry Connection
        </button>
      )}
    </div>
  );
};

interface EmptyStateProps {
  title?: string;
  message?: string;
  actionText?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No items found',
  message = 'There are no active records matching your current filter criteria.',
  actionText,
  onAction,
  className = ''
}) => {
  return (
    <div className={`g-card p-8 text-center flex flex-col items-center justify-center ${className}`}>
      <div className="w-12 h-12 rounded-full bg-[#F1F3F4] text-[#5F6368] flex items-center justify-center mb-3">
        <Inbox size={24} />
      </div>
      <h4 className="text-base font-semibold text-[#202124] mb-1">{title}</h4>
      <p className="text-sm text-[#5F6368] max-w-md mb-4">{message}</p>
      {actionText && onAction && (
        <button
          id="btn-empty-action"
          onClick={onAction}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-[#1A73E8] bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};
