const crypto = require("node:crypto");
const fs = require("node:fs/promises");
const http = require("node:http");
const path = require("node:path");
const { AsyncLocalStorage } = require("node:async_hooks");
const nodemailer = require("nodemailer");
const database = require("./database");

const ROOT = __dirname;
const PUBLIC_DIRECTORY = path.join(ROOT, "public");
const DATA_DIRECTORY = path.join(ROOT, "data");
const USERS_FILE = path.join(DATA_DIRECTORY, "users.json");
const EMPLOYEES_FILE = path.join(DATA_DIRECTORY, "employees.json");
const TEAMS_FILE = path.join(DATA_DIRECTORY, "teams.json");
const DEALS_FILE = path.join(DATA_DIRECTORY, "deals.json");
const CLIENTS_FILE = path.join(DATA_DIRECTORY, "clients.json");
const LEADS_FILE = path.join(DATA_DIRECTORY, "leads.json");
const NOTIFICATIONS_FILE = path.join(DATA_DIRECTORY, "notifications.json");
const AUDIT_LOGS_FILE = path.join(DATA_DIRECTORY, "audit-logs.json");
const UNDO_DELETIONS_FILE = path.join(DATA_DIRECTORY, "undo-deletions.json");
const LEAD_TIME_ZONE = "Asia/Dhaka";
const UNDO_RETENTION_MS = 24 * 60 * 60 * 1000;
const MAX_UNDO_ENTRIES_PER_USER = 20;
const REMINDER_CHECK_INTERVAL_MS = 60_000;
const REMINDER_RETRY_INTERVAL_MS = 15 * 60_000;
const SESSION_COOKIE = "crm_session";
const SESSION_DURATION_MS = 8 * 60 * 60 * 1000;
const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const MAX_LOGIN_ATTEMPTS = 10;
const MAX_PROFILE_PHOTO_BYTES = 1024 * 1024;
const MAX_JSON_BODY_BYTES = 2 * 1024 * 1024;
const DEFAULT_TEAMS = ["Operation Team", "Project Team", "Sales Team"];
const sessions = new Map();
const loginAttempts = new Map();
const auditStorage = new AsyncLocalStorage();
let auditWriteQueue = Promise.resolve();
const mailTransport = process.env.SMTP_HOST && process.env.SMTP_FROM
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === "true",
      ...(process.env.SMTP_USER
        ? { auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD || "" } }
        : {}),
    })
  : null;
const scryptAsync = (password, salt, length, options) =>
  new Promise((resolve, reject) => {
    crypto.scrypt(password, salt, length, options, (error, key) => {
      if (error) reject(error);
      else resolve(key);
    });
  });

function usesDatabase() {
  if (process.env.VERCEL === "1" && !database.isDatabaseConfigured()) {
    const error = new Error("Set DATABASE_URL (or POSTGRES_URL) in the Vercel project environment.");
    error.statusCode = 503;
    throw error;
  }
  return database.isDatabaseConfigured();
}

async function readJsonFile(filePath) {
  if (usesDatabase()) {
    const value = await database.getJson(filePath);
    if (value === undefined) {
      const error = new Error(`No database record exists for ${path.basename(filePath)}.`);
      error.code = "ENOENT";
      throw error;
    }
    return value;
  }
  return JSON.parse(await fs.readFile(filePath, "utf8"));
}

const staticFiles = new Map([
  ["/", ["index.html", "text/html; charset=utf-8"]],
  ["/index.html", ["index.html", "text/html; charset=utf-8"]],
  ["/app.js", ["app.js", "text/javascript; charset=utf-8"]],
  ["/styles.css", ["styles.css", "text/css; charset=utf-8"]],
  ["/assets/ritorica-logo.png", ["assets/ritorica-logo.png", "image/png"]],
  ["/assets/ritorica-logo-login.png", ["assets/ritorica-logo-login.png", "image/png"]],
]);

function isAdminRole(role) {
  return role === "Admin" || role === "Super Admin";
}

async function hashPassword(password, salt = crypto.randomBytes(16)) {
  const hash = await scryptAsync(password, salt, 64, {
    N: 16384,
    r: 8,
    p: 1,
    maxmem: 64 * 1024 * 1024,
  });
  return {
    salt: salt.toString("hex"),
    hash: hash.toString("hex"),
  };
}

function publicProfile(account, role = "Admin") {
  return {
    name: account.name || account.email.split("@")[0].replace(/[._-]+/g, " "),
    designation: account.designation || (isAdminRole(role) ? "Super Admin" : "Employee"),
    photo: account.photo || "",
  };
}

async function loadEmployees() {
  try {
    return await readJsonFile(EMPLOYEES_FILE);
  } catch (error) {
    if (error.code === "ENOENT") return [];
    throw error;
  }
}

async function loadTeams() {
  try {
    return await readJsonFile(TEAMS_FILE);
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
    const teams = DEFAULT_TEAMS.map((name) => ({
      id: crypto.randomUUID(),
      name,
      createdAt: new Date().toISOString(),
    }));
    await writeJsonFile(TEAMS_FILE, teams);
    return teams;
  }
}

async function loadDeals() {
  try {
    return await readJsonFile(DEALS_FILE);
  } catch (error) {
    if (error.code === "ENOENT") return [];
    throw error;
  }
}

async function loadClients() {
  try {
    return await readJsonFile(CLIENTS_FILE);
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
    const account = await loadAccount();
    const clients = [
      {
        company: "Green Delta Foods Ltd",
        country: "Bangladesh",
        industry: "Food & Beverage",
        type: "customer",
      },
      {
        company: "Meghna Garments & Export",
        country: "Bangladesh",
        industry: "Textiles & Apparel",
        type: "customer",
      },
      {
        company: "Bay Maritime Logistics",
        country: "Bangladesh",
        industry: "Logistics",
        type: "prospect",
      },
      {
        company: "Padma Software Solutions",
        country: "Bangladesh",
        industry: "Software & IT",
        type: "customer",
      },
    ].map((client) => ({
      id: crypto.randomUUID(),
      email: "",
      phone: "",
      website: "",
      size: "",
      status: "active",
      managerEmail: account?.email || "",
      tags: [],
      address: "",
      notes: "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...client,
    }));
    await writeJsonFile(CLIENTS_FILE, clients);
    return clients;
  }
}

async function loadLeads(teams) {
  try {
    return await readJsonFile(LEADS_FILE);
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
    const [adminAccount, employees] = await Promise.all([loadAccount(), loadEmployees()]);
    const availableTeams = teams || (await loadTeams());
    const assignedEmail = adminAccount?.email || employees[0]?.email || "";
    const teamId = availableTeams.find((team) => team.name === "Sales Team")?.id || "";
    const examples = [
      {
        recordNumber: 1007,
        company: "PalmPay",
        contactName: "Zilan Noor",
        contactEmail: "zilan.noor@ritorica.com.bd",
        followUp: "2026-11-15",
        status: "New",
        priority: "Medium",
        value: 100000,
        currency: "BDT",
        createdAt: "2026-11-08T10:18:00.000Z",
      },
      {
        recordNumber: 1002,
        company: "Rupayan Real Estate",
        contactName: "Shirin Akter",
        contactEmail: "shirin@rupayan.example.com",
        followUp: "2026-11-06",
        status: "Contacted",
        priority: "High",
        value: 1200000,
        currency: "BDT",
        createdAt: "2026-11-03T15:33:25.000Z",
      },
      {
        recordNumber: 1003,
        company: "Karnaphuli Cement",
        contactName: "Mahmudul Hasan",
        contactEmail: "mahmudul@kcement.example.com",
        followUp: "2026-11-08",
        status: "Qualified",
        priority: "Medium",
        value: 2400,
        currency: "USD",
        createdAt: "2026-11-03T15:33:25.000Z",
      },
      {
        recordNumber: 1001,
        company: "Chittagong Steel House",
        contactName: "Jamal Uddin",
        contactEmail: "jamal@steelhouse.example.com",
        followUp: "2026-11-05",
        status: "New",
        priority: "Medium",
        value: 850000,
        currency: "BDT",
        createdAt: "2026-11-03T15:33:25.000Z",
      },
      {
        recordNumber: 1005,
        company: "Bengal Agro Mills",
        contactName: "Ashraful Alam",
        contactEmail: "ashraful@bengalagro.example.com",
        followUp: "2026-11-04",
        status: "Negotiation",
        priority: "Urgent",
        value: 3600000,
        currency: "BDT",
        createdAt: "2026-11-03T15:33:25.000Z",
      },
      {
        recordNumber: 1006,
        company: "Uttara Medical Depot",
        contactName: "Kamrun Nahar",
        contactEmail: "kamrun@uttaramd.example.com",
        followUp: "2026-11-15",
        status: "New",
        priority: "Low",
        value: 90000,
        currency: "BDT",
        createdAt: "2026-11-03T15:33:25.000Z",
      },
      {
        recordNumber: 1004,
        company: "Sundarban Fisheries",
        contactName: "Rita Das",
        contactEmail: "rita@sundarbanfish.example.com",
        followUp: "2026-11-10",
        status: "Proposal",
        priority: "Low",
        value: 420000,
        currency: "BDT",
        createdAt: "2026-11-03T15:33:25.000Z",
      },
    ].map((lead) => ({
      id: crypto.randomUUID(),
      phone: "",
      teamId,
      assignedEmail,
      source: "website",
      sourceDetails: "",
      followUpTime: "",
      notes: "",
      history: [
        {
          at: lead.createdAt,
          actor: "Admin",
          message: "Lead created",
        },
      ],
      ...lead,
    }));
    await writeJsonFile(LEADS_FILE, examples);
    return examples;
  }
}

async function loadNotifications() {
  try {
    return await readJsonFile(NOTIFICATIONS_FILE);
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
    return [];
  }
}

async function writeJsonFile(filePath, value) {
  const auditContext = auditStorage.getStore();
  let auditChange = null;
  if (auditContext && filePath !== AUDIT_LOGS_FILE) {
    let previous = null;
    try {
      previous = await readJsonFile(filePath);
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
    }
    auditChange = buildAuditChange(filePath, previous, value);
  }
  if (usesDatabase()) {
    await database.setJson(filePath, value);
    if (auditChange) auditContext.changes.push(auditChange);
    return;
  }
  await fs.mkdir(DATA_DIRECTORY, { recursive: true });
  const temporaryFile = `${filePath}.${crypto.randomBytes(8).toString("hex")}.tmp`;
  try {
    await fs.writeFile(temporaryFile, `${JSON.stringify(value, null, 2)}\n`, {
      encoding: "utf8",
      flag: "wx",
      mode: 0o600,
    });
    await fs.rename(temporaryFile, filePath);
    if (auditChange) auditContext.changes.push(auditChange);
  } catch (error) {
    await fs.rm(temporaryFile, { force: true });
    throw error;
  }
}

