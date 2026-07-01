import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { format, startOfWeek, endOfWeek, subWeeks, isToday, parseISO } from 'date-fns'
import { useData } from '../context/DataContext.jsx'
import { CATCH_STATUS, EXPENSE_CATEGORIES } from '../data/constants.js'
import {
  Users, Fish, DollarSign, Receipt, TrendingUp, TrendingDown,
  ArrowRight, Clock, Anchor, AlertCircle, CheckCircle2,
  Plus, FileText, CalendarCheck
} from 'lucide-react'

// ─── Stat Card Component ─────────────────────────────────────
function StatCard({ icon: Icon, label, value, subtext, color = 'teal', onClick }) {
  const colorMap = {
    teal: 'bg-teal-500/10 text-teal-600',
    blue: 'bg-blue-500/10 text-blue-600',
    amber: 'bg-amber-500/10 text-amber-600',
    green: 'bg-emerald-500/10 text-emerald-600',
    red: 'bg-red-500/10 text-red-600',
    purple: 'bg-purple-500/10 text-purple-600',
  };

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 ${onClick ? 'cursor-pointer hover:-translate-y-0.5' : ''}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl ${colorMap[color]} flex items-center justify-center`}>
          <Icon className="w-5 h-5" />
        </div>
        {onClick && <ArrowRight className="w-4 h-4 text-slate-300" />}
      </div>
      <p className="text-2xl font-bold text-brand-dark font-display">{value}</p>
      <p className="text-xs text-brand-gray mt-1">{label}</p>
      {subtext && <p className="text-[10px] text-brand-gray/60 mt-0.5">{subtext}</p>}
    </div>
  );
}

// ─── Quick Action Button ─────────────────────────────────────
function QuickAction({ icon: Icon, label, onClick, color = 'teal' }) {
  const colorMap = {
    teal: 'bg-brand-teal hover:bg-brand-teal-light',
    amber: 'bg-amber-500 hover:bg-amber-600',
    blue: 'bg-blue-500 hover:bg-blue-600',
    green: 'bg-emerald-500 hover:bg-emerald-600',
  };

  return (
    <button
      onClick={onClick}
      className={`${colorMap[color]} text-white rounded-xl px-4 py-3 flex items-center gap-2.5 text-sm font-medium transition-all duration-200 hover:shadow-md active:scale-[0.98] cursor-pointer w-full`}
    >
      <Icon className="w-4 h-4 flex-shrink-0" />
      <span>{label}</span>
    </button>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const data = useData();
  const today = format(new Date(), 'yyyy-MM-dd');

  // ─── Current Week Range (Sat–Fri) ──────────────────────────
  const weekStart = format(startOfWeek(new Date(), { weekStartsOn: 6 }), 'yyyy-MM-dd');
  const weekEnd = format(endOfWeek(new Date(), { weekStartsOn: 6 }), 'yyyy-MM-dd');

  // ─── Compute Dashboard Stats ───────────────────────────────
  const stats = useMemo(() => {
    const employees = data.employees;
    const todayCatch = data.getCatchEntriesByDate(today);
    const todayExpenses = data.getExpensesByDate(today);
    const weekCatch = data.getCatchEntriesByDateRange(weekStart, weekEnd);
    const weekExpenses = data.getExpensesByDateRange(weekStart, weekEnd);

    const todayTotalWeight = todayCatch.reduce((s, c) => s + c.weightKg, 0);
    const todayTotalIncome = todayCatch
      .filter((c) => c.status === CATCH_STATUS.PRICED)
      .reduce((s, c) => s + (c.value || 0), 0);
    const todayTotalExpenses = todayExpenses.reduce((s, e) => s + e.amount, 0);
    const todayPendingCount = todayCatch.filter((c) => c.status === CATCH_STATUS.PENDING).length;

    const weekTotalWeight = weekCatch.reduce((s, c) => s + c.weightKg, 0);
    const weekTotalIncome = weekCatch
      .filter((c) => c.status === CATCH_STATUS.PRICED)
      .reduce((s, c) => s + (c.value || 0), 0);
    const weekTotalExpenses = weekExpenses.reduce((s, e) => s + e.amount, 0);
    const weekNetPayable = weekTotalIncome - weekTotalExpenses;

    // Recent activities (last 10 catch + expense entries combined)
    const recentCatch = data.getCatchEntriesByDateRange(
      format(subWeeks(new Date(), 2), 'yyyy-MM-dd'),
      today
    ).map((c) => ({
      ...c,
      type: 'catch',
      timestamp: c.createdAt,
    }));
    const recentExpenses = data.getExpensesByDateRange(
      format(subWeeks(new Date(), 2), 'yyyy-MM-dd'),
      today
    ).map((e) => ({
      ...e,
      type: 'expense',
      timestamp: e.createdAt,
    }));

    const recentActivity = [...recentCatch, ...recentExpenses]
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 10);

    return {
      employeeCount: employees.length,
      todayTotalWeight,
      todayTotalIncome,
      todayTotalExpenses,
      todayPendingCount,
      todayCatchCount: todayCatch.length,
      weekTotalWeight,
      weekTotalIncome,
      weekTotalExpenses,
      weekNetPayable,
      recentActivity,
    };
  }, [data.refreshKey, today, weekStart, weekEnd]);

  return (
    <div className="space-y-6 animate-[fadeIn_0.3s_ease-out]">
      {/* ─── Header ─────────────────────────────────────────── */}
      <div>
        <h1 className="text-2xl font-bold text-brand-dark font-display">Dashboard</h1>
        <p className="text-sm text-brand-gray mt-1">
          {format(new Date(), 'EEEE, MMMM d, yyyy')} — Overview of your fisheries operation
        </p>
      </div>

      {/* ─── Today's Stats ──────────────────────────────────── */}
      <div>
        <h2 className="text-xs font-semibold text-brand-gray uppercase tracking-wider mb-3">Today's Summary</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={Users}
            label="Total Employees"
            value={stats.employeeCount}
            color="teal"
            onClick={() => navigate('/employees')}
          />
          <StatCard
            icon={Fish}
            label="Today's Catch"
            value={`${stats.todayTotalWeight.toFixed(1)} kg`}
            subtext={`${stats.todayCatchCount} entries recorded`}
            color="blue"
            onClick={() => navigate('/catch')}
          />
          <StatCard
            icon={DollarSign}
            label="Today's Income"
            value={`LKR ${stats.todayTotalIncome.toLocaleString()}`}
            subtext={stats.todayPendingCount > 0 ? `${stats.todayPendingCount} pending pricing` : 'All priced'}
            color="green"
            onClick={() => navigate('/pricing')}
          />
          <StatCard
            icon={Receipt}
            label="Today's Expenses"
            value={`LKR ${stats.todayTotalExpenses.toLocaleString()}`}
            color="amber"
            onClick={() => navigate('/expenses')}
          />
        </div>
      </div>

      {/* ─── This Week Overview ─────────────────────────────── */}
      <div>
        <h2 className="text-xs font-semibold text-brand-gray uppercase tracking-wider mb-3">
          This Week ({format(parseISO(weekStart), 'MMM d')} — {format(parseISO(weekEnd), 'MMM d')})
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={Anchor}
            label="Total Catch"
            value={`${stats.weekTotalWeight.toFixed(1)} kg`}
            color="blue"
          />
          <StatCard
            icon={TrendingUp}
            label="Total Income"
            value={`LKR ${stats.weekTotalIncome.toLocaleString()}`}
            color="green"
          />
          <StatCard
            icon={TrendingDown}
            label="Total Expenses"
            value={`LKR ${stats.weekTotalExpenses.toLocaleString()}`}
            color="red"
          />
          <StatCard
            icon={DollarSign}
            label="Net Payable"
            value={`LKR ${stats.weekNetPayable.toLocaleString()}`}
            color={stats.weekNetPayable >= 0 ? 'green' : 'red'}
            onClick={() => navigate('/invoices/weekly')}
          />
        </div>
      </div>

      {/* ─── Quick Actions + Recent Activity ────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <h3 className="text-sm font-semibold text-brand-dark mb-4 flex items-center gap-2">
            <Plus className="w-4 h-4 text-brand-teal" />
            Quick Actions
          </h3>
          <div className="space-y-2.5">
            <QuickAction icon={Fish} label="Record Catch" onClick={() => navigate('/catch')} color="teal" />
            <QuickAction icon={DollarSign} label="Enter Fish Prices" onClick={() => navigate('/pricing')} color="amber" />
            <QuickAction icon={Receipt} label="Issue Materials" onClick={() => navigate('/expenses')} color="blue" />
            <QuickAction icon={FileText} label="Seller Invoice" onClick={() => navigate('/invoices/seller')} color="green" />
            <QuickAction icon={CalendarCheck} label="Weekly Settlement" onClick={() => navigate('/invoices/weekly')} />
          </div>
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <h3 className="text-sm font-semibold text-brand-dark mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-brand-teal" />
            Recent Activity
          </h3>
          {stats.recentActivity.length === 0 ? (
            <div className="text-center py-8">
              <AlertCircle className="w-10 h-10 text-slate-200 mx-auto mb-3" />
              <p className="text-sm text-brand-gray">No recent activity</p>
              <p className="text-xs text-brand-gray/60 mt-1">Start by adding employees and recording catch</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
              {stats.recentActivity.map((item) => {
                const employee = data.getEmployeeById(item.employeeId);
                const empName = employee ? employee.name : 'Unknown';

                if (item.type === 'catch') {
                  const variety = data.fishVarieties.find((v) => v.id === item.fishVarietyId);
                  return (
                    <div key={item.id} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-slate-50 transition-colors">
                      <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center flex-shrink-0">
                        <Fish className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-brand-dark truncate">
                          <span className="font-medium">{empName}</span> caught{' '}
                          <span className="font-medium">{item.weightKg} kg</span> of{' '}
                          <span className="text-brand-teal">{variety?.name || 'Unknown'}</span>
                        </p>
                        <p className="text-[10px] text-brand-gray">{item.date}</p>
                      </div>
                      {item.status === CATCH_STATUS.PRICED ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      ) : (
                        <Clock className="w-4 h-4 text-amber-500 flex-shrink-0" />
                      )}
                    </div>
                  );
                } else {
                  const cat = EXPENSE_CATEGORIES.find((c) => c.id === item.category);
                  return (
                    <div key={item.id} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-slate-50 transition-colors">
                      <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center flex-shrink-0">
                        <Receipt className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-brand-dark truncate">
                          <span className="font-medium">{empName}</span> — {cat?.label || item.category}{' '}
                          <span className="font-medium">LKR {item.amount.toLocaleString()}</span>
                        </p>
                        <p className="text-[10px] text-brand-gray">{item.date}</p>
                      </div>
                    </div>
                  );
                }
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
