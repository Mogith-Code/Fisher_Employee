import { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { useData } from '../context/DataContext';
import { useToast } from '../components/UI/Toast';
import DatePicker from '../components/UI/DatePicker';
import { DollarSign, Fish, PackageOpen, CheckCircle, Clock, Info, TrendingUp, Users } from 'lucide-react';

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
export default function FishPricing() {
  const {
    fishVarieties,
    getCatchEntriesByDate,
    getDailyFishPrice,
    setDailyFishPrice,
    getEmployeeById,
    refreshKey,
  } = useData();

  const toast = useToast();
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [priceInputs, setPriceInputs] = useState({});

  // ─── Catch entries for selected date ───────────────────────
  const catchEntries = useMemo(
    () => getCatchEntriesByDate(selectedDate),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectedDate, refreshKey]
  );

  // ─── Varieties with catch data for the day ─────────────────
  const varietyData = useMemo(() => {
    const map = {};

    // Seed all configured varieties
    fishVarieties.forEach((v) => {
      map[v.id] = {
        variety: v,
        totalWeight: 0,
        employeeIds: new Set(),
        entries: [],
      };
    });

    catchEntries.forEach((entry) => {
      if (!map[entry.fishVarietyId]) {
        const variety = fishVarieties.find((v) => v.id === entry.fishVarietyId);
        map[entry.fishVarietyId] = {
          variety: variety || { id: entry.fishVarietyId, name: 'Unknown' },
          totalWeight: 0,
          employeeIds: new Set(),
          entries: [],
        };
      }
      map[entry.fishVarietyId].totalWeight += entry.weightKg;
      map[entry.fishVarietyId].employeeIds.add(entry.employeeId);
      map[entry.fishVarietyId].entries.push(entry);
    });

    // Convert to array
    return Object.entries(map).map(([id, data]) => ({
      varietyId: id,
      variety: data.variety,
      totalWeight: data.totalWeight,
      employeeCount: data.employeeIds.size,
      entries: data.entries,
    }));
  }, [catchEntries, fishVarieties]);

  // ─── Price status per variety ──────────────────────────────
  const priceStatus = useMemo(() => {
    const status = {};
    varietyData.forEach(({ varietyId }) => {
      const price = getDailyFishPrice(varietyId, selectedDate);
      status[varietyId] = price;
    });
    return status;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [varietyData, selectedDate, refreshKey]);

  // ─── Summary calculations ─────────────────────────────────
  const summary = useMemo(() => {
    const activeVarieties = varietyData.filter((v) => v.totalWeight > 0);
    const totalVarieties = activeVarieties.length;
    let pricedCount = 0;
    let totalValue = 0;
    let totalWeight = 0;

    varietyData.forEach(({ varietyId, totalWeight: tw }) => {
      totalWeight += tw;
      const price = priceStatus[varietyId];
      if (price) {
        if (tw > 0) {
          pricedCount++;
        }
        totalValue += tw * price.pricePerKg;
      }
    });

    return { totalVarieties, pricedCount, totalValue, totalWeight };
  }, [varietyData, priceStatus]);

  // ─── Price change handler ─────────────────────────────────
  const handlePriceChange = (varietyId, value) => {
    setPriceInputs((prev) => ({ ...prev, [varietyId]: value }));
  };

  // ─── Set Price Handler ─────────────────────────────────────
  const handleSetPrice = (varietyId) => {
    const priceValue = priceInputs[varietyId];
    if (!priceValue || parseFloat(priceValue) <= 0) {
      toast.error('Please enter a valid price greater than 0.');
      return;
    }

    setDailyFishPrice(varietyId, selectedDate, parseFloat(priceValue));

    const variety = fishVarieties.find((v) => v.id === varietyId);
    toast.success(`Price set: LKR ${parseFloat(priceValue).toFixed(2)}/kg for ${variety?.name || 'Unknown'}`);

    // Clear input after setting
    setPriceInputs((prev) => ({ ...prev, [varietyId]: '' }));
  };

  // ─── Render ────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-brand-ivory">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-brand-teal/10 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-brand-teal" />
            </div>
            <div>
              <h1 className="text-2xl font-display font-bold text-brand-dark">Daily Fish Pricing</h1>
              <p className="text-sm text-brand-gray">Set daily prices per fish variety to finalize catch values</p>
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

        {/* No Fish Varieties */}
        {fishVarieties.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
            <EmptyState
              icon={Fish}
              title="No varieties configured"
              description="Please configure fish varieties in Settings first to start setting prices."
            />
          </div>
        ) : (
          <>
            {/* Summary Section */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              {/* Pricing Progress */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    summary.pricedCount === summary.totalVarieties
                      ? 'bg-emerald-50'
                      : 'bg-amber-50'
                  }`}>
                    {summary.pricedCount === summary.totalVarieties ? (
                      <CheckCircle className="w-5 h-5 text-emerald-500" />
                    ) : (
                      <Clock className="w-5 h-5 text-amber-500" />
                    )}
                  </div>
                  <div>
                    <p className="text-xs text-brand-gray font-medium">Pricing Progress</p>
                    <p className="text-lg font-display font-bold text-brand-dark">
                      {summary.pricedCount} <span className="text-brand-gray font-normal text-sm">of</span> {summary.totalVarieties}
                    </p>
                    <p className="text-[11px] text-brand-gray">varieties priced</p>
                  </div>
                </div>
                {/* Progress bar */}
                <div className="mt-3 w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ease-out ${
                      summary.pricedCount === summary.totalVarieties ? 'bg-emerald-500' : 'bg-amber-400'
                    }`}
                    style={{ width: `${summary.totalVarieties > 0 ? (summary.pricedCount / summary.totalVarieties) * 100 : 0}%` }}
                  />
                </div>
              </div>

              {/* Total Catch Weight */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                    <Fish className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-xs text-brand-gray font-medium">Total Catch</p>
                    <p className="text-lg font-display font-bold text-brand-dark">
                      {summary.totalWeight.toFixed(1)} <span className="text-sm font-normal text-brand-gray">kg</span>
                    </p>
                    <p className="text-[11px] text-brand-gray">{summary.totalVarieties} varieties</p>
                  </div>
                </div>
              </div>

              {/* Total Value */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-teal/10 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-brand-teal" />
                  </div>
                  <div>
                    <p className="text-xs text-brand-gray font-medium">Total Value</p>
                    <p className="text-lg font-display font-bold text-brand-teal">
                      {summary.totalValue > 0 ? `LKR ${summary.totalValue.toFixed(2)}` : '—'}
                    </p>
                    <p className="text-[11px] text-brand-gray">
                      {summary.pricedCount < summary.totalVarieties ? 'Partial — pending prices' : 'All varieties priced'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Info Banner */}
            <div className="bg-blue-50/80 border border-blue-100 rounded-xl px-4 py-3 mb-6 flex items-start gap-3">
              <Info className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
              <p className="text-xs text-blue-700 leading-relaxed">
                Setting a price for a fish variety will <strong>automatically update all employee catch entries</strong> for
                that variety on this date, calculating their catch value based on the weight recorded.
              </p>
            </div>

            {/* Variety Pricing Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {varietyData.map(({ varietyId, variety, totalWeight, employeeCount, entries }) => {
                const existingPrice = priceStatus[varietyId];
                const isPriced = !!existingPrice;
                const currentInputValue = priceInputs[varietyId] || '';
                const totalValue = isPriced ? totalWeight * existingPrice.pricePerKg : 0;

                return (
                  <div
                    key={varietyId}
                    className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all-custom
                      ${isPriced ? 'border-emerald-200' : 'border-gray-100'}`}
                  >
                    {/* Card Header */}
                    <div className={`px-5 py-4 border-b ${isPriced ? 'border-emerald-100 bg-emerald-50/30' : 'border-gray-100'}`}>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                            isPriced ? 'bg-emerald-100' : 'bg-gray-100'
                          }`}>
                            <Fish className={`w-5 h-5 ${isPriced ? 'text-emerald-600' : 'text-brand-gray'}`} />
                          </div>
                          <div>
                            <h3 className="text-base font-display font-semibold text-brand-dark">
                              {variety?.name || 'Unknown Variety'}
                            </h3>
                            <div className="flex items-center gap-3 mt-0.5">
                              {totalWeight > 0 ? (
                                <>
                                  <span className="text-xs text-brand-gray flex items-center gap-1">
                                    <Fish className="w-3 h-3" />
                                    {totalWeight.toFixed(1)} kg
                                  </span>
                                  <span className="text-xs text-brand-gray flex items-center gap-1">
                                    <Users className="w-3 h-3" />
                                    {employeeCount} {employeeCount === 1 ? 'employee' : 'employees'}
                                  </span>
                                </>
                              ) : (
                                <span className="text-[11px] text-brand-gray/60 italic">No catches today</span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Status indicator */}
                        {isPriced ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle className="w-3 h-3" />
                            Priced
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                            <Clock className="w-3 h-3 animate-pulse" />
                            Pending
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="px-5 py-4">
                      {/* Current price display */}
                      {isPriced && (
                        <div className="mb-4 p-3 rounded-xl bg-emerald-50/60 border border-emerald-100">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">Current Price</p>
                              <p className="text-lg font-display font-bold text-emerald-700 mt-0.5">
                                LKR {existingPrice.pricePerKg.toFixed(2)} <span className="text-xs font-normal">/kg</span>
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">Total Value</p>
                              <p className="text-lg font-display font-bold text-emerald-700 mt-0.5">
                                LKR {totalValue.toFixed(2)}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Price input */}
                      <div className="flex items-end gap-3">
                        <div className="flex-1 space-y-1.5">
                          <label className="text-xs font-semibold text-brand-dark/85 tracking-wide">
                            {isPriced ? 'Update Price (LKR/kg)' : 'Set Price (LKR/kg)'}
                          </label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-brand-gray font-medium">LKR</span>
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              value={currentInputValue}
                              onChange={(e) => handlePriceChange(varietyId, e.target.value)}
                              placeholder={isPriced ? existingPrice.pricePerKg.toFixed(2) : '0.00'}
                              className="w-full pl-11 pr-3 py-2.5 rounded-xl border border-gray-200 bg-white
                                text-sm text-brand-dark placeholder:text-brand-gray/50
                                focus:outline-none focus:ring-2 focus:ring-brand-teal/20 focus:border-brand-teal
                                transition-all-custom tabular-nums"
                            />
                          </div>
                        </div>
                        <button
                          onClick={() => handleSetPrice(varietyId)}
                          className={`px-5 py-2.5 text-sm font-semibold rounded-xl shadow-sm
                            transition-all-custom cursor-pointer active:scale-[0.98]
                            flex items-center gap-2 shrink-0
                            ${isPriced
                              ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                              : 'bg-brand-teal text-white hover:bg-brand-teal-light'
                            }`}
                        >
                          <DollarSign className="w-4 h-4" />
                          {isPriced ? 'Update' : 'Set Price'}
                        </button>
                      </div>

                      {/* Preview calculation */}
                      {totalWeight > 0 && currentInputValue && parseFloat(currentInputValue) > 0 && (
                        <div className="mt-3 p-2.5 rounded-lg bg-gray-50 border border-gray-100">
                          <p className="text-[11px] text-brand-gray">
                            Preview: {totalWeight.toFixed(1)} kg × LKR {parseFloat(currentInputValue).toFixed(2)} ={' '}
                            <span className="font-bold text-brand-dark">
                              LKR {(totalWeight * parseFloat(currentInputValue)).toFixed(2)}
                            </span>
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
