import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const DataContext = createContext(null);

export function DataProvider({ children }) {
  const [refreshKey, setRefreshKey] = useState(0);
  const refresh = useCallback(() => setRefreshKey((k) => k + 1), []);

  // ─── Reactive state synced with Express Backend ─────────────
  const [employees, setEmployees] = useState([]);
  const [fishVarieties, setFishVarieties] = useState([]);
  const [catchEntries, setCatchEntries] = useState([]);
  const [dailyFishPrices, setDailyFishPrices] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [weeklySettlements, setWeeklySettlements] = useState([]);
  const [sellerInvoices, setSellerInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  // Sync state with backend on mount and refresh key changes
  useEffect(() => {
    async function loadAllData() {
      try {
        const [
          empRes,
          varRes,
          catchRes,
          priceRes,
          expenseRes,
          settlementRes,
          invoiceRes,
        ] = await Promise.all([
          fetch('/api/employees').then((r) => r.json()),
          fetch('/api/fish-varieties').then((r) => r.json()),
          fetch('/api/catches').then((r) => r.json()),
          fetch('/api/fish-prices').then((r) => r.json()),
          fetch('/api/expenses').then((r) => r.json()),
          fetch('/api/settlements').then((r) => r.json()),
          fetch('/api/invoices/seller').then((r) => r.json()),
        ]);

        setEmployees(empRes || []);
        setFishVarieties(varRes || []);
        setCatchEntries(catchRes || []);
        setDailyFishPrices(priceRes || []);
        setExpenses(expenseRes || []);
        setWeeklySettlements(settlementRes || []);
        setSellerInvoices(invoiceRes || []);
        setLoading(false);
      } catch (err) {
        console.error('Failed to sync backend collections:', err);
      }
    }
    loadAllData();
  }, [refreshKey]);

  // ─── Employees ─────────────────────────────────────────────
  const getEmployeeById = (id) => employees.find((e) => e.id === id) || null;

  const addEmployee = async (data) => {
    const res = await fetch('/api/employees', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    refresh();
    return result;
  };

  const updateEmployee = async (id, updates) => {
    const res = await fetch(`/api/employees/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    const result = await res.json();
    refresh();
    return result;
  };

  const deleteEmployee = async (id) => {
    await fetch(`/api/employees/${id}`, { method: 'DELETE' });
    refresh();
  };

  // ─── Fish Varieties ────────────────────────────────────────
  const addFishVariety = async (name) => {
    const res = await fetch('/api/fish-varieties', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
    const result = await res.json();
    refresh();
    return result;
  };

  const deleteFishVariety = async (id) => {
    await fetch(`/api/fish-varieties/${id}`, { method: 'DELETE' });
    refresh();
  };

  // ─── Catch Entries ─────────────────────────────────────────
  const getCatchEntriesByDate = (date) => catchEntries.filter((c) => c.date === date);
  const getCatchEntriesByEmployee = (empId) => catchEntries.filter((c) => c.employeeId === empId);
  const getCatchEntriesByDateRange = (s, e) => catchEntries.filter((c) => c.date >= s && c.date <= e);

  const addCatchEntry = async (data) => {
    const res = await fetch('/api/catches', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    refresh();
    return result;
  };

  const updateCatchEntry = async (id, updates) => {
    const res = await fetch(`/api/catches/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    const result = await res.json();
    refresh();
    return result;
  };

  const deleteCatchEntry = async (id) => {
    await fetch(`/api/catches/${id}`, { method: 'DELETE' });
    refresh();
  };

  // ─── Daily Fish Prices ─────────────────────────────────────
  const getDailyFishPricesByDate = (date) => dailyFishPrices.filter((p) => p.date === date);
  const getDailyFishPrice = (varietyId, date) =>
    dailyFishPrices.find((p) => p.fishVarietyId === varietyId && p.date === date) || null;

  const setDailyFishPrice = async (varietyId, date, price) => {
    const res = await fetch('/api/fish-prices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fishVarietyId: varietyId, date, pricePerKg: price }),
    });
    const result = await res.json();
    refresh();
    return result;
  };

  // ─── Expenses ──────────────────────────────────────────────
  const getExpensesByDate = (date) => expenses.filter((e) => e.date === date);
  const getExpensesByEmployee = (empId) => expenses.filter((e) => e.employeeId === empId);
  const getExpensesByDateRange = (s, e) => expenses.filter((e) => e.date >= s && e.date <= e);

  const addExpense = async (data) => {
    const res = await fetch('/api/expenses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    refresh();
    return result;
  };

  const deleteExpense = async (id) => {
    await fetch(`/api/expenses/${id}`, { method: 'DELETE' });
    refresh();
  };

  // ─── Invoices & Settlements ────────────────────────────────
  const generateSellerInvoice = async (date) => {
    const res = await fetch('/api/invoices/seller', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date }),
    });
    const result = await res.json();
    refresh();
    return result;
  };

  const getSellerInvoiceByDate = (date) => sellerInvoices.find((i) => i.date === date) || null;
  const getSellerInvoices = () => sellerInvoices;

  const getWeeklySettlements = () => weeklySettlements;
  const getWeeklySettlement = (empId, weekStart) =>
    weeklySettlements.find((s) => s.employeeId === empId && s.weekStart === weekStart) || null;

  const addWeeklySettlement = async (data) => {
    const res = await fetch('/api/settlements', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    refresh();
    return result;
  };

  const settleWeek = async (id) => {
    const res = await fetch(`/api/settlements/${id}/settle`, { method: 'PUT' });
    const result = await res.json();
    refresh();
    return result;
  };

  const unsettleWeek = async (id) => {
    const res = await fetch(`/api/settlements/${id}/unsettle`, { method: 'PUT' });
    const result = await res.json();
    refresh();
    return result;
  };

  const deleteWeeklySettlement = async (id) => {
    await fetch(`/api/settlements/${id}`, { method: 'DELETE' });
    refresh();
  };

  // ─── Aggregates ────────────────────────────────────────────
  const getEmployeeDailyIncome = (employeeId, date) => {
    const entries = catchEntries.filter(
      (c) => c.employeeId === employeeId && c.date === date && c.status === 'priced'
    );
    return entries.reduce((sum, e) => sum + (e.value || 0), 0);
  };

  const getEmployeeDailyExpenses = (employeeId, date) => {
    const exps = expenses.filter(
      (e) => e.employeeId === employeeId && e.date === date
    );
    return exps.reduce((sum, e) => sum + e.amount, 0);
  };

  const getEmployeeWeeklySummary = (employeeId, startDate, endDate) => {
    const catches = catchEntries.filter(
      (c) => c.employeeId === employeeId && c.date >= startDate && c.date <= endDate
    );
    const exps = expenses.filter(
      (e) => e.employeeId === employeeId && e.date >= startDate && e.date <= endDate
    );

    const totalIncome = catches
      .filter((c) => c.status === 'priced')
      .reduce((sum, c) => sum + (c.value || 0), 0);
    const totalExpenses = exps.reduce((sum, e) => sum + e.amount, 0);
    const totalWeightKg = catches.reduce((sum, c) => sum + c.weightKg, 0);
    const hasPending = catches.some((c) => c.status === 'pending_price');

    return {
      totalIncome,
      totalExpenses,
      netBalance: totalIncome - totalExpenses,
      totalWeightKg,
      catchEntries: catches,
      expenses: exps,
      hasPending,
    };
  };

  // ─── Data Management ──────────────────────────────────────
  const exportAllData = async () => {
    const res = await fetch('/api/data/export');
    return res.json();
  };

  const importAllData = async (data) => {
    await fetch('/api/data/import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    refresh();
  };

  const clearAllData = async () => {
    await fetch('/api/data/clear', { method: 'POST' });
    refresh();
  };

  const value = {
    refreshKey,
    loading,
    // Employees
    employees, addEmployee, updateEmployee, deleteEmployee, getEmployeeById,
    // Fish Varieties
    fishVarieties, addFishVariety, deleteFishVariety,
    // Catch
    getCatchEntriesByDate, getCatchEntriesByEmployee, getCatchEntriesByDateRange,
    addCatchEntry, updateCatchEntry, deleteCatchEntry,
    // Prices
    getDailyFishPricesByDate, getDailyFishPrice, setDailyFishPrice,
    // Expenses
    getExpensesByDate, getExpensesByEmployee, getExpensesByDateRange,
    addExpense, deleteExpense,
    // Seller Invoices
    generateSellerInvoice, getSellerInvoiceByDate, getSellerInvoices,
    // Weekly Settlements
    getWeeklySettlements, getWeeklySettlement,
    addWeeklySettlement, settleWeek, unsettleWeek, deleteWeeklySettlement,
    // Aggregates
    getEmployeeDailyIncome, getEmployeeDailyExpenses, getEmployeeWeeklySummary,
    // Data Management
    exportAllData, importAllData, clearAllData,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within DataProvider');
  return context;
};