function auditModuleForFile(filePath) {
  const name = path.basename(filePath);
  return ({
    "users.json": "Authentication",
    "employees.json": "Employees",
    "teams.json": "Teams",
    "deals.json": "Deals",
    "clients.json": "Clients",
    "leads.json": "Leads",
    "notifications.json": "Notifications",
  })[name] || "System";
}

function undoActorKey(session) {
  return `${session.role}:${session.email}`;
}

function publicUndoEntry(entry) {
  return {
    id: entry.id,
    resource: entry.resource,
    label: entry.label,
    expiresAt: entry.expiresAt,
  };
}

async function loadUndoEntries() {
  let entries;
  try {
    entries = await readJsonFile(UNDO_DELETIONS_FILE);
  } catch (error) {
    if (error.code === "ENOENT") return [];
    throw error;
  }
  if (!Array.isArray(entries)) throw new Error("Undo history file must contain an array.");
  const activeEntries = entries.filter((entry) => Date.parse(entry.expiresAt) > Date.now());
  if (activeEntries.length !== entries.length) {
    await writeJsonFile(UNDO_DELETIONS_FILE, activeEntries);
  }
  return activeEntries;
}

async function saveUndoEntry(session, resource, label, record, details = {}) {
  const entries = await loadUndoEntries();
  const actor = undoActorKey(session);
  const entry = {
    id: crypto.randomUUID(),
    actor,
    resource,
    label,
    record,
    details,
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + UNDO_RETENTION_MS).toISOString(),
  };
  const userEntries = entries.filter((item) => item.actor === actor);
  const retainedEntries = entries.filter((item) => item.actor !== actor);
  retainedEntries.push(...userEntries.slice(-(MAX_UNDO_ENTRIES_PER_USER - 1)), entry);
  await writeJsonFile(UNDO_DELETIONS_FILE, retainedEntries);
  return entry;
}

async function removeUndoEntry(entryId) {
  const entries = await loadUndoEntries();
  await writeJsonFile(
    UNDO_DELETIONS_FILE,
    entries.filter((entry) => entry.id !== entryId),
  );
}

async function commitDeletion(entry, saveDeletedState) {
  try {
    await saveDeletedState();
  } catch (error) {
    try {
      await removeUndoEntry(entry.id);
    } catch (cleanupError) {
      console.error(`Could not remove unused undo record ${entry.id}: ${cleanupError.message}`);
    }
    throw error;
  }
}

async function undoEntryForSession(session) {
  const entries = await loadUndoEntries();
  return entries
    .filter((entry) => entry.actor === undoActorKey(session))
    .sort((left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt))[0] || null;
}

async function restoreUndoEntry(entry) {
  switch (entry.resource) {
    case "lead": {
      const leads = await loadLeads();
      if (leads.some((lead) => lead.id === entry.record.id)) {
        throw Object.assign(new Error("This lead already exists and cannot be restored twice."), { statusCode: 409 });
      }
      leads.push(entry.record);
      await writeJsonFile(LEADS_FILE, leads);
      break;
    }
    case "client": {
      const clients = await loadClients();
      if (clients.some((client) => client.id === entry.record.id)) {
        throw Object.assign(new Error("This client already exists and cannot be restored twice."), { statusCode: 409 });
      }
      if (clients.some((client) => client.company.toLocaleLowerCase() === entry.record.company.toLocaleLowerCase())) {
        throw Object.assign(new Error("A client with this company name now exists. Rename or remove it before undoing."), { statusCode: 409 });
      }
      clients.push(entry.record);
      await writeJsonFile(CLIENTS_FILE, clients);
      break;
    }
    case "deal": {
      const deals = await loadDeals();
      if (deals.some((deal) => deal.id === entry.record.id)) {
        throw Object.assign(new Error("This deal already exists and cannot be restored twice."), { statusCode: 409 });
      }
      deals.push(entry.record);
      await writeJsonFile(DEALS_FILE, deals);
      break;
    }
    case "employee": {
      if (!entry.record || !entry.record.email) {
        throw Object.assign(new Error("The deleted employee data is incomplete."), { statusCode: 409 });
      }
      const employees = await loadEmployees();
      if (employees.some((employee) => employee.id === entry.record.id || employee.email === entry.record.email)) {
        throw Object.assign(new Error("An employee with this ID or email already exists. Remove the duplicate before undoing."), { statusCode: 409 });
      }
      const teams = await loadTeams();
      employees.push({
        ...entry.record,
        teamIds: (entry.record.teamIds || []).filter((teamId) => teams.some((team) => team.id === teamId)),
      });
      await writeJsonFile(EMPLOYEES_FILE, employees);
      break;
    }
    case "team": {
      const teams = await loadTeams();
      if (teams.some((team) => team.id === entry.record.id || team.name.toLocaleLowerCase() === entry.record.name.toLocaleLowerCase())) {
        throw Object.assign(new Error("A team with this ID or name now exists. Remove or rename it before undoing."), { statusCode: 409 });
      }
      const employees = await loadEmployees();
      const memberIds = new Set(entry.details.memberIds || []);
      const updatedEmployees = employees.map((employee) => (
        memberIds.has(employee.id)
          ? { ...employee, teamIds: [...new Set([...(employee.teamIds || []), entry.record.id])] }
          : employee
      ));
      await writeJsonFile(TEAMS_FILE, [...teams, entry.record]);
      try {
        await writeJsonFile(EMPLOYEES_FILE, updatedEmployees);
      } catch (error) {
        await writeJsonFile(TEAMS_FILE, teams);
        throw error;
      }
      break;
    }
    default:
      throw Object.assign(new Error("This deleted item cannot be restored."), { statusCode: 400 });
  }
}

