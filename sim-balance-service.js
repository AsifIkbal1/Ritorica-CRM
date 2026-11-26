const crypto = require("node:crypto");

const MONITORED_SIMS = [
  { simNumber: "01552146408", operator: "Teletalk" },
  { simNumber: "01339911694", operator: "Grameenphone" },
  { simNumber: "01969904987", operator: "Banglalink" },
  { simNumber: "01969904986", operator: "Banglalink" },
  { simNumber: "01805991952", operator: "Robi" },
  { simNumber: "01805991951", operator: "Robi" },
];

const DEFAULT_SYNC_INTERVAL_SECONDS = 60;
const ALLOWED_SYNC_INTERVALS = [0, 15, 30, 60, 120, 300];
const DEFAULT_TIMEOUT_MS = 8_000;
const MAX_HISTORY_PER_SIM = 200;
const MNPSP_DEFAULT_HOST = "https://api.mnpspbd.com";
const RITORICA_MAIN_API = "https://api.ritorica.com.bd";
const RITORICA_BACKUP_API = "https://api2.ritorica.com.bd";

function detectOperator(simNumber) {
  const digits = String(simNumber || "").replace(/\D/g, "");
  const normalized = digits.startsWith("880") ? `0${digits.slice(3)}` : digits;
  if (normalized.startsWith("013") || normalized.startsWith("017")) return "Grameenphone";
  if (normalized.startsWith("014") || normalized.startsWith("019")) return "Banglalink";
  if (normalized.startsWith("015")) return "Teletalk";
  if (normalized.startsWith("018")) return "Robi";
  if (normalized.startsWith("016")) return "Airtel";
  return "Unknown";
}

function detectMnpspMnoCode(simNumber) {
  const operator = detectOperator(simNumber);
  if (operator === "Grameenphone") return "GP";
  if (operator === "Robi" || operator === "Airtel") return "RB";
  if (operator === "Teletalk") return "TT";
  if (operator === "Banglalink") return "BL";
  return "";
}

function getTimeoutMs() {
  const parsed = Number(process.env.SIM_BALANCE_TIMEOUT_MS);
  if (Number.isFinite(parsed) && parsed >= 1000 && parsed <= 30_000) {
    return parsed;
  }
  return DEFAULT_TIMEOUT_MS;
}

/**
 * Loads backend-only provider configuration for each SIM from environment variables.
 * Never expose returned credentials to the frontend.
 *
 * Supported env formats:
 * 1) SIM_BALANCE_PROVIDERS_JSON='{"01552146408":{"type":"generic-json","url":"https://...","method":"GET","headers":{"Authorization":"Bearer ..."},"balancePath":"balance"}}'
 * 2) Per-SIM env vars:
 *    - SIM_BALANCE_<SIM>_TYPE (generic-json | mnpsp | gp-cmp)
 *    - SIM_BALANCE_<SIM>_URL
 *    - SIM_BALANCE_<SIM>_API_KEY / SIM_BALANCE_<SIM>_TOKEN / SIM_BALANCE_<SIM>_USERNAME / SIM_BALANCE_<SIM>_PASSWORD
 *    - SIM_BALANCE_<SIM>_BALANCE_PATH (dot path e.g. "data.balance" or "availableBalance")
 *    - SIM_BALANCE_<SIM>_METHOD (GET or POST)
 *    - SIM_BALANCE_<SIM>_SCALE (optional divisor, e.g. 100 when gateway returns paisa)
 */
