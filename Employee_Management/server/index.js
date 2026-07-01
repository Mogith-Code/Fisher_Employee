import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import { readDb, writeDb } from './db.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(morgan('dev'));
app.use(bodyParser.json({ limit: '50mb' }));

// Utility: generate unique ID
const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// ─── AUTHENTICATION ──────────────────────────────────────────
app.post('/api/auth/login', (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }
  // Mock login: accepts any valid email, returns user object
  return res.json({
    email,
    name: 'Admin User',
    role: 'Administrator',
    token: `token-${generateId()}`,
  });
});

// ─── EMPLOYEES CRUD ──────────────────────────────────────────
app.get('/api/employees', async (req, res) => {
  try {
    const db = await readDb();
    res.json(db.fisheries_employees || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/employees/:id', async (req, res) => {
  try {
    const db = await readDb();
    const emp = db.fisheries_employees.find((e) => e.id === req.params.id);
    if (!emp) return res.status(404).json({ error: 'Employee not found' });
    res.json(emp);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/employees', async (req, res) => {
  try {
    const { name, nic, phone } = req.body;
    if (!name || !nic || !phone) {
      return res.status(400).json({ error: 'Missing required employee fields' });
    }

    const db = await readDb();
    const newEmployee = {
      id: generateId(),
      name,
      nic: nic.toUpperCase(),
      phone,
      photoUrl: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.fisheries_employees.push(newEmployee);
    await writeDb(db);
    res.status(201).json(newEmployee);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/employees/:id', async (req, res) => {
  try {
    const db = await readDb();
    const idx = db.fisheries_employees.findIndex((e) => e.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Employee not found' });

    db.fisheries_employees[idx] = {
      ...db.fisheries_employees[idx],
      ...req.body,
      updatedAt: new Date().toISOString(),
    };

    await writeDb(db);
    res.json(db.fisheries_employees[idx]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/employees/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const db = await readDb();

    db.fisheries_employees = db.fisheries_employees.filter((e) => e.id !== id);

    // Cascading delete related records
    db.fisheries_catch_entries = db.fisheries_catch_entries.filter((c) => c.employeeId !== id);
    db.fisheries_expenses = db.fisheries_expenses.filter((e) => e.employeeId !== id);
    db.fisheries_weekly_settlements = db.fisheries_weekly_settlements.filter((s) => s.employeeId !== id);

    await writeDb(db);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── FISH VARIETIES CRUD ──────────────────────────────────────
app.get('/api/fish-varieties', async (req, res) => {
  try {
    const db = await readDb();
    res.json(db.fisheries_fish_varieties || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/fish-varieties', async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Variety name is required' });

    const db = await readDb();
    const newVariety = {
      id: generateId(),
      name,
      createdAt: new Date().toISOString(),
    };

    db.fisheries_fish_varieties.push(newVariety);
    await writeDb(db);
    res.status(201).json(newVariety);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/fish-varieties/:id', async (req, res) => {
  try {
    const db = await readDb();
    db.fisheries_fish_varieties = db.fisheries_fish_varieties.filter((v) => v.id !== req.params.id);
    await writeDb(db);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── CATCH ENTRIES CRUD ────────────────────────────────────────
app.get('/api/catches', async (req, res) => {
  try {
    const db = await readDb();
    res.json(db.fisheries_catch_entries || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/catches', async (req, res) => {
  try {
    const { employeeId, fishVarietyId, date, weightKg } = req.body;
    if (!employeeId || !fishVarietyId || !date || weightKg == null) {
      return res.status(400).json({ error: 'Missing required catch fields' });
    }

    const db = await readDb();

    // Check if price exists for this variety + date
    const priceEntry = db.fisheries_daily_fish_prices.find(
      (p) => p.fishVarietyId === fishVarietyId && p.date === date
    );

    const pricePerKg = priceEntry ? priceEntry.pricePerKg : null;
    const value = pricePerKg ? parseFloat(weightKg) * pricePerKg : null;
    const status = pricePerKg ? 'priced' : 'pending_price';

    const newCatch = {
      id: generateId(),
      employeeId,
      fishVarietyId,
      date,
      weightKg: parseFloat(weightKg),
      pricePerKg,
      value,
      status,
      createdAt: new Date().toISOString(),
    };

    db.fisheries_catch_entries.push(newCatch);
    await writeDb(db);
    res.status(201).json(newCatch);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/catches/:id', async (req, res) => {
  try {
    const db = await readDb();
    const idx = db.fisheries_catch_entries.findIndex((c) => c.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Catch entry not found' });

    db.fisheries_catch_entries[idx] = {
      ...db.fisheries_catch_entries[idx],
      ...req.body,
    };

    await writeDb(db);
    res.json(db.fisheries_catch_entries[idx]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/catches/:id', async (req, res) => {
  try {
    const db = await readDb();
    db.fisheries_catch_entries = db.fisheries_catch_entries.filter((c) => c.id !== req.params.id);
    await writeDb(db);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── DAILY FISH PRICES ────────────────────────────────────────
app.get('/api/fish-prices', async (req, res) => {
  try {
    const db = await readDb();
    res.json(db.fisheries_daily_fish_prices || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/fish-prices', async (req, res) => {
  try {
    const { fishVarietyId, date, pricePerKg } = req.body;
    if (!fishVarietyId || !date || pricePerKg == null) {
      return res.status(400).json({ error: 'Missing required pricing fields' });
    }

    const db = await readDb();
    const existingIdx = db.fisheries_daily_fish_prices.findIndex(
      (p) => p.fishVarietyId === fishVarietyId && p.date === date
    );

    const priceEntry = {
      id: existingIdx >= 0 ? db.fisheries_daily_fish_prices[existingIdx].id : generateId(),
      fishVarietyId,
      date,
      pricePerKg: parseFloat(pricePerKg),
      enteredAt: new Date().toISOString(),
    };

    if (existingIdx >= 0) {
      db.fisheries_daily_fish_prices[existingIdx] = priceEntry;
    } else {
      db.fisheries_daily_fish_prices.push(priceEntry);
    }

    // ─── Cascade-update catches ───
    db.fisheries_catch_entries.forEach((entry, idx) => {
      if (entry.fishVarietyId === fishVarietyId && entry.date === date) {
        db.fisheries_catch_entries[idx] = {
          ...entry,
          pricePerKg: parseFloat(pricePerKg),
          value: entry.weightKg * parseFloat(pricePerKg),
          status: 'priced',
        };
      }
    });

    await writeDb(db);
    res.json(priceEntry);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── EXPENSES CRUD ────────────────────────────────────────────
app.get('/api/expenses', async (req, res) => {
  try {
    const db = await readDb();
    res.json(db.fisheries_expenses || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/expenses', async (req, res) => {
  try {
    const { employeeId, date, category, amount } = req.body;
    if (!employeeId || !date || !category || amount == null) {
      return res.status(400).json({ error: 'Missing required expense fields' });
    }

    const db = await readDb();
    const newExpense = {
      id: generateId(),
      employeeId,
      date,
      category,
      amount: parseFloat(amount),
      createdAt: new Date().toISOString(),
    };

    db.fisheries_expenses.push(newExpense);
    await writeDb(db);
    res.status(201).json(newExpense);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/expenses/:id', async (req, res) => {
  try {
    const db = await readDb();
    db.fisheries_expenses = db.fisheries_expenses.filter((e) => e.id !== req.params.id);
    await writeDb(db);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── SELLER INVOICES ──────────────────────────────────────────
app.get('/api/invoices/seller', async (req, res) => {
  try {
    const db = await readDb();
    res.json(db.fisheries_seller_invoices || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/invoices/seller', async (req, res) => {
  try {
    const { date } = req.body;
    if (!date) return res.status(400).json({ error: 'Invoice date is required' });

    const db = await readDb();
    const catchEntries = db.fisheries_catch_entries.filter((c) => c.date === date);

    // Group catches by variety
    const catchByVariety = {};
    catchEntries.forEach((entry) => {
      if (!catchByVariety[entry.fishVarietyId]) {
        const variety = db.fisheries_fish_varieties.find((v) => v.id === entry.fishVarietyId);
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

    const existingIdx = db.fisheries_seller_invoices.findIndex((i) => i.date === date);

    const invoice = {
      id: existingIdx >= 0 ? db.fisheries_seller_invoices[existingIdx].id : generateId(),
      date,
      catchByVariety: Object.values(catchByVariety),
      totalWeightKg: catchEntries.reduce((sum, e) => sum + e.weightKg, 0),
      createdAt: existingIdx >= 0 ? db.fisheries_seller_invoices[existingIdx].createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (existingIdx >= 0) {
      db.fisheries_seller_invoices[existingIdx] = invoice;
    } else {
      db.fisheries_seller_invoices.push(invoice);
    }

    await writeDb(db);
    res.json(invoice);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── WEEKLY SETTLEMENTS ───────────────────────────────────────
app.get('/api/settlements', async (req, res) => {
  try {
    const db = await readDb();
    res.json(db.fisheries_weekly_settlements || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/settlements', async (req, res) => {
  try {
    const { employeeId, weekStart, weekEnd, totalIncome, totalExpenses, netBalance } = req.body;
    if (!employeeId || !weekStart || !weekEnd) {
      return res.status(400).json({ error: 'Missing required settlement fields' });
    }

    const db = await readDb();
    const newSettlement = {
      id: generateId(),
      employeeId,
      weekStart,
      weekEnd,
      totalIncome: parseFloat(totalIncome || 0),
      totalExpenses: parseFloat(totalExpenses || 0),
      netBalance: parseFloat(netBalance || 0),
      settled: false,
      settledAt: null,
      createdAt: new Date().toISOString(),
    };

    db.fisheries_weekly_settlements.push(newSettlement);
    await writeDb(db);
    res.status(201).json(newSettlement);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/settlements/:id/settle', async (req, res) => {
  try {
    const db = await readDb();
    const idx = db.fisheries_weekly_settlements.findIndex((s) => s.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Settlement not found' });

    db.fisheries_weekly_settlements[idx] = {
      ...db.fisheries_weekly_settlements[idx],
      settled: true,
      settledAt: new Date().toISOString(),
    };

    await writeDb(db);
    res.json(db.fisheries_weekly_settlements[idx]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/settlements/:id/unsettle', async (req, res) => {
  try {
    const db = await readDb();
    const idx = db.fisheries_weekly_settlements.findIndex((s) => s.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Settlement not found' });

    db.fisheries_weekly_settlements[idx] = {
      ...db.fisheries_weekly_settlements[idx],
      settled: false,
      settledAt: null,
    };

    await writeDb(db);
    res.json(db.fisheries_weekly_settlements[idx]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/settlements/:id', async (req, res) => {
  try {
    const db = await readDb();
    db.fisheries_weekly_settlements = db.fisheries_weekly_settlements.filter((s) => s.id !== req.params.id);
    await writeDb(db);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── ADMIN SYSTEM DATA MANAGEMENT ─────────────────────────────
app.get('/api/data/export', async (req, res) => {
  try {
    const db = await readDb();
    res.json(db);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/data/import', async (req, res) => {
  try {
    const dbData = req.body;
    if (typeof dbData !== 'object' || dbData === null) {
      return res.status(400).json({ error: 'Invalid database payload' });
    }
    await writeDb(dbData);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/data/clear', async (req, res) => {
  try {
    // Clear and reset varieties
    const db = {
      fisheries_employees: [],
      fisheries_fish_varieties: DEFAULT_FISH_VARIETIES.map((name) => ({
        id: generateId() + '-' + name.toLowerCase(),
        name,
        createdAt: new Date().toISOString(),
      })),
      fisheries_catch_entries: [],
      fisheries_daily_fish_prices: [],
      fisheries_expenses: [],
      fisheries_weekly_settlements: [],
      fisheries_seller_invoices: [],
    };
    await writeDb(db);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