function safeAuditValue(value, depth = 0) {
  if (value === null || typeof value === "boolean" || typeof value === "number") return value;
  if (typeof value === "string") {
    if (/^data:image\//i.test(value)) return "[image omitted]";
    return value.length > 2000 ? `${value.slice(0, 2000)}… [truncated]` : value;
  }
  if (Array.isArray(value)) {
    if (depth >= 6) return `[${value.length} items omitted]`;
    return value.slice(0, 100).map((item) => safeAuditValue(item, depth + 1));
  }
  if (typeof value !== "object") return String(value);
  if (depth >= 6) return "[nested value omitted]";
  return Object.fromEntries(
    Object.entries(value)
      .filter(([key]) => !/(?:password|passphrase|salt|hash|token|secret|authorization|cookie|photo)/i.test(key))
      .map(([key, item]) => [key, safeAuditValue(item, depth + 1)]),
  );
}

function auditRecordKey(record, index) {
  if (!record || typeof record !== "object") return `index:${index}`;
  return record.id || record.email || record.name || record.company || record.title || `index:${index}`;
}

function changedAuditRecords(previous, next) {
  if (!Array.isArray(previous) || !Array.isArray(next)) {
    return {
      previousValue: safeAuditValue(previous),
      newValue: safeAuditValue(next),
    };
  }
  const previousMap = new Map(previous.map((record, index) => [auditRecordKey(record, index), record]));
  const nextMap = new Map(next.map((record, index) => [auditRecordKey(record, index), record]));
  const keys = new Set([...previousMap.keys(), ...nextMap.keys()]);
  const changes = [];
  for (const key of keys) {
    const before = previousMap.get(key);
    const after = nextMap.get(key);
    if (JSON.stringify(before) === JSON.stringify(after)) continue;
    changes.push({
      previousValue: safeAuditValue(before ?? null),
      newValue: safeAuditValue(after ?? null),
    });
    if (changes.length === 20) break;
  }
  return {
    previousValue: changes.map((change) => change.previousValue),
    newValue: changes.map((change) => change.newValue),
  };
}

function auditCompanyFrom(value) {
  if (!value || typeof value !== "object") return "";
  if (Array.isArray(value)) {
    for (const item of value) {
      const company = auditCompanyFrom(item);
      if (company) return company;
    }
    return "";
  }
  if (typeof value.company === "string" && value.company) return value.company;
  if (typeof value.client === "string" && value.client) return value.client;
  for (const [key, item] of Object.entries(value)) {
    if (/(?:company|client)/i.test(key) && typeof item === "string" && item) return item;
  }
  return "";
}

function buildAuditChange(filePath, previous, next) {
  const { previousValue, newValue } = changedAuditRecords(previous, next);
  if (JSON.stringify(previousValue) === JSON.stringify(newValue)) return null;
  return {
    module: auditModuleForFile(filePath),
    previousValue,
    newValue,
    companyName: auditCompanyFrom(newValue) || auditCompanyFrom(previousValue),
  };
}

async function loadAuditLogs() {
  try {
    const logs = await readJsonFile(AUDIT_LOGS_FILE);
    return Array.isArray(logs) ? logs : [];
  } catch (error) {
    if (error.code === "ENOENT") return [];
    throw error;
  }
}

function appendAuditLog(entry) {
  auditWriteQueue = auditWriteQueue.catch(() => {}).then(async () => {
    const logs = await loadAuditLogs();
    logs.unshift(entry);
    if (usesDatabase()) {
      await writeJsonFile(AUDIT_LOGS_FILE, logs);
      return;
    }
    await fs.mkdir(DATA_DIRECTORY, { recursive: true });
    const temporaryFile = `${AUDIT_LOGS_FILE}.${crypto.randomBytes(8).toString("hex")}.tmp`;
    try {
      await fs.writeFile(temporaryFile, `${JSON.stringify(logs)}\n`, {
        encoding: "utf8",
        flag: "wx",
        mode: 0o600,
      });
      await fs.rename(temporaryFile, AUDIT_LOGS_FILE);
    } catch (error) {
      await fs.rm(temporaryFile, { force: true });
      throw error;
    }
  });
  return auditWriteQueue;
}

function auditDevice(userAgent = "") {
  const browser = /Edg\/[\d.]+/.test(userAgent)
    ? "Edge"
    : /Chrome\/[\d.]+/.test(userAgent)
      ? "Chrome"
      : /Firefox\/[\d.]+/.test(userAgent)
        ? "Firefox"
        : /Safari\/[\d.]+/.test(userAgent)
          ? "Safari"
          : "Unknown browser";
  const operatingSystem = /Windows NT/.test(userAgent)
    ? "Windows"
    : /Android/.test(userAgent)
      ? "Android"
      : /iPhone|iPad|iOS/.test(userAgent)
        ? "iOS"
        : /Mac OS X/.test(userAgent)
          ? "macOS"
          : /Linux/.test(userAgent)
            ? "Linux"
            : "Unknown OS";
  return userAgent ? `${browser} / ${operatingSystem}` : "Unknown device";
}

function auditModuleForPath(pathname) {
  if (pathname === "/api/login" || pathname === "/api/logout") return "Authentication";
  if (pathname === "/api/me" || pathname === "/api/profile") return "Profile";
  if (pathname.startsWith("/api/employees")) return "Employees";
  if (pathname.startsWith("/api/teams")) return "Teams";
  if (pathname.startsWith("/api/leads")) return "Leads";
  if (pathname.startsWith("/api/clients")) return "Clients";
  if (pathname.startsWith("/api/deals")) return "Deals";
  if (pathname.startsWith("/api/notifications")) return "Notifications";
  if (pathname === "/api/lead-dashboard") return "Dashboard";
  if (pathname.startsWith("/api/audit-logs")) return "Audit Logs";
  return "System";
}

function auditActionForRequest(request, pathname) {
  const segments = pathname.split("/").filter(Boolean);
  const resource = segments[1] || "resource";
  if (pathname === "/api/login") return "Sign in";
  if (pathname === "/api/logout") return "Sign out";
  if (pathname === "/api/undo-deletion" && request.method === "POST") return "Undo deletion";
  if (segments.at(-1) === "reset-password") return "Reset password";
  if (segments.at(-1) === "convert") return "Convert lead";
  if (segments.at(-1) === "read") return "Mark notification read";
  if (request.method === "GET") return "View";
  if (request.method === "POST") return `Create ${resource.replace(/s$/, "")}`;
  if (request.method === "PUT" || request.method === "PATCH") return `Update ${resource.replace(/s$/, "")}`;
  if (request.method === "DELETE") return `Delete ${resource.replace(/s$/, "")}`;
  return request.method;
}

function auditStatusForCode(statusCode, pathname) {
  if (statusCode === 401 && pathname === "/api/login") return "Failed";
  if (statusCode === 401 || statusCode === 403 || statusCode === 429) return "Blocked";
  if (statusCode >= 400) return "Failed";
  return "Success";
}

function auditLocation(ip) {
  if (process.env.AUDIT_LOCATION) return process.env.AUDIT_LOCATION.slice(0, 120);
  if (ip === "127.0.0.1" || ip === "::1" || /^10\./.test(ip) || /^192\.168\./.test(ip) || /^172\.(1[6-9]|2\d|3[01])\./.test(ip)) {
    return "Local network (approximate location unavailable)";
  }
  return "Unknown (configure AUDIT_LOCATION; no external geolocation lookup)";
}

function auditRoleLabel(role) {
  if (isAdminRole(role)) return "Super Admin";
  if (role === "Employee" || role === "User") return "User";
  return "Unknown";
}

async function writeRequestAuditLog(context, response) {
  if (!context.pathname.startsWith("/api/")) return;
  const statusCode = response.statusCode || 500;
  const actorEmail = context.actorEmail || "";
  const actorRole = context.actorRole || "Unknown";
  const userName =
    context.actorName ||
    actorEmail.split("@")[0].replace(/[._-]+/g, " ") ||
    "Unknown";
  const changes = context.changes;
  const status = auditStatusForCode(statusCode, context.pathname);
  const responseError = context.responseValue?.error || "";
  const description = context.eventDescription || [
    `${context.method} ${context.pathname}`,
    status === "Success" ? "completed successfully" : `${status.toLowerCase()}: ${responseError || `HTTP ${statusCode}`}`,
  ].join(" — ");
  const entry = {
    id: crypto.randomUUID(),
    dateTime: context.startedAt,
    companyName:
      changes.find((change) => change.companyName)?.companyName ||
        context.eventCompanyName ||
        auditCompanyFrom(context.requestValue) ||
        "—",
    userName,
    userRole: auditRoleLabel(actorRole),
    action: context.action,
    module: context.module,
    previousValue: context.eventPreviousValue !== undefined
      ? context.eventPreviousValue
      : changes.length
        ? changes.map((change) => ({ module: change.module, value: change.previousValue }))
        : "—",
    newValue: context.eventNewValue !== undefined
      ? context.eventNewValue
      : changes.length
        ? changes.map((change) => ({ module: change.module, value: change.newValue }))
        : context.requestValue || "—",
    ipAddress: context.ip,
    device: context.device,
    location: auditLocation(context.ip),
    status,
    description,
  };
  await appendAuditLog(entry);
}

async function findAccount(email, role) {
  if (isAdminRole(role)) {
    const account = await loadAccount();
    if (account?.email === email) return account;
    const employees = await loadEmployees();
    return employees.find(
      (employee) => employee.email === email && isAdminRole(employee.role),
    ) || null;
  }
  const employees = await loadEmployees();
  return employees.find((employee) => employee.email === email) || null;
}

function isAdmin(session) {
  return isAdminRole(session?.role);
}

function publicEmployee(employee, teams) {
  const membershipIds = new Set(employee.teamIds || []);
  return {
    id: employee.id,
    name: employee.name,
    email: employee.email,
    designation: employee.designation,
    role: isAdminRole(employee.role) ? "Super Admin" : "Employee",
    teamIds: [...membershipIds],
    teams: teams.filter((team) => membershipIds.has(team.id)).map((team) => team.name),
  };
}

function getAssignees(adminAccount, employees) {
  return [
    ...(adminAccount
      ? [{
          email: adminAccount.email,
          name: adminAccount.name || adminAccount.email.split("@")[0],
        }]
      : []),
    ...employees.map((employee) => ({
      email: employee.email,
      name: employee.name || employee.email.split("@")[0],
    })),
  ];
}

function publicDeal(deal, assignees) {
  return {
    ...deal,
    assignedName:
      assignees.find((assignee) => assignee.email === deal.assignedEmail)?.name ||
      deal.assignedName ||
      deal.assignedEmail,
  };
}

function publicClient(client, assignees) {
  return {
    ...client,
    managerName: client.managerEmail
      ? assignees.find((assignee) => assignee.email === client.managerEmail)?.name ||
        client.managerName ||
        client.managerEmail
      : "Unassigned",
  };
}

function publicLead(lead, assignees, teams) {
  return {
    ...lead,
    source: lead.source || "website",
    sourceDetails: lead.sourceDetails || "",
    followUpTime: lead.followUpTime || "",
    assignedName:
      assignees.find((assignee) => assignee.email === lead.assignedEmail)?.name ||
      (lead.assignedEmail ? lead.assignedEmail : "Unassigned"),
    teamName: teams.find((team) => team.id === lead.teamId)?.name || "",
  };
}

function canViewLead(lead, session) {
  return (
    isAdmin(session) ||
    lead.createdByEmail === session.email ||
    lead.assignedEmail === session.email
  );
}

function publicLeadForUser(lead, assignees, teams, session) {
  const result = publicLead(lead, assignees, teams);
  if (!isAdmin(session) && lead.createdByEmail !== session.email) {
    delete result.assignmentHistory;
    delete result.createdByEmail;
    result.history = (result.history || []).filter(
      (entry) => !entry.assignmentEvent,
    );
  }
  return result;
}

async function createLeadNotification({ lead, recipientEmail, actorEmail, actorName, previousEmail = "" }) {
  if (!recipientEmail || recipientEmail === previousEmail) return;
  const notifications = await loadNotifications();
  notifications.push({
    id: crypto.randomUUID(),
    recipientEmail,
    leadId: lead.id,
    company: lead.company,
    actorEmail,
    previousEmail,
    message: previousEmail
      ? `${lead.company} was assigned to you by ${actorName}`
      : `A new lead, ${lead.company}, was assigned to you by ${actorName}`,
    createdAt: new Date().toISOString(),
    readAt: "",
  });
  await writeJsonFile(NOTIFICATIONS_FILE, notifications);
}

function notificationsForSession(notifications, session) {
  return notifications.filter(
    (notification) => isAdmin(session) || notification.recipientEmail === session.email,
  );
}

function getMonthKeyInLeadTimeZone(value) {
  if (typeof value !== "string" || !value) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value.slice(0, 7);
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: LEAD_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
  }).formatToParts(date);
  return `${parts.find((part) => part.type === "year")?.value}-${parts.find((part) => part.type === "month")?.value}`;
}

async function handleLeadDashboard(request, response, session) {
  const [leads, teams, employees, adminAccount, notifications, clients, deals] = await Promise.all([
    loadLeads(),
    loadTeams(),
    loadEmployees(),
    loadAccount(),
    loadNotifications(),
    loadClients(),
    loadDeals(),
  ]);
  const assignees = getAssignees(adminAccount, employees);
  const visibleLeads = leads.filter((lead) => canViewLead(lead, session));
  const currentMonth = getMonthKeyInLeadTimeZone(new Date().toISOString());
  const openDeals = deals.filter((deal) => deal.status === "Open");
  const wonThisMonth = deals.filter(
    (deal) =>
      deal.status === "Won" &&
      getMonthKeyInLeadTimeZone(deal.closeDate || deal.updatedAt) === currentMonth,
  );
  const recent = (items) =>
    [...items]
      .sort((a, b) => Date.parse(b.createdAt || b.updatedAt || "") - Date.parse(a.createdAt || a.updatedAt || ""))
      .slice(0, 3);
  const flows = visibleLeads
    .filter((lead) => isAdmin(session) || lead.createdByEmail === session.email)
    .map((lead) => ({
      ...publicLead(lead, assignees, teams),
      createdByName:
        assignees.find((assignee) => assignee.email === lead.createdByEmail)?.name ||
        lead.createdByEmail ||
        "Unknown",
      assignmentHistory: (lead.assignmentHistory || []).map((entry) => ({
        ...entry,
        fromName: assignees.find((assignee) => assignee.email === entry.fromEmail)?.name || "",
        toName: assignees.find((assignee) => assignee.email === entry.toEmail)?.name || entry.toEmail || "Unassigned",
      })),
    }))
    .sort((a, b) => Date.parse(b.updatedAt || b.createdAt) - Date.parse(a.updatedAt || a.createdAt));
  const assignedLeads = visibleLeads
    .filter((lead) => lead.assignedEmail === session.email)
    .map((lead) => publicLeadForUser(lead, assignees, teams, session));
  const visibleNotifications = notificationsForSession(notifications, session);
  return sendJson(response, 200, {
    overview: {
      leads: recent(visibleLeads).map((lead) => ({
        company: lead.company,
        recordNumber: lead.recordNumber,
        status: lead.status,
        notes: lead.notes || "",
        createdAt: lead.createdAt,
      })),
      leadCount: visibleLeads.length,
      newLeadCount: visibleLeads.filter(
        (lead) => getMonthKeyInLeadTimeZone(lead.createdAt) === currentMonth,
      ).length,
      clientCount: clients.length,
      clients: recent(clients).map((client) => ({
        company: client.company,
        status: client.status,
        createdAt: client.createdAt,
      })),
      openDealCount: openDeals.length,
      openDealValue: openDeals.reduce((total, deal) => total + deal.value, 0),
      deals: recent(deals).map((deal) => ({
        title: deal.title,
        client: deal.client,
        value: deal.value,
        status: deal.status,
      })),
      wonThisMonthCount: wonThisMonth.length,
      wonThisMonthValue: wonThisMonth.reduce((total, deal) => total + deal.value, 0),
    },
    flows,
    assignedLeads,
    notifications: visibleNotifications
      .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
      .slice(0, 30),
    unreadCount: visibleNotifications.filter((notification) => !notification.readAt).length,
  });
}