function getProviderConfig(simNumber) {
  if (process.env.SIM_BALANCE_PROVIDERS_JSON) {
    try {
      const parsed = JSON.parse(process.env.SIM_BALANCE_PROVIDERS_JSON);
      if (parsed && typeof parsed === "object" && parsed[simNumber] && typeof parsed[simNumber] === "object") {
        return parsed[simNumber];
      }
    } catch {
      return {
        type: "invalid-config",
        configError: "SIM_BALANCE_PROVIDERS_JSON contains invalid JSON.",
      };
    }
  }

  const prefix = `SIM_BALANCE_${simNumber}_`;
  const url = (process.env[`${prefix}URL`] || "").trim();
  const type = (process.env[`${prefix}TYPE`] || (url ? "generic-json" : "")).trim().toLowerCase();
  if (!type && !url) return null;

  return {
    type: type || "generic-json",
    url,
    method: (process.env[`${prefix}METHOD`] || "").trim().toUpperCase() || undefined,
    apiKey: process.env[`${prefix}API_KEY`] || process.env.MNPSP_API_KEY || "",
    token: process.env[`${prefix}TOKEN`] || "",
    username: process.env[`${prefix}USERNAME`] || "",
    password: process.env[`${prefix}PASSWORD`] || "",
    mno: (process.env[`${prefix}MNO`] || "").trim().toUpperCase() || undefined,
    balancePath: (process.env[`${prefix}BALANCE_PATH`] || "").trim() || undefined,
    scale: process.env[`${prefix}SCALE`] ? Number(process.env[`${prefix}SCALE`]) : undefined,
    multiplier: process.env[`${prefix}MULTIPLIER`] ? Number(process.env[`${prefix}MULTIPLIER`]) : undefined,
    unit: (process.env[`${prefix}UNIT`] || "").trim().toLowerCase() || undefined,
  };
}

function readDotPath(obj, dotPath) {
  if (!obj || typeof obj !== "object" || !dotPath) return undefined;
  return dotPath.split(".").reduce((current, key) => {
    if (current === null || current === undefined || typeof current !== "object") return undefined;
    return current[key];
  }, obj);
}

function parseRawNumeric(raw) {
  if (typeof raw === "number" && Number.isFinite(raw)) {
    return raw;
  }
  if (typeof raw === "string") {
    const cleaned = raw.replace(/[^\d.-]/g, "");
    if (!cleaned) return null;
    const numeric = Number(cleaned);
    if (Number.isFinite(numeric)) {
      return numeric;
    }
  }
  return null;
}

function parseNumericBalance(raw, scale = 1, multiplier = 1) {
  const numeric = parseRawNumeric(raw);
  if (numeric === null) return null;
  const safeScale = Number.isFinite(scale) && scale > 0 ? scale : 1;
  const safeMultiplier = Number.isFinite(multiplier) && multiplier > 0 ? multiplier : 1;
  return Math.round(((numeric / safeScale) * safeMultiplier) * 100) / 100;
}

async function fetchWithTimeout(url, options = {}, timeoutMs = getTimeoutMs()) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

async function queryGenericJsonProvider(config, simNumber) {
  if (!config.url) {
    return {
      ok: false,
      connected: false,
      apiConfigured: false,
      apiResponseStatus: "NOT_CONFIGURED",
      errorMessage: "Balance API Not Connected",
    };
  }

  const method = config.method || "GET";
  const headers = {
    Accept: "application/json",
    ...(config.headers && typeof config.headers === "object" ? config.headers : {}),
  };
  if (config.token && !headers.Authorization) {
    headers.Authorization = `Bearer ${config.token}`;
  }
  if (config.apiKey && !headers["x-api-key"]) {
    headers["x-api-key"] = config.apiKey;
  }

  let body;
  if (method !== "GET" && method !== "HEAD") {
    headers["Content-Type"] = headers["Content-Type"] || "application/json";
    body = JSON.stringify({
      simNumber,
      ...(config.body && typeof config.body === "object" ? config.body : {}),
    });
  }

  const response = await fetchWithTimeout(config.url, { method, headers, body });
  const text = await response.text();
  if (!response.ok) {
    return {
      ok: false,
      connected: false,
      apiConfigured: true,
      apiResponseStatus: `HTTP_${response.status}`,
      errorMessage: `Operator gateway returned HTTP ${response.status}.`,
    };
  }

  let payload;
  try {
    payload = JSON.parse(text);
  } catch {
    return {
      ok: false,
      connected: false,
      apiConfigured: true,
      apiResponseStatus: "INVALID_RESPONSE",
      errorMessage: "Operator API returned a non-JSON response.",
    };
  }

  const candidatePaths = [
    config.balancePath,
    "balance",
    "availableBalance",
    "availablebalance",
    "data.balance",
    "data.availableBalance",
    "statusInfo.availablebalance",
  ].filter(Boolean);

  let rawValue;
  for (const pathKey of candidatePaths) {
    const found = readDotPath(payload, pathKey);
    if (found !== undefined && found !== null && found !== "") {
      rawValue = found;
      break;
    }
  }

  const scale = Number.isFinite(config.scale) && config.scale > 0 ? config.scale : 1;
  const balance = parseNumericBalance(rawValue, scale);
  if (balance === null) {
    return {
      ok: false,
      connected: false,
      apiConfigured: true,
      apiResponseStatus: "MISSING_BALANCE",
      errorMessage: "Operator response did not include a valid numeric balance.",
    };
  }

  return {
    ok: true,
    connected: true,
    apiConfigured: true,
    balance,
    apiResponseStatus: `HTTP_${response.status}_OK`,
    errorMessage: "",
  };
}

