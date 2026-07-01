import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import { useToast } from '../../components/UI/Toast';
import {
  startOfWeek,
  endOfWeek,
  format,
  parseISO,
  isValid,
} from 'date-fns';
import {
  ArrowLeft,
  Phone,
  CreditCard,
  CalendarDays,
  Anchor,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Scale,
  Fish,
  Receipt,
  Wallet,
  Clock,
  Filter,
  Edit,
  Loader2,
  User,
} from 'lucide-react';
import { WEEK_START_DAY, EXPENSE_CATEGORIES, CATCH_STATUS } from '../../data/constants';
import StatusBadge from '../../components/UI/StatusBadge';
import Modal from '../../components/UI/Modal.jsx';

// ─── Avatar helper (same logic as EmployeeCard) ──────────────────
const AVATAR_COLORS = [
  { bg: 'bg-teal-100', text: 'text-teal-700' },
  { bg: 'bg-sky-100', text: 'text-sky-700' },
  { bg: 'bg-violet-100', text: 'text-violet-700' },
  { bg: 'bg-rose-100', text: 'text-rose-700' },
  { bg: 'bg-amber-100', text: 'text-amber-700' },
  { bg: 'bg-emerald-100', text: 'text-emerald-700' },
  { bg: 'bg-indigo-100', text: 'text-indigo-700' },
  { bg: 'bg-pink-100', text: 'text-pink-700' },
  { bg: 'bg-cyan-100', text: 'text-cyan-700' },
  { bg: 'bg-orange-100', text: 'text-orange-700' },
];