async function handleNotifications(request, response, session, notificationId = "") {
  const notifications = await loadNotifications();
  if (request.method === "GET") {
    const mine = notificationsForSession(notifications, session)
      .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
      .slice(0, 30);
    return sendJson(response, 200, {
      notifications: mine,
      unreadCount: notificationsForSession(notifications, session)
        .filter((notification) => !notification.readAt).length,
    });
  }
  const notification = notifications.find(
    (item) =>
      item.id === notificationId &&
      (isAdmin(session) || item.recipientEmail === session.email),
  );
  if (!notification) return sendJson(response, 404, { error: "Notification not found." });
  if (!notification.readAt) {
    notification.readAt = new Date().toISOString();
    await writeJsonFile(NOTIFICATIONS_FILE, notifications);
  }
  return sendJson(response, 200, { ok: true });
}

function getLeadFollowUpAt(lead) {
  if (!lead.followUp || !lead.followUpTime) return null;
  const date = new Date(`${lead.followUp}T${lead.followUpTime}:00+06:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

async function sendEmail({ to, subject, text }) {
  if (!mailTransport) {
    throw new Error("SMTP is not configured. Set SMTP_HOST and SMTP_FROM.");
  }
  await mailTransport.sendMail({
    from: process.env.SMTP_FROM,
    to,
    subject,
    text,
  });
}

async function sendLeadAssignmentEmail(lead) {
  if (!lead.assignedEmail) return false;
  const followUpAt = getLeadFollowUpAt(lead);
  const followUp = followUpAt
    ? new Intl.DateTimeFormat("en-US", {
        dateStyle: "long",
        timeStyle: "short",
        timeZone: LEAD_TIME_ZONE,
      }).format(followUpAt)
    : "Not scheduled";
  await sendEmail({
    to: lead.assignedEmail,
    subject: `New lead assigned: ${lead.company}`,
    text: [
      `A lead has been assigned to you.`,
      "",
      `Company: ${lead.company}`,
      `Contact: ${lead.contactName}`,
      `Status: ${lead.status}`,
      `Follow-up: ${followUp} (${LEAD_TIME_ZONE})`,
      `Assigned by: ${lead.assignmentHistory?.at(-1)?.actorName || lead.createdByEmail}`,
    ].join("\n"),
  });
  return true;
}

let checkingLeadReminders = false;

async function sendDueLeadReminders() {
  if (!mailTransport || checkingLeadReminders) return;
  checkingLeadReminders = true;
  try {
    const leads = await loadLeads();
    const now = Date.now();
    let updated = false;
    for (const lead of leads) {
      const followUpAt = getLeadFollowUpAt(lead);
      if (!followUpAt || !lead.createdByEmail || followUpAt.getTime() <= now) continue;
      const reminderAt = followUpAt.getTime() - 48 * 60 * 60 * 1000;
      if (reminderAt > now || lead.reminderSentFor === followUpAt.toISOString()) continue;
      const lastAttempt = Date.parse(lead.lastReminderAttemptAt || "");
      if (Number.isFinite(lastAttempt) && now - lastAttempt < REMINDER_RETRY_INTERVAL_MS) continue;
      lead.lastReminderAttemptAt = new Date(now).toISOString();
      try {
        await sendEmail({
          to: lead.createdByEmail,
          subject: `Follow-up reminder in 48 hours: ${lead.company}`,
          text: [
            `This is a gentle reminder for an upcoming lead follow-up.`,
            "",
            `Company: ${lead.company}`,
            `Contact: ${lead.contactName}`,
            `Follow-up: ${new Intl.DateTimeFormat("en-US", {
              dateStyle: "long",
              timeStyle: "short",
              timeZone: LEAD_TIME_ZONE,
            }).format(followUpAt)} (${LEAD_TIME_ZONE})`,
          ].join("\n"),
        });
        lead.reminderSentFor = followUpAt.toISOString();
        lead.history.push({
          at: new Date(now).toISOString(),
          actor: "System",
          message: "48-hour follow-up reminder emailed to the lead creator",
        });
      } catch (error) {
        console.error(`Could not send follow-up reminder for lead ${lead.id}: ${error.message}`);
      }
      updated = true;
    }
    if (updated) await writeJsonFile(LEADS_FILE, leads);
  } catch (error) {
    console.error(`Could not process lead follow-up reminders: ${error.message}`);
  } finally {
    checkingLeadReminders = false;
  }
}

async function createAdmin(email) {
  const normalizedEmail = email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    throw new Error("Provide a valid email address.");
  }

  const password = `Rit!${crypto.randomBytes(24).toString("base64url")}`;
  const passwordRecord = await hashPassword(password);
  const account = {
    email: normalizedEmail,
    ...passwordRecord,
    createdAt: new Date().toISOString(),
  };

  if (usesDatabase()) {
    await database.createJson(USERS_FILE, account);
  } else {
    await fs.mkdir(DATA_DIRECTORY, { recursive: true });
    await fs.writeFile(USERS_FILE, `${JSON.stringify(account, null, 2)}\n`, {
      encoding: "utf8",
      flag: "wx",
    });
  }

  console.log(`Admin account created.\nEmail: ${normalizedEmail}\nPassword: ${password}`);
}

function sendJson(response, statusCode, payload, headers = {}) {
  const auditContext = auditStorage.getStore();
  if (auditContext) {
    auditContext.responseValue = safeAuditValue(payload);
  }
  response.writeHead(statusCode, {
    "Cache-Control": "no-store",
    "Content-Type": "application/json; charset=utf-8",
    ...headers,
  });
  response.end(JSON.stringify(payload));
}

function requestIp(request) {
  const forwarded = request.headers?.["x-forwarded-for"];
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return request.socket?.remoteAddress || request.connection?.remoteAddress || "unknown";
}

function parseCookies(header = "") {
  return Object.fromEntries(
    header
      .split(";")
      .map((part) => part.trim().split(/=(.*)/s, 2))
      .filter(([name, value]) => name && value !== undefined)
      .map(([name, value]) => [name, decodeURIComponent(value)]),
  );
}

function sessionCookie(value, maxAge) {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${SESSION_COOKIE}=${value}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${maxAge}${secure}`;
}

function recordRequestBody(parsed) {
  const auditContext = auditStorage.getStore();
  if (auditContext) {
    auditContext.requestValue = safeAuditValue(parsed);
    if (
      auditContext.pathname === "/api/login" &&
      parsed &&
      typeof parsed.email === "string" &&
      parsed.email.trim()
    ) {
      auditContext.actorEmail = parsed.email.trim().toLowerCase();
    }
  }
}

async function readJsonBody(request, maxBytes = 16 * 1024) {
  if (!request.headers["content-type"]?.startsWith("application/json")) {
    const error = new Error("Content-Type must be application/json.");
    error.statusCode = 415;
    throw error;
  }

  if (request.body !== undefined) {
    const body = typeof request.body === "string"
      ? request.body
      : Buffer.isBuffer(request.body)
        ? request.body.toString("utf8")
        : JSON.stringify(request.body);
    if (Buffer.byteLength(body) > maxBytes) {
      const error = new Error("Request body is too large.");
      error.statusCode = 413;
      throw error;
    }
    try {
      const parsed = typeof request.body === "object" && !Buffer.isBuffer(request.body)
        ? request.body
        : JSON.parse(body);
      recordRequestBody(parsed);
      return parsed;
    } catch {
      const error = new Error("Request body must be valid JSON.");
      error.statusCode = 400;
      throw error;
    }
  }

  let body = "";
  for await (const chunk of request) {
    body += chunk;
    if (Buffer.byteLength(body) > maxBytes) {
      const error = new Error("Request body is too large.");
      error.statusCode = 413;
      throw error;
    }
  }

  try {
    const parsed = JSON.parse(body);
    recordRequestBody(parsed);
    return parsed;
  } catch {
    const error = new Error("Request body must be valid JSON.");
    error.statusCode = 400;
    throw error;
  }
}

async function serveStatic(pathname, response) {
  const file = staticFiles.get(pathname);
  if (!file) return false;

  const [relativePath, contentType] = file;
  const contents = await fs.readFile(path.join(PUBLIC_DIRECTORY, relativePath));
  response.writeHead(200, {
    "Cache-Control": "no-store",
    "Content-Security-Policy":
      "default-src 'self'; img-src 'self' data:; style-src 'self'; script-src 'self'; connect-src 'self'; base-uri 'none'; form-action 'self'; frame-ancestors 'none'; object-src 'none'",
    "Content-Type": contentType,
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
  });
  response.end(contents);
  return true;
}

async function handleLogin(request, response) {
  const ip = requestIp(request);
  const now = Date.now();
  const attempts = loginAttempts.get(ip) || { count: 0, resetAt: now + LOGIN_WINDOW_MS };
  if (attempts.resetAt <= now) {
    attempts.count = 0;
    attempts.resetAt = now + LOGIN_WINDOW_MS;
  }
  if (attempts.count >= MAX_LOGIN_ATTEMPTS) {
    return sendJson(
      response,
      429,
      { error: "Too many sign-in attempts. Please wait 15 minutes and try again." },
      { "Retry-After": String(Math.ceil((attempts.resetAt - now) / 1000)) },
    );
  }

  const body = await readJsonBody(request);
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";
  if (!email || password.length < 1 || password.length > 1024) {
    attempts.count += 1;
    loginAttempts.set(ip, attempts);
    return sendJson(response, 401, { error: "Invalid email or password." });
  }

  const adminAccount = await loadAccount();
  const employees = await loadEmployees();
  const employeeAccount = employees.find((employee) => employee.email === email);
  const account = adminAccount?.email === email ? adminAccount : employeeAccount;
  const role = account === adminAccount && adminAccount
    ? "Admin"
    : isAdminRole(employeeAccount?.role) ? "Admin" : "Employee";
  const auditContext = auditStorage.getStore();
  if (auditContext) {
    auditContext.actorEmail = email;
    auditContext.actorRole = account ? role : "Unknown";
    auditContext.actorName = account
      ? publicProfile(account, role).name
      : email.split("@")[0].replace(/[._-]+/g, " ") || "Unknown";
  }
  const passwordRecord = account
    ? { salt: account.salt, hash: account.hash }
    : await hashPassword("invalid-account-password");
  const calculatedHash = await scryptAsync(
    password,
    Buffer.from(passwordRecord.salt, "hex"),
    64,
    { N: 16384, r: 8, p: 1, maxmem: 64 * 1024 * 1024 },
  );
  const expectedHash = Buffer.from(passwordRecord.hash, "hex");
  const passwordMatches =
    expectedHash.length === calculatedHash.length &&
    crypto.timingSafeEqual(expectedHash, calculatedHash);

  if (!account || !passwordMatches) {
    attempts.count += 1;
    loginAttempts.set(ip, attempts);
    return sendJson(response, 401, { error: "Invalid email or password." });
  }

  loginAttempts.delete(ip);
  const token = crypto.randomBytes(32).toString("base64url");
  await saveSession(token, {
    email: account.email,
    role,
    name: publicProfile(account, role).name,
    expiresAt: now + SESSION_DURATION_MS,
  });
  return sendJson(
    response,
    200,
    { email: account.email, role, profile: publicProfile(account, role) },
    {
      "Set-Cookie": sessionCookie(token, SESSION_DURATION_MS / 1000),
    },
  );
}

async function loadAccount() {
  try {
    return await readJsonFile(USERS_FILE);
  } catch (error) {
    if (error.code === "ENOENT") {
      if (!usesDatabase()) return null;
      const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
      const password = process.env.ADMIN_PASSWORD;
      if (!email || !password) return null;
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || password.length < 12 || password.length > 128) {
        throw new Error("ADMIN_EMAIL must be valid and ADMIN_PASSWORD must be 12 to 128 characters.");
      }
      const account = {
        email,
        ...await hashPassword(password),
        createdAt: new Date().toISOString(),
      };
      try {
        await database.createJson(USERS_FILE, account);
        return account;
      } catch (createError) {
        if (createError.code !== "23505") throw createError;
        return readJsonFile(USERS_FILE);
      }
    }
    throw error;
  }
}