async function queryMnpspProvider(config) {
  const apiKey = config.apiKey || process.env.MNPSP_API_KEY || "";
  const url =
    config.url ||
    `${(process.env.MNPSP_BASE_URL || MNPSP_DEFAULT_HOST).replace(/\/+$/, "")}/a2p-wallet/api/v1/check-current-balance`;
  if (!apiKey) {
    return {
      ok: false,
      connected: false,
      apiConfigured: false,
      apiResponseStatus: "NOT_CONFIGURED",
      errorMessage: "Balance API Not Connected",
    };
  }

  const response = await fetchWithTimeout(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ apiKey }),
  });
  const text = await response.text();
  let parsed = {};
  try {
    parsed = JSON.parse(text);
  } catch {
    return {
      ok: false,
      connected: false,
      apiConfigured: true,
      apiResponseStatus: `HTTP_${response.status}_INVALID`,
      errorMessage: "MNPSP balance API returned an invalid response.",
    };
  }

  const code = String(parsed.serverResponseCode ?? "").trim();
  if (response.ok && code === "9000") {
    const balance = parseNumericBalance(parsed.availableBalance, 1);
    if (balance === null) {
      return {
        ok: false,
        connected: false,
        apiConfigured: true,
        apiResponseStatus: "MISSING_BALANCE",
        errorMessage: "MNPSP response did not contain a valid balance.",
      };
    }
    return {
      ok: true,
      connected: true,
      apiConfigured: true,
      balance,
      apiResponseStatus: "MNPSP_9000_OK",
      errorMessage: "",
    };
  }

  const message = String(parsed.serverResponseMessage ?? "").trim();
  return {
    ok: false,
    connected: false,
    apiConfigured: true,
    apiResponseStatus: code ? `MNPSP_${code}` : `HTTP_${response.status}`,
    errorMessage: message || `MNPSP balance check rejected (code ${code || response.status}).`,
  };
}

/**
 * Infozillion MNPSP: API Check ANS Balance
 * POST https://a2papiintl.mnpspbd.com/a2p-proxy-api/api/v1/check-credit-balance
 * Body: { username, password, mno: "GP"|"RB"|"TT"|"BL", apiKey }
 */
