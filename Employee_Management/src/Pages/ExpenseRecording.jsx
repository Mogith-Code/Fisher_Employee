import { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { useData } from '../context/DataContext';
import { useToast } from '../components/UI/Toast';
import { EXPENSE_CATEGORIES } from '../data/constants';
import DatePicker from '../components/UI/DatePicker';
import { Plus, Trash2, User, Wallet, ChevronDown, PackageOpen, Receipt } from 'lucide-react';

/* ─── Inline EmptyState ───────────────────────────────────────── */
function EmptyState({ icon: Icon = PackageOpen, title, description }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
        <Icon className="w-7 h-7 text-brand-gray" />
      </div>
      <h3 className="text-lg font-display font-semibold text-brand-dark mb-1">{title}</h3>
      <p className="text-sm text-brand-gray max-w-sm">{description}</p>
    </div>
  );
}

/* ─── Category lookup helper ──────────────────────────────────── */
const categoryMap = {};
EXPENSE_CATEGORIES.forEach((cat) => (categoryMap[cat.id] = cat));

/* ═══════════════════════════════════════════════════════════════ */
export default function ExpenseRecording() {
  const {
    employees,
    addExpense,
    getExpensesByDate,
    deleteExpense,
    getEmployeeById,
    refreshKey,
  } = useData();

  const toast = useToast();
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  // ─── Form state ────────────────────────────────────────────
  const [employeeId, setEmployeeId] = useState('');
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState('');

  // ─── Expenses for selected date ────────────────────────────
  const expenses = useMemo(
    () => getExpensesByDate(selectedDate),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectedDate, refreshKey]
  );

  // ─── Grouped by employee ──────────────────────────────────
  const grouped = useMemo(() => {
    const map = {};
    expenses.forEach((expense) => {
      if (!map[expense.employeeId]) {
        const emp = getEmployeeById(expense.employeeId);
        map[expense.employeeId] = {
          employee: emp,
          entries: [],
          subtotal: 0,
        };
      }
      map[expense.employeeId].entries.push(expense);
      map[expense.employeeId].subtotal += expense.amount;
    });
    return Object.values(map);
  }, [expenses, getEmployeeById]);

  // ─── Grand total ──────────────────────────────────────────
  const grandTotal = useMemo(
    () => expenses.reduce((sum, e) => sum + e.amount, 0),
    [expenses]
  );

  // ─── Submit Handler ────────────────────────────────────────
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!employeeId || !category || !amount || parseFloat(amount) <= 0) {
      toast.error('Please fill in all fields with valid values.');
      return;
    }

    addExpense({
      employeeId,
      date: selectedDate,
      category,
      amount: parseFloat(amount),
    });

    const empName = getEmployeeById(employeeId)?.name || 'Employee';
    const catInfo = categoryMap[category];
    toast.success(`Added ${catInfo?.icon || ''} ${catInfo?.label || category} expense of LKR ${parseFloat(amount).toFixed(2)} for ${empName}`);

    setAmount('');
  };

  // ─── Delete Handler ────────────────────────────────────────
  const handleDelete = (id) => {
    deleteExpense(id);
    toast.success('Expense deleted');
  };

  // ─── Render ────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-brand-ivory">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-brand-teal/10 flex items-center justify-center">
              <Wallet className="w-5 h-5 text-brand-teal" />
            </div>
            <div>
              <h1 className="text-2xl font-display font-bold text-brand-dark">Daily Expenses</h1>
              <p className="text-sm text-brand-gray">Record daily expenses and material issuances per employee</p>
            </div>
          </div>
        </div>

        {/* Date Picker */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6">
          <DatePicker
            value={selectedDate}
            onChange={setSelectedDate}
            label="Select Date"
          />
        </div>

        {/* Add Expense Form */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
          <h2 className="text-base font-display font-semibold text-brand-dark mb-4 flex items-center gap-2">
            <Plus className="w-4 h-4 text-brand-teal" />
            Add Expense
          </h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Employee Dropdown */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-brand-dark/85 tracking-wide flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-brand-gray" />
                Employee
              </label>
              <div className="relative">
                <select
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  className="w-full appearance-none px-3 py-2.5 rounded-xl border border-gray-200 bg-white
                    text-sm text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-teal/20
                    focus:border-brand-teal transition-all-custom cursor-pointer pr-8"
                >
                  <option value="">Select employee…</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>{emp.name}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-gray pointer-events-none" />
              </div>
            </div>

            {/* Category Dropdown */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-brand-dark/85 tracking-wide flex items-center gap-1.5">
                <Receipt className="w-3.5 h-3.5 text-brand-gray" />
                Category
              </label>
              <div className="relative">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full appearance-none px-3 py-2.5 rounded-xl border border-gray-200 bg-white
                    text-sm text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-teal/20
                    focus:border-brand-teal transition-all-custom cursor-pointer pr-8"
                >
                  <option value="">Select category…</option>
                  {EXPENSE_CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.icon} {cat.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-gray pointer-events-none" />
              </div>
            </div>

            {/* Amount Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-brand-dark/85 tracking-wide flex items-center gap-1.5">
                <Wallet className="w-3.5 h-3.5 text-brand-gray" />
                Amount (LKR)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-white
                  text-sm text-brand-dark placeholder:text-brand-gray
                  focus:outline-none focus:ring-2 focus:ring-brand-teal/20 focus:border-brand-teal
                  transition-all-custom"
              />
            </div>

            {/* Submit Button */}
            <div className="flex items-end">
              <button
                type="submit"
                className="w-full bg-brand-teal text-white text-sm font-semibold py-2.5 px-5
                  rounded-xl hover:bg-brand-teal-light active:bg-brand-teal-dark
                  shadow-md hover:shadow-lg active:scale-[0.98] transition-all-custom
                  cursor-pointer flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Expense
              </button>
            </div>
          </form>
        </div>

        {/* Expenses Table */}
        {expenses.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
            <EmptyState
              icon={Wallet}
              title="No expenses recorded"
              description={`No expenses have been recorded for ${selectedDate}. Use the form above to add entries.`}
            />
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-base font-display font-semibold text-brand-dark">
                Expenses — {selectedDate}
              </h2>
              <p className="text-xs text-brand-gray mt-0.5">
                {expenses.length} {expenses.length === 1 ? 'expense' : 'expenses'} · LKR {grandTotal.toFixed(2)} total
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50/80">
                    <th className="text-left px-6 py-3 text-xs font-semibold text-brand-gray uppercase tracking-wider">Category</th>
                    <th className="text-right px-6 py-3 text-xs font-semibold text-brand-gray uppercase tracking-wider">Amount (LKR)</th>
                    <th className="text-center px-6 py-3 text-xs font-semibold text-brand-gray uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {grouped.map(({ employee, entries, subtotal }) => (
                    <React.Fragment key={employee?.id || 'unknown'}>
                      {/* Employee Group Header */}
                      <tr className="bg-brand-teal/[0.03]">
                        <td colSpan={3} className="px-6 py-2.5">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-brand-teal/10 flex items-center justify-center">
                              <User className="w-3.5 h-3.5 text-brand-teal" />
                            </div>
                            <span className="text-sm font-semibold text-brand-dark">
                              {employee?.name || 'Unknown Employee'}
                            </span>
                            <span className="text-xs text-brand-gray ml-1">
                              ({entries.length} {entries.length === 1 ? 'item' : 'items'})
                            </span>
                          </div>
                        </td>
                      </tr>

                      {/* Expense Rows */}
                      {entries.map((expense) => {
                        const cat = categoryMap[expense.category];
                        return (
                          <tr key={expense.id} className="hover:bg-gray-50/50 transition-colors">
                            <td className="px-6 py-3 pl-14">
                              <div className="flex items-center gap-2.5">
                                <span className="text-lg leading-none">{cat?.icon || '📦'}</span>
                                <span className="text-brand-dark font-medium">{cat?.label || expense.category}</span>
                              </div>
                            </td>
                            <td className="px-6 py-3 text-right text-brand-dark font-semibold tabular-nums">
                              LKR {expense.amount.toFixed(2)}
                            </td>
                            <td className="px-6 py-3 text-center">
                              <button
                                onClick={() => handleDelete(expense.id)}
                                className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50
                                  transition-all-custom cursor-pointer"
                                title="Delete expense"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}

                      {/* Per-employee subtotal */}
                      <tr className="bg-gray-50/40">
                        <td className="px-6 py-2 pl-14 text-xs font-semibold text-brand-gray">
                          Subtotal for {employee?.name || 'Unknown'}
                        </td>
                        <td className="px-6 py-2 text-right text-brand-dark font-bold text-xs tabular-nums">
                          LKR {subtotal.toFixed(2)}
                        </td>
                        <td />
                      </tr>
                    </React.Fragment>
                  ))}

                  {/* Grand Total */}
                  <tr className="bg-brand-teal/[0.06] border-t-2 border-brand-teal/10">
                    <td className="px-6 py-3.5 text-brand-dark font-display font-bold">
                      Grand Total
                    </td>
                    <td className="px-6 py-3.5 text-right text-brand-teal font-display font-bold tabular-nums">
                      LKR {grandTotal.toFixed(2)}
                    </td>
                    <td />
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
