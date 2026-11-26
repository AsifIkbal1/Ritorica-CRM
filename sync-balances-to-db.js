const fsSync = require("node:fs");
const path = require("node:path");

// Load local .env file before requiring database.js
try {
  const envPath = path.join(__dirname, ".env");
  if (fsSync.existsSync(envPath)) {
    const lines = fsSync.readFileSync(envPath, "utf8").split(/\r?\n/);
    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line || line.startsWith("#")) continue;
      const eq = line.indexOf("=");
      if (eq <= 0) continue;
      const key = line.slice(0, eq).trim();
      let val = line.slice(eq + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      if (key && process.env[key] === undefined) {
        process.env[key] = val;
      }
    }
  }
} catch {
  // Ignore unreadable .env
}

if (!process.env.DATABASE_URL && process.env.SYNC_DATABASE_URL) {
  process.env.DATABASE_URL = process.env.SYNC_DATABASE_URL;
}

const database = require("./database");
const simBalanceService = require("./sim-balance-service");

const SIM_BALANCES_FILE = path.join(__dirname, "data", "sim-balances.json");

async function runSyncOnce() {
  if (!database.isDatabaseConfigured()) {
    throw new Error("Set DATABASE_URL or SYNC_DATABASE_URL in .env to sync balances to PostgreSQL.");
  }

  let raw = null;
  try {
    raw = await database.getJson(SIM_BALANCES_FILE);
  } catch {
    raw = null;
  }
  const store = simBalanceService.normalizeStore(raw);

  const results = await Promise.all(
    simBalanceService.MONITORED_SIMS.map(async (meta) => {
      const result = await simBalanceService.fetchLiveSimBalance(meta.simNumber);
      return { simNumber: meta.simNumber, result };
    }),
  );

  const checkedAt = new Date().toISOString();
  for (const { simNumber, result } of results) {
    store.sims[simNumber] = simBalanceService.applySyncResult(store.sims[simNumber], result, checkedAt);
  }
  store.lastSyncAt = checkedAt;

  await database.setJson(SIM_BALANCES_FILE, store);
  const summary = simBalanceService.summarizeStore(store);
  console.log(
    `[${checkedAt}] Synced to Postgres: Total=BDT ${summary.totalBalance.toFixed(2)} | Online=${summary.connectedCount}/${summary.totalSims}`,
  );
  return summary;
}

const watchMode = process.argv.includes("--watch");
const intervalSec = Math.max(15, Number(process.env.SYNC_WORKER_INTERVAL_SECONDS || 60));

if (watchMode) {
  let running = false;
  const tick = async () => {
    if (running) return;
    running = true;
    try {
      await runSyncOnce();
    } catch (error) {
      console.error(`[${new Date().toISOString()}] Sync failed: ${error.message}`);
    } finally {
      running = false;
    }
  };
  tick();
  setInterval(tick, intervalSec * 1000);
} else {
  runSyncOnce()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(`Sync failed: ${error.message}`);
      process.exit(1);
    });
}
