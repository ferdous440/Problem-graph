import React from 'react';

interface SeverityBadgeProps {
  severity: 'low' | 'medium' | 'high' | 'critical' | string;
  size?: 'sm' | 'md';
}

export const SeverityBadge: React.FC<SeverityBadgeProps> = ({ severity, size = 'sm' }) => {
  const configs: Record<string, { label: string; bg: string; text: string }> = {
    low: {
      label: 'কম গুরুত্ব',
      bg: 'bg-slate-100 text-slate-700 border-slate-200',
      text: 'text-slate-700'
    },
    medium: {
      label: 'মাঝারি',
      bg: 'bg-blue-50 text-blue-700 border-blue-200',
      text: 'text-blue-700'
    },
    high: {
      label: 'বেশি গুরুত্ব',
      bg: 'bg-amber-50 text-amber-800 border-amber-300',
      text: 'text-amber-800'
    },
    critical: {
      label: 'অত্যন্ত জরুরি',
      bg: 'bg-rose-100 text-rose-800 border-rose-300 font-semibold animate-pulse',
      text: 'text-rose-800'
    }
  };

  const config = configs[severity] || configs.medium;
  const padding = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm';

  return (
    <span className={`inline-flex items-center rounded-md border font-medium ${config.bg} ${padding}`}>
      {config.label}
    </span>
  );
};