async function getSession(request) {
  const token = parseCookies(request.headers.cookie)[SESSION_COOKIE];
  const session = token
    ? usesDatabase()
      ? await database.getSession(token)
      : sessions.get(token)
    : null;
  if (!session || session.expiresAt <= Date.now()) {
    if (token) {
      if (usesDatabase()) await database.deleteSession(token);
      else sessions.delete(token);
    }
    return null;
  }
  const auditContext = auditStorage.getStore();
  if (auditContext) {
    auditContext.actorEmail = session.email;
    auditContext.actorRole = session.role;
    auditContext.actorName = session.name || "";
  }
  return session;
}

async function saveSession(token, session) {
  if (usesDatabase()) await database.setSession(token, session);
  else sessions.set(token, session);
}

async function revokeSessions(email, role) {
  if (usesDatabase()) {
    await database.deleteSessionsForEmail(email, role);
    return;
  }
  for (const [token, session] of sessions) {
    if (session.email === email && (!role || session.role === role)) sessions.delete(token);
  }
}

async function updateSessions(email, role, changes) {
  if (usesDatabase()) {
    await database.updateSessionsForEmail(email, role, changes);
    return;
  }
  for (const session of sessions.values()) {
    if (session.email === email && session.role === role) Object.assign(session, changes);
  }
}

async function handleProfileUpdate(request, response, session) {
  const body = await readJsonBody(request, MAX_JSON_BODY_BYTES);
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const designation = typeof body.designation === "string" ? body.designation.trim() : "";
  const photo = typeof body.photo === "string" ? body.photo : "";

  if (!name || name.length > 80 || designation.length > 80) {
    return sendJson(response, 400, {
      error: "Name is required and both name and designation must be 80 characters or fewer.",
    });
  }

  let photoBytes = Buffer.alloc(0);
  if (photo) {
    const match = /^data:image\/(jpeg|png|webp);base64,([A-Za-z0-9+/]+={0,2})$/.exec(photo);
    if (!match) {
      return sendJson(response, 400, { error: "Choose a valid JPG, PNG, or WebP profile photo." });
    }
    photoBytes = Buffer.from(match[2], "base64");
    if (photoBytes.length > MAX_PROFILE_PHOTO_BYTES) {
      return sendJson(response, 413, { error: "Profile photos must be 1 MB or smaller." });
    }
    const isJpeg = match[1] === "jpeg" && photoBytes[0] === 0xff && photoBytes[1] === 0xd8;
    const isPng =
      match[1] === "png" &&
      photoBytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
    const isWebp =
      match[1] === "webp" &&
      photoBytes.toString("ascii", 0, 4) === "RIFF" &&
      photoBytes.toString("ascii", 8, 12) === "WEBP";
    if (!isJpeg && !isPng && !isWebp) {
      return sendJson(response, 400, { error: "The selected file is not a valid image." });
    }
  }

  const account = await findAccount(session.email, session.role);
  if (!account) {
    return sendJson(response, 401, { error: "Your session has expired. Please sign in again." });
  }

  account.name = name;
  const primaryAdmin = await loadAccount();
  const isAdminAccount = primaryAdmin?.email === session.email;
  account.designation = designation || (isAdmin(session) ? "Super Admin" : "Employee");
  account.photo = photo;
  const accountFile = isAdminAccount ? USERS_FILE : EMPLOYEES_FILE;
  if (isAdminAccount) {
    await writeJsonFile(accountFile, account);
  } else {
    const employees = await loadEmployees();
    const index = employees.findIndex((employee) => employee.email === session.email);
    employees[index] = account;
    await writeJsonFile(accountFile, employees);
  }
  session.name = account.name;
  const auditContext = auditStorage.getStore();
  if (auditContext) auditContext.actorName = account.name;

  return sendJson(response, 200, {
    email: account.email,
    profile: publicProfile(account, session.role),
  });
}

async function handleEmployees(request, response, session, employeeId = "") {
  if (!isAdmin(session)) return sendJson(response, 403, { error: "Admin access is required." });
  const [employees, teams] = await Promise.all([loadEmployees(), loadTeams()]);

  if (request.method === "GET") {
    return sendJson(response, 200, { employees: employees.map((employee) => publicEmployee(employee, teams)) });
  }

  if (request.method === "DELETE") {
    const employeeIndex = employees.findIndex((employee) => employee.id === employeeId);
    if (employeeIndex < 0) return sendJson(response, 404, { error: "Employee not found." });
    const deletedEmployee = employees[employeeIndex];
    if (isAdminRole(deletedEmployee.role)) {
      return sendJson(response, 403, { error: "Super Admin accounts cannot be deleted from Employees & Teams." });
    }
    const undoEntry = await saveUndoEntry(session, "employee", deletedEmployee.name, deletedEmployee);
    employees.splice(employeeIndex, 1);
    await commitDeletion(undoEntry, () => writeJsonFile(EMPLOYEES_FILE, employees));
    await revokeSessions(deletedEmployee.email, "Employee");
    return sendJson(response, 200, { ok: true, undo: publicUndoEntry(undoEntry) });
  }

  const body = await readJsonBody(request);
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";
  const designation = typeof body.designation === "string" ? body.designation.trim() : "";
  const teamIds = Array.isArray(body.teamIds) ? [...new Set(body.teamIds)] : [];

  if (!name || name.length > 80 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
    return sendJson(response, 400, { error: "Enter a valid name and email address." });
  }
  if ((request.method === "POST" && password.length < 12) || password.length > 128) {
    return sendJson(response, 400, { error: "Temporary passwords must be 12 to 128 characters long." });
  }
  if (designation.length > 80) {
    return sendJson(response, 400, { error: "Designation must be 80 characters or fewer." });
  }
  const adminAccount = await loadAccount();
  if (adminAccount?.email === email) {
    return sendJson(response, 409, { error: "This email is already in use." });
  }
  const existingEmployee = employees.find((employee) => employee.id === employeeId);
  if (request.method === "PUT" && !existingEmployee) {
    return sendJson(response, 404, { error: "Employee not found." });
  }
  if (employees.some((employee) => employee.email === email && employee.id !== employeeId)) {
    return sendJson(response, 409, { error: "An employee with this email already exists." });
  }
  const teamIdSet = new Set(teams.map((team) => team.id));
  if (teamIds.some((teamId) => typeof teamId !== "string" || !teamIdSet.has(teamId))) {
    return sendJson(response, 400, { error: "Select valid teams for this employee." });
  }

  let employee;
  let shouldInvalidatePasswordSessions = false;
  if (request.method === "PUT") {
    const previousEmail = existingEmployee.email;
    const employeeSessionRole = isAdminRole(existingEmployee.role) ? "Admin" : "Employee";
    employee = {
      ...existingEmployee,
      name,
      email,
      designation,
      teamIds,
    };
    if (password) {
      Object.assign(employee, await hashPassword(password));
      shouldInvalidatePasswordSessions = true;
    }
    employees[employees.indexOf(existingEmployee)] = employee;
    if (previousEmail !== email) {
      await updateSessions(previousEmail, employeeSessionRole, { email });
    }
  } else {
    const passwordRecord = await hashPassword(password);
    employee = {
      id: crypto.randomUUID(),
      name,
      email,
      designation,
      role: "Employee",
      teamIds,
      createdAt: new Date().toISOString(),
      ...passwordRecord,
    };
    employees.push(employee);
  }
  await writeJsonFile(EMPLOYEES_FILE, employees);
  const employeeSessionRole = isAdminRole(employee.role) ? "Admin" : "Employee";
  await updateSessions(employee.email, employeeSessionRole, { name: employee.name });
  if (shouldInvalidatePasswordSessions) {
    await revokeSessions(employee.email, employeeSessionRole);
  }
  return sendJson(response, request.method === "POST" ? 201 : 200, {
    employee: publicEmployee(employee, teams),
  });
}

async function handleEmployeePasswordReset(request, response, session, employeeId) {
  if (!isAdmin(session)) return sendJson(response, 403, { error: "Super Admin access is required." });
  const employees = await loadEmployees();
  const employee = employees.find((item) => item.id === employeeId);
  if (!employee) return sendJson(response, 404, { error: "Employee not found." });

  const body = await readJsonBody(request);
  const password = typeof body.password === "string" ? body.password : "";
  if (password.length < 12 || password.length > 128) {
    return sendJson(response, 400, { error: "Passwords must be 12 to 128 characters long." });
  }

  Object.assign(employee, await hashPassword(password));
  await writeJsonFile(EMPLOYEES_FILE, employees);
  const employeeSessionRole = isAdminRole(employee.role) ? "Admin" : "Employee";
  await revokeSessions(employee.email, employeeSessionRole);
  return sendJson(response, 200, {
    ok: true,
    message: `Password reset for ${employee.name}. They can now sign in with the new password.`,
  });
}