function getAvatarColor(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function getInitials(name) {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return parts[0][0].toUpperCase();
}

function getCategoryInfo(catId) {
  return EXPENSE_CATEGORIES.find((c) => c.id === catId) || { id: catId, label: catId, icon: '📦' };
}

function formatCurrency(value) {
  if (value == null) return 'Rs 0';
  return `Rs ${Math.abs(value).toLocaleString('en-LK', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

function formatDate(dateStr) {
  try {
    const d = parseISO(dateStr);
    return isValid(d) ? format(d, 'dd MMM yyyy') : dateStr;
  } catch {
    return dateStr;
  }
}

function formatShortDate(dateStr) {
  try {
    const d = parseISO(dateStr);
    return isValid(d) ? format(d, 'dd MMM') : dateStr;
  } catch {
    return dateStr;
  }
}

// ─── Tab definitions ─────────────────────────────────────────────
const TABS = [
  { id: 'overview', label: 'Overview', icon: TrendingUp },
  { id: 'catch', label: 'Catch History', icon: Fish },
  { id: 'expenses', label: 'Expenses', icon: Receipt },
  { id: 'invoices', label: 'Invoices', icon: Wallet },
];

export default function EmployeeProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    getEmployeeById,
    getEmployeeWeeklySummary,
    getCatchEntriesByEmployee,
    getExpensesByEmployee,
    getWeeklySettlements,
    fishVarieties,
    updateEmployee,
  } = useData();

  const toast = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [catchDateFrom, setCatchDateFrom] = useState('');
  const [catchDateTo, setCatchDateTo] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);

  const employee = getEmployeeById(id);

  // Current week range
  const weekRange = useMemo(() => {
    const now = new Date();
    const start = startOfWeek(now, { weekStartsOn: WEEK_START_DAY });
    const end = endOfWeek(now, { weekStartsOn: WEEK_START_DAY });
    return {
      start: format(start, 'yyyy-MM-dd'),
      end: format(end, 'yyyy-MM-dd'),
      startDisplay: format(start, 'dd MMM'),
      endDisplay: format(end, 'dd MMM yyyy'),
    };
  }, []);

  // Weekly summary
  const weeklySummary = useMemo(() => {
    if (!employee) return null;
    return getEmployeeWeeklySummary(employee.id, weekRange.start, weekRange.end);
  }, [employee, weekRange, getEmployeeWeeklySummary]);

  // All catch entries for this employee
  const allCatchEntries = useMemo(() => {
    if (!employee) return [];
    return getCatchEntriesByEmployee(employee.id).sort((a, b) => b.date.localeCompare(a.date));
  }, [employee, getCatchEntriesByEmployee]);

  // Filtered catch entries (by date range)
  const filteredCatchEntries = useMemo(() => {
    let entries = allCatchEntries;
    if (catchDateFrom) entries = entries.filter((e) => e.date >= catchDateFrom);
    if (catchDateTo) entries = entries.filter((e) => e.date <= catchDateTo);
    return entries;
  }, [allCatchEntries, catchDateFrom, catchDateTo]);

  // All expenses
  const allExpenses = useMemo(() => {
    if (!employee) return [];
    return getExpensesByEmployee(employee.id).sort((a, b) => b.date.localeCompare(a.date));
  }, [employee, getExpensesByEmployee]);

  // Weekly settlements for this employee
  const settlements = useMemo(() => {
    if (!employee) return [];
    return getWeeklySettlements()
      .filter((s) => s.employeeId === employee.id)
      .sort((a, b) => (b.weekStart || '').localeCompare(a.weekStart || ''));
  }, [employee, getWeeklySettlements]);

  // Recent activity (last 10 combined catch + expenses)
  const recentActivity = useMemo(() => {
    if (!weeklySummary) return [];
    const catchItems = (weeklySummary.catchEntries || []).map((c) => ({
      type: 'catch',
      date: c.date,
      createdAt: c.createdAt,
      description: `${getVarietyName(c.fishVarietyId)} — ${c.weightKg} kg`,
      value: c.value,
      status: c.status,
    }));
    const expenseItems = (weeklySummary.expenses || []).map((e) => ({
      type: 'expense',
      date: e.date,
      createdAt: e.createdAt,
      description: `${getCategoryInfo(e.category).label}`,
      value: -e.amount,
    }));
    return [...catchItems, ...expenseItems]
      .sort((a, b) => (b.createdAt || b.date || '').localeCompare(a.createdAt || a.date || ''))
      .slice(0, 10);
  }, [weeklySummary, fishVarieties]);

  function getVarietyName(varietyId) {
    const v = fishVarieties.find((f) => f.id === varietyId);
    return v ? v.name : 'Unknown';
  }

  // 404 state
  if (!employee) {
    return (
      <div className="min-h-screen bg-brand-ivory flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <Anchor className="w-8 h-8 text-gray-300" />
          </div>
          <h2 className="text-xl font-display font-semibold text-brand-dark">
            Employee not found
          </h2>
          <p className="text-sm text-brand-gray mt-2">
            The employee you&apos;re looking for doesn&apos;t exist.
          </p>
          <button
            onClick={() => navigate('/employees')}
            className="mt-4 px-5 py-2.5 bg-brand-teal text-white text-sm font-semibold rounded-xl
              hover:bg-brand-teal-light transition-all-custom cursor-pointer"
          >
            Back to Employees
          </button>
        </div>
      </div>
    );
  }

  const avatarColor = getAvatarColor(employee.name);
  const initials = getInitials(employee.name);

  return (
    <div className="min-h-screen bg-brand-ivory">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back button */}
        <button
          onClick={() => navigate('/employees')}
          className="inline-flex items-center gap-2 text-sm text-brand-gray hover:text-brand-teal
            font-medium mb-6 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Employees
        </button>

        {/* ─── Profile Header ─────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-5">
            {/* Avatar */}
            <div
              className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center shrink-0
                ${avatarColor.bg} ${avatarColor.text} text-2xl sm:text-3xl font-bold font-display
                ring-4 ring-white shadow-md`}
            >
              {initials}
            </div>

            {/* Details */}
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-brand-dark font-display tracking-tight">
                {employee.name}
              </h1>
              <div className="flex flex-wrap items-center gap-x-5 gap-y-1 mt-2">
                <span className="inline-flex items-center gap-1.5 text-sm text-brand-gray">
                  <CreditCard className="w-3.5 h-3.5" />
                  {employee.nic}
                </span>
                {employee.phone && (
                  <span className="inline-flex items-center gap-1.5 text-sm text-brand-gray">
                    <Phone className="w-3.5 h-3.5" />
                    {employee.phone}
                  </span>
                )}
                {employee.createdAt && (
                  <span className="inline-flex items-center gap-1.5 text-sm text-brand-gray">
                    <CalendarDays className="w-3.5 h-3.5" />
                    Joined {formatDate(employee.createdAt)}
                  </span>
                )}
              </div>
            </div>

            {/* Edit Profile Button */}
            <div className="sm:ml-auto shrink-0 self-start sm:self-center">
              <button
                onClick={() => setShowEditModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-teal text-white text-xs
                  font-semibold rounded-xl hover:bg-brand-teal-light active:bg-brand-teal-dark
                  shadow-sm hover:shadow-md active:scale-[0.98] transition-all-custom cursor-pointer"
              >
                <Edit className="w-3.5 h-3.5" />
                Edit Profile
              </button>
            </div>
          </div>
        </div>

        {/* ─── Tab Navigation ─────────────────────────────────────── */}
        <div className="flex gap-1 bg-white rounded-xl p-1 border border-gray-100 shadow-sm mb-6 overflow-x-auto">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium
                  whitespace-nowrap transition-all-custom cursor-pointer ${
                    isActive
                      ? 'bg-brand-teal text-white shadow-sm'
                      : 'text-brand-gray hover:text-brand-dark hover:bg-gray-50'
                  }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* ─── Tab Content ────────────────────────────────────────── */}
        {activeTab === 'overview' && (
          <OverviewTab
            summary={weeklySummary}
            weekRange={weekRange}
            recentActivity={recentActivity}
          />
        )}
        {activeTab === 'catch' && (
          <CatchHistoryTab
            entries={filteredCatchEntries}
            getVarietyName={getVarietyName}
            catchDateFrom={catchDateFrom}
            catchDateTo={catchDateTo}
            onDateFromChange={setCatchDateFrom}
            onDateToChange={setCatchDateTo}
          />
        )}
        {activeTab === 'expenses' && <ExpensesTab expenses={allExpenses} />}
        {activeTab === 'invoices' && <InvoicesTab settlements={settlements} />}
      </div>

      <EditEmployeeModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        employee={employee}
        onUpdate={(empId, updates) => {
          updateEmployee(empId, updates);
          toast.success('Employee profile updated successfully!');
        }}
      />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// OVERVIEW TAB
// ═══════════════════════════════════════════════════════════════════
function OverviewTab({ summary, weekRange, recentActivity }) {
  if (!summary) return null;

  const summaryCards = [
    {
      label: 'Total Catch',
      value: `${summary.totalWeightKg.toFixed(1)} kg`,
      icon: Scale,
      color: 'bg-sky-50 text-sky-600',
      iconBg: 'bg-sky-100',
    },
    {
      label: 'Total Income',
      value: formatCurrency(summary.totalIncome),
      icon: TrendingUp,
      color: 'bg-emerald-50 text-emerald-600',
      iconBg: 'bg-emerald-100',
    },
    {
      label: 'Total Expenses',
      value: formatCurrency(summary.totalExpenses),
      icon: TrendingDown,
      color: 'bg-red-50 text-red-500',
      iconBg: 'bg-red-100',
    },
    {
      label: 'Net Balance',
      value: formatCurrency(summary.netBalance),
      icon: DollarSign,
      color: summary.netBalance >= 0
        ? 'bg-emerald-50 text-emerald-600'
        : 'bg-red-50 text-red-500',
      iconBg: summary.netBalance >= 0 ? 'bg-emerald-100' : 'bg-red-100',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Week label */}
      <div className="flex items-center gap-2 text-sm text-brand-gray">
        <CalendarDays className="w-4 h-4" />
        Current Week: {weekRange.startDisplay} – {weekRange.endDisplay}
        {summary.hasPending && (
          <span className="ml-2 px-2 py-0.5 text-[11px] font-medium bg-amber-50 text-amber-600 rounded-full">
            Has pending prices
          </span>
        )}
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5"
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${card.iconBg}`}>
                <Icon className={`w-5 h-5 ${card.color.split(' ')[1]}`} />
              </div>
              <p className="text-[11px] font-medium text-brand-gray uppercase tracking-wider">
                {card.label}
              </p>
              <p className={`text-xl font-bold font-display mt-1 ${card.color.split(' ')[1]}`}>
                {card.value}
              </p>
            </div>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
          <Clock className="w-4 h-4 text-brand-gray" />
          <h3 className="text-base font-display font-semibold text-brand-dark">
            Recent Activity
          </h3>
          <span className="text-xs text-brand-gray ml-auto">This week</span>
        </div>

        {recentActivity.length > 0 ? (
          <div className="divide-y divide-gray-50">
            {recentActivity.map((item, idx) => (
              <div
                key={idx}
                className="px-6 py-3.5 flex items-center gap-4 hover:bg-gray-50/50 transition-colors"
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    item.type === 'catch'
                      ? 'bg-sky-50 text-sky-500'
                      : 'bg-red-50 text-red-400'
                  }`}
                >
                  {item.type === 'catch' ? (
                    <Fish className="w-4 h-4" />
                  ) : (
                    <Receipt className="w-4 h-4" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-brand-dark font-medium truncate">
                    {item.description}
                  </p>
                  <p className="text-xs text-brand-gray mt-0.5">
                    {formatShortDate(item.date)}
                  </p>
                </div>
                <span
                  className={`text-sm font-semibold whitespace-nowrap ${
                    item.value != null && item.value >= 0
                      ? 'text-emerald-600'
                      : 'text-red-500'
                  }`}
                >
                  {item.value != null
                    ? item.value >= 0
                      ? `+${formatCurrency(item.value)}`
                      : `-${formatCurrency(Math.abs(item.value))}`
                    : 'Pending'}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center">
            <p className="text-sm text-brand-gray">No activity this week</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// CATCH HISTORY TAB
// ═══════════════════════════════════════════════════════════════════
function CatchHistoryTab({
  entries,
  getVarietyName,
  catchDateFrom,
  catchDateTo,
  onDateFromChange,
  onDateToChange,
}) {
  return (
    <div className="space-y-4">
      {/* Date range filter */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex items-center gap-2 text-sm text-brand-gray">
            <Filter className="w-4 h-4" />
            <span className="font-medium">Filter</span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={catchDateFrom}
              onChange={(e) => onDateFromChange(e.target.value)}
              className="px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm text-brand-dark
                focus:outline-none focus:ring-2 focus:ring-brand-teal/20 focus:border-brand-teal
                transition-all-custom"
              placeholder="From"
            />
            <span className="text-brand-gray text-sm">to</span>
            <input
              type="date"
              value={catchDateTo}
              onChange={(e) => onDateToChange(e.target.value)}
              className="px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm text-brand-dark
                focus:outline-none focus:ring-2 focus:ring-brand-teal/20 focus:border-brand-teal
                transition-all-custom"
              placeholder="To"
            />
          </div>
          {(catchDateFrom || catchDateTo) && (
            <button
              onClick={() => { onDateFromChange(''); onDateToChange(''); }}
              className="text-xs text-brand-teal hover:text-brand-teal-light font-medium cursor-pointer
                transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {entries.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-brand-gray uppercase tracking-wider">
                    Date
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-brand-gray uppercase tracking-wider">
                    Fish Variety
                  </th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-brand-gray uppercase tracking-wider">
                    Weight (kg)
                  </th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-brand-gray uppercase tracking-wider">
                    Price/kg
                  </th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-brand-gray uppercase tracking-wider">
                    Value
                  </th>
                  <th className="text-center px-5 py-3 text-xs font-semibold text-brand-gray uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {entries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-3.5 text-brand-dark font-medium whitespace-nowrap">
                      {formatShortDate(entry.date)}
                    </td>
                    <td className="px-5 py-3.5 text-brand-dark">
                      {getVarietyName(entry.fishVarietyId)}
                    </td>
                    <td className="px-5 py-3.5 text-right text-brand-dark font-medium tabular-nums">
                      {entry.weightKg.toFixed(1)}
                    </td>
                    <td className="px-5 py-3.5 text-right text-brand-gray tabular-nums">
                      {entry.pricePerKg != null ? `Rs ${entry.pricePerKg}` : '—'}
                    </td>
                    <td className="px-5 py-3.5 text-right font-semibold text-brand-dark tabular-nums">
                      {entry.value != null ? formatCurrency(entry.value) : '—'}
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <StatusBadge status={entry.status} size="sm" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-12 text-center">
            <Fish className="w-10 h-10 text-gray-200 mx-auto mb-3" />
            <p className="text-sm text-brand-gray">No catch entries found</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// EXPENSES TAB
// ═══════════════════════════════════════════════════════════════════
function ExpensesTab({ expenses }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {expenses.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left px-5 py-3 text-xs font-semibold text-brand-gray uppercase tracking-wider">
                  Date
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-brand-gray uppercase tracking-wider">
                  Category
                </th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-brand-gray uppercase tracking-wider">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {expenses.map((exp) => {
                const cat = getCategoryInfo(exp.category);
                return (
                  <tr key={exp.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-3.5 text-brand-dark font-medium whitespace-nowrap">
                      {formatShortDate(exp.date)}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center gap-2 text-brand-dark">
                        <span className="text-base">{cat.icon}</span>
                        {cat.label}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right font-semibold text-red-500 tabular-nums">
                      {formatCurrency(exp.amount)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="py-12 text-center">
          <Receipt className="w-10 h-10 text-gray-200 mx-auto mb-3" />
          <p className="text-sm text-brand-gray">No expenses recorded</p>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// INVOICES TAB
// ═══════════════════════════════════════════════════════════════════
function InvoicesTab({ settlements }) {
  return (
    <div className="space-y-4">
      {settlements.length > 0 ? (
        settlements.map((s) => {
          const income = s.totalIncome || 0;
          const expenses = s.totalExpenses || 0;
          const payable = income - expenses;
          return (
            <div
              key={s.id}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-all-custom"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="w-4 h-4 text-brand-gray" />
                    <span className="text-sm font-semibold text-brand-dark font-display">
                      {formatShortDate(s.weekStart)} – {formatShortDate(s.weekEnd)}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-brand-gray">
                    <span>Income: <span className="font-medium text-emerald-600">{formatCurrency(income)}</span></span>
                    <span>Expenses: <span className="font-medium text-red-500">{formatCurrency(expenses)}</span></span>
                    <span>
                      Payable:{' '}
                      <span className={`font-semibold ${payable >= 0 ? 'text-brand-dark' : 'text-red-500'}`}>
                        {formatCurrency(payable)}
                      </span>
                    </span>
                  </div>
                </div>

                <div>
                  <StatusBadge status={s.settled ? 'settled' : 'pending'} />
                </div>
              </div>
            </div>
          );
        })
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm py-12 text-center">
          <Wallet className="w-10 h-10 text-gray-200 mx-auto mb-3" />
          <p className="text-sm text-brand-gray">No settlements found</p>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// EDIT EMPLOYEE MODAL
// ═══════════════════════════════════════════════════════════════════
const NIC_REGEX = /^(\d{9}[VvXx]|\d{12})$/;

function EditEmployeeModal({ isOpen, onClose, employee, onUpdate }) {
  const { employees } = useData();
  const [name, setName] = useState('');
  const [nic, setNic] = useState('');
  const [phone, setPhone] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (employee) {
      setName(employee.name || '');
      setNic(employee.nic || '');
      setPhone(employee.phone || '');
      setErrors({});
    }
  }, [employee, isOpen]);

  const validate = () => {
    const newErrors = {};

    if (!name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!nic.trim()) {
      newErrors.nic = 'NIC number is required';
    } else if (!NIC_REGEX.test(nic.trim())) {
      newErrors.nic = 'Invalid NIC format (9 digits + V/X or 12 digits)';
    } else {
      // Duplicate NIC check excluding current employee
      const normalizedNic = nic.trim().toUpperCase();
      const exists = employees.some(
        (emp) => emp.id !== employee?.id && emp.nic.toUpperCase() === normalizedNic
      );
      if (exists) {
        newErrors.nic = 'An employee with this NIC already exists';
      }
    }

    if (!phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      onUpdate(employee.id, {
        name: name.trim(),
        nic: nic.trim().toUpperCase(),
        phone: phone.trim(),
      });
      setIsSubmitting(false);
      onClose();
    }, 400);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Employee Profile">
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Name */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-brand-dark/85 tracking-wide block">
            Full Name
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-gray/50 pointer-events-none" />
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors(prev => ({ ...prev, name: '' }));
              }}
              placeholder="e.g. Mohamed Rizwan"
              className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm text-brand-dark
                bg-white placeholder:text-brand-gray/50
                focus:outline-none focus:ring-2 focus:ring-brand-teal/20 focus:border-brand-teal
                transition-all-custom ${
                  errors.name ? 'border-red-300 focus:ring-red-200/50 focus:border-red-400' : 'border-gray-200'
                }`}
              disabled={isSubmitting}
            />
          </div>
          {errors.name && (
            <p className="text-xs text-red-500 mt-1">{errors.name}</p>
          )}
        </div>

        {/* NIC */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-brand-dark/85 tracking-wide block">
            NIC Number
          </label>
          <div className="relative">
            <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-gray/50 pointer-events-none" />
            <input
              type="text"
              value={nic}
              onChange={(e) => {
                setNic(e.target.value);
                if (errors.nic) setErrors(prev => ({ ...prev, nic: '' }));
              }}
              placeholder="e.g. 199912345678 or 912345678V"
              className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm text-brand-dark
                bg-white placeholder:text-brand-gray/50
                focus:outline-none focus:ring-2 focus:ring-brand-teal/20 focus:border-brand-teal
                transition-all-custom ${
                  errors.nic ? 'border-red-300 focus:ring-red-200/50 focus:border-red-400' : 'border-gray-200'
                }`}
              disabled={isSubmitting}
            />
          </div>
          {errors.nic && (
            <p className="text-xs text-red-500 mt-1">{errors.nic}</p>
          )}
        </div>

        {/* Phone */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-brand-dark/85 tracking-wide block">
            Phone Number
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-gray/50 pointer-events-none" />
            <input
              type="tel"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                if (errors.phone) setErrors(prev => ({ ...prev, phone: '' }));
              }}
              placeholder="e.g. 077 1234567"
              className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm text-brand-dark
                bg-white placeholder:text-brand-gray/50
                focus:outline-none focus:ring-2 focus:ring-brand-teal/20 focus:border-brand-teal
                transition-all-custom ${
                  errors.phone ? 'border-red-300 focus:ring-red-200/50 focus:border-red-400' : 'border-gray-200'
                }`}
              disabled={isSubmitting}
            />
          </div>
          {errors.phone && (
            <p className="text-xs text-red-500 mt-1">{errors.phone}</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 text-sm font-medium text-brand-gray bg-white border border-gray-200
              rounded-xl hover:bg-gray-50 hover:text-brand-dark transition-all-custom cursor-pointer"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2.5 text-sm font-semibold text-white bg-brand-teal rounded-xl
              hover:bg-brand-teal-light active:bg-brand-teal-dark shadow-sm hover:shadow-md
              active:scale-[0.98] transition-all-custom cursor-pointer
              disabled:opacity-60 disabled:cursor-not-allowed
              flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