async function queryMnpspAnsProvider(config, simNumber) {
  const apiKey = config.apiKey || process.env.MNPSP_API_KEY || "";
  const mno = config.mno || detectMnpspMnoCode(simNumber);
  const url =
    config.url ||
    `${(process.env.MNPSP_BASE_URL || MNPSP_DEFAULT_HOST).replace(/\/+$/, "")}/a2p-proxy-api/api/v1/check-credit-balance`;

  if (!apiKey || !config.username || !config.password || !mno) {
    return {
      ok: false,
      connected: false,
      apiConfigured: false,
      apiResponseStatus: "NOT_CONFIGURED",
      errorMessage: "Balance API Not Connected",
    };
  }

  const response = await fetchWithTimeout(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      username: config.username,
      password: config.password,
      mno,
      apiKey,
    }),
  });
  const text = await response.text();
  if (response.status === 403) {
    return {
      ok: false,
      connected: false,
      apiConfigured: true,
      apiResponseStatus: "HTTP_403_IP_BLOCKED",
      errorMessage: `MNPSP (${mno}) blocked this server IP (HTTP 403). Sync from a whitelisted IP.`,
    };
  }
  let parsed = {};
  try {
    parsed = JSON.parse(text);
  } catch {
    return {
      ok: false,
      connected: false,
      apiConfigured: true,
      apiResponseStatus: `HTTP_${response.status}_INVALID`,
      errorMessage: `MNPSP ANS (${mno}) balance API returned an invalid response.`,
    };
  }

  const code = String(parsed.serverResponseCode ?? "").trim();
  const mnoCode = String(parsed.mnoResponseCode ?? "").trim();
  if (response.ok && code === "9000") {
    if (mnoCode && mnoCode !== "1000") {
      const mnoMsg = String(parsed.mnoResponseMessage ?? "").trim();
      return {
        ok: false,
        connected: false,
        apiConfigured: true,
        apiResponseStatus: `MNO_${mno}_${mnoCode}`,
        errorMessage: mnoMsg
          ? `${mno} gateway rejected credentials: ${mnoMsg} (code ${mnoCode}).`
          : `${mno} balance check failed (MNO code ${mnoCode}).`,
      };
    }
    const scale = Number.isFinite(config.scale) && config.scale > 0 ? config.scale : 1;
    const multiplier = Number.isFinite(config.multiplier) && config.multiplier > 0 ? config.multiplier : 1;
    const rawBalance = parseRawNumeric(parsed.availableBalance);
    const balance = parseNumericBalance(parsed.availableBalance, scale, multiplier);
    if (balance === null) {
      return {
        ok: false,
        connected: false,
        apiConfigured: true,
        apiResponseStatus: "MISSING_BALANCE",
        errorMessage: `MNPSP ANS (${mno}) response did not include a valid balance.`,
      };
    }
    return {
      ok: true,
      connected: true,
      apiConfigured: true,
      balance,
      rawBalance,
      balanceUnit: config.unit || (scale === 100 ? "paisa" : "bdt"),
      apiResponseStatus: `MNPSP_${mno}_1000_OK`,
      errorMessage: "",
    };
  }

  const message = String(parsed.serverResponseMessage ?? "").trim();
  return {
    ok: false,
    connected: false,
    apiConfigured: true,
    apiResponseStatus: code ? `MNPSP_${code}` : `HTTP_${response.status}`,
    errorMessage: message || `MNPSP ANS (${mno}) balance check failed (code ${code || response.status}).`,
  };
}

/**
 * Ritorica HTTP API v2: GET https://api.ritorica.com.bd/v2/account
 * Authorization: Bearer <API_KEY>
 * Response: { "success": true, "data": { "account": "12520.35" } }
 */
