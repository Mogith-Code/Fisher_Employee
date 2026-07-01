import { STORAGE_KEYS, DEFAULT_FISH_VARIETIES, CATCH_STATUS } from './constants.js';

// ─── Utility: Generate unique ID ─────────────────────────────
const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// ─── Utility: Read / Write localStorage ──────────────────────
const read = (key) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const write = (key, data) => {
  localStorage.setItem(key, JSON.stringify(data));
};

// ─── Initialize Defaults ─────────────────────────────────────
export const initializeStore = () => {
  // Seed fish varieties if not present
  if (!read(STORAGE_KEYS.FISH_VARIETIES)) {
    const varieties = DEFAULT_FISH_VARIETIES.map((name) => ({
      id: generateId() + '-' + name.toLowerCase(),
      name,
      createdAt: new Date().toISOString(),
    }));
    write(STORAGE_KEYS.FISH_VARIETIES, varieties);
  }

  // Initialize empty arrays for other keys if not present
  const emptyArrayKeys = [
    STORAGE_KEYS.EMPLOYEES,
    STORAGE_KEYS.CATCH_ENTRIES,
    STORAGE_KEYS.DAILY_FISH_PRICES,
    STORAGE_KEYS.EXPENSES,
    STORAGE_KEYS.DAILY_INVOICES,
    STORAGE_KEYS.WEEKLY_SETTLEMENTS,
    STORAGE_KEYS.SELLER_INVOICES,
  ];

  emptyArrayKeys.forEach((key) => {
    if (!read(key)) write(key, []);
  });
};

// ═══════════════════════════════════════════════════════════════
// EMPLOYEES
// ═══════════════════════════════════════════════════════════════
export const getEmployees = () => read(STORAGE_KEYS.EMPLOYEES) || [];

export const getEmployeeById = (id) => getEmployees().find((e) => e.id === id) || null;

