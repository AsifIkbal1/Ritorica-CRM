const passwordInput = document.querySelector("#password");
const passwordToggle = document.querySelector("#password-toggle");
const form = document.querySelector("#login-form");
const formMessage = document.querySelector("#form-message");
const loginCard = document.querySelector("#login-card");
const loginView = document.querySelector("#login-view");
const appShell = document.querySelector("#app-shell");
const accountName = document.querySelector("#account-name");
const accountAvatar = document.querySelector("#account-avatar");
const accountInitials = document.querySelector("#account-initials");
const accountPhoto = document.querySelector("#account-photo");
const accountDesignation = document.querySelector("#account-designation");
const sidebar = document.querySelector("#sidebar");
const sidebarToggle = document.querySelector("#menu-toggle");
const sidebarBackdrop = document.querySelector("#sidebar-backdrop");
const notificationButton = document.querySelector("#notification-button");
const notificationPanel = document.querySelector("#notification-panel");
const notificationCount = document.querySelector("#notification-count");
const notificationSummary = document.querySelector("#notification-summary");
const notificationList = document.querySelector("#notification-list");
const handoffFlowList = document.querySelector("#handoff-flow-list");
const handoffFlowEmpty = document.querySelector("#handoff-flow-empty");
const handoffFlowCount = document.querySelector("#handoff-flow-count");
const assignedLeadList = document.querySelector("#assigned-lead-list");
const assignedLeadEmpty = document.querySelector("#assigned-lead-empty");
const assignedLeadCount = document.querySelector("#assigned-lead-count");
const handoffMessage = document.querySelector("#handoff-message");
const handoffDescription = document.querySelector("#handoff-description");
const dashboardOverviewMessage = document.querySelector("#dashboard-overview-message");
const pageTitle = document.querySelector("#page-title");
const pageDescription = document.querySelector("#page-description");
const dashboardContent = document.querySelector("#dashboard-content");
const salesDashboard = document.querySelector("#sales-dashboard");
const clientsDashboard = document.querySelector("#clients-dashboard");
const leadsDashboard = document.querySelector("#leads-dashboard");
const sectionPlaceholder = document.querySelector("#section-placeholder");
const auditDashboard = document.querySelector("#audit-dashboard");
const auditList = document.querySelector("#audit-list");
const auditEmpty = document.querySelector("#audit-empty");
const auditMessage = document.querySelector("#audit-message");
const auditCount = document.querySelector("#audit-count");
const auditSearch = document.querySelector("#audit-search");
const auditModuleFilter = document.querySelector("#audit-module-filter");
const auditStatusFilter = document.querySelector("#audit-status-filter");
const auditPrevious = document.querySelector("#audit-previous");
const auditNext = document.querySelector("#audit-next");
const auditPageStatus = document.querySelector("#audit-page-status");
const sectionHeading = document.querySelector("#section-heading");
const sectionIcon = document.querySelector("#section-icon");
const profileDialog = document.querySelector("#profile-dialog");
const profileForm = document.querySelector("#profile-form");
const profilePhotoInput = document.querySelector("#profile-photo-input");
const profilePhotoImage = document.querySelector("#profile-photo-image");
const profilePhotoPlaceholder = document.querySelector(".profile-photo__placeholder");
const profileMessage = document.querySelector("#profile-message");
const profileSave = document.querySelector("#profile-save");
const employeeManagement = document.querySelector("#employee-management");
const employeeDialog = document.querySelector("#employee-dialog");
const employeeForm = document.querySelector("#employee-form");
const employeeMessage = document.querySelector("#employee-message");
const employeeCreate = document.querySelector("#employee-create");
const employeeList = document.querySelector("#employee-list");
const employeeEmpty = document.querySelector("#employee-empty");
const employeeTeamOptions = document.querySelector("#employee-team-options");
const employeePasswordDialog = document.querySelector("#employee-password-dialog");
const employeePasswordForm = document.querySelector("#employee-password-form");
const employeePasswordMessage = document.querySelector("#employee-password-message");
const employeePasswordSave = document.querySelector("#employee-password-save");
const teamList = document.querySelector("#team-list");
const managementMessage = document.querySelector("#management-message");
const teamDialog = document.querySelector("#team-dialog");
const teamForm = document.querySelector("#team-form");
const teamMessage = document.querySelector("#team-message");
const teamCreate = document.querySelector("#team-create");
const dealList = document.querySelector("#deal-list");
const dealEmpty = document.querySelector("#deal-empty");
const dealsMessage = document.querySelector("#deals-message");
const dealDialog = document.querySelector("#deal-dialog");
const dealForm = document.querySelector("#deal-form");
const dealMessage = document.querySelector("#deal-message");
const dealSave = document.querySelector("#deal-save");
const dealAssignee = document.querySelector("#deal-assigned");
const dealStatusFilter = document.querySelector("#deal-status-filter");
const dealStatusSelect = document.querySelector("#deal-status");
const dealStatusTrigger = document.querySelector("#deal-status-trigger");
const dealStatusValue = document.querySelector("#deal-status-value");
const dealStatusOptions = document.querySelector("#deal-status-options");
const clientList = document.querySelector("#client-list");
const clientEmpty = document.querySelector("#client-empty");
const clientsCount = document.querySelector("#clients-count");
const clientsMessage = document.querySelector("#clients-message");
const clientDialog = document.querySelector("#client-dialog");
const clientForm = document.querySelector("#client-form");
const clientMessage = document.querySelector("#client-message");
const clientSave = document.querySelector("#client-save");
const clientManagerSelect = document.querySelector("#client-manager");
const leadList = document.querySelector("#lead-list");
const leadEmpty = document.querySelector("#lead-empty");
const leadsMessage = document.querySelector("#leads-message");
const leadSearch = document.querySelector("#lead-search");
const leadStatusFilter = document.querySelector("#lead-status-filter");
const leadTeamFilter = document.querySelector("#lead-team-filter");
const leadDialog = document.querySelector("#lead-dialog");
const leadForm = document.querySelector("#lead-form");
const leadMessage = document.querySelector("#lead-message");
const leadSave = document.querySelector("#lead-save");
const leadTeamSelect = document.querySelector("#lead-team");
const leadAssignedSelect = document.querySelector("#lead-assigned");
const leadHistoryDialog = document.querySelector("#lead-history-dialog");
const leadHistoryList = document.querySelector("#lead-history-list");
const confirmDialog = document.querySelector("#confirm-dialog");
const confirmTitle = document.querySelector("#confirm-dialog-title");
const confirmMessage = document.querySelector("#confirm-dialog-message");
const confirmIcon = document.querySelector("#confirm-dialog-icon");
const confirmCancel = document.querySelector("#confirm-dialog-cancel");
const confirmSubmit = document.querySelector("#confirm-dialog-submit");
const dealDropdowns = [
  {
    container: document.querySelector("#deal-status-select"),
    select: dealStatusSelect,
    trigger: dealStatusTrigger,
    value: dealStatusValue,
    options: dealStatusOptions,
  },
  {
    container: document.querySelector("#deal-priority-select"),
    select: document.querySelector("#deal-priority"),
    trigger: document.querySelector("#deal-priority-trigger"),
    value: document.querySelector("#deal-priority-value"),
    options: document.querySelector("#deal-priority-options"),
  },
  {
    container: document.querySelector("#deal-assigned-select"),
    select: dealAssignee,
    trigger: document.querySelector("#deal-assigned-trigger"),
    value: document.querySelector("#deal-assigned-value"),
    options: document.querySelector("#deal-assigned-options"),
  },
  {
    container: document.querySelector("#client-status-select"),
    select: document.querySelector("#client-status"),
    trigger: document.querySelector("#client-status-trigger"),
    value: document.querySelector("#client-status-value"),
    options: document.querySelector("#client-status-options"),
    placeholder: "active",
  },
  {
    container: document.querySelector("#client-manager-select"),
    select: clientManagerSelect,
    trigger: document.querySelector("#client-manager-trigger"),
    value: document.querySelector("#client-manager-value"),
    options: document.querySelector("#client-manager-options"),
    placeholder: "Unassigned",
  },
];

let profile = { name: "", designation: "Super Admin", photo: "" };
let selectedPhoto = "";
let signedInRole = "Admin";
let signedInEmail = "";
let dashboardNotificationData = [];
let teams = [];
let employees = [];
let employeeTeamIds = [];
let returnToEmployeeDialog = false;
let editingEmployeeId = "";
let resolveConfirmation = null;

function hasAdminAccess(role) {
  return role === "Admin" || role === "Super Admin";
}

function confirmAction({ title, message, confirmLabel = "Continue", tone = "danger" }) {
  confirmTitle.textContent = title;
  confirmMessage.textContent = message;
  confirmSubmit.textContent = confirmLabel;
  confirmSubmit.classList.toggle("confirm-dialog__button--danger", tone === "danger");
  confirmIcon.classList.toggle("confirm-dialog__icon--danger", tone === "danger");
  confirmIcon.classList.toggle("confirm-dialog__icon--primary", tone !== "danger");
  return new Promise((resolve) => {
    resolveConfirmation = resolve;
    confirmDialog.returnValue = "";
    confirmDialog.showModal();
    confirmCancel.focus();
  });
}

confirmCancel.addEventListener("click", () => confirmDialog.close("cancel"));
confirmSubmit.addEventListener("click", () => confirmDialog.close("confirm"));
confirmDialog.addEventListener("click", (event) => {
  if (event.target === confirmDialog) confirmDialog.close("cancel");
});
confirmDialog.addEventListener("close", () => {
  resolveConfirmation?.(confirmDialog.returnValue === "confirm");
  resolveConfirmation = null;
});
let editingTeamId = "";
let deals = [];
let dealAssignees = [];
let editingDealId = "";
let clients = [];
let clientAssignees = [];
let editingClientId = "";
let leads = [];
let leadTeams = [];
let leadAssignees = [];
let editingLeadId = "";
let auditLogs = [];
let auditTotal = 0;
let auditOffset = 0;
const auditPageSize = 100;
let currentPageKey = "";
let availableUndo = null;
let undoInProgress = false;

const pages = {
  dashboard: { title: "Dashboard", description: "Your workspace at a glance.", icon: "▦" },
  leads: { title: "Leads", description: "Manage your customer prospects.", icon: "↗" },
  clients: { title: "Clients", description: "Manage your client relationships.", icon: "◎" },
  sales: { title: "Sales & Deals", description: "Track your sales opportunities.", icon: "◇" },
  employees: { title: "Employees & Teams", description: "Manage your team and employees.", icon: "♧" },
  audit: { title: "Audit Logs", description: "Review activity across your workspace.", icon: "≡" },
  profile: { title: "My profile", description: "Your account and profile settings.", icon: "◉" },
};

