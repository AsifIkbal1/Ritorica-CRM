const fs = require("node:fs/promises");
const path = require("node:path");
const database = require("./database");

const dataDirectory = path.join(__dirname, "data");
const dataFiles = [
  "users.json",
  "employees.json",
  "teams.json",
  "deals.json",
  "clients.json",
  "leads.json",
  "notifications.json",
  "audit-logs.json",
  "undo-deletions.json",
];

async function importData() {
  if (!database.isDatabaseConfigured()) {
    throw new Error("Set DATABASE_URL or POSTGRES_URL before importing JSON data.");
  }

  let imported = 0;
  for (const fileName of dataFiles) {
    let value;
    try {
      value = JSON.parse(await fs.readFile(path.join(dataDirectory, fileName), "utf8"));
    } catch (error) {
      if (error.code === "ENOENT") continue;
      throw new Error(`Could not read ${fileName}: ${error.message}`);
    }

    if (await database.getJson(path.join(dataDirectory, fileName)) !== undefined) {
      console.log(`Skipped ${fileName}; a database record already exists.`);
      continue;
    }
    await database.setJson(path.join(dataDirectory, fileName), value);
    console.log(`Imported ${fileName}.`);
    imported += 1;
  }
  console.log(`Import complete: ${imported} file(s) imported.`);
}

importData().catch((error) => {
  console.error(`Could not import CRM data: ${error.message}`);
  process.exitCode = 1;
});