export const addEmployee = ({ name, nic, phone }) => {
  const employees = getEmployees();
  const employee = {
    id: generateId(),
    name,
    nic,
    phone,
    photoUrl: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  employees.push(employee);
  write(STORAGE_KEYS.EMPLOYEES, employees);
  return employee;
};

export const updateEmployee = (id, updates) => {
  const employees = getEmployees();
  const idx = employees.findIndex((e) => e.id === id);
  if (idx === -1) return null;
  employees[idx] = { ...employees[idx], ...updates, updatedAt: new Date().toISOString() };
  write(STORAGE_KEYS.EMPLOYEES, employees);
  return employees[idx];
};

export const deleteEmployee = (id) => {
  const employees = getEmployees().filter((e) => e.id !== id);
  write(STORAGE_KEYS.EMPLOYEES, employees);

  // Also clean up related data
  write(STORAGE_KEYS.CATCH_ENTRIES, getCatchEntries().filter((c) => c.employeeId !== id));
  write(STORAGE_KEYS.EXPENSES, getExpenses().filter((e) => e.employeeId !== id));
  write(STORAGE_KEYS.DAILY_INVOICES, getDailyInvoices().filter((i) => i.employeeId !== id));
  write(STORAGE_KEYS.WEEKLY_SETTLEMENTS, getWeeklySettlements().filter((s) => s.employeeId !== id));
};

// ═══════════════════════════════════════════════════════════════
// FISH VARIETIES
// ═══════════════════════════════════════════════════════════════
export const getFishVarieties = () => read(STORAGE_KEYS.FISH_VARIETIES) || [];

export const addFishVariety = (name) => {
  const varieties = getFishVarieties();
  const variety = {
    id: generateId(),
    name,
    createdAt: new Date().toISOString(),
  };
  varieties.push(variety);
  write(STORAGE_KEYS.FISH_VARIETIES, varieties);
  return variety;
};

export const deleteFishVariety = (id) => {
  const varieties = getFishVarieties().filter((v) => v.id !== id);
  write(STORAGE_KEYS.FISH_VARIETIES, varieties);
};

// ═══════════════════════════════════════════════════════════════
// CATCH ENTRIES
// ═══════════════════════════════════════════════════════════════
export const getCatchEntries = () => read(STORAGE_KEYS.CATCH_ENTRIES) || [];

export const getCatchEntriesByDate = (date) =>
  getCatchEntries().filter((c) => c.date === date);

export const getCatchEntriesByEmployee = (employeeId) =>
  getCatchEntries().filter((c) => c.employeeId === employeeId);

export const getCatchEntriesByDateRange = (startDate, endDate) =>
  getCatchEntries().filter((c) => c.date >= startDate && c.date <= endDate);

export const addCatchEntry = ({ employeeId, fishVarietyId, date, weightKg }) => {
  const entries = getCatchEntries();
  // Check if a price already exists for this variety+date
  const existingPrice = getDailyFishPrice(fishVarietyId, date);

  const entry = {
    id: generateId(),
    employeeId,
    fishVarietyId,
    date,
    weightKg: parseFloat(weightKg),
    pricePerKg: existingPrice ? existingPrice.pricePerKg : null,
    value: existingPrice ? parseFloat(weightKg) * existingPrice.pricePerKg : null,
    status: existingPrice ? CATCH_STATUS.PRICED : CATCH_STATUS.PENDING,
    createdAt: new Date().toISOString(),
  };
  entries.push(entry);
  write(STORAGE_KEYS.CATCH_ENTRIES, entries);
  return entry;
};

export const updateCatchEntry = (id, updates) => {
  const entries = getCatchEntries();
  const idx = entries.findIndex((e) => e.id === id);
  if (idx === -1) return null;
  entries[idx] = { ...entries[idx], ...updates };
  write(STORAGE_KEYS.CATCH_ENTRIES, entries);
  return entries[idx];
};

export const deleteCatchEntry = (id) => {
  const entries = getCatchEntries().filter((e) => e.id !== id);
  write(STORAGE_KEYS.CATCH_ENTRIES, entries);
};

// ═══════════════════════════════════════════════════════════════
// DAILY FISH PRICES
// ═══════════════════════════════════════════════════════════════
export const getDailyFishPrices = () => read(STORAGE_KEYS.DAILY_FISH_PRICES) || [];

export const getDailyFishPrice = (fishVarietyId, date) =>
  getDailyFishPrices().find((p) => p.fishVarietyId === fishVarietyId && p.date === date) || null;

export const getDailyFishPricesByDate = (date) =>
  getDailyFishPrices().filter((p) => p.date === date);

export const setDailyFishPrice = (fishVarietyId, date, pricePerKg) => {
  const prices = getDailyFishPrices();
  const existingIdx = prices.findIndex(
    (p) => p.fishVarietyId === fishVarietyId && p.date === date
  );

  const priceEntry = {
    id: existingIdx >= 0 ? prices[existingIdx].id : generateId(),
    fishVarietyId,
    date,
    pricePerKg: parseFloat(pricePerKg),
    enteredAt: new Date().toISOString(),
  };

  if (existingIdx >= 0) {
    prices[existingIdx] = priceEntry;
  } else {
    prices.push(priceEntry);
  }
  write(STORAGE_KEYS.DAILY_FISH_PRICES, prices);

  // ─── AUTO-CASCADE: Update all matching catch entries ────────
  const catchEntries = getCatchEntries();
  let updated = false;
  catchEntries.forEach((entry, idx) => {
    if (entry.fishVarietyId === fishVarietyId && entry.date === date) {
      catchEntries[idx] = {
        ...entry,
        pricePerKg: parseFloat(pricePerKg),
        value: entry.weightKg * parseFloat(pricePerKg),
        status: CATCH_STATUS.PRICED,
      };
      updated = true;
    }
  });
  if (updated) {
    write(STORAGE_KEYS.CATCH_ENTRIES, catchEntries);
  }

  return priceEntry;
};

// ═══════════════════════════════════════════════════════════════
// EXPENSES
// ═══════════════════════════════════════════════════════════════
export const getExpenses = () => read(STORAGE_KEYS.EXPENSES) || [];

export const getExpensesByDate = (date) =>
  getExpenses().filter((e) => e.date === date);

export const getExpensesByEmployee = (employeeId) =>
  getExpenses().filter((e) => e.employeeId === employeeId);

export const getExpensesByDateRange = (startDate, endDate) =>
  getExpenses().filter((e) => e.date >= startDate && e.date <= endDate);

export const addExpense = ({ employeeId, date, category, amount }) => {
  const expenses = getExpenses();
  const expense = {
    id: generateId(),
    employeeId,
    date,
    category,
    amount: parseFloat(amount),
    createdAt: new Date().toISOString(),
  };
  expenses.push(expense);
  write(STORAGE_KEYS.EXPENSES, expenses);
  return expense;
};

export const updateExpense = (id, updates) => {
  const expenses = getExpenses();
  const idx = expenses.findIndex((e) => e.id === id);
  if (idx === -1) return null;
  expenses[idx] = { ...expenses[idx], ...updates };
  write(STORAGE_KEYS.EXPENSES, expenses);
  return expenses[idx];
};

export const deleteExpense = (id) => {
  const expenses = getExpenses().filter((e) => e.id !== id);
  write(STORAGE_KEYS.EXPENSES, expenses);
};

// ═══════════════════════════════════════════════════════════════
// DAILY INVOICES
// ═══════════════════════════════════════════════════════════════
export const getDailyInvoices = () => read(STORAGE_KEYS.DAILY_INVOICES) || [];

export const getDailyInvoice = (employeeId, date) =>
  getDailyInvoices().find((i) => i.employeeId === employeeId && i.date === date) || null;

// ═══════════════════════════════════════════════════════════════
// WEEKLY SETTLEMENTS
// ═══════════════════════════════════════════════════════════════
export const getWeeklySettlements = () => read(STORAGE_KEYS.WEEKLY_SETTLEMENTS) || [];

export const getWeeklySettlement = (employeeId, weekStart) =>
  getWeeklySettlements().find(
    (s) => s.employeeId === employeeId && s.weekStart === weekStart
  ) || null;

export const addWeeklySettlement = (settlement) => {
  const settlements = getWeeklySettlements();
  const newSettlement = {
    id: generateId(),
    ...settlement,
    settled: false,
    settledAt: null,
    createdAt: new Date().toISOString(),
  };
  settlements.push(newSettlement);
  write(STORAGE_KEYS.WEEKLY_SETTLEMENTS, settlements);
  return newSettlement;
};

export const settleWeek = (id) => {
  const settlements = getWeeklySettlements();
  const idx = settlements.findIndex((s) => s.id === id);
  if (idx === -1) return null;
  settlements[idx] = {
    ...settlements[idx],
    settled: true,
    settledAt: new Date().toISOString(),
  };
  write(STORAGE_KEYS.WEEKLY_SETTLEMENTS, settlements);
  return settlements[idx];
};

export const unsettleWeek = (id) => {
  const settlements = getWeeklySettlements();
  const idx = settlements.findIndex((s) => s.id === id);
  if (idx === -1) return null;
  settlements[idx] = {
    ...settlements[idx],
    settled: false,
    settledAt: null,
  };
  write(STORAGE_KEYS.WEEKLY_SETTLEMENTS, settlements);
  return settlements[idx];
};

export const deleteWeeklySettlement = (id) => {
  const settlements = getWeeklySettlements().filter((s) => s.id !== id);
  write(STORAGE_KEYS.WEEKLY_SETTLEMENTS, settlements);
};

// ═══════════════════════════════════════════════════════════════
// SELLER INVOICES
// ═══════════════════════════════════════════════════════════════
export const getSellerInvoices = () => read(STORAGE_KEYS.SELLER_INVOICES) || [];

export const getSellerInvoiceByDate = (date) =>
  getSellerInvoices().find((i) => i.date === date) || null;

export const generateSellerInvoice = (date) => {
  const catchEntries = getCatchEntriesByDate(date);
  const varieties = getFishVarieties();

  // Group by variety
  const catchByVariety = {};
  catchEntries.forEach((entry) => {
    if (!catchByVariety[entry.fishVarietyId]) {
      const variety = varieties.find((v) => v.id === entry.fishVarietyId);
      catchByVariety[entry.fishVarietyId] = {
        varietyId: entry.fishVarietyId,
        varietyName: variety ? variety.name : 'Unknown',
        totalWeightKg: 0,
        employees: [],
      };
    }
    catchByVariety[entry.fishVarietyId].totalWeightKg += entry.weightKg;
    catchByVariety[entry.fishVarietyId].employees.push({
      employeeId: entry.employeeId,
      weightKg: entry.weightKg,
    });
  });

  const invoices = getSellerInvoices();
  const existingIdx = invoices.findIndex((i) => i.date === date);

  const invoice = {
    id: existingIdx >= 0 ? invoices[existingIdx].id : generateId(),
    date,
    catchByVariety: Object.values(catchByVariety),
    totalWeightKg: catchEntries.reduce((sum, e) => sum + e.weightKg, 0),
    createdAt: existingIdx >= 0 ? invoices[existingIdx].createdAt : new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  if (existingIdx >= 0) {
    invoices[existingIdx] = invoice;
  } else {
    invoices.push(invoice);
  }
  write(STORAGE_KEYS.SELLER_INVOICES, invoices);
  return invoice;
};

// ═══════════════════════════════════════════════════════════════
// AGGREGATE HELPERS
// ═══════════════════════════════════════════════════════════════

/** Get total income for an employee on a specific date */
export const getEmployeeDailyIncome = (employeeId, date) => {
  const entries = getCatchEntries().filter(
    (c) => c.employeeId === employeeId && c.date === date && c.status === CATCH_STATUS.PRICED
  );
  return entries.reduce((sum, e) => sum + (e.value || 0), 0);
};

/** Get total expenses for an employee on a specific date */
export const getEmployeeDailyExpenses = (employeeId, date) => {
  const expenses = getExpenses().filter(
    (e) => e.employeeId === employeeId && e.date === date
  );
  return expenses.reduce((sum, e) => sum + e.amount, 0);
};

/** Get employee weekly summary */
export const getEmployeeWeeklySummary = (employeeId, startDate, endDate) => {
  const catchEntries = getCatchEntries().filter(
    (c) => c.employeeId === employeeId && c.date >= startDate && c.date <= endDate
  );
  const expenses = getExpenses().filter(
    (e) => e.employeeId === employeeId && e.date >= startDate && e.date <= endDate
  );

  const totalIncome = catchEntries
    .filter((c) => c.status === CATCH_STATUS.PRICED)
    .reduce((sum, c) => sum + (c.value || 0), 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalWeightKg = catchEntries.reduce((sum, c) => sum + c.weightKg, 0);
  const hasPending = catchEntries.some((c) => c.status === CATCH_STATUS.PENDING);

  return {
    totalIncome,
    totalExpenses,
    netBalance: totalIncome - totalExpenses,
    totalWeightKg,
    catchEntries,
    expenses,
    hasPending,
  };
};

// ═══════════════════════════════════════════════════════════════
// DATA MANAGEMENT (Export / Import / Clear)
// ═══════════════════════════════════════════════════════════════
export const exportAllData = () => {
  const data = {};
  Object.values(STORAGE_KEYS).forEach((key) => {
    data[key] = read(key);
  });
  return data;
};

export const importAllData = (data) => {
  Object.entries(data).forEach(([key, value]) => {
    if (Object.values(STORAGE_KEYS).includes(key)) {
      write(key, value);
    }
  });
};

export const clearAllData = () => {
  Object.values(STORAGE_KEYS).forEach((key) => {
    localStorage.removeItem(key);
  });
  initializeStore();
};
