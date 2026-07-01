import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

const colorMap = {
  teal: {
    iconBg: 'bg-brand-teal/10',
    iconText: 'text-brand-teal',
  },
  blue: {
    iconBg: 'bg-blue-50',
    iconText: 'text-blue-600',
  },
  amber: {
    iconBg: 'bg-amber-50',
    iconText: 'text-amber-600',
  },
  green: {
    iconBg: 'bg-emerald-50',
    iconText: 'text-emerald-600',
  },
  red: {
    iconBg: 'bg-red-50',
    iconText: 'text-red-600',
  },
  purple: {
    iconBg: 'bg-purple-50',
    iconText: 'text-purple-600',
  },
};

export default function StatCard({ icon: Icon, label, value, trend, trendUp = true, color = 'teal' }) {
  const palette = colorMap[color] || colorMap.teal;

  return (
    <div
      className="bg-white rounded-2xl border border-gray-100 p-5
        hover:shadow-lg hover:shadow-gray-100/50 transition-all-custom"
    >
      <div className="flex items-start justify-between">
        <div className={`p-2.5 rounded-xl ${palette.iconBg}`}>
          {Icon && <Icon className={`w-5 h-5 ${palette.iconText}`} />}
        </div>

        {trend && (
          <div
            className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-lg
              ${trendUp
                ? 'text-emerald-600 bg-emerald-50'
                : 'text-red-600 bg-red-50'
              }`}
          >
            {trendUp ? (
              <TrendingUp className="w-3.5 h-3.5" />
            ) : (
              <TrendingDown className="w-3.5 h-3.5" />
            )}
            {trend}
          </div>
        )}
      </div>

      <div className="mt-4">
        <p className="text-2xl font-display font-bold text-brand-dark tracking-tight">
          {value}
        </p>
        <p className="text-sm text-brand-gray mt-0.5">{label}</p>
      </div>
    </div>
  );
}
