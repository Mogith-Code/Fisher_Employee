import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.join(__dirname, 'data', 'db.json');

// Ensure standard defaults
const DEFAULT_FISH_VARIETIES = [
  'Balaya',
  'Thalapath',
  'Paraw',
  'Salaya',
  'Kelawalla',
  'Soorai',
  'Thora',
];

const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// Simple promise chain to serialize writes and prevent concurrent file corruption
let writeQueue = Promise.resolve();

async function ensureDir(filePath) {
  const dir = path.dirname(filePath);
  try {
    await fs.mkdir(dir, { recursive: true });
  } catch (err) {
    if (err.code !== 'EEXIST') throw err;
  }
}

export async function readDb() {
  await ensureDir(DB_PATH);
  try {
    const raw = await fs.readFile(DB_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    if (err.code === 'ENOENT') {
      // Seed initial structure
      const initialDb = {
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
      await fs.writeFile(DB_PATH, JSON.stringify(initialDb, null, 2), 'utf-8');
      return initialDb;
    }
    throw err;
  }
}

export async function writeDb(data) {
  return new Promise((resolve, reject) => {
    writeQueue = writeQueue.then(async () => {
      try {
        await ensureDir(DB_PATH);
        await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
        resolve();
      } catch (err) {
        reject(err);
      }
    });
  });
}
