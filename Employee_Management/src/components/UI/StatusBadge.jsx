import React from 'react';

const statusStyles = {
  pending_price: {
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    dot: 'bg-amber-500',
    label: 'Pending Price',
  },
  priced: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    dot: 'bg-emerald-500',
    label: 'Priced',
  },
  provisional: {
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    dot: 'bg-amber-500',
    label: 'Provisional',
  },
  finalized: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    dot: 'bg-emerald-500',
    label: 'Finalized',
  },
  settled: {
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    dot: 'bg-blue-500',
    label: 'Settled',
  },
  pending: {
    bg: 'bg-gray-100',
    text: 'text-gray-600',
    dot: 'bg-gray-400',
    label: 'Pending',
  },
};

const defaultStyle = {
  bg: 'bg-gray-100',
  text: 'text-gray-600',
  dot: 'bg-gray-400',
};

export default function StatusBadge({ status, size = 'md' }) {
  const style = statusStyles[status] || defaultStyle;
  const displayLabel = style.label || status?.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) || 'Unknown';

  const sizeClasses = size === 'sm'
    ? 'px-2 py-0.5 text-[11px] gap-1'
    : 'px-2.5 py-1 text-xs gap-1.5';

  const dotSize = size === 'sm' ? 'w-1.5 h-1.5' : 'w-2 h-2';

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full
        ${style.bg} ${style.text} ${sizeClasses}`}
    >
      <span className={`${dotSize} rounded-full ${style.dot} shrink-0`} />
      {displayLabel}
    </span>
  );
}
