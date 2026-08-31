import React from 'react';
import { VisitStatus } from '../types';

interface Props {
  status: VisitStatus;
}

export const VisitorStatusBadge: React.FC<Props> = ({ status }) => {
  const configs: Record<VisitStatus, { label: string; style: string; icon: string }> = {
    checked_in: {
      label: 'Inside',
      style: 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-500/20',
      icon: '🟢'
    },
    pending: {
      label: 'Waiting Approval',
      style: 'bg-amber-50 text-amber-700 border-amber-200 ring-amber-500/20',
      icon: '🟡'
    },
    approved: {
      label: 'Approved (QR Ready)',
      style: 'bg-sky-50 text-sky-700 border-sky-200 ring-sky-500/20',
      icon: '🔵'
    },
    checked_out: {
      label: 'Checked Out',
      style: 'bg-slate-100 text-slate-600 border-slate-200 ring-slate-400/20',
      icon: '⚪'
    },
    rejected: {
      label: 'Rejected',
      style: 'bg-rose-50 text-rose-700 border-rose-200 ring-rose-500/20',
      icon: '🔴'
    }
  };

  const config = configs[status] || configs.pending;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold shadow-xs ring-1 ring-inset ${config.style}`}
    >
      <span className="text-[10px]">{config.icon}</span>
      <span>{config.label}</span>
    </span>
  );
};
