# Ritorica CRM

## Run locally

1. Create the first admin account and save the generated password:

   ```sh
   npm run create-admin -- admin@ritorica.test
   ```

   The password is printed once and its scrypt hash is stored in `data/users.json`.
   The account file is excluded from version control.

2. Start the website and authentication API:

   ```sh
   npm start
   ```

3. Open <http://127.0.0.1:3000> and sign in with the account credentials.

In VS Code, you can start the server from **Terminal > Run Task > Start Ritorica CRM**.
The task runs the local server in the background while VS Code remains open.

The account created with `create-admin` is the Super Admin. It has access to all
leads and their assignment history, clients, deals, employees, teams, audit logs,
and workspace notifications. The app stores this account with the internal
`Admin` role; the Super Admin designation shown in the profile does not limit
its access.

Only one admin account is supported. To use a different email when creating the
account, replace `admin@ritorica.test` in the setup command. The service binds to
localhost by default. The server refuses non-loopback `HOST` values unless both
`NODE_ENV=production` and `ALLOW_REMOTE_BIND=true` are set. Only enable remote
binding when the service is on a private interface behind a TLS-terminating
reverse proxy and firewall rules prevent direct public access to the HTTP port.
The app itself does not provide TLS; setting the remote-binding variables alone
does not make a public HTTP deployment safe. The production session cookie is
marked `Secure`.

The signed-in admin can update their display name, designation, and profile
photo from **My profile**. Profile data is stored with the account in
`data/users.json`; uploaded images are resized in the browser and limited to
1 MB.

Admins can also create employees and teams from **Employees & Teams**. Employee
passwords are hashed before storage in `data/employees.json`, and team records
are stored in `data/teams.json`. The initial teams are Operation Team, Project
Team, and Sales Team. Employee accounts can sign in with their temporary
password and have the standard Employee role. Admins can edit or delete
employees and teams from the same screen. Deleting a team removes that team
membership from its employees; deleting an employee invalidates their sessions.
If an employee forgets a password, only the Super Admin can set a replacement
from **Employees & Teams** using **Reset password**. Passwords must be at least
12 characters; a reset invalidates existing sessions, and the employee can
then sign in with the new password.

Deleted leads, clients, deals, employees, and teams can be restored for 24 hours
by the same signed-in account using **Undo** or **Ctrl+Z** (or **Cmd+Z** on Mac).
The undo history is kept in `data/undo-deletions.json`, retains up to 20 recent
deletions per account, and expired entries are removed the next time undo
history is accessed. Restoring an employee does not restore previously invalidated login sessions.
Restoring an employee does not restore previously invalidated login sessions.

Signed-in users can manage deals from **Sales & Deals**. The dashboard starts
with no deals, so the Open, Won, and Lost totals all begin at BDT 0. Create,
edit, filter, and delete deals; deal records are stored in `data/deals.json`.
Each deal includes a client, BDT value, status, priority, optional close date,
and assignee selected from the admin and employee accounts.

The **Clients** page provides a client directory with create, edit, and delete
actions. The first visit seeds four sample Bangladesh companies; all client
records are saved in `data/clients.json`. Client records include contact
details, country, industry, type, status, account manager, tags, address, and
notes. New clients default to Prospect; the type is shown in the directory but
is not an editable form field.

The **Leads** page starts with seven sample prospects and supports searching,
status and team filtering, CSV export, and creating, editing, and deleting
leads. Each lead includes contact details, source and source details, follow-up
date and time, status, priority, team member, and estimated value with a
selectable currency. Team member choices are limited to the selected team's
employees. Lead records and activity history are saved in `data/leads.json`;
converting a lead creates a client record and records the conversion in its
history.

Lead visibility is limited to the Super Admin, the lead creator, and its
current assignee. The creator or current assignee can hand a lead to another
employee across teams; Super Admin can manage any lead. Each handoff creates an in-app
notification and an assignment event. The dashboard shows an animated
assignment journey with a red sender light, a moving transfer line, a blinking
green recipient light, and the assignment date/time only to the lead creator
and Super Admin. The dashboard also shows lead, client, and deal summaries and
recent records. Other employees only see leads currently assigned to them.
Notifications are stored in `data/notifications.json`.

Lead email notifications use SMTP. Configure `SMTP_HOST`, `SMTP_PORT` (default
`587`), `SMTP_SECURE` (`true` for implicit TLS), `SMTP_FROM`, and optionally
`SMTP_USER` and `SMTP_PASSWORD` in the server environment before starting the
app. Do not put credentials in source files. New assignments send the current
assignee an email with the follow-up date/time; a background check sends the
creator a gentle reminder 48 hours before that time. Follow-up times use the
`Asia/Dhaka` timezone. The server must remain running for scheduled reminders
to be delivered.

## Audit logs

The **Audit Logs** page and `GET /api/audit-logs` are restricted on the server
to the Super Admin. The app records API requests (including failed and blocked
requests), data changes with sanitized before/after values, and tracked
workspace navigation, searches, and filters. Records include a unique ID,
timestamp, company when available, user and role, action, module, IP address,
browser/OS user-agent summary, status, and description. The page shows the
records newest first in pages of 100 and supports local search and
module/status filters. Search activity is recorded without storing the entered
search text.

Audit data is stored in `data/audit-logs.json` (excluded from version control).
Passwords, password hashes, salts, tokens, cookies, authorization values, and
profile photos are redacted. IP addresses are taken from the direct socket
connection; forwarded-IP headers are not trusted. Device information is
inferred from the browser user-agent. No external geolocation lookup is made:
location is reported as local/unknown unless the server operator sets the
static `AUDIT_LOCATION` environment label. This label is not an IP-based
geolocation service.