passwordToggle.addEventListener("click", () => {
  const shouldShowPassword = passwordInput.type === "password";
  passwordInput.type = shouldShowPassword ? "text" : "password";
  passwordToggle.setAttribute("aria-pressed", String(shouldShowPassword));
  passwordToggle.setAttribute(
    "aria-label",
    shouldShowPassword ? "Hide password" : "Show password",
  );
});

document.querySelector("#forgot-password").addEventListener("click", () => {
  formMessage.textContent = "Please contact the Super Admin to set a new password for you.";
});

function defaultProfileName(email) {
  const displayName = email.split("@")[0].replace(/[._-]+/g, " ");
  return displayName
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.replace(/\b\w/g, (letter) => letter.toUpperCase()))
    .join(" ");
}

function renderProfile(nextProfile, email) {
  profile = {
    name: nextProfile?.name || defaultProfileName(email),
    designation: nextProfile?.designation || "Super Admin",
    photo: nextProfile?.photo || "",
  };
  accountName.textContent = profile.name;
  accountDesignation.textContent = profile.designation;
  const initials = profile.name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toLocaleUpperCase())
    .join("");
  accountInitials.textContent = initials || "A";
  accountPhoto.hidden = !profile.photo;
  accountInitials.hidden = Boolean(profile.photo);
  if (profile.photo) accountPhoto.src = profile.photo;
  profilePhotoImage.hidden = !profile.photo;
  profilePhotoPlaceholder.hidden = Boolean(profile.photo);
  if (profile.photo) profilePhotoImage.src = profile.photo;
}

function showSignedIn(email, savedProfile, role = "Admin") {
  renderProfile(savedProfile, email);
  signedInRole = role;
  signedInEmail = email;
  document.querySelectorAll("[data-admin-only]").forEach((group) => {
    const restricted = !hasAdminAccess(role);
    group.hidden = restricted;
    group.querySelectorAll(".nav-link").forEach((link) => {
      link.disabled = restricted;
      link.title = restricted ? "Available to administrators only" : "";
    });
  });
  loginView.hidden = true;
  appShell.hidden = false;
  loadAvailableUndo();
  setPage("dashboard");
}

function rememberUndoEntry(undo) {
  availableUndo = undo;
}

async function loadAvailableUndo() {
  try {
    const response = await fetch("/api/undo-deletion", { credentials: "same-origin" });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Could not check undo history.");
    availableUndo = result.undo;
  } catch (error) {
    console.error("Could not load undo history:", error);
  }
}

async function undoLastDeletion() {
  if (!availableUndo || undoInProgress) return;
  undoInProgress = true;
  try {
    const response = await fetch("/api/undo-deletion", {
      method: "POST",
      credentials: "same-origin",
    });
    const result = await response.json();
    if (!response.ok) {
      console.error("Could not undo the deletion:", result.error || response.status);
      return;
    }

    const resource = result.undone.resource;
    availableUndo = null;
    const refresh = {
      lead: () => loadLeads(),
      client: () => loadClients(),
      deal: () => loadDeals(),
      employee: () => loadEmployeeManagement(),
      team: () => loadEmployeeManagement(),
    }[resource];
    if (refresh) await refresh();
    if (resource === "employee" || resource === "team") await loadLeads();
    if (["lead", "client", "deal"].includes(resource)) await loadLeadDashboard();
    await loadAvailableUndo();
  } catch (error) {
    console.error("Could not connect to undo the deletion:", error);
  } finally {
    undoInProgress = false;
  }
}

document.addEventListener("keydown", (event) => {
  if (!(event.ctrlKey || event.metaKey) || event.key.toLocaleLowerCase() !== "z" || !availableUndo) return;
  const target = event.target;
  if (
    target instanceof HTMLElement &&
    (target.isContentEditable || target.matches("input, textarea, select") || target.closest("dialog[open]"))
  ) return;
  event.preventDefault();
  undoLastDeletion();
});

async function checkExistingSession() {
  try {
    const response = await fetch("/api/me", { credentials: "same-origin" });
    if (!response.ok) return;
    const account = await response.json();
    showSignedIn(account.email, account.profile, account.role);
  } catch {
    formMessage.textContent = "Could not connect to the server. Please try again.";
  }
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const submitButton = form.querySelector('button[type="submit"]');
  submitButton.disabled = true;
  formMessage.textContent = "Signing in…";

  try {
    const response = await fetch("/api/login", {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: form.elements.email.value,
        password: form.elements.password.value,
      }),
    });
    const result = await response.json();
    if (!response.ok) {
      formMessage.textContent = result.error || "Could not sign in. Please try again.";
      return;
    }
    form.reset();
    formMessage.textContent = "";
    showSignedIn(result.email, result.profile, result.role);
  } catch {
    formMessage.textContent = "Could not connect to the server. Please try again.";
  } finally {
    submitButton.disabled = false;
  }
});

document.querySelector("#sign-out").addEventListener("click", async () => {
  const signOutButton = document.querySelector("#sign-out");
  signOutButton.disabled = true;
  try {
    const response = await fetch("/api/logout", {
      method: "POST",
      credentials: "same-origin",
    });
    if (!response.ok) {
      formMessage.textContent = "Could not sign out. Please try again.";
      return;
    }
    appShell.hidden = true;
    loginView.hidden = false;
    availableUndo = null;
    loginCard.querySelector("#email").focus();
  } catch {
    window.alert("Could not connect to the server. Please try again.");
  } finally {
    signOutButton.disabled = false;
  }
});

async function logAuditUiEvent({ action, module, description, previousValue, newValue }) {
  try {
    const response = await fetch("/api/audit-events", {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, module, description, previousValue, newValue }),
    });
    if (!response.ok) {
      throw new Error(`Audit activity request failed with HTTP ${response.status}.`);
    }
  } catch (error) {
    console.error("Could not record workspace activity:", error);
  }
}

function auditValueText(value) {
  if (value === "—" || value == null) return "—";
  if (typeof value === "string") return value;
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

function filteredAuditLogs() {
  const query = auditSearch.value.trim().toLocaleLowerCase();
  const module = auditModuleFilter.value;
  const status = auditStatusFilter.value;
  return auditLogs.filter((log) => {
    if (module !== "All" && log.module !== module) return false;
    if (status !== "All" && log.status !== status) return false;
    if (!query) return true;
    return [
      log.id,
      log.dateTime,
      log.companyName,
      log.userName,
      log.userRole,
      log.action,
      log.module,
      auditValueText(log.previousValue),
      auditValueText(log.newValue),
      log.ipAddress,
      log.device,
      log.location,
      log.status,
      log.description,
    ].some((value) => String(value || "").toLocaleLowerCase().includes(query));
  });
}

function renderAuditLogs() {
  const visibleLogs = filteredAuditLogs();
  auditList.replaceChildren();
  auditCount.textContent = `${visibleLogs.length} shown · ${auditTotal} total`;
  const pageCount = Math.max(1, Math.ceil(auditTotal / auditPageSize));
  const pageNumber = Math.floor(auditOffset / auditPageSize) + 1;
  auditPageStatus.textContent = `Page ${pageNumber} of ${pageCount}`;
  auditPrevious.disabled = auditOffset === 0;
  auditNext.disabled = auditOffset + auditPageSize >= auditTotal;
  auditEmpty.hidden = visibleLogs.length > 0;
  for (const log of visibleLogs) {
    const row = document.createElement("tr");
    const values = [
      log.id,
      log.dateTime ? new Date(log.dateTime).toLocaleString() : "—",
      log.companyName,
      log.userName,
      log.userRole,
      log.action,
      log.module,
      auditValueText(log.previousValue),
      auditValueText(log.newValue),
      log.ipAddress,
      log.device,
      log.location,
      log.status,
      log.description,
    ];
    for (const [index, rawValue] of values.entries()) {
      const cell = document.createElement("td");
      const value = String(rawValue || "—");
      cell.textContent = value.length > 400 ? `${value.slice(0, 400)}…` : value;
      if (value.length > 400) cell.title = value;
      if (index === 12) {
        cell.classList.add("audit-status");
        cell.dataset.status = String(log.status || "").toLowerCase();
      }
      row.append(cell);
    }
    auditList.append(row);
  }
}

async function loadAuditLogs() {
  auditMessage.textContent = "";
  auditCount.textContent = "Loading…";
  try {
    const response = await fetch(
      `/api/audit-logs?limit=${auditPageSize}&offset=${auditOffset}`,
      {
      credentials: "same-origin",
      },
    );
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error || "Could not load audit logs.");
    }
    auditLogs = result.logs;
    auditTotal = result.total;
    auditOffset = result.offset;
    renderAuditLogs();
  } catch (error) {
    auditLogs = [];
    auditTotal = 0;
    auditOffset = 0;
    renderAuditLogs();
    auditMessage.textContent = error.message || "Could not load audit logs.";
  }
}

function setPage(pageKey) {
  if (!hasAdminAccess(signedInRole) && ["audit"].includes(pageKey)) return;
  const page = pages[pageKey];
  if (!page) return;

  pageTitle.textContent = page.title;
  pageDescription.textContent = page.description;
  const isDashboard = pageKey === "dashboard";
  const isEmployeeManagement = pageKey === "employees";
  const isSalesDashboard = pageKey === "sales";
  const isClientsDashboard = pageKey === "clients";
  const isLeadsDashboard = pageKey === "leads";
  const isAuditDashboard = pageKey === "audit";
  const previousPageKey = currentPageKey;
  currentPageKey = pageKey;
  const moduleByPage = {
    dashboard: "Dashboard",
    leads: "Leads",
    clients: "Clients",
    sales: "Sales",
    employees: "Employees",
    audit: "Audit Logs",
    profile: "Profile",
  };
  const activity = previousPageKey !== pageKey
    ? logAuditUiEvent({
        action: "Navigate",
        module: moduleByPage[pageKey],
        description: `Opened ${page.title}`,
        previousValue: previousPageKey || "Signed in",
        newValue: pageKey,
      })
    : Promise.resolve();
  dashboardContent.hidden = !isDashboard;
  employeeManagement.hidden = !isEmployeeManagement;
  salesDashboard.hidden = !isSalesDashboard;
  clientsDashboard.hidden = !isClientsDashboard;
  leadsDashboard.hidden = !isLeadsDashboard;
  auditDashboard.hidden = !isAuditDashboard;
  sectionPlaceholder.hidden =
    isDashboard || isEmployeeManagement || isSalesDashboard || isClientsDashboard || isLeadsDashboard || isAuditDashboard;
  sectionHeading.textContent = page.title;
  sectionIcon.textContent = page.icon;
  if (isEmployeeManagement) loadEmployeeManagement();
  if (isSalesDashboard) loadDeals();
  if (isClientsDashboard) loadClients();
  if (isLeadsDashboard) loadLeads();
  if (isAuditDashboard) activity.then(loadAuditLogs);
  if (isDashboard) loadLeadDashboard();

  document.querySelectorAll(".sidebar-nav [data-page], .profile-link").forEach((link) => {
    const active = link.dataset.page === pageKey;
    link.classList.toggle("is-active", active);
    if (active) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });

  setSidebarOpen(false);
}

