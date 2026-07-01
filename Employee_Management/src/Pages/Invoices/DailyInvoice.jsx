import { useState, useMemo } from 'react';
import { format, parseISO } from 'date-fns';
import {
  Printer, FileText, Users, User, ChevronDown, Package,
  DollarSign, TrendingUp, TrendingDown, Scale,
} from 'lucide-react';
import { useData } from '../../context/DataContext.jsx';
import { EXPENSE_CATEGORIES, CATCH_STATUS, INVOICE_STATUS } from '../../data/constants.js';
import DatePicker from '../../components/UI/DatePicker.jsx';

// ─── Status Badge ─────────────────────────────────────────────
function StatusBadge({ status }) {
  const isFinalized = status === INVOICE_STATUS.FINALIZED;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
        isFinalized
          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
          : 'bg-amber-50 text-amber-700 border border-amber-200'
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${isFinalized ? 'bg-emerald-500' : 'bg-amber-500'}`} />
      {isFinalized ? 'Finalized' : 'Provisional'}
    </span>
  );
}

// ─── Empty State ──────────────────────────────────────────────
function EmptyState({ message }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
        <Package className="w-8 h-8 text-slate-300" />
      </div>
      <h3 className="text-base font-display font-semibold text-brand-dark mb-1">No Data</h3>
      <p className="text-sm text-brand-gray max-w-xs">{message}</p>
    </div>
  );
}

// ─── Single Employee Invoice Card ─────────────────────────────
function EmployeeInvoiceCard({ employee, catches, expenses, fishVarieties, date }) {
  const getCategoryLabel = (catId) => {
    const cat = EXPENSE_CATEGORIES.find((c) => c.id === catId);
    return cat ? `${cat.icon} ${cat.label}` : catId;
  };

  const getVarietyName = (varId) => {
    const v = fishVarieties.find((fv) => fv.id === varId);
    return v ? v.name : 'Unknown';
  };

  // Determine invoice status
  const allPriced = catches.length > 0 && catches.every((c) => c.status === CATCH_STATUS.PRICED);
  const invoiceStatus = allPriced ? INVOICE_STATUS.FINALIZED : INVOICE_STATUS.PROVISIONAL;

  const totalIncome = catches
    .filter((c) => c.status === CATCH_STATUS.PRICED)
    .reduce((sum, c) => sum + (c.value || 0), 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const netBalance = totalIncome - totalExpenses;

  return (
    <div className="print-area bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-6 print:mb-0 print:break-inside-avoid print:shadow-none print:rounded-none print:border-black">
      {/* Header */}
      <div className="bg-gradient-to-r from-brand-teal to-brand-teal-dark text-white px-6 py-5 print:bg-white print:text-black print:border-b-2 print:border-black">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-white/15 flex items-center justify-center text-lg font-bold font-display print:bg-gray-200 print:text-black">
              {employee.name.charAt(0)}
            </div>
            <div>
              <h3 className="text-lg font-display font-bold">{employee.name}</h3>
              <p className="text-xs opacity-70">NIC: {employee.nic || 'N/A'}</p>
            </div>
          </div>
          <div className="text-right flex flex-col items-end gap-2">
            <p className="text-sm font-semibold">{format(parseISO(date), 'MMM dd, yyyy')}</p>
            <StatusBadge status={invoiceStatus} />
          </div>
        </div>
      </div>

      <div className="px-6 py-5 space-y-5">
        {/* Catch Table */}
        {catches.length > 0 && (
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-brand-dark/50 mb-2.5 flex items-center gap-1.5">
              <Scale className="w-3.5 h-3.5" />
              Catch Entries
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-gray-100">
                    <th className="text-left py-2 text-xs font-bold text-brand-dark/50 uppercase">Variety</th>
                    <th className="text-right py-2 text-xs font-bold text-brand-dark/50 uppercase">Weight</th>
                    <th className="text-right py-2 text-xs font-bold text-brand-dark/50 uppercase">Price/kg</th>
                    <th className="text-right py-2 text-xs font-bold text-brand-dark/50 uppercase">Value</th>
                  </tr>
                </thead>
                <tbody>
                  {catches.map((c) => (
                    <tr key={c.id} className="border-b border-gray-50 last:border-b-0">
                      <td className="py-2.5 font-medium text-brand-dark">
                        {getVarietyName(c.fishVarietyId)}
                      </td>
                      <td className="py-2.5 text-right font-mono text-brand-dark">
                        {c.weightKg.toFixed(1)} kg
                      </td>
                      <td className="py-2.5 text-right font-mono">
                        {c.status === CATCH_STATUS.PRICED ? (
                          <span className="text-brand-dark">Rs. {c.pricePerKg?.toFixed(2)}</span>
                        ) : (
                          <span className="text-amber-600 text-xs font-bold">Pending</span>
                        )}
                      </td>
                      <td className="py-2.5 text-right font-mono font-semibold">
                        {c.status === CATCH_STATUS.PRICED ? (
                          <span className="text-emerald-700">Rs. {c.value?.toFixed(2)}</span>
                        ) : (
                          <span className="text-amber-600 text-xs font-bold">Pending</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Expenses Table */}
        {expenses.length > 0 && (
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-brand-dark/50 mb-2.5 flex items-center gap-1.5">
              <TrendingDown className="w-3.5 h-3.5" />
              Expenses
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-gray-100">
                    <th className="text-left py-2 text-xs font-bold text-brand-dark/50 uppercase">Category</th>
                    <th className="text-right py-2 text-xs font-bold text-brand-dark/50 uppercase">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.map((e) => (
                    <tr key={e.id} className="border-b border-gray-50 last:border-b-0">
                      <td className="py-2.5 text-brand-dark">{getCategoryLabel(e.category)}</td>
                      <td className="py-2.5 text-right font-mono font-semibold text-red-600">
                        Rs. {e.amount.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {catches.length === 0 && expenses.length === 0 && (
          <p className="text-sm text-brand-gray text-center py-4">No catch or expense entries for this employee today.</p>
        )}

        {/* Summary */}
        <div className="bg-slate-50 rounded-xl p-4 space-y-2.5 border border-gray-100">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-1.5 text-brand-gray">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              Total Income
            </span>
            <span className="font-bold font-mono text-emerald-700">
              Rs. {totalIncome.toFixed(2)}
              {!allPriced && catches.length > 0 && (
                <span className="text-[10px] text-amber-600 ml-1 font-sans font-normal">(partial)</span>
              )}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-1.5 text-brand-gray">
              <TrendingDown className="w-4 h-4 text-red-500" />
              Total Expenses
            </span>
            <span className="font-bold font-mono text-red-600">Rs. {totalExpenses.toFixed(2)}</span>
          </div>
          <div className="border-t border-gray-200 pt-2.5 flex items-center justify-between">
            <span className="text-sm font-bold text-brand-dark">Net Balance</span>
            <span
              className={`text-lg font-display font-extrabold ${
                netBalance >= 0 ? 'text-emerald-700' : 'text-red-600'
              }`}
            >
              Rs. {netBalance.toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// DAILY INVOICE PAGE
// ═══════════════════════════════════════════════════════════════
export default function DailyInvoice() {
  const {
    employees,
    fishVarieties,
    getCatchEntriesByDate,
    getExpensesByDate,
    refreshKey,
  } = useData();

  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [bulkMode, setBulkMode] = useState(false);

  // Get all catch and expense entries for the date
  const allCatches = useMemo(
    () => (selectedDate ? getCatchEntriesByDate(selectedDate) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectedDate, refreshKey]
  );

  const allExpenses = useMemo(
    () => (selectedDate ? getExpensesByDate(selectedDate) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectedDate, refreshKey]
  );

  // Employees who have data for this date
  const activeEmployeeIds = useMemo(() => {
    const ids = new Set();
    allCatches.forEach((c) => ids.add(c.employeeId));
    allExpenses.forEach((e) => ids.add(e.employeeId));
    return [...ids];
  }, [allCatches, allExpenses]);

  const activeEmployees = useMemo(
    () => employees.filter((e) => activeEmployeeIds.includes(e.id)),
    [employees, activeEmployeeIds]
  );

  // Filter data based on selection
  const displayEmployees = useMemo(() => {
    if (bulkMode) return activeEmployees;
    if (selectedEmployeeId) {
      const emp = employees.find((e) => e.id === selectedEmployeeId);
      return emp ? [emp] : [];
    }
    return [];
  }, [bulkMode, selectedEmployeeId, activeEmployees, employees]);

  const handlePrint = () => window.print();

  const handleGenerateAll = () => {
    setBulkMode(true);
    setSelectedEmployeeId('');
  };

  const handleEmployeeSelect = (empId) => {
    setSelectedEmployeeId(empId);
    setBulkMode(false);
  };

  return (
    <div className="min-h-screen bg-brand-ivory">
      {/* Print Styles */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .print-zone, .print-zone * { visibility: visible; }
          .print-zone { position: absolute; left: 0; top: 0; width: 100%; padding: 20px; }
          .print\\:hidden { display: none !important; }
          .print-area { page-break-inside: avoid; margin-bottom: 20px; }
        }
      `}</style>

      {/* Controls */}
      <div className="print:hidden max-w-4xl mx-auto px-4 sm:px-6 py-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
          {/* Header */}
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h1 className="text-xl font-display font-bold text-brand-dark">Daily Invoice</h1>
              <p className="text-xs text-brand-gray">Employee daily catch & expense summary</p>
            </div>
          </div>

          {/* Date + Employee selectors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <DatePicker
              value={selectedDate}
              onChange={(d) => {
                setSelectedDate(d);
                setSelectedEmployeeId('');
                setBulkMode(false);
              }}
              label="Date"
            />

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-brand-dark">Employee</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-gray pointer-events-none" />
                <select
                  value={selectedEmployeeId}
                  onChange={(e) => handleEmployeeSelect(e.target.value)}
                  className="w-full pl-9 pr-8 py-2 rounded-xl border border-gray-200 bg-white text-sm text-brand-dark
                    focus:outline-none focus:ring-2 focus:ring-brand-teal/20 focus:border-brand-teal
                    transition-all-custom appearance-none cursor-pointer"
                >
                  <option value="">Select employee...</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} {activeEmployeeIds.includes(emp.id) ? '' : '(no data)'}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-gray pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={handleGenerateAll}
              disabled={activeEmployees.length === 0}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-teal text-white text-sm font-semibold
                hover:bg-brand-teal-light active:scale-[0.98] transition-all-custom shadow-md hover:shadow-lg
                disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <Users className="w-4 h-4" />
              Generate All ({activeEmployees.length})
            </button>

            {displayEmployees.length > 0 && (
              <button
                type="button"
                onClick={handlePrint}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-brand-dark text-sm font-semibold
                  hover:bg-slate-50 active:scale-[0.98] transition-all-custom cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                Print
              </button>
            )}
          </div>

          {bulkMode && (
            <p className="text-xs text-brand-teal bg-brand-teal/5 border border-brand-teal/10 rounded-lg px-3 py-2">
              Showing all {activeEmployees.length} employees with data for{' '}
              {format(parseISO(selectedDate), 'MMM dd, yyyy')}.
            </p>
          )}
        </div>
      </div>

      {/* Invoice Display */}
      <div className="print-zone max-w-4xl mx-auto px-4 sm:px-6 pb-10">
        {displayEmployees.length > 0 ? (
          displayEmployees.map((emp) => {
            const empCatches = allCatches.filter((c) => c.employeeId === emp.id);
            const empExpenses = allExpenses.filter((e) => e.employeeId === emp.id);
            return (
              <EmployeeInvoiceCard
                key={emp.id}
                employee={emp}
                catches={empCatches}
                expenses={empExpenses}
                fishVarieties={fishVarieties}
                date={selectedDate}
              />
            );
          })
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm print:hidden">
            <EmptyState
              message={
                selectedDate
                  ? 'Select an employee or click "Generate All" to view daily invoices.'
                  : 'Select a date to get started.'
              }
            />
          </div>
        )}
      </div>
    </div>
  );
}
