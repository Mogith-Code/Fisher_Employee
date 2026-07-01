import { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { useData } from '../context/DataContext';
import { useToast } from '../components/UI/Toast';
import { CATCH_STATUS } from '../data/constants';
import DatePicker from '../components/UI/DatePicker';
import { Plus, Trash2, Fish, Scale, User, PackageOpen, ChevronDown } from 'lucide-react';

/* ─── Inline StatusBadge ──────────────────────────────────────── */
function StatusBadge({ status }) {
  const isPriced = status === CATCH_STATUS.PRICED;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wide uppercase
        ${isPriced
          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
          : 'bg-amber-50 text-amber-700 border border-amber-200'
        }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${isPriced ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
      {isPriced ? 'Priced' : 'Pending'}
    </span>
  );
}

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

/* ═══════════════════════════════════════════════════════════════ */
export default function CatchRecording() {
  const {
    employees,
    fishVarieties,
    addCatchEntry,
    getCatchEntriesByDate,
    deleteCatchEntry,
    getDailyFishPrice,
    getEmployeeById,
    refreshKey,
  } = useData();

  const toast = useToast();
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  // ─── Form state ────────────────────────────────────────────
  const [employeeId, setEmployeeId] = useState('');
  const [fishVarietyId, setFishVarietyId] = useState('');
  const [weightKg, setWeightKg] = useState('');

  // ─── Catch entries for selected date ───────────────────────
  const catchEntries = useMemo(
    () => getCatchEntriesByDate(selectedDate),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectedDate, refreshKey]
  );

  // ─── Grouped by employee ──────────────────────────────────
  const grouped = useMemo(() => {
    const map = {};
    catchEntries.forEach((entry) => {
      if (!map[entry.employeeId]) {
        const emp = getEmployeeById(entry.employeeId);
        map[entry.employeeId] = {
          employee: emp,
          entries: [],
        };
      }
      map[entry.employeeId].entries.push(entry);
    });
    return Object.values(map);
  }, [catchEntries, getEmployeeById]);

  // ─── Variety lookup ────────────────────────────────────────
  const varietyMap = useMemo(() => {
    const m = {};
    fishVarieties.forEach((v) => (m[v.id] = v));
    return m;
  }, [fishVarieties]);

  // ─── Totals ────────────────────────────────────────────────
  const totals = useMemo(() => {
    let totalWeight = 0;
    let totalValue = 0;
    const byVariety = {};

    catchEntries.forEach((e) => {
      totalWeight += e.weightKg;
      totalValue += e.value || 0;

      if (!byVariety[e.fishVarietyId]) {
        byVariety[e.fishVarietyId] = { weight: 0, value: 0 };
      }
      byVariety[e.fishVarietyId].weight += e.weightKg;
      byVariety[e.fishVarietyId].value += e.value || 0;
    });

    return { totalWeight, totalValue, byVariety };
  }, [catchEntries]);

  // ─── Submit Handler ────────────────────────────────────────
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!employeeId || !fishVarietyId || !weightKg || parseFloat(weightKg) <= 0) {
      toast.error('Please fill in all fields with valid values.');
      return;
    }

    addCatchEntry({
      employeeId,
      fishVarietyId,
      date: selectedDate,
      weightKg: parseFloat(weightKg),
    });

    const empName = getEmployeeById(employeeId)?.name || 'Employee';
    const varName = varietyMap[fishVarietyId]?.name || 'Fish';
    toast.success(`Added ${weightKg} kg of ${varName} for ${empName}`);

    setWeightKg('');
  };

  // ─── Delete Handler ────────────────────────────────────────
  const handleDelete = (id) => {
    deleteCatchEntry(id);
    toast.success('Catch entry deleted');
  };

  // ─── Render ────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-brand-ivory">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-brand-teal/10 flex items-center justify-center">
              <Fish className="w-5 h-5 text-brand-teal" />
            </div>
            <div>
              <h1 className="text-2xl font-display font-bold text-brand-dark">Daily Catch Recording</h1>
              <p className="text-sm text-brand-gray">Record fish catches per employee for each day</p>
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

        {/* Add Catch Form */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
          <h2 className="text-base font-display font-semibold text-brand-dark mb-4 flex items-center gap-2">
            <Plus className="w-4 h-4 text-brand-teal" />
            Add Catch Entry
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

            {/* Fish Variety Dropdown */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-brand-dark/85 tracking-wide flex items-center gap-1.5">
                <Fish className="w-3.5 h-3.5 text-brand-gray" />
                Fish Variety
              </label>
              <div className="relative">
                <select
                  value={fishVarietyId}
                  onChange={(e) => setFishVarietyId(e.target.value)}
                  className="w-full appearance-none px-3 py-2.5 rounded-xl border border-gray-200 bg-white
                    text-sm text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-teal/20
                    focus:border-brand-teal transition-all-custom cursor-pointer pr-8"
                >
                  <option value="">Select variety…</option>
                  {fishVarieties.map((v) => (
                    <option key={v.id} value={v.id}>{v.name}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-gray pointer-events-none" />
              </div>
            </div>

            {/* Weight Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-brand-dark/85 tracking-wide flex items-center gap-1.5">
                <Scale className="w-3.5 h-3.5 text-brand-gray" />
                Weight (kg)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={weightKg}
                onChange={(e) => setWeightKg(e.target.value)}
                placeholder="0.0"
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
                Add Catch
              </button>
            </div>
          </form>
        </div>

        {/* Catch Entries Table */}
        {catchEntries.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
            <EmptyState
              icon={Fish}
              title="No catch entries"
              description={`No fish catch has been recorded for ${selectedDate}. Use the form above to add entries.`}
            />
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-base font-display font-semibold text-brand-dark">
                Catch Entries — {selectedDate}
              </h2>
              <p className="text-xs text-brand-gray mt-0.5">
                {catchEntries.length} {catchEntries.length === 1 ? 'entry' : 'entries'} · {totals.totalWeight.toFixed(1)} kg total
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50/80">
                    <th className="text-left px-6 py-3 text-xs font-semibold text-brand-gray uppercase tracking-wider">Fish Variety</th>
                    <th className="text-right px-6 py-3 text-xs font-semibold text-brand-gray uppercase tracking-wider">Weight (kg)</th>
                    <th className="text-right px-6 py-3 text-xs font-semibold text-brand-gray uppercase tracking-wider">Price/kg</th>
                    <th className="text-right px-6 py-3 text-xs font-semibold text-brand-gray uppercase tracking-wider">Value (LKR)</th>
                    <th className="text-center px-6 py-3 text-xs font-semibold text-brand-gray uppercase tracking-wider">Status</th>
                    <th className="text-center px-6 py-3 text-xs font-semibold text-brand-gray uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {grouped.map(({ employee, entries }) => (
                    <React.Fragment key={employee?.id || 'unknown'}>
                      {/* Employee Group Header */}
                      <tr className="bg-brand-teal/[0.03]">
                        <td colSpan={6} className="px-6 py-2.5">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-brand-teal/10 flex items-center justify-center">
                              <User className="w-3.5 h-3.5 text-brand-teal" />
                            </div>
                            <span className="text-sm font-semibold text-brand-dark">
                              {employee?.name || 'Unknown Employee'}
                            </span>
                            <span className="text-xs text-brand-gray ml-1">
                              ({entries.length} {entries.length === 1 ? 'entry' : 'entries'})
                            </span>
                          </div>
                        </td>
                      </tr>

                      {/* Entry Rows */}
                      {entries.map((entry) => (
                        <tr key={entry.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-6 py-3 pl-14 text-brand-dark font-medium">
                            {varietyMap[entry.fishVarietyId]?.name || 'Unknown'}
                          </td>
                          <td className="px-6 py-3 text-right text-brand-dark tabular-nums">
                            {entry.weightKg.toFixed(1)}
                          </td>
                          <td className="px-6 py-3 text-right tabular-nums">
                            {entry.pricePerKg !== null ? (
                              <span className="text-brand-dark">LKR {entry.pricePerKg.toFixed(2)}</span>
                            ) : (
                              <span className="text-amber-600 italic text-xs">Pending</span>
                            )}
                          </td>
                          <td className="px-6 py-3 text-right tabular-nums">
                            {entry.value !== null ? (
                              <span className="text-brand-dark font-semibold">LKR {entry.value.toFixed(2)}</span>
                            ) : (
                              <span className="text-brand-gray">—</span>
                            )}
                          </td>
                          <td className="px-6 py-3 text-center">
                            <StatusBadge status={entry.status} />
                          </td>
                          <td className="px-6 py-3 text-center">
                            <button
                              onClick={() => handleDelete(entry.id)}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50
                                transition-all-custom cursor-pointer"
                              title="Delete entry"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </React.Fragment>
                  ))}

                  {/* Variety Subtotals */}
                  {Object.keys(totals.byVariety).length > 1 && (
                    <>
                      <tr className="bg-gray-50/60">
                        <td colSpan={6} className="px-6 py-2">
                          <span className="text-xs font-semibold text-brand-gray uppercase tracking-wider">
                            Totals by Variety
                          </span>
                        </td>
                      </tr>
                      {Object.entries(totals.byVariety).map(([varId, data]) => (
                        <tr key={`total-${varId}`} className="bg-gray-50/30">
                          <td className="px-6 py-2 text-brand-dark font-medium text-xs">
                            {varietyMap[varId]?.name || 'Unknown'}
                          </td>
                          <td className="px-6 py-2 text-right text-brand-dark font-semibold text-xs tabular-nums">
                            {data.weight.toFixed(1)} kg
                          </td>
                          <td className="px-6 py-2" />
                          <td className="px-6 py-2 text-right text-brand-dark font-semibold text-xs tabular-nums">
                            {data.value > 0 ? `LKR ${data.value.toFixed(2)}` : '—'}
                          </td>
                          <td colSpan={2} />
                        </tr>
                      ))}
                    </>
                  )}

                  {/* Grand Total */}
                  <tr className="bg-brand-teal/[0.06] border-t-2 border-brand-teal/10">
                    <td className="px-6 py-3.5 text-brand-dark font-display font-bold">
                      Grand Total
                    </td>
                    <td className="px-6 py-3.5 text-right text-brand-dark font-display font-bold tabular-nums">
                      {totals.totalWeight.toFixed(1)} kg
                    </td>
                    <td className="px-6 py-3.5" />
                    <td className="px-6 py-3.5 text-right text-brand-teal font-display font-bold tabular-nums">
                      {totals.totalValue > 0 ? `LKR ${totals.totalValue.toFixed(2)}` : '—'}
                    </td>
                    <td colSpan={2} />
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