async function handleTeams(request, response, session, teamId = "") {
  if (!isAdmin(session)) return sendJson(response, 403, { error: "Admin access is required." });
  const [teams, employees] = await Promise.all([loadTeams(), loadEmployees()]);

  if (request.method === "GET") {
    return sendJson(response, 200, {
      teams: teams.map((team) => ({
        ...team,
        memberCount: employees.filter((employee) => (employee.teamIds || []).includes(team.id)).length,
      })),
    });
  }

  if (request.method === "DELETE") {
    const teamIndex = teams.findIndex((team) => team.id === teamId);
    if (teamIndex < 0) return sendJson(response, 404, { error: "Team not found." });
    const deletedTeam = teams[teamIndex];
    const memberIds = employees
      .filter((employee) => (employee.teamIds || []).includes(teamId))
      .map((employee) => employee.id);
    const undoEntry = await saveUndoEntry(session, "team", deletedTeam.name, deletedTeam, { memberIds });
    teams.splice(teamIndex, 1);
    const updatedEmployees = employees.map((employee) => ({
      ...employee,
      teamIds: (employee.teamIds || []).filter((id) => id !== teamId),
    }));
    await commitDeletion(undoEntry, async () => {
      await writeJsonFile(TEAMS_FILE, teams);
      try {
        await writeJsonFile(EMPLOYEES_FILE, updatedEmployees);
      } catch (error) {
        await writeJsonFile(TEAMS_FILE, [...teams, deletedTeam]);
        throw error;
      }
    });
    return sendJson(response, 200, { ok: true, undo: publicUndoEntry(undoEntry) });
  }

  const body = await readJsonBody(request);
  const name = typeof body.name === "string" ? body.name.trim() : "";
  if (!name || name.length > 60) {
    return sendJson(response, 400, { error: "Team name is required and must be 60 characters or fewer." });
  }
  const existingTeam = teams.find((team) => team.id === teamId);
  if (request.method === "PUT" && !existingTeam) {
    return sendJson(response, 404, { error: "Team not found." });
  }
  if (teams.some((team) => team.id !== teamId && team.name.toLocaleLowerCase() === name.toLocaleLowerCase())) {
    return sendJson(response, 409, { error: "A team with this name already exists." });
  }
  const team = existingTeam ? { ...existingTeam, name } : {
    id: crypto.randomUUID(),
    name,
    createdAt: new Date().toISOString(),
  };
  if (existingTeam) teams[teams.indexOf(existingTeam)] = team;
  else teams.push(team);
  await writeJsonFile(TEAMS_FILE, teams);
  return sendJson(response, request.method === "POST" ? 201 : 200, {
    team,
    teams: teams.map((item) => ({
      ...item,
      memberCount: employees.filter((employee) => (employee.teamIds || []).includes(item.id)).length,
    })),
  });
}

async function handleDeals(request, response, session, dealId = "") {
  const [deals, employees, adminAccount] = await Promise.all([
    loadDeals(),
    loadEmployees(),
    loadAccount(),
  ]);
  const assignees = getAssignees(adminAccount, employees);

  if (request.method === "GET") {
    return sendJson(response, 200, {
      deals: deals.map((deal) => publicDeal(deal, assignees)),
      assignees,
    });
  }

  if (request.method === "DELETE") {
    const index = deals.findIndex((deal) => deal.id === dealId);
    if (index < 0) return sendJson(response, 404, { error: "Deal not found." });
    const deletedDeal = deals[index];
    const undoEntry = await saveUndoEntry(session, "deal", deletedDeal.title, deletedDeal);
    deals.splice(index, 1);
    await commitDeletion(undoEntry, () => writeJsonFile(DEALS_FILE, deals));
    return sendJson(response, 200, { ok: true, undo: publicUndoEntry(undoEntry) });
  }

  const body = await readJsonBody(request);
  const title = typeof body.title === "string" ? body.title.trim() : "";
  const client = typeof body.client === "string" ? body.client.trim() : "";
  const value = typeof body.value === "number" ? body.value : Number.NaN;
  const status = typeof body.status === "string" ? body.status : "";
  const priority = typeof body.priority === "string" ? body.priority : "Medium";
  const closeDate = typeof body.closeDate === "string" ? body.closeDate : "";
  const assignedEmail =
    typeof body.assignedEmail === "string" ? body.assignedEmail.trim().toLowerCase() : "";

  if (!title || title.length > 120 || !client || client.length > 120) {
    return sendJson(response, 400, { error: "Deal name and client are required (120 characters maximum)." });
  }
  if (!Number.isSafeInteger(value) || value < 0 || value > 1_000_000_000_000) {
    return sendJson(response, 400, { error: "Deal value must be a whole BDT amount between 0 and 1,000,000,000,000." });
  }
  if (!["Open", "Won", "Lost"].includes(status)) {
    return sendJson(response, 400, { error: "Choose Open, Won, or Lost as the deal status." });
  }
  if (!["Low", "Medium", "High"].includes(priority)) {
    return sendJson(response, 400, { error: "Choose a valid deal priority." });
  }
  if (closeDate) {
    const parsedCloseDate = new Date(`${closeDate}T00:00:00Z`);
    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(closeDate) ||
      Number.isNaN(parsedCloseDate.getTime()) ||
      parsedCloseDate.toISOString().slice(0, 10) !== closeDate
    ) {
      return sendJson(response, 400, { error: "Enter a valid close date." });
    }
  }
  const assignee = assignees.find((item) => item.email === assignedEmail);
  if (!assignee) return sendJson(response, 400, { error: "Choose a valid assignee." });

  const existingDeal = deals.find((deal) => deal.id === dealId);
  if (request.method === "PUT" && !existingDeal) {
    return sendJson(response, 404, { error: "Deal not found." });
  }
  const deal = {
    ...(existingDeal || {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    }),
    title,
    client,
    value,
    status,
    priority,
    closeDate,
    assignedEmail,
    assignedName: assignee.name,
    updatedAt: new Date().toISOString(),
  };
  if (existingDeal) deals[deals.indexOf(existingDeal)] = deal;
  else deals.push(deal);
  await writeJsonFile(DEALS_FILE, deals);
  return sendJson(response, request.method === "POST" ? 201 : 200, {
    deal: publicDeal(deal, assignees),
  });
}

