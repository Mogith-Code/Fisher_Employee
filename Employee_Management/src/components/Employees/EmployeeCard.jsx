import { useMemo } from 'react';

export default function EmployeeCard({ employee, weeklyBalance, onClick }) {
  const { initials, colorClass } = useMemo(() => {
    const parts = employee.name.split(' ');
    const firstInitial = parts[0]?.[0]?.toUpperCase() || '';
    const lastInitial = parts.length > 1 ? parts[parts.length - 1][0].toUpperCase() : '';
    const inits = firstInitial + lastInitial;
    
    const colors = [
      'bg-teal-500/10 text-teal-700',
      'bg-blue-500/10 text-blue-700',
      'bg-indigo-500/10 text-indigo-700',
      'bg-purple-500/10 text-purple-700',
      'bg-pink-500/10 text-pink-700',
      'bg-rose-500/10 text-rose-700',
      'bg-orange-500/10 text-orange-700'
    ];
    // Simple hash to consistently pick a color
    const hash = employee.name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const col = colors[hash % colors.length];
    
    return { initials: inits, colorClass: col };
  }, [employee.name]);

  let balanceColor = 'text-brand-gray';
  let balancePrefix = '';
  if (weeklyBalance !== null && weeklyBalance > 0) {
    balanceColor = 'text-emerald-600';
    balancePrefix = '+';
  } else if (weeklyBalance !== null && weeklyBalance < 0) {
    balanceColor = 'text-red-600';
  }

  return (
    <div 
      onClick={() => onClick(employee)}
      className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col h-full"
    >
      <div className="flex items-center gap-4 mb-4">
        <div className={`w-14 h-14 rounded-full flex items-center justify-center font-bold text-xl ${colorClass}`}>
          {initials}
        </div>
        <div>
          <h3 className="font-bold text-lg font-display text-brand-dark leading-tight">{employee.name}</h3>
          <p className="text-xs text-brand-gray/80 mt-0.5">NIC: {employee.nic}</p>
          <p className="text-xs text-brand-gray/80">Tel: {employee.phone}</p>
        </div>
      </div>
      
      <div className="mt-auto pt-4 border-t border-slate-50">
        <p className="text-[10px] uppercase tracking-wider text-brand-gray/60 font-semibold mb-1">This Week</p>
        {weeklyBalance !== null ? (
          <p className={`text-xl font-bold font-display ${balanceColor}`}>
            {balancePrefix}LKR {Math.abs(weeklyBalance).toLocaleString()}
          </p>
        ) : (
          <p className="text-sm text-brand-gray italic">No data yet</p>
        )}
      </div>
    </div>
  );
}
