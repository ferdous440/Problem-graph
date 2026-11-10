import React from 'react';

interface StatusBadgeProps {
  status: 'pending' | 'verified' | 'in_progress' | 'resolved' | 'rejected' | string;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'sm' }) => {
  const configs: Record<string, { label: string; bg: string; text: string; dot: string }> = {
    pending: {
      label: 'অপেক্ষমাণ',
      bg: 'bg-amber-50 border-amber-200',
      text: 'text-amber-800',
      dot: 'bg-amber-500'
    },
    verified: {
      label: 'যাচাইকৃত',
      bg: 'bg-sky-50 border-sky-200',
      text: 'text-sky-800',
      dot: 'bg-sky-500'
    },
    in_progress: {
      label: 'কাজ চলমান',
      bg: 'bg-indigo-50 border-indigo-200',
      text: 'text-indigo-800',
      dot: 'bg-indigo-500'
    },
    resolved: {
      label: 'সমাধানকৃত',
      bg: 'bg-emerald-50 border-emerald-200',
      text: 'text-emerald-800',
      dot: 'bg-emerald-500'
    },
    rejected: {
      label: 'খারিজকৃত',
      bg: 'bg-rose-50 border-rose-200',
      text: 'text-rose-800',
      dot: 'bg-rose-500'
    }
  };

  const config = configs[status] || configs.pending;

  const sizeClasses = {
    sm: 'text-xs px-2.5 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-3.5 py-1.5'
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${config.bg} ${config.text} ${sizeClasses[size]}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
};
