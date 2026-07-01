// ─── Expense Categories ───────────────────────────────────────
export const EXPENSE_CATEGORIES = [
  { id: 'diesel', label: 'Diesel', icon: '⛽' },
  { id: 'petrol', label: 'Petrol', icon: '🛢️' },
  { id: 'boat_materials', label: 'Boat Materials', icon: '🔧' },
  { id: 'food', label: 'Food', icon: '🍚' },
  { id: 'allowance', label: 'Personal Allowance', icon: '💵' },
];

// ─── Default Fish Varieties ───────────────────────────────────
export const DEFAULT_FISH_VARIETIES = [
  'Balaya',
  'Thalapath',
  'Paraw',
  'Salaya',
  'Kelawalla',
  'Soorai',
  'Thora',
];

// ─── Invoice / Entry Statuses ─────────────────────────────────
export const CATCH_STATUS = {
  PENDING: 'pending_price',
  PRICED: 'priced',
};

export const INVOICE_STATUS = {
  PROVISIONAL: 'provisional',
  FINALIZED: 'finalized',
};

export const SETTLEMENT_STATUS = {
  PENDING: 'pending',
  SETTLED: 'settled',
};

// ─── localStorage Keys ───────────────────────────────────────
export const STORAGE_KEYS = {
  EMPLOYEES: 'fisheries_employees',
  FISH_VARIETIES: 'fisheries_fish_varieties',
  CATCH_ENTRIES: 'fisheries_catch_entries',
  DAILY_FISH_PRICES: 'fisheries_daily_fish_prices',
  EXPENSES: 'fisheries_expenses',
  DAILY_INVOICES: 'fisheries_daily_invoices',
  WEEKLY_SETTLEMENTS: 'fisheries_weekly_settlements',
  SELLER_INVOICES: 'fisheries_seller_invoices',
  AUTH: 'fisheries_auth',
};

// ─── Week Configuration ──────────────────────────────────────
// Week runs Saturday to Friday (common in fishing operations)
export const WEEK_START_DAY = 6; // 0=Sunday, 6=Saturday
