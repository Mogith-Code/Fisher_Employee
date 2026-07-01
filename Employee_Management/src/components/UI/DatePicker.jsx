import React from 'react';
import { Calendar } from 'lucide-react';
import { format, subDays } from 'date-fns';

export default function DatePicker({ value, onChange, label }) {
  const setToday = () => onChange(format(new Date(), 'yyyy-MM-dd'));
  const setYesterday = () => onChange(format(subDays(new Date(), 1), 'yyyy-MM-dd'));

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-medium text-brand-dark">{label}</label>
      )}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-gray pointer-events-none" />
          <input
            type="date"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 bg-white
              text-sm text-brand-dark placeholder:text-brand-gray
              focus:outline-none focus:ring-2 focus:ring-brand-teal/20 focus:border-brand-teal
              transition-all-custom"
          />
        </div>
        <button
          type="button"
          onClick={setToday}
          className="px-3 py-2 text-xs font-medium rounded-lg border border-gray-200
            text-brand-gray hover:text-brand-teal hover:border-brand-teal/30 hover:bg-brand-teal/5
            transition-all-custom cursor-pointer"
        >
          Today
        </button>
        <button
          type="button"
          onClick={setYesterday}
          className="px-3 py-2 text-xs font-medium rounded-lg border border-gray-200
            text-brand-gray hover:text-brand-teal hover:border-brand-teal/30 hover:bg-brand-teal/5
            transition-all-custom cursor-pointer"
        >
          Yesterday
        </button>
      </div>
    </div>
  );
}