let auditSearchTimer = 0;
let lastAuditSearch = "";
let lastAuditModule = "All";
let lastAuditStatus = "All";
auditSearch.addEventListener("input", () => {
  renderAuditLogs();
  window.clearTimeout(auditSearchTimer);
  auditSearchTimer = window.setTimeout(() => {
    const value = auditSearch.value.trim();
    if (value === lastAuditSearch) return;
    logAuditUiEvent({
      action: "Search",
      module: "Audit Logs",
      description: "Searched audit logs",
      previousValue: lastAuditSearch ? `${lastAuditSearch.length} characters` : "—",
      newValue: value ? `${value.length} characters` : "—",
    });
    lastAuditSearch = value;
  }, 500);
});
auditModuleFilter.addEventListener("change", () => {
  renderAuditLogs();
  logAuditUiEvent({
    action: "Filter",
    module: "Audit Logs",
    description: "Changed audit log module filter",
    previousValue: lastAuditModule,
    newValue: auditModuleFilter.value,
  });
  lastAuditModule = auditModuleFilter.value;
});
auditStatusFilter.addEventListener("change", () => {
  renderAuditLogs();
  logAuditUiEvent({
    action: "Filter",
    module: "Audit Logs",
    description: "Changed audit log status filter",
    previousValue: lastAuditStatus,
    newValue: auditStatusFilter.value,
  });
  lastAuditStatus = auditStatusFilter.value;
});
document.querySelector("#audit-refresh").addEventListener("click", async () => {
  auditOffset = 0;
  await logAuditUiEvent({
    action: "Open",
    module: "Audit Logs",
    description: "Refreshed audit logs",
    previousValue: "—",
    newValue: "Latest 500 records",
  });
  await loadAuditLogs();
});
async function changeAuditPage(nextOffset) {
  const previousOffset = auditOffset;
  auditOffset = nextOffset;
  await logAuditUiEvent({
    action: "Open",
    module: "Audit Logs",
    description: `Viewed audit log page ${auditOffset / auditPageSize + 1}`,
    previousValue: previousOffset,
    newValue: auditOffset,
  });
  await loadAuditLogs();
}
auditPrevious.addEventListener("click", async () => {
  if (auditOffset < auditPageSize) return;
  await changeAuditPage(auditOffset - auditPageSize);
});
auditNext.addEventListener("click", async () => {
  if (auditOffset + auditPageSize >= auditTotal) return;
  await changeAuditPage(auditOffset + auditPageSize);
});

document.querySelectorAll("[data-page]").forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    if (link.dataset.page === "profile") {
      setPage("profile");
      openProfile();
      return;
    }
    setPage(link.dataset.page);
  });
});

function setSidebarOpen(isOpen) {
  sidebar.classList.toggle("is-open", isOpen);
  sidebarBackdrop.hidden = !isOpen;
  sidebarToggle.setAttribute("aria-expanded", String(isOpen));
  sidebarToggle.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
}

sidebarToggle.addEventListener("click", () => {
  setSidebarOpen(!sidebar.classList.contains("is-open"));
});

sidebarBackdrop.addEventListener("click", () => setSidebarOpen(false));

function addCell(row, value, className = "") {
  const cell = document.createElement("td");
  if (className) cell.className = className;
  cell.textContent = value;
  row.append(cell);
  return cell;
}

function formatDealValue(value) {
  return `BDT ${new Intl.NumberFormat("en-BD", { maximumFractionDigits: 0 }).format(value)}`;
}

function renderDealTotals() {
  for (const status of ["Open", "Won", "Lost"]) {
    const statusDeals = deals.filter((deal) => deal.status === status);
    document.querySelector(`#${status.toLowerCase()}-total`).textContent = formatDealValue(
      statusDeals.reduce((total, deal) => total + deal.value, 0),
    );
    const count = statusDeals.length;
    document.querySelector(`#${status.toLowerCase()}-count`).textContent =
      `${count} ${count === 1 ? "deal" : "deals"}`;
  }
}

function renderDeals() {
  const visibleDeals = deals.filter(
    (deal) => dealStatusFilter.value === "All" || deal.status === dealStatusFilter.value,
  );
  dealList.replaceChildren();
  dealEmpty.hidden = visibleDeals.length > 0;
  dealEmpty.textContent = deals.length && !visibleDeals.length
    ? `No ${dealStatusFilter.value.toLowerCase()} deals found.`
    : "No deals yet. Create a deal to get started.";
  for (const deal of visibleDeals) {
    const row = document.createElement("tr");
    const title = document.createElement("td");
    const titleText = document.createElement("strong");
    titleText.className = "deal-table__title";
    titleText.textContent = deal.title;
    title.append(titleText);
    row.append(title);
    addCell(row, deal.client);
    addCell(row, formatDealValue(deal.value), "deal-table__value");
    const statusCell = addCell(row, deal.status);
    statusCell.classList.add("deal-status", `deal-status--${deal.status.toLowerCase()}`);
    addCell(
      row,
      deal.closeDate
        ? new Date(`${deal.closeDate}T00:00:00`).toLocaleDateString()
        : "—",
    );
    addCell(row, deal.assignedName || deal.assignedEmail);
    const actions = document.createElement("td");
    actions.className = "management-actions";
    const edit = document.createElement("button");
    edit.className = "row-action";
    edit.type = "button";
    edit.dataset.action = "edit-deal";
    edit.dataset.id = deal.id;
    edit.textContent = "Edit";
    const remove = document.createElement("button");
    remove.className = "row-action row-action--danger";
    remove.type = "button";
    remove.dataset.action = "delete-deal";
    remove.dataset.id = deal.id;
    remove.textContent = "Delete";
    actions.append(edit, remove);
    row.append(actions);
    dealList.append(row);
  }
  renderDealTotals();
}