async function handleClients(request, response, session, clientId = "") {
  const [clients, employees, adminAccount] = await Promise.all([
    loadClients(),
    loadEmployees(),
    loadAccount(),
  ]);
  const assignees = getAssignees(adminAccount, employees);

  if (request.method === "GET") {
    return sendJson(response, 200, {
      clients: clients.map((client) => publicClient(client, assignees)),
      assignees,
    });
  }

  if (request.method === "DELETE") {
    const index = clients.findIndex((client) => client.id === clientId);
    if (index < 0) return sendJson(response, 404, { error: "Client not found." });
    const deletedClient = clients[index];
    const undoEntry = await saveUndoEntry(session, "client", deletedClient.company, deletedClient);
    clients.splice(index, 1);
    await commitDeletion(undoEntry, () => writeJsonFile(CLIENTS_FILE, clients));
    return sendJson(response, 200, { ok: true, undo: publicUndoEntry(undoEntry) });
  }

  const body = await readJsonBody(request);
  const fields = ["company", "email", "phone", "website", "country", "industry", "address", "notes"];
  const values = Object.fromEntries(
    fields.map((field) => [field, typeof body[field] === "string" ? body[field].trim() : ""]),
  );
  const type = typeof body.type === "string" ? body.type : "";
  const status = typeof body.status === "string" ? body.status : "";
  const managerEmail =
    typeof body.managerEmail === "string" ? body.managerEmail.trim().toLowerCase() : "";
  const tags = Array.isArray(body.tags)
    ? [...new Set(body.tags.filter((tag) => typeof tag === "string").map((tag) => tag.trim()).filter(Boolean))]
    : [];
  const limits = {
    company: 120,
    email: 254,
    phone: 40,
    website: 2048,
    country: 80,
    industry: 100,
    address: 500,
    notes: 2000,
  };

  if (!values.company || values.company.length > limits.company) {
    return sendJson(response, 400, { error: "Company name is required and must be 120 characters or fewer." });
  }
  if (fields.some((field) => values[field].length > limits[field])) {
    return sendJson(response, 400, { error: "One or more client fields exceed the allowed length." });
  }
  if (values.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    return sendJson(response, 400, { error: "Enter a valid business email." });
  }
  if (values.website && !/^https?:\/\/[^\s/$.?#].[^\s]*$/i.test(values.website)) {
    return sendJson(response, 400, { error: "Enter a valid website URL beginning with http:// or https://." });
  }
  if (!["prospect", "customer", "partner"].includes(type)) {
    return sendJson(response, 400, { error: "Choose a valid client type." });
  }
  if (!["active", "inactive"].includes(status)) {
    return sendJson(response, 400, { error: "Choose Active or Inactive as the client status." });
  }
  if (tags.length > 20 || tags.some((tag) => tag.length > 40)) {
    return sendJson(response, 400, { error: "Use up to 20 tags, each no longer than 40 characters." });
  }
  if (managerEmail && !assignees.some((assignee) => assignee.email === managerEmail)) {
    return sendJson(response, 400, { error: "Choose a valid account manager." });
  }

  const existingClient = clients.find((client) => client.id === clientId);
  if (request.method === "PUT" && !existingClient) {
    return sendJson(response, 404, { error: "Client not found." });
  }
  const duplicate = clients.find(
    (client) =>
      client.id !== clientId &&
      client.company.toLocaleLowerCase() === values.company.toLocaleLowerCase(),
  );
  if (duplicate) return sendJson(response, 409, { error: "A client with this company name already exists." });

  const client = {
    ...(existingClient || {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    }),
    ...values,
    type,
    status,
    managerEmail,
    tags,
    updatedAt: new Date().toISOString(),
  };
  if (existingClient) clients[clients.indexOf(existingClient)] = client;
  else clients.push(client);
  await writeJsonFile(CLIENTS_FILE, clients);
  return sendJson(response, request.method === "POST" ? 201 : 200, {
    client: publicClient(client, assignees),
  });
}

async function handleLeads(request, response, session, leadId = "", action = "") {
  const teams = await loadTeams();
  const [leads, employees, adminAccount] = await Promise.all([
    loadLeads(teams),
    loadEmployees(),
    loadAccount(),
  ]);
  const assignees = getAssignees(adminAccount, employees);
  if (request.method === "GET") {
    const teamsWithMembers = teams.map((team) => ({
      ...team,
      members: employees
        .filter((employee) => (employee.teamIds || []).includes(team.id))
        .map((employee) => ({ email: employee.email, name: employee.name || employee.email })),
    }));
    return sendJson(response, 200, {
      leads: leads
        .filter((lead) => canViewLead(lead, session))
        .map((lead) => publicLeadForUser(lead, assignees, teamsWithMembers, session)),
      teams: teamsWithMembers,
      assignees,
    });
  }

  const existingLead = leads.find((lead) => lead.id === leadId);
  if ((!existingLead && leadId) || (existingLead && !canViewLead(existingLead, session))) {
    return sendJson(response, 404, { error: "Lead not found." });
  }

  if (request.method === "DELETE") {
    if (!isAdmin(session) && existingLead.createdByEmail !== session.email) {
      return sendJson(response, 403, { error: "Only the lead creator or Super Admin can delete this lead." });
    }
    const undoEntry = await saveUndoEntry(session, "lead", existingLead.company, existingLead);
    leads.splice(leads.indexOf(existingLead), 1);
    await commitDeletion(undoEntry, () => writeJsonFile(LEADS_FILE, leads));
    return sendJson(response, 200, { ok: true, undo: publicUndoEntry(undoEntry) });
  }

  if (action === "convert" && request.method === "POST") {
    if (existingLead.convertedClientId) {
      return sendJson(response, 200, { clientId: existingLead.convertedClientId });
    }
    const clients = await loadClients();
    const duplicate = clients.find(
      (client) => client.company.toLocaleLowerCase() === existingLead.company.toLocaleLowerCase(),
    );
    if (duplicate) {
      return sendJson(response, 409, { error: "A client with this company name already exists." });
    }
    const now = new Date().toISOString();
    const client = {
      id: crypto.randomUUID(),
      company: existingLead.company,
      email: existingLead.contactEmail || "",
      phone: existingLead.phone || "",
      website: "",
      country: "",
      industry: "",
      address: "",
      notes: existingLead.notes || "",
      type: "prospect",
      status: "active",
      managerEmail: existingLead.assignedEmail || "",
      tags: [],
      createdAt: now,
      updatedAt: now,
    };
    clients.push(client);
    existingLead.status = "Converted";
    existingLead.convertedClientId = client.id;
    existingLead.updatedAt = now;
    existingLead.history.push({
      at: now,
      actor: session.name || session.email,
      message: "Lead converted to client",
    });
    await Promise.all([
      writeJsonFile(CLIENTS_FILE, clients),
      writeJsonFile(LEADS_FILE, leads),
    ]);
    return sendJson(response, 201, { clientId: client.id });
  }

  const body = await readJsonBody(request);
  const fields = [
    "company",
    "contactName",
    "contactEmail",
    "phone",
    "followUp",
    "followUpTime",
    "source",
    "sourceDetails",
    "notes",
  ];
  const values = Object.fromEntries(
    fields.map((field) => [field, typeof body[field] === "string" ? body[field].trim() : ""]),
  );
  const status = typeof body.status === "string" ? body.status : "";
  const priority = typeof body.priority === "string" ? body.priority : "";
  const currency = typeof body.currency === "string" ? body.currency : "";
  const value = typeof body.value === "number" ? body.value : Number.NaN;
  const teamId = typeof body.teamId === "string" ? body.teamId : "";
  const assignedEmail =
    typeof body.assignedEmail === "string" ? body.assignedEmail.trim().toLowerCase() : "";
  const limits = {
    company: 120,
    contactName: 100,
    contactEmail: 254,
    phone: 40,
    followUp: 10,
    followUpTime: 5,
    source: 30,
    sourceDetails: 300,
    notes: 2000,
  };
  if (!values.company || !values.contactName || fields.some((field) => values[field].length > limits[field])) {
    return sendJson(response, 400, { error: "Company and contact name are required; check the allowed field lengths." });
  }
  if (values.contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.contactEmail)) {
    return sendJson(response, 400, { error: "Enter a valid contact email." });
  }
  if (!values.source) {
    return sendJson(response, 400, { error: "Enter the lead source." });
  }
  if (values.followUp) {
    const date = new Date(`${values.followUp}T00:00:00Z`);
    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(values.followUp) ||
      Number.isNaN(date.getTime()) ||
      date.toISOString().slice(0, 10) !== values.followUp
    ) {
      return sendJson(response, 400, { error: "Enter a valid follow-up date." });
    }
  }
  if (
    values.followUpTime &&
    (!/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(values.followUpTime))
  ) {
    return sendJson(response, 400, { error: "Enter a valid follow-up time." });
  }
  const allowedStatuses = ["New", "Qualified", "Proposal", "Negotiation", "Contract", "Won", "Lost"];
  const isLegacyStatus = existingLead && status === existingLead.status && ["Contacted", "Converted"].includes(status);
  if (!allowedStatuses.includes(status) && !isLegacyStatus) {
    return sendJson(response, 400, { error: "Choose a valid lead status." });
  }
  if (!["Low", "Medium", "High", "Urgent"].includes(priority)) {
    return sendJson(response, 400, { error: "Choose a valid lead priority." });
  }
  if (!Number.isSafeInteger(value) || value < 0 || value > 1_000_000_000_000) {
    return sendJson(response, 400, { error: "Lead value must be a whole amount between 0 and 1,000,000,000,000." });
  }
  if (!["BDT", "USD", "EUR", "RMB"].includes(currency)) {
    return sendJson(response, 400, { error: "Choose a valid lead currency." });
  }
  if (teamId && !teams.some((team) => team.id === teamId)) {
    return sendJson(response, 400, { error: "Choose a valid team." });
  }
  if (assignedEmail && !assignees.some((assignee) => assignee.email === assignedEmail)) {
    return sendJson(response, 400, { error: "Choose a valid assignee." });
  }
  const keepsExistingAssignee =
    existingLead &&
    existingLead.teamId === teamId &&
    existingLead.assignedEmail === assignedEmail;
  if (assignedEmail && !teamId && !keepsExistingAssignee) {
    return sendJson(response, 400, { error: "Choose a team before assigning a team member." });
  }
  if (request.method === "PUT" && existingLead.convertedClientId) {
    return sendJson(response, 409, { error: "Converted leads cannot be edited." });
  }
  if (request.method === "PUT" && existingLead && !isAdmin(session) &&
      existingLead.createdByEmail !== session.email &&
      existingLead.assignedEmail !== session.email) {
    return sendJson(response, 403, { error: "Only the lead creator, current assignee, or Super Admin can update this lead." });
  }
  const now = new Date().toISOString();
  const account = await findAccount(session.email, session.role);
  const actor = publicProfile(account, session.role).name;
  const previousAssignee = existingLead?.assignedEmail || "";
  const lead = {
    ...(existingLead || {
      id: crypto.randomUUID(),
      recordNumber: Math.max(1000, ...leads.map((item) => item.recordNumber || 0)) + 1,
      createdAt: now,
      createdByEmail: session.email,
      assignmentHistory: [],
      history: [],
    }),
    ...values,
    status,
    priority,
    value,
    currency,
    teamId,
    assignedEmail,
    updatedAt: now,
  };
  const assignmentChanged =
    previousAssignee !== assignedEmail ||
    (existingLead && existingLead.teamId !== teamId && Boolean(assignedEmail));
  if (assignmentChanged) {
    lead.assignmentHistory = lead.assignmentHistory || [];
    lead.assignmentHistory.push({
      at: now,
      fromEmail: previousAssignee,
      toEmail: assignedEmail,
      actorEmail: session.email,
      actorName: actor,
      teamId,
    });
    lead.history.push({
      at: now,
      actor,
      message: "Lead assignment updated",
      assignmentEvent: true,
    });
  }
  if (!existingLead) {
    lead.history.push({ at: now, actor, message: "Lead created" });
  } else if (!assignmentChanged) {
    lead.history.push({ at: now, actor, message: "Lead updated" });
  }
  if (existingLead) leads[leads.indexOf(existingLead)] = lead;
  else leads.push(lead);
  await writeJsonFile(LEADS_FILE, leads);
  if (assignmentChanged && assignedEmail) {
    await createLeadNotification({
      lead,
      recipientEmail: assignedEmail,
      actorEmail: session.email,
      actorName: actor,
      previousEmail: previousAssignee,
    });
  }
  let emailWarning = "";
  if (assignmentChanged && lead.assignedEmail) {
    try {
      await sendLeadAssignmentEmail(lead);
    } catch (error) {
      console.error(`Could not send lead assignment email for lead ${lead.id}: ${error.message}`);
      emailWarning = `Lead ${existingLead ? "reassigned" : "created"}, but the assignment email could not be sent. Check the SMTP configuration.`;
    }
  }
  return sendJson(response, request.method === "POST" ? 201 : 200, {
    lead: publicLeadForUser(lead, assignees, teams, session),
    ...(emailWarning ? { emailWarning } : {}),
  });
}

async function handleUndoDeletion(request, response, session) {
  const entry = await undoEntryForSession(session);
  if (request.method === "GET") {
    return sendJson(response, 200, { undo: entry ? publicUndoEntry(entry) : null });
  }
  if (request.method !== "POST") return sendJson(response, 405, { error: "Method not allowed." });
  if (!entry) return sendJson(response, 404, { error: "There is no recent deletion to undo." });
  if (["employee", "team"].includes(entry.resource) && !isAdmin(session)) {
    return sendJson(response, 403, { error: "Admin access is required to restore this item." });
  }

  await restoreUndoEntry(entry);
  await removeUndoEntry(entry.id);
  return sendJson(response, 200, { ok: true, undone: publicUndoEntry(entry) });
}

