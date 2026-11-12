const crypto = require("node:crypto");
const path = require("node:path");
const { Pool } = require("pg");

let pool;
let schemaPromise;

function isDatabaseConfigured() {
  return Boolean(process.env.DATABASE_URL || process.env.POSTGRES_URL);
}

function getPool() {
  if (!isDatabaseConfigured()) {
    throw new Error("Set DATABASE_URL (or POSTGRES_URL) to enable persistent Vercel storage.");
  }
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL || process.env.POSTGRES_URL,
      max: 1,
      idleTimeoutMillis: 10_000,
      connectionTimeoutMillis: 10_000,
    });
  }
  return pool;
}

async function ensureSchema() {
  if (!schemaPromise) {
    schemaPromise = (async () => {
      const client = getPool();
      await client.query(`
        CREATE TABLE IF NOT EXISTS crm_json_store (
          key text PRIMARY KEY,
          value jsonb NOT NULL,
          updated_at timestamptz NOT NULL DEFAULT now()
        )
      `);
      await client.query(`
        CREATE TABLE IF NOT EXISTS crm_sessions (
          token text PRIMARY KEY,
          email text NOT NULL,
          role text NOT NULL,
          name text NOT NULL,
          expires_at bigint NOT NULL
        )
      `);
      await client.query("CREATE INDEX IF NOT EXISTS crm_sessions_email_idx ON crm_sessions (email, role)");
    })().catch((error) => {
      schemaPromise = null;
      throw error;
    });
  }
  await schemaPromise;
}

function dataKey(filePath) {
  return path.basename(filePath);
}

function sessionKey(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

async function getJson(filePath) {
  await ensureSchema();
  const result = await getPool().query(
    "SELECT value FROM crm_json_store WHERE key = $1",
    [dataKey(filePath)],
  );
  return result.rows[0]?.value;
}

async function setJson(filePath, value) {
  await ensureSchema();
  await getPool().query(
    `INSERT INTO crm_json_store (key, value, updated_at)
     VALUES ($1, $2::jsonb, now())
     ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now()`,
    [dataKey(filePath), JSON.stringify(value)],
  );
}

async function createJson(filePath, value) {
  await ensureSchema();
  await getPool().query(
    "INSERT INTO crm_json_store (key, value) VALUES ($1, $2::jsonb)",
    [dataKey(filePath), JSON.stringify(value)],
  );
}

async function getSession(token) {
  await ensureSchema();
  const result = await getPool().query(
    "SELECT email, role, name, expires_at FROM crm_sessions WHERE token = $1 AND expires_at > $2",
    [sessionKey(token), Date.now()],
  );
  const session = result.rows[0];
  return session
    ? { email: session.email, role: session.role, name: session.name, expiresAt: Number(session.expires_at) }
    : null;
}

async function setSession(token, session) {
  await ensureSchema();
  await getPool().query(
    `INSERT INTO crm_sessions (token, email, role, name, expires_at)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (token) DO UPDATE SET
       email = EXCLUDED.email, role = EXCLUDED.role, name = EXCLUDED.name, expires_at = EXCLUDED.expires_at`,
    [sessionKey(token), session.email, session.role, session.name, session.expiresAt],
  );
}

async function deleteSession(token) {
  await ensureSchema();
  await getPool().query("DELETE FROM crm_sessions WHERE token = $1", [sessionKey(token)]);
}

async function deleteSessionsForEmail(email, role) {
  await ensureSchema();
  await getPool().query(
    "DELETE FROM crm_sessions WHERE email = $1 AND ($2::text IS NULL OR role = $2)",
    [email, role || null],
  );
}

async function updateSessionsForEmail(email, role, changes) {
  await ensureSchema();
  const fields = [];
  const values = [email, role];
  if (changes.email !== undefined) {
    values.push(changes.email);
    fields.push(`email = $${values.length}`);
  }
  if (changes.name !== undefined) {
    values.push(changes.name);
    fields.push(`name = $${values.length}`);
  }
  if (fields.length) {
    await getPool().query(
      `UPDATE crm_sessions SET ${fields.join(", ")} WHERE email = $1 AND role = $2 AND expires_at > $${values.length + 1}`,
      [...values, Date.now()],
    );
  }
}

module.exports = {
  createJson,
  deleteSession,
  deleteSessionsForEmail,
  getJson,
  getSession,
  isDatabaseConfigured,
  setJson,
  setSession,
  updateSessionsForEmail,
};