async function queryRitoricaV2Provider(config) {
  const token = config.token || config.apiKey || "";
  if (!token) {
    return {
      ok: false,
      connected: false,
      apiConfigured: false,
      apiResponseStatus: "NOT_CONFIGURED",
      errorMessage: "Balance API Not Connected",
    };
  }

  const urls = config.url
    ? [config.url]
    : [`${RITORICA_MAIN_API}/v2/account`, `${RITORICA_BACKUP_API}/v2/account`];

  let lastError = null;
  for (const url of urls) {
    try {
      const response = await fetchWithTimeout(url, {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const text = await response.text();
      let parsed = {};
      try {
        parsed = JSON.parse(text);
      } catch {
        return {
          ok: false,
          connected: false,
          apiConfigured: true,
          apiResponseStatus: `HTTP_${response.status}_INVALID`,
          errorMessage: "Ritorica API v2 returned a non-JSON response.",
        };
      }

      if (response.ok && parsed.success === true) {
        const balance = parseNumericBalance(parsed?.data?.account, 1);
        if (balance === null) {
          return {
            ok: false,
            connected: false,
            apiConfigured: true,
            apiResponseStatus: "MISSING_BALANCE",
            errorMessage: "Ritorica API v2 response did not contain a valid account balance.",
          };
        }
        return {
          ok: true,
          connected: true,
          apiConfigured: true,
          balance,
          apiResponseStatus: "RITORICA_V2_OK",
          errorMessage: "",
        };
      }

      const errCode = parsed?.error?.code ?? response.status;
      const errMsg = parsed?.error?.message || `Ritorica API v2 rejected request (HTTP ${response.status}).`;
      if (Number(errCode) === 1000 && url !== urls[urls.length - 1]) {
        continue;
      }
      return {
        ok: false,
        connected: false,
        apiConfigured: true,
        apiResponseStatus: `RITORICA_${errCode}`,
        errorMessage: errMsg,
      };
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError || new Error("Ritorica API v2 unreachable.");
}

/**
 * Ritorica HTTP API v1 (XML): POST https://api.ritorica.com.bd/multi.php
 * Form body: login=...&password=...&operation=account
 * Response XML: <reply><account>10025</account></reply>
 */
async function queryRitoricaV1Provider(config) {
  if (!config.username || !config.password) {
    return {
      ok: false,
      connected: false,
      apiConfigured: false,
      apiResponseStatus: "NOT_CONFIGURED",
      errorMessage: "Balance API Not Connected",
    };
  }

  const urls = config.url
    ? [config.url]
    : [`${RITORICA_MAIN_API}/multi.php`, `${RITORICA_BACKUP_API}/multi.php`];

  const formBody = new URLSearchParams({
    login: config.username,
    password: config.password,
    operation: "account",
  }).toString();

  let lastError = null;
  for (const url of urls) {
    try {
      const response = await fetchWithTimeout(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "text/xml, application/xml, */*",
        },
        body: formBody,
      });
      const text = await response.text();
      const accountMatch = /<account>\s*([^<]+)\s*<\/account>/i.exec(text);
      if (response.ok && accountMatch) {
        const balance = parseNumericBalance(accountMatch[1], 1);
        if (balance !== null) {
          return {
            ok: true,
            connected: true,
            apiConfigured: true,
            balance,
            apiResponseStatus: "RITORICA_V1_OK",
            errorMessage: "",
          };
        }
      }
      const codeMatch = /<code>\s*([^<]+)\s*<\/code>/i.exec(text);
      const descMatch = /<description>\s*([^<]+)\s*<\/description>/i.exec(text);
      const code = codeMatch ? codeMatch[1].trim() : String(response.status);
      if (code === "1000" && url !== urls[urls.length - 1]) {
        continue;
      }
      return {
        ok: false,
        connected: false,
        apiConfigured: true,
        apiResponseStatus: `RITORICA_${code}`,
        errorMessage: descMatch ? descMatch[1].trim() : `Ritorica API v1 error (code ${code}).`,
      };
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError || new Error("Ritorica API v1 unreachable.");
}

async function queryGpCmpProvider(config) {
  if (!config.url || !config.username || !config.password) {
    return {
      ok: false,
      connected: false,
      apiConfigured: false,
      apiResponseStatus: "NOT_CONFIGURED",
      errorMessage: "Balance API Not Connected",
    };
  }

  const response = await fetchWithTimeout(config.url, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      username: config.username,
      password: config.password,
      apicode: "3",
      msisdn: "0",
      countrycode: "0",
      cli: "0",
      messagetype: "0",
      message: "0",
      messageid: "0",
    }),
  });
  const text = await response.text();
  let parsed = {};
  try {
    parsed = JSON.parse(text);
  } catch {
    return {
      ok: false,
      connected: false,
      apiConfigured: true,
      apiResponseStatus: `HTTP_${response.status}_INVALID`,
      errorMessage: "GP CMP balance API returned an invalid response.",
    };
  }

  const info = parsed.statusInfo && typeof parsed.statusInfo === "object" ? parsed.statusInfo : {};
  const code = String(info.statusCode ?? parsed.statusCode ?? "").trim();
  if (response.ok && code === "1000") {
    const balance = parseNumericBalance(info.availablebalance ?? parsed.availablebalance, 100);
    if (balance === null) {
      return {
        ok: false,
        connected: false,
        apiConfigured: true,
        apiResponseStatus: "MISSING_BALANCE",
        errorMessage: "GP CMP response did not contain a valid balance.",
      };
    }
    return {
      ok: true,
      connected: true,
      apiConfigured: true,
      balance,
      apiResponseStatus: "GP_CMP_1000_OK",
      errorMessage: "",
    };
  }

  const message = String(info.errordescription ?? parsed.message ?? "").trim();
  return {
    ok: false,
    connected: false,
    apiConfigured: true,
    apiResponseStatus: code ? `GP_CMP_${code}` : `HTTP_${response.status}`,
    errorMessage: message || `GP CMP balance check failed (code ${code || response.status}).`,
  };
}

/**
 * Fetches live balance for a single SIM from its configured backend operator API.
 * Never returns hardcoded, fake, or random balances.
 */
async function fetchLiveSimBalance(simNumber) {
  const config = getProviderConfig(simNumber);
  if (!config) {
    return {
      ok: false,
      connected: false,
      apiConfigured: false,
      apiResponseStatus: "NOT_CONFIGURED",
      errorMessage: "Balance API Not Connected",
    };
  }

  if (config.type === "invalid-config") {
    return {
      ok: false,
      connected: false,
      apiConfigured: false,
      apiResponseStatus: "CONFIG_ERROR",
      errorMessage: config.configError || "Balance API configuration is invalid.",
    };
  }

  try {
    if (config.type === "mnpsp-ans") {
      return await queryMnpspAnsProvider(config, simNumber);
    }
    if (config.type === "mnpsp") {
      return await queryMnpspProvider(config);
    }
    if (config.type === "gp-cmp") {
      return await queryGpCmpProvider(config);
    }
    if (config.type === "ritorica-v2") {
      return await queryRitoricaV2Provider(config);
    }
    if (config.type === "ritorica-v1") {
      return await queryRitoricaV1Provider(config);
    }
    if (config.type === "generic-json") {
      return await queryGenericJsonProvider(config, simNumber);
    }
    return {
      ok: false,
      connected: false,
      apiConfigured: false,
      apiResponseStatus: "UNSUPPORTED_PROVIDER",
      errorMessage: "Balance API Not Connected",
    };
  } catch (error) {
    const timedOut = error && error.name === "AbortError";
    return {
      ok: false,
      connected: false,
      apiConfigured: true,
      apiResponseStatus: timedOut ? "TIMEOUT" : "NETWORK_ERROR",
      errorMessage: timedOut
        ? `Operator balance API timed out after ${Math.round(getTimeoutMs() / 1000)}s.`
        : `Could not reach operator balance API: ${error?.message || "connection failed"}.`,
    };
  }
}

function createInitialSimRecord(simMeta) {
  const configured = Boolean(getProviderConfig(simMeta.simNumber));
  return {
    simNumber: simMeta.simNumber,
    operator: simMeta.operator || detectOperator(simMeta.simNumber),
    latestBalance: null,
    previousBalance: null,
    lastSuccessfulSync: null,
    lastCheckedAt: null,
    connectionStatus: "offline",
    apiResponseStatus: configured ? "PENDING_SYNC" : "NOT_CONFIGURED",
    errorMessage: configured ? "" : "Balance API Not Connected",
    apiConfigured: configured,
    history: [],
  };
}

function normalizeStore(rawStore) {
  const existingSims = rawStore && typeof rawStore.sims === "object" && rawStore.sims ? rawStore.sims : {};
  const rawInterval = Number(rawStore?.config?.syncIntervalSeconds);
  const syncIntervalSeconds = ALLOWED_SYNC_INTERVALS.includes(rawInterval)
    ? rawInterval
    : DEFAULT_SYNC_INTERVAL_SECONDS;

  const isServerlessHost = process.env.VERCEL === "1";
  const sims = {};
  for (const simMeta of MONITORED_SIMS) {
    const saved = existingSims[simMeta.simNumber];
    const localConfigured = Boolean(getProviderConfig(simMeta.simNumber));
    if (saved && typeof saved === "object") {
      // On serverless hosts (e.g. Vercel), respect live records written by a whitelisted external sync worker.
      const externallyOnline =
        isServerlessHost &&
        saved.apiConfigured === true &&
        saved.connectionStatus === "online" &&
        typeof saved.lastSuccessfulSync === "string" &&
        Boolean(saved.lastSuccessfulSync);
      const externallyUnconfigured =
        isServerlessHost &&
        saved.apiConfigured === false &&
        saved.apiResponseStatus === "NOT_CONFIGURED";
      const configured = externallyOnline ? true : externallyUnconfigured ? false : localConfigured;
      const latestBalance =
        configured && typeof saved.latestBalance === "number" && Number.isFinite(saved.latestBalance)
          ? saved.latestBalance
          : null;
      const previousBalance =
        configured && typeof saved.previousBalance === "number" && Number.isFinite(saved.previousBalance)
          ? saved.previousBalance
          : null;
      sims[simMeta.simNumber] = {
        simNumber: simMeta.simNumber,
        operator: simMeta.operator || detectOperator(simMeta.simNumber),
        latestBalance,
        previousBalance,
        lastSuccessfulSync: configured && typeof saved.lastSuccessfulSync === "string" ? saved.lastSuccessfulSync : null,
        lastCheckedAt: typeof saved.lastCheckedAt === "string" ? saved.lastCheckedAt : null,
        connectionStatus: configured && saved.connectionStatus === "online" ? "online" : "offline",
        apiResponseStatus: configured
          ? (typeof saved.apiResponseStatus === "string" ? saved.apiResponseStatus : "PENDING_SYNC")
          : "NOT_CONFIGURED",
        errorMessage: configured
          ? (typeof saved.errorMessage === "string" ? saved.errorMessage : "")
          : "Balance API Not Connected",
        apiConfigured: configured,
        rawBalance:
          configured && typeof saved.rawBalance === "number" && Number.isFinite(saved.rawBalance) ? saved.rawBalance : null,
        balanceUnit: typeof saved.balanceUnit === "string" ? saved.balanceUnit : "bdt",
        history: Array.isArray(saved.history) ? saved.history.slice(0, MAX_HISTORY_PER_SIM) : [],
      };
    } else {
      sims[simMeta.simNumber] = createInitialSimRecord(simMeta);
    }
  }

  return {
    config: { syncIntervalSeconds },
    lastSyncAt: typeof rawStore?.lastSyncAt === "string" ? rawStore.lastSyncAt : null,
    sims,
  };
}

function applySyncResult(record, result, checkedAt) {
  const next = {
    ...record,
    lastCheckedAt: checkedAt,
    apiConfigured: Boolean(result.apiConfigured),
    apiResponseStatus: result.apiResponseStatus || (result.ok ? "OK" : "ERROR"),
    errorMessage: result.ok ? "" : (result.errorMessage || "Failed to retrieve balance."),
    history: Array.isArray(record.history) ? [...record.history] : [],
  };

  if (result.ok && typeof result.balance === "number" && Number.isFinite(result.balance)) {
    const previousBalance = record.latestBalance;
    if (previousBalance !== result.balance) {
      next.previousBalance = previousBalance;
    }
    next.latestBalance = result.balance;
    if (typeof result.rawBalance === "number" && Number.isFinite(result.rawBalance)) {
      next.rawBalance = result.rawBalance;
    }
    if (typeof result.balanceUnit === "string" && result.balanceUnit) {
      next.balanceUnit = result.balanceUnit;
    }
    next.lastSuccessfulSync = checkedAt;
    next.connectionStatus = "online";

    const delta =
      typeof previousBalance === "number"
        ? Math.round((result.balance - previousBalance) * 100) / 100
        : null;

    const lastEntry = next.history[0];
    const shouldRecordSuccess =
      !lastEntry ||
      lastEntry.connectionStatus !== "online" ||
      lastEntry.balance !== result.balance;

    if (shouldRecordSuccess) {
      next.history.unshift({
        id: crypto.randomUUID(),
        syncedAt: checkedAt,
        balance: result.balance,
        previousBalance,
        delta,
        connectionStatus: "online",
        apiResponseStatus: next.apiResponseStatus,
        message:
          delta && delta !== 0
            ? `Balance changed (${delta > 0 ? "+" : ""}BDT ${delta.toFixed(2)}).`
            : "Balance synchronized successfully.",
      });
      next.history = next.history.slice(0, MAX_HISTORY_PER_SIM);
    }
  } else {
    next.connectionStatus = "offline";
    if (!result.apiConfigured) {
      // Clear stale balance when a SIM's API credentials are removed or reassigned.
      next.latestBalance = null;
      next.previousBalance = null;
      next.rawBalance = null;
      next.lastSuccessfulSync = null;
    }
    const lastEntry = next.history[0];
    const shouldRecordFailure =
      !lastEntry ||
      lastEntry.connectionStatus !== "offline" ||
      lastEntry.apiResponseStatus !== next.apiResponseStatus;

    if (shouldRecordFailure) {
      next.history.unshift({
        id: crypto.randomUUID(),
        syncedAt: checkedAt,
        balance: next.latestBalance,
        previousBalance: next.previousBalance,
        delta: null,
        connectionStatus: "offline",
        apiResponseStatus: next.apiResponseStatus,
        message: next.errorMessage,
      });
      next.history = next.history.slice(0, MAX_HISTORY_PER_SIM);
    }
  }

  return next;
}

function publicSimRecord(record) {
  return {
    simNumber: record.simNumber,
    operator: record.operator,
    latestBalance: record.latestBalance,
    previousBalance: record.previousBalance,
    rawBalance: typeof record.rawBalance === "number" ? record.rawBalance : null,
    balanceUnit: record.balanceUnit || "bdt",
    lastSuccessfulSync: record.lastSuccessfulSync,
    lastCheckedAt: record.lastCheckedAt,
    connectionStatus: record.connectionStatus,
    apiResponseStatus: record.apiResponseStatus,
    errorMessage: record.errorMessage,
    apiConfigured: record.apiConfigured,
    historyCount: Array.isArray(record.history) ? record.history.length : 0,
  };
}

function summarizeStore(store) {
  const orderedRecords = MONITORED_SIMS.map((meta) => store.sims[meta.simNumber]);
  let totalBalance = 0;
  let simsWithBalance = 0;
  let connectedCount = 0;
  let disconnectedCount = 0;
  let configuredCount = 0;
  let latestSuccessTime = null;

  for (const record of orderedRecords) {
    if (record.apiConfigured) configuredCount += 1;
    if (record.connectionStatus === "online") {
      connectedCount += 1;
    } else {
      disconnectedCount += 1;
    }
    if (typeof record.latestBalance === "number" && Number.isFinite(record.latestBalance)) {
      totalBalance += record.latestBalance;
      simsWithBalance += 1;
    }
    if (record.lastSuccessfulSync && (!latestSuccessTime || record.lastSuccessfulSync > latestSuccessTime)) {
      latestSuccessTime = record.lastSuccessfulSync;
    }
  }

  return {
    totalBalance: Math.round(totalBalance * 100) / 100,
    simsWithBalance,
    totalSims: orderedRecords.length,
    connectedCount,
    disconnectedCount,
    configuredCount,
    lastSyncAt: store.lastSyncAt || latestSuccessTime,
    lastSuccessfulSyncAt: latestSuccessTime,
    syncIntervalSeconds: store.config.syncIntervalSeconds,
    allowedSyncIntervals: ALLOWED_SYNC_INTERVALS,
    sims: orderedRecords.map(publicSimRecord),
  };
}

module.exports = {
  ALLOWED_SYNC_INTERVALS,
  DEFAULT_SYNC_INTERVAL_SECONDS,
  MONITORED_SIMS,
  applySyncResult,
  detectOperator,
  fetchLiveSimBalance,
  normalizeStore,
  publicSimRecord,
  summarizeStore,
};
