import { useState, useMemo } from 'react';
import {
  format, parseISO, startOfWeek, endOfWeek, addWeeks, subWeeks, eachDayOfInterval,
} from 'date-fns';
import {
  ChevronLeft, ChevronRight, Printer, CheckCircle2, XCircle,
  Scale, TrendingUp, TrendingDown, DollarSign, Users, Calendar,
} from 'lucide-react';
import { useData } from '../../context/DataContext.jsx';
import { EXPENSE_CATEGORIES, SETTLEMENT_STATUS, CATCH_STATUS } from '../../data/constants.js';

// ─── Status Badge ─────────────────────────────────────────────
function SettlementBadge({ settled }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
        settled
          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
          : 'bg-amber-50 text-amber-700 border border-amber-200'
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${settled ? 'bg-emerald-500' : 'bg-amber-500'}`} />
      {settled ? 'Settled' : 'Pending'}
    </span>
  );
}

// ─── Settlement Card ──────────────────────────────────────────
function SettlementCard({
  employee,
  summary,
  settlement,
  fishVarieties,
  onSettle,
  onUnsettle,
  weekStart,
  weekEnd,
}) {
  const isSettled = settlement?.settled;

  // Group catches by variety
  const catchByVariety = useMemo(() => {
    const grouped = {};
    (summary.catchEntries || []).forEach((c) => {
      if (!grouped[c.fishVarietyId]) {
        const v = fishVarieties.find((fv) => fv.id === c.fishVarietyId);
        grouped[c.fishVarietyId] = {
          name: v ? v.name : 'Unknown',
          totalKg: 0,
          totalValue: 0,
          hasPending: false,
        };
      }
      grouped[c.fishVarietyId].totalKg += c.weightKg;
      if (c.status === CATCH_STATUS.PRICED) {
        grouped[c.fishVarietyId].totalValue += c.value || 0;
      } else {
        grouped[c.fishVarietyId].hasPending = true;
      }
    });
    return Object.values(grouped);
  }, [summary.catchEntries, fishVarieties]);

  // Group expenses by category
  const expensesByCategory = useMemo(() => {
    const grouped = {};
    (summary.expenses || []).forEach((e) => {
      if (!grouped[e.category]) {
        const cat = EXPENSE_CATEGORIES.find((c) => c.id === e.category);
        grouped[e.category] = {
          icon: cat?.icon || '📦',
          label: cat?.label || e.category,
          total: 0,
        };
      }
      grouped[e.category].total += e.amount;
    });
    return Object.values(grouped);
  }, [summary.expenses]);

  return (
    <div className="print-card bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden print:shadow-none print:rounded-none print:border-black print:break-inside-avoid print:mb-4">
      {/* Card Header */}
      <div className="px-6 py-4 bg-gradient-to-r from-slate-50 to-white border-b border-gray-100 print:bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-brand-teal/10 flex items-center justify-center text-xl font-bold font-display text-brand-teal">
              {employee.name.charAt(0)}
            </div>
            <div>
              <h3 className="text-lg font-display font-bold text-brand-dark">{employee.name}</h3>
              <p className="text-xs text-brand-gray">NIC: {employee.nic || 'N/A'}</p>
            </div>
          </div>
          <SettlementBadge settled={isSettled} />
        </div>
      </div>

      <div className="px-6 py-5 space-y-5">
        {/* Catch Breakdown */}
        {catchByVariety.length > 0 && (
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-brand-dark/50 mb-3 flex items-center gap-1.5">
              <Scale className="w-3.5 h-3.5" />
              Catch Summary
            </h4>
            <div className="space-y-1.5">
              {catchByVariety.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between py-2 px-3 rounded-lg bg-slate-50/80 hover:bg-slate-50 transition-colors"
                >
                  <span className="text-sm font-medium text-brand-dark">{item.name}</span>
                  <div className="flex items-center gap-4 text-sm font-mono">
                    <span className="text-brand-gray">{item.totalKg.toFixed(1)} kg</span>
                    <span className="font-semibold text-emerald-700 min-w-[90px] text-right">
                      {item.hasPending ? (
                        <span className="text-amber-600 text-xs font-sans font-bold">Partial</span>
                      ) : (
                        `Rs. ${item.totalValue.toFixed(0)}`
                      )}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Expense Breakdown */}
        {expensesByCategory.length > 0 && (
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-brand-dark/50 mb-3 flex items-center gap-1.5">
              <TrendingDown className="w-3.5 h-3.5" />
              Expense Summary
            </h4>
            <div className="space-y-1.5">
              {expensesByCategory.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between py-2 px-3 rounded-lg bg-red-50/50 hover:bg-red-50 transition-colors"
                >
                  <span className="text-sm text-brand-dark flex items-center gap-2">
                    <span className="text-base">{item.icon}</span>
                    {item.label}
                  </span>
                  <span className="text-sm font-mono font-semibold text-red-600">
                    Rs. {item.total.toFixed(0)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {catchByVariety.length === 0 && expensesByCategory.length === 0 && (
          <p className="text-sm text-brand-gray text-center py-6">
            No catch or expense data for this week.
          </p>
        )}

        {/* Summary Footer */}
        <div className="bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-xl p-4 space-y-2.5 border border-gray-100">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-1.5 text-brand-gray">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              Total Income
            </span>
            <span className="font-bold font-mono text-emerald-700">
              Rs. {summary.totalIncome.toFixed(0)}
              {summary.hasPending && (
                <span className="text-[10px] text-amber-600 ml-1 font-sans font-normal">(partial)</span>
              )}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-1.5 text-brand-gray">
              <TrendingDown className="w-4 h-4 text-red-500" />
              Total Expenses
            </span>
            <span className="font-bold font-mono text-red-600">Rs. {summary.totalExpenses.toFixed(0)}</span>
          </div>
          <div className="border-t border-gray-200 pt-3 flex items-center justify-between">
            <span className="text-sm font-bold text-brand-dark flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-brand-teal" />
              Net Payable
            </span>
            <span
              className={`text-xl font-display font-extrabold ${
                summary.netBalance >= 0 ? 'text-emerald-700' : 'text-red-600'
              }`}
            >
              Rs. {summary.netBalance.toFixed(0)}
            </span>
          </div>
        </div>

        {/* Settle / Unsettle */}
        <div className="flex items-center justify-end gap-2 print:hidden">
          {isSettled ? (
            <button
              type="button"
              onClick={() => onUnsettle(settlement.id)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-amber-200 text-amber-700 text-sm font-semibold
                hover:bg-amber-50 active:scale-[0.98] transition-all-custom cursor-pointer"
            >
              <XCircle className="w-4 h-4" />
              Unsettle
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onSettle(employee.id)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-semibold
                hover:bg-emerald-700 active:scale-[0.98] transition-all-custom shadow-md cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              Settle
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// WEEKLY SETTLEMENT PAGE
// ═══════════════════════════════════════════════════════════════
export default function WeeklySettlement() {
  const {
    employees,
    fishVarieties,
    getEmployeeWeeklySummary,
    getWeeklySettlement,
    getWeeklySettlements,
    addWeeklySettlement,
    settleWeek,
    unsettleWeek,
    refreshKey,
  } = useData();

  // Current week reference (Saturday start)
  const [weekOffset, setWeekOffset] = useState(0);

  const weekStart = useMemo(() => {
    const base = startOfWeek(new Date(), { weekStartsOn: 6 });
    return addWeeks(base, weekOffset);
  }, [weekOffset]);

  const weekEnd = useMemo(() => endOfWeek(weekStart, { weekStartsOn: 6 }), [weekStart]);

  const weekStartStr = format(weekStart, 'yyyy-MM-dd');
  const weekEndStr = format(weekEnd, 'yyyy-MM-dd');

  // Get all days in the week
  const weekDays = useMemo(() => eachDayOfInterval({ start: weekStart, end: weekEnd }), [weekStart, weekEnd]);

  // Build data for each employee
  const employeeData = useMemo(() => {
    return employees.map((emp) => {
      const summary = getEmployeeWeeklySummary(emp.id, weekStartStr, weekEndStr);
      const settlement = getWeeklySettlement(emp.id, weekStartStr);
      return { employee: emp, summary, settlement };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [employees, weekStartStr, weekEndStr, refreshKey]);

  // Only show employees who have data OR existing settlements
  const activeEmployeeData = useMemo(
    () =>
      employeeData.filter(
        (d) =>
          d.summary.catchEntries.length > 0 ||
          d.summary.expenses.length > 0 ||
          d.settlement
      ),
    [employeeData]
  );

  const handleSettle = (employeeId) => {
    const existing = getWeeklySettlement(employeeId, weekStartStr);
    if (existing) {
      settleWeek(existing.id);
    } else {
      const summary = getEmployeeWeeklySummary(employeeId, weekStartStr, weekEndStr);
      const newSettlement = addWeeklySettlement({
        employeeId,
        weekStart: weekStartStr,
        weekEnd: weekEndStr,
        totalIncome: summary.totalIncome,
        totalExpenses: summary.totalExpenses,
        netBalance: summary.netBalance,
      });
      settleWeek(newSettlement.id);
    }
  };

  const handleUnsettle = (settlementId) => {
    unsettleWeek(settlementId);
  };

  const handleSettleAll = () => {
    activeEmployeeData.forEach((d) => {
      if (!d.settlement?.settled) {
        handleSettle(d.employee.id);
      }
    });
  };

  const handlePrint = () => window.print();

  const allSettled =
    activeEmployeeData.length > 0 && activeEmployeeData.every((d) => d.settlement?.settled);
  const settledCount = activeEmployeeData.filter((d) => d.settlement?.settled).length;

  return (
    <div className="min-h-screen bg-brand-ivory">
      {/* Print Styles */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .print-zone, .print-zone * { visibility: visible; }
          .print-zone { position: absolute; left: 0; top: 0; width: 100%; padding: 20px; }
          .print\\:hidden { display: none !important; }
          .print-card { page-break-inside: avoid; }
        }
      `}</style>

      {/* Controls */}
      <div className="print:hidden max-w-4xl mx-auto px-4 sm:px-6 py-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-violet-600" />
            </div>
            <div>
              <h1 className="text-xl font-display font-bold text-brand-dark">Weekly Settlement</h1>
              <p className="text-xs text-brand-gray">Employee weekly income, expenses & settlement</p>
            </div>
          </div>

          {/* Week Navigator */}
          <div className="flex items-center justify-between bg-slate-50 rounded-xl px-4 py-3 border border-gray-100">
            <button
              type="button"
              onClick={() => setWeekOffset((o) => o - 1)}
              className="p-2 rounded-lg hover:bg-white hover:shadow-sm transition-all-custom text-brand-gray hover:text-brand-dark cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="text-center">
              <p className="text-sm font-bold text-brand-dark font-display">
                {format(weekStart, 'MMM dd, yyyy')} — {format(weekEnd, 'MMM dd, yyyy')}
              </p>
              <p className="text-[11px] text-brand-gray mt-0.5">
                {weekDays.map((d) => format(d, 'EEE')).join(' · ')}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setWeekOffset((o) => o + 1)}
              className="p-2 rounded-lg hover:bg-white hover:shadow-sm transition-all-custom text-brand-gray hover:text-brand-dark cursor-pointer"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSettleAll}
                disabled={activeEmployeeData.length === 0 || allSettled}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-semibold
                  hover:bg-emerald-700 active:scale-[0.98] transition-all-custom shadow-md
                  disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                Settle All
              </button>

              <button
                type="button"
                onClick={handlePrint}
                disabled={activeEmployeeData.length === 0}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-brand-dark text-sm font-semibold
                  hover:bg-slate-50 active:scale-[0.98] transition-all-custom
                  disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                Print
              </button>
            </div>

            <div className="text-xs text-brand-gray flex items-center gap-2">
              <Users className="w-4 h-4" />
              {settledCount}/{activeEmployeeData.length} settled
            </div>
          </div>
        </div>
      </div>

      {/* Settlement Cards */}
      <div className="print-zone max-w-4xl mx-auto px-4 sm:px-6 pb-10">
        {/* Print header (hidden on screen) */}
        <div className="hidden print:block mb-6 text-center border-b-2 border-black pb-4">
          <h1 className="text-2xl font-bold">KDT SEA FOOD — Weekly Settlement</h1>
          <p className="text-sm">
            {format(weekStart, 'MMM dd, yyyy')} — {format(weekEnd, 'MMM dd, yyyy')}
          </p>
        </div>

        {activeEmployeeData.length > 0 ? (
          <div className="space-y-4">
            {activeEmployeeData.map(({ employee, summary, settlement }) => (
              <SettlementCard
                key={employee.id}
                employee={employee}
                summary={summary}
                settlement={settlement}
                fishVarieties={fishVarieties}
                weekStart={weekStartStr}
                weekEnd={weekEndStr}
                onSettle={handleSettle}
                onUnsettle={handleUnsettle}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm print:hidden">
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center mb-5">
                <Calendar className="w-9 h-9 text-slate-300" />
              </div>
              <h3 className="text-lg font-display font-semibold text-brand-dark mb-2">No Data This Week</h3>
              <p className="text-sm text-brand-gray max-w-xs">
                No catch or expense entries found for the selected week. Try a different week or record data first.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
