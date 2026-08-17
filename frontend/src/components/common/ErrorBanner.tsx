import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorBannerProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export const ErrorBanner: React.FC<ErrorBannerProps> = ({ title, message, onRetry }) => {
  return (
    <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-between text-rose-900 shadow-xs">
      <div className="flex items-center gap-3">
        <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
        <div>
          {title && <div className="text-xs font-bold text-rose-900">{title}</div>}
          <span className="text-xs font-medium text-rose-800">{message}</span>
        </div>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-100 hover:bg-rose-200 text-xs font-semibold text-rose-800 transition-colors shrink-0 cursor-pointer border border-rose-300"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Retry
        </button>
      )}
    </div>
  );
};