async function handleRequest(request, response) {
  const url = new URL(request.url, "http://localhost");
  if (request.method === "GET" && (await serveStatic(url.pathname, response))) return;

  if (url.pathname === "/api/cron/lead-reminders" && request.method === "GET") {
    const secret = process.env.CRON_SECRET || "";
    const authorization = request.headers.authorization || "";
    const supplied = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
    const expectedBuffer = Buffer.from(secret);
    const suppliedBuffer = Buffer.from(supplied);
    if (
      !secret ||
      expectedBuffer.length !== suppliedBuffer.length ||
      !crypto.timingSafeEqual(expectedBuffer, suppliedBuffer)
    ) {
      return sendJson(response, 401, { error: "Unauthorized." });
    }
    await sendDueLeadReminders();
    return sendJson(response, 200, { ok: true });
  }

  if (url.pathname === "/api/undo-deletion" && ["GET", "POST"].includes(request.method)) {
    const session = await getSession(request);
    if (!session) return sendJson(response, 401, { error: "Not signed in." });
    return handleUndoDeletion(request, response, session);
  }

  if (url.pathname === "/api/login" && request.method === "POST") {
    return handleLogin(request, response);
  }

  if (url.pathname === "/api/me" && request.method === "GET") {
    const session = await getSession(request);
    if (!session) return sendJson(response, 401, { error: "Not signed in." });
    const account = await findAccount(session.email, session.role);
    if (!account) {
      return sendJson(response, 401, { error: "Not signed in." });
    }
    return sendJson(response, 200, {
      email: account.email,
      role: session.role,
      profile: publicProfile(account, session.role),
    });
  }

  if (url.pathname === "/api/profile" && request.method === "PUT") {
    const session = await getSession(request);
    if (!session) return sendJson(response, 401, { error: "Not signed in." });
    return handleProfileUpdate(request, response, session);
  }

  if (url.pathname === "/api/employees" && ["GET", "POST"].includes(request.method)) {
    const session = await getSession(request);
    if (!session) return sendJson(response, 401, { error: "Not signed in." });
    return handleEmployees(request, response, session);
  }

  const employeePasswordMatch = /^\/api\/employees\/([^/]+)\/reset-password$/.exec(url.pathname);
  if (employeePasswordMatch && request.method === "POST") {
    const session = await getSession(request);
    if (!session) return sendJson(response, 401, { error: "Not signed in." });
    return handleEmployeePasswordReset(
      request,
      response,
      session,
      decodeURIComponent(employeePasswordMatch[1]),
    );
  }

  const employeeMatch = /^\/api\/employees\/([^/]+)$/.exec(url.pathname);
  if (employeeMatch && ["PUT", "DELETE"].includes(request.method)) {
    const session = await getSession(request);
    if (!session) return sendJson(response, 401, { error: "Not signed in." });
    return handleEmployees(request, response, session, decodeURIComponent(employeeMatch[1]));
  }

  if (url.pathname === "/api/deals" && ["GET", "POST"].includes(request.method)) {
    const session = await getSession(request);
    if (!session) return sendJson(response, 401, { error: "Not signed in." });
    return handleDeals(request, response, session);
  }

  const dealMatch = /^\/api\/deals\/([^/]+)$/.exec(url.pathname);
  if (dealMatch && ["PUT", "DELETE"].includes(request.method)) {
    const session = await getSession(request);
    if (!session) return sendJson(response, 401, { error: "Not signed in." });
    return handleDeals(request, response, session, decodeURIComponent(dealMatch[1]));
  }

  if (url.pathname === "/api/clients" && ["GET", "POST"].includes(request.method)) {
    const session = await getSession(request);
    if (!session) return sendJson(response, 401, { error: "Not signed in." });
    return handleClients(request, response, session);
  }

  const clientMatch = /^\/api\/clients\/([^/]+)$/.exec(url.pathname);
  if (clientMatch && ["PUT", "DELETE"].includes(request.method)) {
    const session = await getSession(request);
    if (!session) return sendJson(response, 401, { error: "Not signed in." });
    return handleClients(request, response, session, decodeURIComponent(clientMatch[1]));
  }

  if (url.pathname === "/api/lead-dashboard" && request.method === "GET") {
    const session = await getSession(request);
    if (!session) return sendJson(response, 401, { error: "Not signed in." });
    return handleLeadDashboard(request, response, session);
  }

  if (url.pathname === "/api/audit-logs" && request.method === "GET") {
    const session = await getSession(request);
    if (!session) return sendJson(response, 401, { error: "Not signed in." });
    if (!isAdmin(session)) return sendJson(response, 403, { error: "Super Admin access is required." });
    await auditWriteQueue;
    const logs = await loadAuditLogs();
    const requestedLimit = Number(url.searchParams.get("limit") || 200);
    const limit = Number.isSafeInteger(requestedLimit)
      ? Math.min(Math.max(requestedLimit, 1), 500)
      : 200;
    const requestedOffset = Number(url.searchParams.get("offset") || 0);
    const offset = Number.isSafeInteger(requestedOffset)
      ? Math.min(Math.max(requestedOffset, 0), logs.length)
      : 0;
    return sendJson(response, 200, {
      logs: logs.slice(offset, offset + limit).map((log) => ({
        ...log,
        userRole: auditRoleLabel(log.userRole),
      })),
      total: logs.length,
      offset,
    });
  }

  if (url.pathname === "/api/audit-events" && request.method === "POST") {
    const session = await getSession(request);
    if (!session) return sendJson(response, 401, { error: "Not signed in." });
    const body = await readJsonBody(request);
    const allowedActions = ["Navigate", "Search", "Filter", "Open", "Export"];
    const allowedModules = [
      "Dashboard",
      "Employees",
      "Teams",
      "Sales",
      "Clients",
      "Leads",
      "Profile",
      "Notifications",
      "Audit Logs",
    ];
    if (
      !allowedActions.includes(body.action) ||
      !allowedModules.includes(body.module) ||
      typeof body.description !== "string" ||
      body.description.length > 200
    ) {
      return sendJson(response, 400, { error: "The audit activity details are invalid." });
    }
    if (
      !isAdmin(session) &&
      ["Employees", "Teams", "Audit Logs"].includes(body.module)
    ) {
      return sendJson(response, 403, { error: "This workspace activity is not available to your role." });
    }
    const auditContext = auditStorage.getStore();
    auditContext.action = body.action;
    auditContext.module = body.module;
    auditContext.eventDescription = body.description;
    auditContext.eventCompanyName =
      typeof body.companyName === "string" ? body.companyName.slice(0, 120) : "";
    auditContext.eventPreviousValue = safeAuditValue(body.previousValue);
    auditContext.eventNewValue = safeAuditValue(body.newValue);
    return sendJson(response, 201, { ok: true });
  }

  if (url.pathname === "/api/notifications" && request.method === "GET") {
    const session = await getSession(request);
    if (!session) return sendJson(response, 401, { error: "Not signed in." });
    return handleNotifications(request, response, session);
  }

  const notificationMatch = /^\/api\/notifications\/([^/]+)\/read$/.exec(url.pathname);
  if (notificationMatch && request.method === "POST") {
    const session = await getSession(request);
    if (!session) return sendJson(response, 401, { error: "Not signed in." });
    return handleNotifications(request, response, session, decodeURIComponent(notificationMatch[1]));
  }

  if (url.pathname === "/api/lead-dashboard" || url.pathname === "/api/notifications") {
    const session = await getSession(request);
    if (!session) return sendJson(response, 401, { error: "Not signed in." });
  }

  if (url.pathname === "/api/leads" && ["GET", "POST"].includes(request.method)) {
    const session = await getSession(request);
    if (!session) return sendJson(response, 401, { error: "Not signed in." });
    return handleLeads(request, response, session);
  }

  const leadConvertMatch = /^\/api\/leads\/([^/]+)\/convert$/.exec(url.pathname);
  if (leadConvertMatch && request.method === "POST") {
    const session = await getSession(request);
    if (!session) return sendJson(response, 401, { error: "Not signed in." });
    return handleLeads(request, response, session, decodeURIComponent(leadConvertMatch[1]), "convert");
  }

  const leadMatch = /^\/api\/leads\/([^/]+)$/.exec(url.pathname);
  if (leadMatch && ["PUT", "DELETE"].includes(request.method)) {
    const session = await getSession(request);
    if (!session) return sendJson(response, 401, { error: "Not signed in." });
    return handleLeads(request, response, session, decodeURIComponent(leadMatch[1]));
  }

  if (url.pathname === "/api/teams" && ["GET", "POST"].includes(request.method)) {
    const session = await getSession(request);
    if (!session) return sendJson(response, 401, { error: "Not signed in." });
    return handleTeams(request, response, session);
  }

  const teamMatch = /^\/api\/teams\/([^/]+)$/.exec(url.pathname);
  if (teamMatch && ["PUT", "DELETE"].includes(request.method)) {
    const session = await getSession(request);
    if (!session) return sendJson(response, 401, { error: "Not signed in." });
    return handleTeams(request, response, session, decodeURIComponent(teamMatch[1]));
  }

  if (url.pathname === "/api/logout" && request.method === "POST") {
    const token = parseCookies(request.headers.cookie)[SESSION_COOKIE];
    if (token) {
      if (usesDatabase()) await database.deleteSession(token);
      else sessions.delete(token);
    }
    return sendJson(
      response,
      200,
      { ok: true },
      { "Set-Cookie": sessionCookie("", 0) },
    );
  }

  sendJson(response, 404, { error: "Not found." });
}

function handleNodeRequest(request, response) {
  const url = new URL(request.url, "http://localhost");
  const context = {
    method: request.method,
    pathname: url.pathname,
    module: auditModuleForPath(url.pathname),
    action: auditActionForRequest(request, url.pathname),
    startedAt: new Date().toISOString(),
    ip: requestIp(request).replace(/^::ffff:/, ""),
    device: auditDevice(request.headers["user-agent"] || ""),
    actorEmail: "",
    actorName: "",
    actorRole: "Unknown",
    requestValue: null,
    responseValue: null,
    changes: [],
  };
  let auditRecorded = false;
  const recordAudit = () => {
    if (auditRecorded) return;
    auditRecorded = true;
    writeRequestAuditLog(context, response).catch((error) => {
      console.error(`Could not write audit log: ${error.message}`);
    });
  };
  response.on("finish", recordAudit);
  response.on("close", () => {
    if (!response.writableFinished) {
      response.statusCode = 499;
      recordAudit();
    }
  });
  auditStorage.run(context, () => {
    handleRequest(request, response).catch((error) => {
      console.error(`Request failed: ${error.message}`);
      if (!response.headersSent) {
        sendJson(response, error.statusCode || 500, {
          error: error.statusCode ? error.message : "An unexpected server error occurred.",
        });
      } else {
        response.destroy();
      }
    });
  });
}

function vercelHandler(request, response) {
  handleNodeRequest(request, response);
}

if (require.main === module && process.argv[2] === "create-admin") {
  createAdmin(process.argv[3] || "admin@ritorica.test").catch((error) => {
    console.error(`Could not create admin account: ${error.message}`);
    process.exitCode = 1;
  });
} else if (require.main === module) {
  const port = Number(process.env.PORT || 3000);
  const host = process.env.HOST || "127.0.0.1";
  const isLoopbackHost = ["localhost", "127.0.0.1", "::1"].includes(host.toLowerCase());
  if (
    !isLoopbackHost &&
    (process.env.NODE_ENV !== "production" || process.env.ALLOW_REMOTE_BIND !== "true")
  ) {
    console.error(
      "Refusing to bind outside localhost. Remote binding requires NODE_ENV=production and ALLOW_REMOTE_BIND=true; use it only behind a TLS proxy with network access restricted.",
    );
    process.exit(1);
  }

  const server = http.createServer(handleNodeRequest);

  server.listen(port, host, () => {
    console.log(`Ritorica CRM is running at http://${host}:${port}`);
  });

  const cleanupTimer = setInterval(() => {
    const now = Date.now();
    if (!database.isDatabaseConfigured()) {
      for (const [token, session] of sessions) {
        if (session.expiresAt <= now) sessions.delete(token);
      }
    }
    for (const [ip, attempts] of loginAttempts) {
      if (attempts.resetAt <= now) loginAttempts.delete(ip);
    }
  }, 60_000);
  cleanupTimer.unref();
  if (!mailTransport) {
    console.warn("Lead emails are disabled. Configure SMTP_HOST and SMTP_FROM to enable notifications.");
  }
  const leadReminderTimer = setInterval(sendDueLeadReminders, REMINDER_CHECK_INTERVAL_MS);
  leadReminderTimer.unref();
  sendDueLeadReminders();
}

module.exports = { vercelHandler };
