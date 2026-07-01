import { useState, useMemo } from 'react';
import logoImg from '../../assets/Images/KDTlogo.png';
import { format, parseISO } from 'date-fns';
import { Printer, FileText, ChevronDown, ChevronUp, Package, RefreshCw } from 'lucide-react';
import { useData } from '../../context/DataContext.jsx';
import DatePicker from '../../components/UI/DatePicker.jsx';

// ─── Empty State ──────────────────────────────────────────────
function EmptyState({ date }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center mb-5">
        <Package className="w-9 h-9 text-slate-300" />
      </div>
      <h3 className="text-lg font-display font-semibold text-brand-dark mb-2">
        No Catch Data
      </h3>
      <p className="text-sm text-brand-gray max-w-xs">
        {date
          ? `No catch entries found for ${format(parseISO(date), 'MMMM d, yyyy')}. Record catch data first to generate a seller invoice.`
          : 'Select a date and click "Generate Invoice" to create a seller invoice.'}
      </p>
    </div>
  );
}

// ─── Collapsible Employee Breakdown ───────────────────────────
function EmployeeBreakdown({ employees, getEmployeeById }) {
  const [open, setOpen] = useState(false);

  if (!employees || employees.length === 0) return null;

  return (
    <div className="print:block">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 text-xs font-medium text-brand-teal hover:text-brand-teal-light transition-all-custom cursor-pointer print:hidden"
      >
        {open ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        {employees.length} employee{employees.length > 1 ? 's' : ''}
      </button>
      <div className={`${open ? 'block' : 'hidden'} print:block mt-1.5 ml-1`}>
        {employees.map((emp, i) => {
          const employee = getEmployeeById(emp.employeeId);
          return (
            <div key={i} className="flex items-center justify-between text-xs text-brand-gray py-0.5">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-teal/40" />
                {employee?.name || 'Unknown'}
              </span>
              <span className="font-mono">{emp.weightKg.toFixed(1)} kg</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// SELLER INVOICE PAGE
// ═══════════════════════════════════════════════════════════════
export default function SellerInvoice() {
  const {
    generateSellerInvoice,
    getSellerInvoiceByDate,
    getCatchEntriesByDate,
    getEmployeeById,
    refreshKey,
  } = useData();

  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [invoice, setInvoice] = useState(null);
  const [generating, setGenerating] = useState(false);

  // Check if catch data exists for the date
  const hasCatchData = useMemo(() => {
    if (!selectedDate) return false;
    const entries = getCatchEntriesByDate(selectedDate);
    return entries && entries.length > 0;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate, refreshKey]);

  const handleGenerate = async () => {
    if (!selectedDate) return;
    setGenerating(true);
    try {
      const result = await generateSellerInvoice(selectedDate);
      setInvoice(result);
    } catch (err) {
      console.error(err);
    } finally {
      setGenerating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Try loading an existing invoice when date changes
  const existingInvoice = useMemo(() => {
    if (!selectedDate) return null;
    return getSellerInvoiceByDate(selectedDate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate, refreshKey]);

  const displayInvoice = invoice || existingInvoice;

  return (
    <div className="min-h-screen bg-brand-ivory">
      {/* ── Print Styles ─────────────────────────────── */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .print-area, .print-area * { visibility: visible; }
          .print-area { 
            position: absolute; left: 0; top: 0; width: 100%;
            padding: 40px;
          }
          .print\\:hidden { display: none !important; }
          .print\\:block { display: block !important; }
          .print\\:border-black { border-color: #000 !important; }
        }
      `}</style>

      {/* ── Controls Bar ─────────────────────────────── */}
      <div className="print:hidden max-w-4xl mx-auto px-4 sm:px-6 py-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-brand-teal/10 flex items-center justify-center">
              <FileText className="w-5 h-5 text-brand-teal" />
            </div>
            <div>
              <h1 className="text-xl font-display font-bold text-brand-dark">Seller Invoice</h1>
              <p className="text-xs text-brand-gray">Generate invoice for fish consignment to seller</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-3">
            <div className="flex-1 w-full">
              <DatePicker
                value={selectedDate}
                onChange={setSelectedDate}
                label="Invoice Date"
              />
            </div>
            <button
              type="button"
              onClick={handleGenerate}
              disabled={!selectedDate || !hasCatchData || generating}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-teal text-white text-sm font-semibold
                hover:bg-brand-teal-light active:scale-[0.98] transition-all-custom shadow-md hover:shadow-lg
                disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-md cursor-pointer whitespace-nowrap"
            >
              {generating ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <FileText className="w-4 h-4" />
              )}
              Generate Invoice
            </button>
          </div>

          {selectedDate && !hasCatchData && (
            <p className="text-xs text-amber-600 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
              No catch entries found for this date. Please record catch data first.
            </p>
          )}
        </div>
      </div>

      {/* ── Invoice Display ──────────────────────────── */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pb-10">
        {displayInvoice ? (
          <div className="print-area bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden print:shadow-none print:rounded-none print:border-black">
            {/* Invoice Header */}
            <div className="bg-gradient-to-br from-brand-teal to-brand-teal-dark text-white px-8 py-7 print:bg-white print:text-black print:border-b-2 print:border-black">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <img
                    src={logoImg}
                    alt="KDT Logo"
                    className="w-14 h-14 object-contain bg-white rounded-xl p-1 shrink-0 shadow-sm print:border print:border-gray-200"
                  />
                  <div>
                    <p className="text-xs font-semibold tracking-[0.25em] uppercase opacity-70 mb-1">
                      Seller Invoice
                    </p>
                    <h2 className="text-2xl font-display font-bold tracking-tight">
                      KDT SEA FOOD
                    </h2>
                    <p className="text-sm opacity-75 mt-1">Karaitheevu, Kalmunai</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs opacity-60 uppercase tracking-wide mb-1">Date</p>
                  <p className="text-lg font-display font-bold">
                    {format(parseISO(displayInvoice.date), 'MMM dd, yyyy')}
                  </p>
                  <p className="text-xs opacity-60 mt-0.5">
                    {format(parseISO(displayInvoice.date), 'EEEE')}
                  </p>
                </div>
              </div>
            </div>

            {/* Invoice Body */}
            <div className="px-8 py-6">
              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full min-w-[500px]">
                  <thead>
                    <tr className="border-b-2 border-brand-dark/10">
                      <th className="text-left py-3 text-xs font-bold text-brand-dark/60 uppercase tracking-wider">
                        #
                      </th>
                      <th className="text-left py-3 text-xs font-bold text-brand-dark/60 uppercase tracking-wider">
                        Fish Variety
                      </th>
                      <th className="text-right py-3 text-xs font-bold text-brand-dark/60 uppercase tracking-wider">
                        Total Weight (kg)
                      </th>
                      <th className="text-left py-3 pl-6 text-xs font-bold text-brand-dark/60 uppercase tracking-wider print:hidden">
                        Breakdown
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayInvoice.catchByVariety.map((item, idx) => (
                      <tr
                        key={item.varietyId}
                        className="border-b border-gray-100 last:border-b-0 hover:bg-slate-50/50 transition-colors"
                      >
                        <td className="py-3.5 text-sm text-brand-gray font-mono">
                          {String(idx + 1).padStart(2, '0')}
                        </td>
                        <td className="py-3.5">
                          <span className="text-sm font-semibold text-brand-dark">
                            {item.varietyName}
                          </span>
                        </td>
                        <td className="py-3.5 text-right">
                          <span className="text-sm font-bold font-mono text-brand-dark">
                            {item.totalWeightKg.toFixed(1)}
                          </span>
                          <span className="text-xs text-brand-gray ml-1">kg</span>
                        </td>
                        <td className="py-3.5 pl-6">
                          <EmployeeBreakdown
                            employees={item.employees}
                            getEmployeeById={getEmployeeById}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Grand Total */}
              <div className="mt-6 pt-4 border-t-2 border-brand-dark/10">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-brand-dark uppercase tracking-wider">
                    Grand Total
                  </span>
                  <div className="text-right">
                    <span className="text-2xl font-display font-extrabold text-brand-teal">
                      {displayInvoice.totalWeightKg.toFixed(1)}
                    </span>
                    <span className="text-sm font-semibold text-brand-gray ml-1.5">kg</span>
                  </div>
                </div>
              </div>

              {/* Note */}
              <div className="mt-8 p-4 bg-amber-50/60 border border-amber-100 rounded-xl print:bg-transparent print:border-gray-300 print:rounded-none">
                <p className="text-xs text-amber-800 leading-relaxed print:text-black">
                  <span className="font-bold">Note:</span> This invoice accompanies the fish
                  consignment. Prices to be determined after sale.
                </p>
              </div>

              {/* Footer */}
              <div className="mt-8 pt-5 border-t border-dashed border-gray-200 flex items-end justify-between">
                <div className="space-y-3">
                  <div>
                    <p className="text-[10px] text-brand-gray uppercase tracking-wider">Prepared By</p>
                    <div className="mt-4 border-b border-gray-400 w-40" />
                    <p className="text-[10px] text-brand-gray mt-1">Authorized Signature</p>
                  </div>
                </div>
                <div className="text-right">
                  <div>
                    <p className="text-[10px] text-brand-gray uppercase tracking-wider">Received By</p>
                    <div className="mt-4 border-b border-gray-400 w-40" />
                    <p className="text-[10px] text-brand-gray mt-1">Seller Signature</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Print Button */}
            <div className="px-8 py-4 bg-slate-50 border-t border-gray-100 flex justify-end print:hidden">
              <button
                type="button"
                onClick={handlePrint}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-dark text-white text-sm font-semibold
                  hover:bg-brand-dark/90 active:scale-[0.98] transition-all-custom shadow-md cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                Print Invoice
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
            <EmptyState date={selectedDate} />
          </div>
        )}
      </div>
    </div>
  );
}