function formatLeadDate(value) {
  if (!value) return "—";
  return new Date(`${value}T00:00:00`).toLocaleDateString("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

function formatLeadCreatedAt(value) {
  if (!value) return "";
  const date = new Date(value);
  return `Created ${date.toLocaleDateString("en-US")}, ${date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  })}`;
}

function getVisibleLeads() {
  const query = leadSearch.value.trim().toLocaleLowerCase();
  return leads.filter((lead) => {
    const matchesQuery =
      !query ||
      [lead.company, lead.contactName, lead.contactEmail, String(lead.recordNumber)]
        .some((value) => String(value || "").toLocaleLowerCase().includes(query));
    const matchesStatus = leadStatusFilter.value === "All" || lead.status === leadStatusFilter.value;
    const matchesTeam = leadTeamFilter.value === "All" || lead.teamId === leadTeamFilter.value;
    return matchesQuery && matchesStatus && matchesTeam;
  });
}

function renderLeads() {
  const visibleLeads = getVisibleLeads();
  leadList.replaceChildren();
  leadEmpty.hidden = visibleLeads.length > 0;
  leadEmpty.textContent = leads.length
    ? "No leads match your filters."
    : "No leads yet. Create a lead to get started.";
  for (const lead of visibleLeads) {
    const row = document.createElement("tr");
    const companyCell = document.createElement("td");
    const company = document.createElement("strong");
    company.className = "lead-table__company";
    company.textContent = lead.company;
    const followUp = document.createElement("span");
    followUp.className = "lead-table__meta";
    followUp.textContent = `Follow-up ${formatLeadDate(lead.followUp)}${lead.followUpTime ? `, ${lead.followUpTime}` : ""}`;
    const created = document.createElement("span");
    created.className = "lead-table__meta";
    created.textContent = formatLeadCreatedAt(lead.createdAt);
    companyCell.append(company, followUp, created);
    row.append(companyCell);
    addCell(row, String(lead.recordNumber), "lead-record-number");
    const contactCell = document.createElement("td");
    const contactName = document.createElement("strong");
    contactName.className = "lead-table__contact-name";
    contactName.textContent = lead.contactName;
    contactCell.append(contactName);
    if (lead.contactEmail) {
      const email = document.createElement("span");
      email.className = "lead-table__meta";
      email.textContent = lead.contactEmail;
      contactCell.append(email);
    }
    row.append(contactCell);
    const status = document.createElement("td");
    const statusBadge = document.createElement("span");
    statusBadge.className = `lead-status-badge lead-status-badge--${lead.status.toLowerCase()}`;
    statusBadge.textContent = lead.status;
    status.append(statusBadge);
    row.append(status);
    addCell(row, lead.priority, `lead-priority lead-priority--${lead.priority.toLowerCase()}`);
    addCell(row, lead.assignedName || "Unassigned");
    addCell(
      row,
      `${lead.currency} ${new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(lead.value)}`,
      "lead-table__value",
    );
    const actions = document.createElement("td");
    actions.className = "lead-actions";
    const makeButton = (action, label, content, className = "") => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = className;
      button.dataset.action = action;
      button.dataset.id = lead.id;
      button.setAttribute("aria-label", `${label} ${lead.company}`);
      button.title = `${label} ${lead.company}`;
      if (content.startsWith("<svg")) button.innerHTML = content;
      else button.textContent = content;
      return button;
    };
    actions.append(
      makeButton("lead-history", "History for", "History", "lead-row-button"),
      ...(lead.convertedClientId ? [] : [makeButton("edit-lead", "Edit", "Edit", "lead-row-button")]),
      makeButton(
        lead.convertedClientId ? "open-converted-client" : "convert-lead",
        lead.convertedClientId ? "View converted client for" : "Convert to client",
        '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M3 6h12m0 0-3-3m3 3-3 3M17 14H5m0 0 3 3m-3-3 3-3"></path></svg>',
        "lead-icon-button",
      ),
      makeButton(
        "delete-lead",
        "Delete",
        '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4.5 6h11m-9.5 0 .6 10h6.8l.6-10M8 6V4h4v2m-3 3v4m2-4v4"></path></svg>',
        "lead-icon-button lead-icon-button--danger",
      ),
    );
    row.append(actions);
    leadList.append(row);
  }
}

async function loadLeads() {
  leadsMessage.textContent = "";
  try {
    const response = await fetch("/api/leads", { credentials: "same-origin" });
    const result = await response.json();
    if (!response.ok) {
      leadsMessage.textContent = result.error || "Could not load leads.";
      return;
    }
    leads = result.leads;
    leadTeams = result.teams;
    leadAssignees = result.assignees;
    const selectedTeam = leadTeamFilter.value;
    leadTeamFilter.replaceChildren(new Option("All teams", "All"));
    for (const team of leadTeams) leadTeamFilter.add(new Option(team.name, team.id));
    if ([...leadTeamFilter.options].some((option) => option.value === selectedTeam)) {
      leadTeamFilter.value = selectedTeam;
    }
    renderLeads();
  } catch {
    leadsMessage.textContent = "Could not connect to the server. Please try again.";
  }
}

function renderNotifications(notifications, unreadCount) {
  dashboardNotificationData = notifications;
  notificationCount.textContent = unreadCount > 99 ? "99+" : String(unreadCount);
  notificationCount.hidden = unreadCount === 0;
  notificationButton.setAttribute(
    "aria-label",
    unreadCount ? `Notifications, ${unreadCount} unread` : "Notifications",
  );
  notificationSummary.textContent = unreadCount
    ? `${unreadCount} unread notification${unreadCount === 1 ? "" : "s"}`
    : "You're all caught up";
  notificationList.replaceChildren();
  if (!notifications.length) {
    const empty = document.createElement("li");
    empty.className = "notification-empty";
    empty.textContent = "No lead notifications yet.";
    notificationList.append(empty);
    return;
  }
  for (const notification of notifications) {
    const item = document.createElement("li");
    const button = document.createElement("button");
    button.type = "button";
    button.className = `notification-item${notification.readAt ? "" : " is-unread"}`;
    button.dataset.notificationId = notification.id;
    const icon = document.createElement("span");
    icon.className = "notification-item__icon";
    icon.setAttribute("aria-hidden", "true");
    icon.textContent = notification.readAt ? "↗" : "•";
    const content = document.createElement("span");
    content.className = "notification-item__content";
    const message = document.createElement("strong");
    message.textContent = notification.message;
    const meta = document.createElement("small");
    meta.textContent = `${new Date(notification.createdAt).toLocaleString()} · View lead`;
    content.append(message, meta);
    button.append(icon, content);
    item.append(button);
    notificationList.append(item);
  }
}

function renderDashboardOverview(overview) {
  document.querySelector("#dashboard-lead-count").textContent = String(overview.leadCount);
  document.querySelector("#dashboard-lead-note").textContent =
    `${overview.newLeadCount} new this month`;
  document.querySelector("#dashboard-client-count").textContent = String(overview.clientCount);
  document.querySelector("#dashboard-open-value").textContent = formatDealValue(overview.openDealValue);
  document.querySelector("#dashboard-open-count").textContent =
    `${overview.openDealCount} ${overview.openDealCount === 1 ? "deal" : "deals"}`;
  document.querySelector("#dashboard-won-value").textContent =
    formatDealValue(overview.wonThisMonthValue);
  document.querySelector("#dashboard-won-count").textContent =
    `${overview.wonThisMonthCount} ${overview.wonThisMonthCount === 1 ? "deal" : "deals"} closed`;

  const renderRecent = (items, listId, emptyId, createCard) => {
    const list = document.querySelector(`#${listId}`);
    const empty = document.querySelector(`#${emptyId}`);
    list.replaceChildren();
    empty.hidden = items.length > 0;
    for (const item of items) list.append(createCard(item));
  };
  renderRecent(overview.leads, "dashboard-recent-leads", "dashboard-recent-leads-empty", (lead) => {
    const card = document.createElement("article");
    card.className = "dashboard-recent-item";
    const details = document.createElement("div");
    details.className = "dashboard-recent-item__details";
    const company = document.createElement("strong");
    company.textContent = lead.company;
    const created = document.createElement("small");
    created.textContent = new Date(lead.createdAt).toLocaleString();
    const summary = document.createElement("small");
    summary.textContent = `Lead #${lead.recordNumber}${lead.notes ? ` · ${lead.notes}` : ""}`;
    details.append(company, created, summary);
    const status = document.createElement("span");
    status.className = "dashboard-recent-status";
    status.textContent = lead.status;
    card.append(details, status);
    return card;
  });
  renderRecent(overview.deals, "dashboard-recent-deals", "dashboard-recent-deals-empty", (deal) => {
    const card = document.createElement("article");
    card.className = "dashboard-recent-item";
    const details = document.createElement("div");
    details.className = "dashboard-recent-item__details";
    const title = document.createElement("strong");
    title.textContent = deal.title;
    const value = document.createElement("small");
    value.textContent = `${deal.client} · ${formatDealValue(deal.value)}`;
    details.append(title, value);
    const status = document.createElement("span");
    status.className = "dashboard-recent-status";
    status.textContent = deal.status;
    card.append(details, status);
    return card;
  });
  renderRecent(overview.clients, "dashboard-recent-clients", "dashboard-recent-clients-empty", (client) => {
    const card = document.createElement("article");
    card.className = "dashboard-recent-item";
    const details = document.createElement("div");
    details.className = "dashboard-recent-item__details";
    const company = document.createElement("strong");
    company.textContent = client.company;
    const created = document.createElement("small");
    created.textContent = new Date(client.createdAt).toLocaleDateString();
    details.append(company, created);
    const status = document.createElement("span");
    status.className = "dashboard-recent-status";
    status.textContent = client.status;
    card.append(details, status);
    return card;
  });
}

function renderHandoffFlows(flows, isAdmin) {
  handoffFlowList.replaceChildren();
  handoffFlowCount.textContent = String(flows.length);
  handoffFlowEmpty.hidden = flows.length > 0;
  handoffDescription.textContent = isAdmin
    ? "Overview of lead ownership and handoffs across your team."
    : "Follow the leads you created as they move through the team.";
  for (const lead of flows) {
    const card = document.createElement("article");
    card.className = "handoff-flow-card";
    const heading = document.createElement("header");
    heading.className = "handoff-flow-card__heading";
    const identity = document.createElement("div");
    const company = document.createElement("strong");
    company.textContent = lead.company;
    const subtitle = document.createElement("span");
    subtitle.textContent = `Created by ${lead.createdByName} · ${lead.status}`;
    identity.append(company, subtitle);
    const current = document.createElement("span");
    current.className = "handoff-current";
    current.textContent = lead.assignedName
      ? `Now with · ${lead.assignedName}`
      : "Unassigned";
    heading.append(identity, current);
    const timeline = document.createElement("ol");
    timeline.className = "handoff-timeline";
    for (const [index, assignment] of (lead.assignmentHistory || []).entries()) {
      const step = document.createElement("li");
      const isCurrent = index === lead.assignmentHistory.length - 1 &&
        assignment.toEmail === lead.assignedEmail;
      step.className = `handoff-transfer${isCurrent ? " is-current" : ""}`;
      step.style.setProperty("--step-index", index + 1);
      const from = document.createElement("div");
      from.className = "handoff-transfer__person handoff-transfer__person--from";
      const fromLight = document.createElement("span");
      fromLight.className = "handoff-transfer__light";
      fromLight.setAttribute("aria-hidden", "true");
      const fromCopy = document.createElement("span");
      const fromLabel = document.createElement("small");
      fromLabel.textContent = "FROM";
      const fromName = document.createElement("strong");
      fromName.textContent = assignment.fromName || assignment.actorName || lead.createdByName;
      fromCopy.append(fromLabel, fromName);
      from.append(fromLight, fromCopy);

      const route = document.createElement("span");
      route.className = "handoff-transfer__route";
      route.setAttribute("aria-hidden", "true");
      const routeBeam = document.createElement("span");
      routeBeam.className = "handoff-transfer__beam";
      route.append(routeBeam);

      const to = document.createElement("div");
      to.className = "handoff-transfer__person handoff-transfer__person--to";
      const toLight = document.createElement("span");
      toLight.className = "handoff-transfer__light";
      toLight.setAttribute("aria-hidden", "true");
      const toCopy = document.createElement("span");
      const toLabel = document.createElement("small");
      toLabel.textContent = "TO";
      const toName = document.createElement("strong");
      toName.textContent = assignment.toName || "Team member";
      toCopy.append(toLabel, toName);
      to.append(toLight, toCopy);

      const meta = document.createElement("time");
      meta.className = "handoff-transfer__time";
      meta.dateTime = assignment.at;
      meta.textContent = new Date(assignment.at).toLocaleString();
      step.append(from, route, to, meta);
      timeline.append(step);
    }
    if (!timeline.childElementCount) {
      const empty = document.createElement("p");
      empty.className = "handoff-transfer-empty";
      empty.textContent = lead.assignedName
        ? `Created by ${lead.createdByName}. No handoffs recorded yet.`
        : "No assignment history yet.";
      timeline.append(empty);
    }
    card.append(heading, timeline);
    handoffFlowList.append(card);
  }
}

function renderAssignedLeads(assignedLeads) {
  assignedLeadList.replaceChildren();
  assignedLeadCount.textContent = String(assignedLeads.length);
  assignedLeadEmpty.hidden = assignedLeads.length > 0;
  for (const lead of assignedLeads) {
    const card = document.createElement("article");
    card.className = "assigned-lead-card";
    const details = document.createElement("div");
    const company = document.createElement("strong");
    company.textContent = lead.company;
    const followUp = document.createElement("span");
    followUp.textContent = lead.followUp
      ? `Follow-up ${formatLeadDate(lead.followUp)}${lead.followUpTime ? ` · ${lead.followUpTime}` : ""}`
      : "No follow-up scheduled";
    details.append(company, followUp);
    const status = document.createElement("span");
    status.className = `lead-status-badge lead-status-badge--${lead.status.toLowerCase()}`;
    status.textContent = lead.status;
    card.append(details, status);
    assignedLeadList.append(card);
  }
}

async function loadLeadDashboard() {
  handoffMessage.textContent = "";
  try {
    const response = await fetch("/api/lead-dashboard", { credentials: "same-origin" });
    const result = await response.json();
    if (!response.ok) {
      handoffMessage.textContent = result.error || "Could not load lead activity.";
      return;
    }
    dashboardOverviewMessage.textContent = "";
    renderDashboardOverview(result.overview);
    renderHandoffFlows(result.flows, hasAdminAccess(signedInRole));
    renderAssignedLeads(result.assignedLeads);
    renderNotifications(result.notifications, result.unreadCount);
  } catch {
    handoffMessage.textContent = "Could not connect to the server. Please try again.";
  }
}

notificationButton.addEventListener("click", async () => {
  const isOpen = notificationPanel.hidden;
  notificationPanel.hidden = !isOpen;
  notificationButton.setAttribute("aria-expanded", String(isOpen));
  if (!isOpen) return;
  try {
    const response = await fetch("/api/notifications", { credentials: "same-origin" });
    const result = await response.json();
    if (response.ok) renderNotifications(result.notifications, result.unreadCount);
  } catch {
    handoffMessage.textContent = "Could not load notifications. Please try again.";
  }
});

notificationList.addEventListener("click", async (event) => {
  const button = event.target.closest("[data-notification-id]");
  if (!button) return;
  const id = button.dataset.notificationId;
  try {
    const response = await fetch(`/api/notifications/${encodeURIComponent(id)}/read`, {
      method: "POST",
      credentials: "same-origin",
    });
    if (!response.ok) {
      const result = await response.json();
      handoffMessage.textContent = result.error || "Could not update notification.";
      return;
    }
    const notification = dashboardNotificationData.find((item) => item.id === id);
    if (notification) notification.readAt = new Date().toISOString();
    renderNotifications(
      dashboardNotificationData,
      dashboardNotificationData.filter((item) => !item.readAt).length,
    );
    notificationPanel.hidden = true;
    notificationButton.setAttribute("aria-expanded", "false");
    leadSearch.value = notification?.company || "";
    setPage("leads");
  } catch {
    handoffMessage.textContent = "Could not connect to the server. Please try again.";
  }
});

document.addEventListener("click", (event) => {
  if (!event.target.closest(".notification-menu") && !notificationPanel.hidden) {
    notificationPanel.hidden = true;
    notificationButton.setAttribute("aria-expanded", "false");
  }
});

function fillLeadFormOptions(lead = null) {
  leadTeamSelect.replaceChildren(new Option("No team", ""));
  for (const team of leadTeams) leadTeamSelect.add(new Option(team.name, team.id));
  leadForm.elements.teamId.value = lead?.teamId || "";
  fillLeadTeamMembers(lead?.teamId || "", lead?.assignedEmail || "");
}

function fillLeadTeamMembers(teamId, selectedEmail = "") {
  const team = leadTeams.find((item) => item.id === teamId);
  leadAssignedSelect.replaceChildren();
  if (!team) {
    leadAssignedSelect.add(new Option("No team", ""));
    leadAssignedSelect.disabled = true;
    return;
  }
  leadAssignedSelect.disabled = false;
  leadAssignedSelect.add(new Option("Select a team member", ""));
  for (const assignee of leadAssignees) {
    leadAssignedSelect.add(new Option(assignee.name, assignee.email));
  }
  leadAssignedSelect.value = selectedEmail;
}

function openLeadDialog(lead = null) {
  editingLeadId = lead?.id || "";
  leadForm.reset();
  for (const field of ["company", "contactName", "contactEmail", "phone", "followUp", "followUpTime", "sourceDetails", "notes"]) {
    leadForm.elements.namedItem(field).value = lead?.[field] || "";
  }
  const statusOptions = leadForm.elements.status;
  statusOptions.querySelectorAll('[data-legacy-status="true"]').forEach((option) => option.remove());
  if (lead?.status && ![...statusOptions.options].some((option) => option.value === lead.status)) {
    const legacyStatus = new Option(lead.status, lead.status);
    legacyStatus.dataset.legacyStatus = "true";
    statusOptions.add(legacyStatus);
  }
  leadForm.elements.namedItem("status").value = lead?.status || "New";
  leadForm.elements.namedItem("priority").value = lead?.priority || "Medium";
  leadForm.elements.namedItem("source").value = lead?.source || "website";
  leadForm.elements.namedItem("source").value = lead?.source || "website";
  leadForm.elements.namedItem("value").value = lead?.value ?? "";
  leadForm.elements.namedItem("currency").value = lead?.currency || "USD";
  fillLeadFormOptions(lead);
  document.querySelector("#lead-dialog-title").textContent = lead ? "Edit lead" : "New lead";
  leadSave.textContent = lead ? "Save changes" : "Create lead";
  leadMessage.textContent = "";
  leadDialog.showModal();
  leadForm.elements.company.focus();
}

function exportLeadsCsv() {
  const rows = [
    ["Company", "Record no.", "Contact", "Email", "Phone", "Follow-up", "Follow-up time", "Source", "Source details", "Status", "Priority", "Team", "Assigned", "Value", "Currency"],
    ...getVisibleLeads().map((lead) => [
      lead.company,
      lead.recordNumber,
      lead.contactName,
      lead.contactEmail,
      lead.phone,
      lead.followUp,
      lead.followUpTime,
      lead.source,
      lead.sourceDetails,
      lead.status,
      lead.priority,
      lead.teamName,
      lead.assignedName,
      lead.value,
      lead.currency,
    ]),
  ];
  const csv = `\uFEFF${rows.map((row) =>
    row.map((value) => `"${String(value ?? "").replaceAll('"', '""')}"`).join(","),
  ).join("\r\n")}`;
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = "ritorica-leads.csv";
  link.click();
  URL.revokeObjectURL(url);
}

function showLeadHistory(lead) {
  document.querySelector("#lead-history-title").textContent = `History · ${lead.company}`;
  leadHistoryList.replaceChildren();
  if (!lead.history?.length) {
    const empty = document.createElement("li");
    empty.className = "lead-history-empty";
    empty.textContent = "No activity recorded yet.";
    leadHistoryList.append(empty);
  } else {
    for (const entry of [...lead.history].reverse()) {
      const item = document.createElement("li");
      const message = document.createElement("strong");
      message.textContent = entry.message;
      const meta = document.createElement("span");
      meta.textContent = `${entry.actor} · ${new Date(entry.at).toLocaleString()}`;
      item.append(message, meta);
      leadHistoryList.append(item);
    }
  }
  leadHistoryDialog.showModal();
}

async function convertLeadToClient(lead) {
  if (lead.convertedClientId) return;
  if (!(await confirmAction({
    title: "Convert lead to client?",
    message: `Create a client record for ${lead.company}?`,
    confirmLabel: "Convert lead",
    tone: "primary",
  }))) return;
  leadsMessage.textContent = "";
  try {
    const response = await fetch(`/api/leads/${encodeURIComponent(lead.id)}/convert`, {
      method: "POST",
      credentials: "same-origin",
    });
    const result = await response.json();
    if (!response.ok) {
      leadsMessage.textContent = result.error || "Could not convert lead to client.";
      return;
    }
    await loadLeads();
  } catch {
    leadsMessage.textContent = "Could not connect to the server. Please try again.";
  }
}

leadList.addEventListener("click", async (event) => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;
  const lead = leads.find((item) => item.id === button.dataset.id);
  if (!lead) return;
  if (button.dataset.action === "edit-lead") {
    openLeadDialog(lead);
  } else if (button.dataset.action === "lead-history") {
    logAuditUiEvent({
      action: "Open",
      module: "Leads",
      description: `Viewed lead history for ${lead.company}`,
      previousValue: "Lead list",
      newValue: lead.id,
    });
    showLeadHistory(lead);
  } else if (button.dataset.action === "convert-lead") {
    await convertLeadToClient(lead);
  } else if (button.dataset.action === "delete-lead") {
    if (await confirmAction({
      title: "Delete this lead?",
      message: `“${lead.company}” will be deleted. You can restore it within 24 hours with Ctrl+Z.`,
      confirmLabel: "Delete lead",
    })) {
      await deleteLead(lead);
    }
  } else if (button.dataset.action === "open-converted-client") {
    setPage("clients");
  }
});

async function deleteLead(lead) {
  leadsMessage.textContent = "";
  try {
    const response = await fetch(`/api/leads/${encodeURIComponent(lead.id)}`, {
      method: "DELETE",
      credentials: "same-origin",
    });
    const result = await response.json();
    if (!response.ok) {
      leadsMessage.textContent = result.error || `Could not delete ${lead.company}.`;
      return;
    }
    if (result.undo) rememberUndoEntry(result.undo);
    await loadLeads();
  } catch {
    leadsMessage.textContent = "Could not connect to the server. Please try again.";
  }
}

let leadSearchTimer = 0;
let lastLeadSearch = "";
let lastLeadStatus = leadStatusFilter.value;
let lastLeadTeam = leadTeamFilter.value;
leadSearch.addEventListener("input", () => {
  renderLeads();
  window.clearTimeout(leadSearchTimer);
  leadSearchTimer = window.setTimeout(() => {
    const value = leadSearch.value.trim();
    if (value === lastLeadSearch) return;
    logAuditUiEvent({
      action: "Search",
      module: "Leads",
      description: "Searched leads",
      previousValue: lastLeadSearch ? `${lastLeadSearch.length} characters` : "—",
      newValue: value ? `${value.length} characters` : "—",
    });
    lastLeadSearch = value;
  }, 500);
});
leadStatusFilter.addEventListener("change", () => {
  renderLeads();
  logAuditUiEvent({
    action: "Filter",
    module: "Leads",
    description: "Changed lead status filter",
    previousValue: lastLeadStatus,
    newValue: leadStatusFilter.value,
  });
  lastLeadStatus = leadStatusFilter.value;
});
leadTeamFilter.addEventListener("change", () => {
  renderLeads();
  logAuditUiEvent({
    action: "Filter",
    module: "Leads",
    description: "Changed lead team filter",
    previousValue: lastLeadTeam,
    newValue: leadTeamFilter.value,
  });
  lastLeadTeam = leadTeamFilter.value;
});
leadTeamSelect.addEventListener("change", () => fillLeadTeamMembers(leadTeamSelect.value));
document.querySelector("#lead-export").addEventListener("click", async () => {
  await logAuditUiEvent({
    action: "Export",
    module: "Leads",
    description: "Exported leads to CSV",
    previousValue: "—",
    newValue: `${leads.length} records`,
  });
  exportLeadsCsv();
});
document.querySelector("#new-lead").addEventListener("click", () => openLeadDialog());
document.querySelector("#lead-close").addEventListener("click", () => leadDialog.close());
leadDialog.addEventListener("click", (event) => {
  if (event.target === leadDialog) leadDialog.close();
});
document.querySelector("#lead-history-close").addEventListener("click", () => leadHistoryDialog.close());
leadHistoryDialog.addEventListener("click", (event) => {
  if (event.target === leadHistoryDialog) leadHistoryDialog.close();
});

leadForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  leadSave.disabled = true;
  leadMessage.textContent = "";
  try {
    const body = Object.fromEntries(
      ["company", "contactName", "contactEmail", "phone", "followUp", "followUpTime", "source", "sourceDetails", "status", "priority", "teamId", "assignedEmail", "currency", "notes"]
        .map((field) => [field, leadForm.elements[field].value]),
    );
    body.value = Number(leadForm.elements.value.value);
    const response = await fetch(
      editingLeadId ? `/api/leads/${encodeURIComponent(editingLeadId)}` : "/api/leads",
      {
        method: editingLeadId ? "PUT" : "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      },
    );
    const result = await response.json();
    if (!response.ok) {
      leadMessage.textContent = result.error || "Could not save lead.";
      return;
    }
    leadDialog.close();
    editingLeadId = "";
    await loadLeads();
    if (result.emailWarning) leadsMessage.textContent = result.emailWarning;
    await loadLeadDashboard();
  } catch {
    leadMessage.textContent = "Could not connect to the server. Please try again.";
  } finally {
    leadSave.disabled = false;
  }
});

function renderClients() {
  clientsCount.textContent = `${clients.length} ${clients.length === 1 ? "client" : "clients"}`;
  clientList.replaceChildren();
  clientEmpty.hidden = clients.length > 0;
  for (const client of clients) {
    const row = document.createElement("tr");
    const companyCell = document.createElement("td");
    const company = document.createElement("strong");
    company.className = "client-table__company";
    company.textContent = client.company;
    companyCell.append(company);
    if (client.country) {
      const country = document.createElement("span");
      country.className = "client-table__country";
      country.textContent = client.country;
      companyCell.append(country);
    }
    row.append(companyCell);
    addCell(row, client.industry || "—");
    addCell(row, client.type ? `${client.type[0].toUpperCase()}${client.type.slice(1)}` : "—");
    const status = document.createElement("td");
    const badge = document.createElement("span");
    badge.className = `client-status-badge client-status-badge--${client.status}`;
    badge.textContent = client.status === "active" ? "Active" : "Inactive";
    status.append(badge);
    row.append(status);
    addCell(row, client.managerName || "Unassigned");
    const actions = document.createElement("td");
    actions.className = "client-actions";
    const edit = document.createElement("button");
    edit.className = "client-edit-button";
    edit.type = "button";
    edit.dataset.action = "edit-client";
    edit.dataset.id = client.id;
    edit.textContent = "Edit";
    edit.setAttribute("aria-label", `Edit ${client.company}`);
    const remove = document.createElement("button");
    remove.className = "client-delete-button";
    remove.type = "button";
    remove.dataset.action = "delete-client";
    remove.dataset.id = client.id;
    remove.setAttribute("aria-label", `Delete ${client.company}`);
    remove.innerHTML =
      '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4.5 6h11m-9.5 0 .6 10h6.8l.6-10M8 6V4h4v2m-3 3v4m2-4v4"></path></svg>';
    actions.append(edit, remove);
    row.append(actions);
    clientList.append(row);
  }
}

async function loadDeals() {
  dealsMessage.textContent = "";
  try {
    const response = await fetch("/api/deals", { credentials: "same-origin" });
    const result = await response.json();
    if (!response.ok) {
      dealsMessage.textContent = result.error || "Could not load deals.";
      return;
    }
    deals = result.deals;
    dealAssignees = result.assignees;
    renderDeals();
  } catch {
    dealsMessage.textContent = "Could not connect to the server. Please try again.";
  }
}

async function loadClients() {
  clientsMessage.textContent = "";
  try {
    const response = await fetch("/api/clients", { credentials: "same-origin" });
    const result = await response.json();
    if (!response.ok) {
      clientsMessage.textContent = result.error || "Could not load clients.";
      return;
    }
    clients = result.clients;
    clientAssignees = result.assignees;
    renderClients();
  } catch {
    clientsMessage.textContent = "Could not connect to the server. Please try again.";
  }
}

function fillDealAssignees(selectedEmail = "") {
  dealAssignee.replaceChildren();
  const options = [];
  for (const assignee of dealAssignees) {
    const option = document.createElement("option");
    option.value = assignee.email;
    option.textContent = assignee.name;
    dealAssignee.append(option);
    options.push(option);
  }
  const assignedOptions = dealDropdowns.find((dropdown) => dropdown.select === dealAssignee).options;
  assignedOptions.replaceChildren();
  for (const assignee of dealAssignees) {
    const option = document.createElement("button");
    option.type = "button";
    option.setAttribute("role", "option");
    option.dataset.value = assignee.email;
    option.textContent = assignee.name;
    assignedOptions.append(option);
  }
  updateDealDropdown(
    dealDropdowns.find((dropdown) => dropdown.select === dealAssignee),
    selectedEmail || options[0]?.value || "",
  );
}

function updateDealDropdown(dropdown, value) {
  const selectedOption = [...dropdown.select.options].find((option) => option.value === value);
  dropdown.select.value = selectedOption?.value || "";
  dropdown.value.textContent = selectedOption?.textContent || dropdown.placeholder || "Choose an option";
  dropdown.options.querySelectorAll('[role="option"]').forEach((option) => {
    option.setAttribute("aria-selected", String(option.dataset.value === dropdown.select.value));
  });
}

function setDealDropdownOpen(dropdown, isOpen, focusSelected = false) {
  dropdown.options.hidden = !isOpen;
  dropdown.trigger.setAttribute("aria-expanded", String(isOpen));
  if (isOpen && focusSelected) {
    dropdown.options.querySelector('[aria-selected="true"]')?.focus();
  }
}

for (const dropdown of dealDropdowns) {
  dropdown.trigger.addEventListener("click", () => {
    setDealDropdownOpen(dropdown, dropdown.options.hidden, true);
  });

  dropdown.trigger.addEventListener("keydown", (event) => {
    if (["ArrowDown", "ArrowUp", "Enter", " "].includes(event.key)) {
      event.preventDefault();
      setDealDropdownOpen(dropdown, true, true);
    }
  });

  dropdown.options.addEventListener("click", (event) => {
    const option = event.target.closest('[role="option"]');
    if (!option) return;
    updateDealDropdown(dropdown, option.dataset.value);
    setDealDropdownOpen(dropdown, false);
    dropdown.trigger.focus();
  });

  dropdown.options.addEventListener("keydown", (event) => {
    const options = [...dropdown.options.querySelectorAll('[role="option"]')];
    const currentIndex = options.indexOf(document.activeElement);
    let nextIndex = currentIndex;
    if (event.key === "ArrowDown") nextIndex = (currentIndex + 1) % options.length;
    else if (event.key === "ArrowUp") nextIndex = (currentIndex - 1 + options.length) % options.length;
    else if (event.key === "Home") nextIndex = 0;
    else if (event.key === "End") nextIndex = options.length - 1;
    else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      updateDealDropdown(dropdown, options[currentIndex].dataset.value);
      setDealDropdownOpen(dropdown, false);
      dropdown.trigger.focus();
      return;
    } else if (event.key === "Escape") {
      event.preventDefault();
      setDealDropdownOpen(dropdown, false);
      dropdown.trigger.focus();
      return;
    } else if (event.key === "Tab") {
      setDealDropdownOpen(dropdown, false);
      return;
    } else {
      return;
    }
    event.preventDefault();
    options[nextIndex].focus();
  });
}

document.addEventListener("click", (event) => {
  for (const dropdown of dealDropdowns) {
    if (!dropdown.container.contains(event.target)) {
      setDealDropdownOpen(dropdown, false);
    }
  }
});

function openDealDialog(deal = null) {
  editingDealId = deal?.id || "";
  dealForm.reset();
  dealForm.elements.namedItem("title").value = deal?.title || "";
  dealForm.elements.namedItem("client").value = deal?.client || "";
  dealForm.elements.namedItem("value").value = deal?.value ?? 0;
  updateDealDropdown(dealDropdowns[0], deal?.status || "Open");
  updateDealDropdown(dealDropdowns[1], deal?.priority || "Medium");
  dealForm.elements.namedItem("priority").value = deal?.priority || "Medium";
  dealForm.elements.namedItem("closeDate").value = deal?.closeDate || "";
  document.querySelector("#deal-dialog-title").textContent = deal ? "Edit deal" : "New deal";
  dealSave.textContent = deal ? "Save changes" : "Create deal";
  dealMessage.textContent = "";
  fillDealAssignees(deal?.assignedEmail || dealAssignees[0]?.email || "");
  dealDialog.showModal();
}

function fillClientManagers(selectedEmail = "") {
  clientManagerSelect.replaceChildren();
  const unassigned = document.createElement("option");
  unassigned.value = "";
  unassigned.textContent = "Unassigned";
  clientManagerSelect.append(unassigned);
  for (const assignee of clientAssignees) {
    const option = document.createElement("option");
    option.value = assignee.email;
    option.textContent = assignee.name;
    clientManagerSelect.append(option);
  }
  const managerDropdown = dealDropdowns.find((dropdown) => dropdown.select === clientManagerSelect);
  managerDropdown.options.replaceChildren();
  const entries = [
    { email: "", name: "Unassigned" },
    ...clientAssignees,
  ];
  for (const entry of entries) {
    const option = document.createElement("button");
    option.type = "button";
    option.setAttribute("role", "option");
    option.dataset.value = entry.email;
    option.textContent = entry.name;
    managerDropdown.options.append(option);
  }
  updateDealDropdown(managerDropdown, selectedEmail);
}

function openClientDialog(client = null) {
  editingClientId = client?.id || "";
  clientForm.reset();
  for (const field of ["company", "email", "phone", "website", "country", "industry", "address", "notes"]) {
    clientForm.elements.namedItem(field).value = client?.[field] || "";
  }
  clientForm.elements.namedItem("type").value = client?.type || "prospect";
  clientForm.elements.namedItem("tags").value = client?.tags?.join(", ") || "";
  updateDealDropdown(dealDropdowns[3], client?.status || "active");
  fillClientManagers(client?.managerEmail || "");
  document.querySelector("#client-dialog-title").textContent = client ? "Edit client" : "New client";
  clientSave.textContent = client ? "Save changes" : "Create client";
  clientMessage.textContent = "";
  clientDialog.showModal();
  clientForm.elements.namedItem("company").focus();
}

clientList.addEventListener("click", async (event) => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;
  const client = clients.find((item) => item.id === button.dataset.id);
  if (!client) return;
  if (button.dataset.action === "edit-client") {
    openClientDialog(client);
    return;
  }
  if (button.dataset.action === "delete-client" && await confirmAction({
    title: "Delete this client?",
    message: `“${client.company}” will be deleted. You can restore it within 24 hours with Ctrl+Z.`,
    confirmLabel: "Delete client",
  })) {
    await deleteClient(client);
  }
});

async function deleteClient(client) {
  clientsMessage.textContent = "";
  try {
    const response = await fetch(`/api/clients/${encodeURIComponent(client.id)}`, {
      method: "DELETE",
      credentials: "same-origin",
    });
    const result = await response.json();
    if (!response.ok) {
      clientsMessage.textContent = result.error || `Could not delete ${client.company}.`;
      return;
    }
    if (result.undo) rememberUndoEntry(result.undo);
    await loadClients();
  } catch {
    clientsMessage.textContent = "Could not connect to the server. Please try again.";
  }
}

document.querySelector("#new-client").addEventListener("click", () => openClientDialog());
document.querySelector("#client-close").addEventListener("click", () => clientDialog.close());
clientDialog.addEventListener("click", (event) => {
  if (event.target === clientDialog) clientDialog.close();
});

clientForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  clientSave.disabled = true;
  clientMessage.textContent = "";
  try {
    const clientFields = ["company", "email", "phone", "website", "country", "industry", "address", "notes"];
    const body = Object.fromEntries(
      clientFields.map((field) => [field, clientForm.elements.namedItem(field).value]),
    );
    body.type = clientForm.elements.namedItem("type").value;
    body.status = clientForm.elements.namedItem("status").value;
    body.managerEmail = clientForm.elements.namedItem("managerEmail").value;
    body.tags = clientForm.elements.namedItem("tags").value
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
    const response = await fetch(
      editingClientId ? `/api/clients/${encodeURIComponent(editingClientId)}` : "/api/clients",
      {
        method: editingClientId ? "PUT" : "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      },
    );
    const result = await response.json();
    if (!response.ok) {
      clientMessage.textContent = result.error || "Could not save client.";
      return;
    }
    clientDialog.close();
    editingClientId = "";
    await loadClients();
  } catch {
    clientMessage.textContent = "Could not connect to the server. Please try again.";
  } finally {
    clientSave.disabled = false;
  }
});

dealList.addEventListener("click", async (event) => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;
  const deal = deals.find((item) => item.id === button.dataset.id);
  if (!deal) return;
  if (button.dataset.action === "edit-deal") {
    openDealDialog(deal);
    return;
  }
  if (button.dataset.action === "delete-deal" && await confirmAction({
    title: "Delete this deal?",
    message: `“${deal.title}” will be deleted. You can restore it within 24 hours with Ctrl+Z.`,
    confirmLabel: "Delete deal",
  })) {
    await deleteDeal(deal);
  }
});

async function deleteDeal(deal) {
  dealsMessage.textContent = "";
  try {
    const response = await fetch(`/api/deals/${encodeURIComponent(deal.id)}`, {
      method: "DELETE",
      credentials: "same-origin",
    });
    const result = await response.json();
    if (!response.ok) {
      dealsMessage.textContent = result.error || `Could not delete ${deal.title}.`;
      return;
    }
    if (result.undo) rememberUndoEntry(result.undo);
    await loadDeals();
  } catch {
    dealsMessage.textContent = "Could not connect to the server. Please try again.";
  }
}

document.querySelector("#new-deal").addEventListener("click", () => openDealDialog());
document.querySelector("#deal-close").addEventListener("click", () => dealDialog.close());
dealDialog.addEventListener("click", (event) => {
  if (event.target === dealDialog) dealDialog.close();
});
let lastDealStatus = dealStatusFilter.value;
dealStatusFilter.addEventListener("change", () => {
  renderDeals();
  logAuditUiEvent({
    action: "Filter",
    module: "Sales",
    description: "Changed deal status filter",
    previousValue: lastDealStatus,
    newValue: dealStatusFilter.value,
  });
  lastDealStatus = dealStatusFilter.value;
});

dealForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  dealSave.disabled = true;
  dealMessage.textContent = "";
  try {
    const response = await fetch(
      editingDealId ? `/api/deals/${encodeURIComponent(editingDealId)}` : "/api/deals",
      {
        method: editingDealId ? "PUT" : "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: dealForm.elements.namedItem("title").value,
          client: dealForm.elements.namedItem("client").value,
          value: Number(dealForm.elements.namedItem("value").value),
          status: dealForm.elements.namedItem("status").value,
          priority: dealForm.elements.namedItem("priority").value,
          closeDate: dealForm.elements.namedItem("closeDate").value,
          assignedEmail: dealForm.elements.namedItem("assignedEmail").value,
        }),
      },
    );
    const result = await response.json();
    if (!response.ok) {
      dealMessage.textContent = result.error || "Could not save deal.";
      return;
    }
    dealDialog.close();
    editingDealId = "";
    await loadDeals();
  } catch {
    dealMessage.textContent = "Could not connect to the server. Please try again.";
  } finally {
    dealSave.disabled = false;
  }
});

function renderTeamOptions(selectedIds = []) {
  employeeTeamOptions.replaceChildren();
  for (const team of teams) {
    const label = document.createElement("label");
    label.className = "team-checkbox";
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.name = "teamIds";
    checkbox.value = team.id;
    checkbox.checked = selectedIds.includes(team.id);
    const name = document.createElement("span");
    name.textContent = team.name;
    label.append(checkbox, name);
    employeeTeamOptions.append(label);
  }
}

function renderEmployeeList(employees) {
  employeeList.replaceChildren();
  employeeEmpty.hidden = employees.length > 0;
  const isSuperAdmin = hasAdminAccess(signedInRole);

  const table = employeeList.closest("table");
  if (table) {
    const thTeams = table.querySelector("th:nth-child(3)");
    const thRole = table.querySelector("th:nth-child(4)");
    const thActions = table.querySelector("th:nth-child(5)");
    if (thTeams) thTeams.hidden = !isSuperAdmin;
    if (thRole) thRole.hidden = !isSuperAdmin;
    if (thActions) thActions.hidden = !isSuperAdmin;
  }

  const newEmployeeBtn = document.querySelector("#new-employee");
  if (newEmployeeBtn) newEmployeeBtn.hidden = !isSuperAdmin;

  const teamsPanel = document.querySelector(".teams-panel");
  if (teamsPanel) teamsPanel.hidden = !isSuperAdmin;

  for (const employee of employees) {
    const row = document.createElement("tr");
    const identity = document.createElement("td");
    const name = document.createElement("strong");
    name.className = "employee-table__name";
    name.textContent = employee.name;
    identity.append(name);

    if (isSuperAdmin && employee.email) {
      const email = document.createElement("span");
      email.className = "employee-table__email";
      email.textContent = employee.email;
      identity.append(email);
    }

    row.append(identity);
    addCell(row, employee.designation || "Employee");

    if (isSuperAdmin) {
      const memberships = document.createElement("td");
      const badges = document.createElement("div");
      badges.className = "team-badges";
      for (const teamName of employee.teams || []) {
        const badge = document.createElement("span");
        badge.className = "team-badge";
        badge.textContent = teamName;
        badges.append(badge);
      }
      memberships.append(badges);
      row.append(memberships);
      addCell(row, employee.role, "employee-role");

      const actions = document.createElement("td");
      actions.className = "management-actions";
      const edit = document.createElement("button");
      edit.className = "row-action";
      edit.type = "button";
      edit.dataset.action = "edit-employee";
      edit.dataset.id = employee.id;
      edit.textContent = "Edit";
      const resetPassword = document.createElement("button");
      resetPassword.className = "row-action";
      resetPassword.type = "button";
      resetPassword.dataset.action = "reset-employee-password";
      resetPassword.dataset.id = employee.id;
      resetPassword.textContent = "Reset password";
      const remove = document.createElement("button");
      remove.className = "row-action row-action--danger";
      remove.type = "button";
      remove.dataset.action = "delete-employee";
      remove.dataset.id = employee.id;
      remove.textContent = "Delete";
      actions.append(edit, resetPassword);
      if (employee.role !== "Super Admin") actions.append(remove);
      row.append(actions);
    }

    employeeList.append(row);
  }
}

function renderTeamList(teamRecords) {
  teamList.replaceChildren();
  for (const team of teamRecords) {
    const item = document.createElement("div");
    item.className = "team-list__item";
    const name = document.createElement("strong");
    name.textContent = team.name;
    const count = document.createElement("span");
    count.textContent = `${team.memberCount} ${team.memberCount === 1 ? "member" : "members"}`;
    const summary = document.createElement("div");
    summary.className = "team-list__summary";
    summary.append(name, count);
    const actions = document.createElement("div");
    actions.className = "management-actions";
    const edit = document.createElement("button");
    edit.className = "row-action";
    edit.type = "button";
    edit.dataset.action = "edit-team";
    edit.dataset.id = team.id;
    edit.textContent = "Edit";
    const remove = document.createElement("button");
    remove.className = "row-action row-action--danger";
    remove.type = "button";
    remove.dataset.action = "delete-team";
    remove.dataset.id = team.id;
    remove.textContent = "Delete";
    actions.append(edit, remove);
    item.append(summary, actions);
    teamList.append(item);
  }
}

async function loadEmployeeManagement() {
  managementMessage.textContent = "";
  try {
    const [employeeResponse, teamResponse] = await Promise.all([
      fetch("/api/employees", { credentials: "same-origin" }),
      fetch("/api/teams", { credentials: "same-origin" }),
    ]);
    const employeeResult = await employeeResponse.json();
    const teamResult = await teamResponse.json();
    if (!employeeResponse.ok || !teamResponse.ok) {
      managementMessage.textContent =
        employeeResult.error || teamResult.error || "Could not load employee and team data.";
      return;
    }
    teams = teamResult.teams;
    employees = employeeResult.employees;
    renderEmployeeList(employeeResult.employees);
    renderTeamList(teamResult.teams);
    renderTeamOptions(employeeTeamIds);
  } catch {
    managementMessage.textContent = "Could not connect to the server. Please try again.";
  }
}

function openEmployeeDialog() {
  editingEmployeeId = "";
  employeeTeamIds = [];
  employeeForm.reset();
  employeeForm.elements.password.required = true;
  document.querySelector("#employee-dialog-title").textContent = "New employee";
  document.querySelector("#employee-create").textContent = "Create";
  document.querySelector("#employee-password-help").textContent = "At least 12 characters.";
  employeeMessage.textContent = "";
  renderTeamOptions();
  employeeDialog.showModal();
}

function editEmployee(employee) {
  editingEmployeeId = employee.id;
  employeeForm.reset();
  employeeForm.elements.name.value = employee.name;
  employeeForm.elements.email.value = employee.email;
  employeeForm.elements.designation.value = employee.designation;
  employeeForm.elements.password.required = false;
  employeeTeamIds = [...employee.teamIds];
  document.querySelector("#employee-dialog-title").textContent = "Edit employee";
  document.querySelector("#employee-create").textContent = "Save changes";
  document.querySelector("#employee-password-help").textContent =
    "Leave blank to keep the current password.";
  employeeMessage.textContent = "";
  renderTeamOptions(employeeTeamIds);
  employeeDialog.showModal();
}

function openEmployeePasswordDialog(employee) {
  employeePasswordForm.reset();
  employeePasswordForm.dataset.employeeId = employee.id;
  document.querySelector("#employee-password-target").textContent =
    `Set a new password for ${employee.name} (${employee.email}).`;
  employeePasswordMessage.textContent = "";
  employeePasswordDialog.showModal();
}

employeeList.addEventListener("click", async (event) => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;
  const employee = employees.find((item) => item.id === button.dataset.id);
  if (!employee) return;
  if (button.dataset.action === "edit-employee") {
    editEmployee(employee);
    return;
  }
  if (button.dataset.action === "reset-employee-password") {
    openEmployeePasswordDialog(employee);
    return;
  }
  if (button.dataset.action === "delete-employee") {
    if (!(await confirmAction({
      title: "Delete this employee?",
      message: `${employee.name} (${employee.email}) will be deleted. You can restore the account within 24 hours with Ctrl+Z.`,
      confirmLabel: "Delete employee",
    }))) {
      return;
    }
    await deleteRecord(`/api/employees/${encodeURIComponent(employee.id)}`, `Could not delete ${employee.name}.`);
  }
});

teamList.addEventListener("click", async (event) => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;
  const team = teams.find((item) => item.id === button.dataset.id);
  if (!team) return;
  if (button.dataset.action === "edit-team") {
    openTeamDialog(false, team);
    return;
  }
  if (button.dataset.action === "delete-team") {
    const warning = team.memberCount
      ? `Delete "${team.name}"? Its ${team.memberCount} member${team.memberCount === 1 ? "" : "s"} will be removed from this team. Restore it within 24 hours with Ctrl+Z.`
      : `Delete team "${team.name}"? You can restore it within 24 hours with Ctrl+Z.`;
    if (!(await confirmAction({
      title: "Delete this team?",
      message: warning,
      confirmLabel: "Delete team",
    }))) return;
    await deleteRecord(`/api/teams/${encodeURIComponent(team.id)}`, `Could not delete ${team.name}.`);
  }
});

async function deleteRecord(url, errorMessage) {
  managementMessage.textContent = "";
  try {
    const response = await fetch(url, { method: "DELETE", credentials: "same-origin" });
    const result = await response.json();
    if (!response.ok) {
      managementMessage.textContent = result.error || errorMessage;
      return;
    }
    if (result.undo) rememberUndoEntry(result.undo);
    await loadEmployeeManagement();
  } catch {
    managementMessage.textContent = "Could not connect to the server. Please try again.";
  }
}

document.querySelector("#new-employee").addEventListener("click", openEmployeeDialog);
document.querySelector("#employee-close").addEventListener("click", () => employeeDialog.close());
employeeDialog.addEventListener("click", (event) => {
  if (event.target === employeeDialog) employeeDialog.close();
});

document.querySelector("#employee-password-close").addEventListener("click", () => {
  employeePasswordDialog.close();
});
employeePasswordDialog.addEventListener("click", (event) => {
  if (event.target === employeePasswordDialog) employeePasswordDialog.close();
});
employeePasswordForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  employeePasswordMessage.textContent = "";
  const password = employeePasswordForm.elements.password.value;
  const confirmation = employeePasswordForm.elements.confirmPassword.value;
  if (password !== confirmation) {
    employeePasswordMessage.textContent = "The passwords do not match.";
    return;
  }
  employeePasswordSave.disabled = true;
  try {
    const response = await fetch(
      `/api/employees/${encodeURIComponent(employeePasswordForm.dataset.employeeId)}/reset-password`,
      {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      },
    );
    const result = await response.json();
    if (!response.ok) {
      employeePasswordMessage.textContent = result.error || "Could not reset the employee password.";
      return;
    }
    employeePasswordDialog.close();
    employeePasswordForm.reset();
    managementMessage.textContent = result.message;
    await loadEmployeeManagement();
  } catch {
    employeePasswordMessage.textContent = "Could not connect to the server. Please try again.";
  } finally {
    employeePasswordSave.disabled = false;
  }
});

employeeForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  employeeCreate.disabled = true;
  employeeMessage.textContent = "";
  const teamIds = [...employeeTeamOptions.querySelectorAll('input[name="teamIds"]:checked')]
    .map((checkbox) => checkbox.value);

  try {
    const employeeUrl = editingEmployeeId
      ? `/api/employees/${encodeURIComponent(editingEmployeeId)}`
      : "/api/employees";
    const response = await fetch(employeeUrl, {
      method: editingEmployeeId ? "PUT" : "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: employeeForm.elements.name.value,
        email: employeeForm.elements.email.value,
        password: employeeForm.elements.password.value,
        designation: employeeForm.elements.designation.value,
        teamIds,
      }),
    });
    const result = await response.json();
    if (!response.ok) {
      employeeMessage.textContent = result.error || "Could not create employee.";
      return;
    }
    employeeDialog.close();
    employeeForm.reset();
    editingEmployeeId = "";
    await loadEmployeeManagement();
  } catch {
    employeeMessage.textContent = "Could not connect to the server. Please try again.";
  } finally {
    employeeCreate.disabled = false;
  }
});

function openTeamDialog(fromEmployee = false, team = null) {
  returnToEmployeeDialog = fromEmployee;
  editingTeamId = team?.id || "";
  teamForm.reset();
  teamForm.elements.name.value = team?.name || "";
  document.querySelector("#team-dialog-title").textContent = team ? "Edit team" : "Create new team";
  document.querySelector("#team-create").textContent = team ? "Save changes" : "Create team";
  teamMessage.textContent = "";
  if (fromEmployee) employeeDialog.close();
  teamDialog.showModal();
}

document.querySelector("#new-team").addEventListener("click", () => openTeamDialog());
document.querySelector("#create-team-from-employee").addEventListener("click", () => {
  employeeTeamIds = [...employeeTeamOptions.querySelectorAll('input[name="teamIds"]:checked')]
    .map((checkbox) => checkbox.value);
  openTeamDialog(true);
});
document.querySelector("#team-close").addEventListener("click", () => {
  teamDialog.close();
  if (returnToEmployeeDialog) employeeDialog.showModal();
  returnToEmployeeDialog = false;
  editingTeamId = "";
});
teamDialog.addEventListener("click", (event) => {
  if (event.target === teamDialog) {
    teamDialog.close();
    if (returnToEmployeeDialog) employeeDialog.showModal();
    returnToEmployeeDialog = false;
    editingTeamId = "";
  }
});

teamDialog.addEventListener("cancel", (event) => {
  event.preventDefault();
  teamDialog.close();
  if (returnToEmployeeDialog) employeeDialog.showModal();
  returnToEmployeeDialog = false;
  editingTeamId = "";
});

teamForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  teamCreate.disabled = true;
  teamMessage.textContent = "";
  try {
    const teamUrl = editingTeamId
      ? `/api/teams/${encodeURIComponent(editingTeamId)}`
      : "/api/teams";
    const response = await fetch(teamUrl, {
      method: editingTeamId ? "PUT" : "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: teamForm.elements.name.value }),
    });
    const result = await response.json();
    if (!response.ok) {
      teamMessage.textContent = result.error || "Could not create team.";
      return;
    }
    teams = result.teams;
    if (returnToEmployeeDialog && result.team) employeeTeamIds.push(result.team.id);
    teamDialog.close();
    const shouldReturnToEmployeeDialog = returnToEmployeeDialog;
    returnToEmployeeDialog = false;
    editingTeamId = "";
    await loadEmployeeManagement();
    if (shouldReturnToEmployeeDialog) employeeDialog.showModal();
  } catch {
    teamMessage.textContent = "Could not connect to the server. Please try again.";
  } finally {
    teamCreate.disabled = false;
  }
});

function openProfile() {
  profileForm.elements.name.value = profile.name;
  profileForm.elements.designation.value = profile.designation;
  if (profileForm.elements.currentPassword) profileForm.elements.currentPassword.value = "";
  if (profileForm.elements.newPassword) profileForm.elements.newPassword.value = "";
  selectedPhoto = profile.photo;
  profileMessage.textContent = "";
  profileDialog.showModal();
}

document.querySelector("#profile-close").addEventListener("click", () => {
  profileDialog.close();
});

profileDialog.addEventListener("click", (event) => {
  if (event.target === profileDialog) profileDialog.close();
});

profilePhotoInput.addEventListener("change", async () => {
  const [file] = profilePhotoInput.files || [];
  if (!file) return;

  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
    profileMessage.textContent = "Choose a JPG, PNG, or WebP image.";
    profilePhotoInput.value = "";
    return;
  }
  if (file.size > 10 * 1024 * 1024) {
    profileMessage.textContent = "Choose an image smaller than 10 MB.";
    profilePhotoInput.value = "";
    return;
  }

  try {
    const image = await createImageBitmap(file);
    const scale = Math.min(1, 512 / Math.max(image.width, image.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(image.width * scale));
    canvas.height = Math.max(1, Math.round(image.height * scale));
    canvas.getContext("2d").drawImage(image, 0, 0, canvas.width, canvas.height);
    image.close();
    selectedPhoto = canvas.toDataURL("image/jpeg", 0.82);
    profilePhotoImage.src = selectedPhoto;
    profilePhotoImage.hidden = false;
    profilePhotoPlaceholder.hidden = true;
    profileMessage.textContent = "";
  } catch {
    profileMessage.textContent = "Could not read that photo. Please choose another image.";
  }
});

profileForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  profileSave.disabled = true;
  profileMessage.textContent = "Saving your profile…";

  try {
    const response = await fetch("/api/profile", {
      method: "PUT",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: profileForm.elements.name.value,
        designation: profileForm.elements.designation.value,
        photo: selectedPhoto,
        currentPassword: profileForm.elements.currentPassword?.value || "",
        newPassword: profileForm.elements.newPassword?.value || "",
      }),
    });
    const result = await response.json();
    if (!response.ok) {
      profileMessage.textContent = result.error || "Could not save your profile.";
      return;
    }
    renderProfile(result.profile, result.email);
    profileDialog.close();
  } catch {
    profileMessage.textContent = "Could not connect to the server. Please try again.";
  } finally {
    profileSave.disabled = false;
  }
});

checkExistingSession();
