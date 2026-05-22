# Teenuste Portaal

Teenuste Portaal is a roadside assistance portal built with React, Express and MySQL. The system supports separate flows for customers, workers, moderators, support staff and administrators.

The repository contains two applications:

- `backend`: Express API server with MySQL access.
- `frontend`: React/Vite client with unit, component and Playwright E2E tests.

## Features

- Customer registration, email verification and login.
- Role-based login for users, workers, moderators, support staff and admins.
- Roadside assistance request flow with vehicle data, location, service selection, payment type and worker selection.
- Worker application flow with moderator approval.
- Worker cabinet with online status, services and assigned orders.
- Customer cabinet with active and completed orders.
- Support ticket creation and support resolution flow.
- Admin dashboard for users, statistics and services.
- Backend API tests with Jest and Supertest.
- Frontend tests with Vitest and Testing Library.
- Browser E2E workflow with Playwright.

## Tech Stack

| Area | Tools |
| --- | --- |
| Frontend | React, Vite, Tailwind CSS, React Router, i18next, Leaflet |
| Backend | Node.js, Express, express-session |
| Database | MySQL or MariaDB |
| Backend tests | Jest, Supertest |
| Frontend tests | Vitest, Testing Library, jsdom |
| E2E tests | Playwright |

## Project Structure

```text
Teenuste-portaal/
  backend/
    __tests__/
    routes/
    db.js
    server.js
    utils.js
  frontend/
    e2e/
    src/
      __tests__/
      components/
      context/
      test/
    playwright.config.js
    vite.config.js
  teenusteportaal.sql
  package.json
  README.md
```

## Requirements

- Node.js 18 or newer.
- npm.
- MySQL or MariaDB.
- Google Chrome or Microsoft Edge for Playwright E2E tests.

On Windows, run commands from PowerShell or the VS Code terminal. Use `npm.cmd` instead of `npm` if PowerShell does not resolve npm scripts correctly.

## Installation

Install backend and frontend dependencies from the repository root:

```bat
npm.cmd run install-all
```

The same installation can be done manually:

```bat
npm.cmd install --prefix backend
npm.cmd install --prefix frontend
```

## Database Setup

The database dump is included in the repository as:

```text
teenusteportaal.sql
```

Create the database:

```sql
CREATE DATABASE teenusteportaal CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Import the dump using phpMyAdmin, MySQL Workbench or the MySQL CLI.

PowerShell example if `mysql` is available in `PATH`:

```bat
cmd /c "mysql -u root -p teenusteportaal < teenusteportaal.sql"
```

XAMPP example:

```bat
cmd /c "C:\xampp\mysql\bin\mysql.exe -u root teenusteportaal < teenusteportaal.sql"
```

The dump includes default staff accounts:

| Username | Password | Role |
| --- | --- | --- |
| `admin` | `1` | Admin |
| `moderator` | `1` | Moderator |
| `support` | `1` | Support |

Passwords are stored as SHA-256 hashes in the database.

## Environment Variables

Create `backend/.env`(if it is not already existing):

```env
DATABASE_URL="mysql://root:@localhost:3306/teenusteportaal"
SESSION_SECRET="SPTV22_Secret_Key_ThisTimeForProduction"
RESEND_API_KEY="re_gCpa6Ziu_AqPW4HpNKwYE1uNXBixKtuC8"
```

Variable notes:

| Variable | Required | Description |
| --- | --- | --- |
| `DATABASE_URL` | Yes | MySQL connection string used by `backend/db.js`. |
| `SESSION_SECRET` | Recommended | Secret used by `express-session`. |
| `RESEND_API_KEY` | Yes | Must be non-empty because the auth route initializes Resend during startup. Use a real key for real email sending. Verification and reset codes are also printed in the backend console. |

The `.env` file should NOT be commited to GitHub, but as a part of the project it is already in the project.

## Running Locally

Start backend and frontend together from the repository root:

```bat
npm.cmd run dev
```

Default local URLs:

```text
Frontend: http://127.0.0.1:3000
Backend:  http://127.0.0.1:3001
```

Run only the backend:

```bat
npm.cmd start --prefix backend
```

Run only the frontend:

```bat
npm.cmd run dev --prefix frontend
```

Build the frontend:

```bat
npm.cmd run build --prefix frontend
```

Build from the repository root:

```bat
npm.cmd run build
```

## Scripts

Root scripts (run from the repository root):

| Command | Description |
| --- | --- |
| `npm run install-all` | Installs backend and frontend dependencies. |
| `npm run dev` | Starts backend and frontend together. |
| `npm run build` | Builds the frontend. |
| `npm run test:backend` | Runs all backend Jest tests. |
| `npm run test:regression` | Runs only the backend regression workflow test. |
| `npm run test:e2e` | Runs Playwright E2E tests for the frontend. (more below)|

Frontend scripts (can also be run from root with `--prefix frontend`):

| Command | Description |
| --- | --- |
| `npm run test --prefix frontend` | Runs frontend unit and component tests. |
| `npm run coverage --prefix frontend` | Runs frontend tests with coverage. |

## Testing

### Backend Tests

Run all backend tests:

```bat
npm.cmd run test:backend
```

Run backend coverage:

```bat
npm.cmd test --prefix backend -- --coverage --runInBand "--collectCoverageFrom=**/*.js" "--collectCoverageFrom=!**/__tests__/**" "--collectCoverageFrom=!**/coverage/**" "--collectCoverageFrom=!**/node_modules/**"
```

Latest verified backend coverage:

| Metric | Coverage |
| --- | --- |
| Statements | 90.33% |
| Branches | 88.20% |
| Functions | 95.08% |
| Lines | 91.02% |

### Backend Regression Test

Run only the backend regression workflow:

```bat
npm.cmd run test:regression
```

This test uses Jest and Supertest with mocked database calls. It does not modify the real MySQL database.

The regression workflow checks:

```text
admin creates a service
worker applies for work
moderator approves the worker
worker goes online
customer creates an order
customer completes the order
customer creates a support ticket
duplicate support ticket is blocked
support resolves the ticket
admin deletes the created service
login role and status normalization
```

Expected successful output:

```text
PASS __tests__/regression.workflow.test.js
Test Suites: 1 passed, 1 total
Tests:       2 passed, 2 total
```

### Frontend Tests

Run frontend unit and component tests:

```bat
npm.cmd run test --prefix frontend
```

Run frontend coverage:

```bat
npm.cmd run coverage --prefix frontend
```

Latest verified frontend coverage:

| Metric | Coverage |
| --- | --- |
| Statements | 76.28% |
| Branches | 64.13% |
| Functions | 68.70% |
| Lines | 80.33% |

The `coverage` directories are generated reports. They are not required for the application and should not be committed.

## Playwright E2E Tests

The E2E test runs a full browser workflow against the frontend, backend and the real MySQL database.

The workflow covers:

```text
admin logs in
admin creates a service
worker logs in
worker applies for work
moderator logs in
moderator approves the worker
worker goes online
customer logs in
customer requests roadside assistance
customer selects a worker
customer completes the order
customer creates a support ticket
support logs in
support resolves the ticket
admin deletes the created service
```

Before running E2E tests:

1. Import `teenusteportaal.sql`.
2. Create `backend/.env` with a valid `DATABASE_URL` if it is not already exists.
3. Confirm the default staff accounts exist: `admin`, `moderator`, `support`.
4. Set E2E customer and worker credentials in PowerShell.

The E2E test automatically deletes and recreates the customer and worker accounts before running. The account names and passwords come from environment variables.

Set required E2E variables:

```powershell
$env:E2E_USER_USERNAME="e2e_user"
$env:E2E_USER_PASSWORD="1"
$env:E2E_WORKER_USERNAME="e2e_worker"
$env:E2E_WORKER_PASSWORD="1"
```

Optional browser path for Windows:

```powershell
$env:E2E_BROWSER_PATH="C:\Program Files\Google\Chrome\Application\chrome.exe"
```

Run E2E in headed mode:

```powershell
npm.cmd run test:e2e --prefix frontend -- --headed
```

Run E2E in headless mode:

```powershell
npm.cmd run test:e2e --prefix frontend
```

Run from the repository root in headless mode:

```powershell
npm.cmd run test:e2e
```

If the test prints `1 skipped`, the required E2E variables are missing. In PowerShell the variable assignment must start with `$env:`.

Correct:

```powershell
$env:E2E_WORKER_USERNAME="e2e_worker"
```

Incorrect:

```powershell
E2E_WORKER_USERNAME
```

### Optional Manual E2E User SQL

The Playwright test creates these users automatically, so this SQL is not required for normal E2E runs. It is useful only if you want to prepare the same test users manually.

```sql
USE teenusteportaal;

DELETE FROM worker_services
WHERE user_id IN (SELECT id FROM users WHERE username IN ('e2e_user', 'e2e_worker'));

DELETE FROM worker_applications
WHERE user_id IN (SELECT id FROM users WHERE username IN ('e2e_user', 'e2e_worker'));

DELETE st FROM support_tickets st
LEFT JOIN users u ON st.user_id = u.id
LEFT JOIN orders o ON st.order_id = o.id
LEFT JOIN users ou ON o.user_id = ou.id
LEFT JOIN users ow ON o.worker_user_id = ow.id
WHERE u.username IN ('e2e_user', 'e2e_worker')
   OR ou.username IN ('e2e_user', 'e2e_worker')
   OR ow.username IN ('e2e_user', 'e2e_worker');

DELETE FROM orders
WHERE user_id IN (SELECT id FROM users WHERE username IN ('e2e_user', 'e2e_worker'))
   OR worker_user_id IN (SELECT id FROM users WHERE username IN ('e2e_user', 'e2e_worker'));

DELETE FROM users
WHERE username IN ('e2e_user', 'e2e_worker');

INSERT INTO users (
  username, password, phone, email, status, is_worker,
  worker_online, email_verified, language, theme
) VALUES
(
  'e2e_user',
  '6b86b273ff34fce19d6b804eff5a3f5747ada4eaa22f1d49c01e52ddb7875b4b',
  '+37255510001',
  'e2e_user@example.test',
  'user',
  0,
  0,
  1,
  'en',
  'light'
),
(
  'e2e_worker',
  '6b86b273ff34fce19d6b804eff5a3f5747ada4eaa22f1d49c01e52ddb7875b4b',
  '+37255510002',
  'e2e_worker@example.test',
  'user',
  0,
  0,
  1,
  'en',
  'light'
);
```

The hash above is SHA-256 for password `1`.

## Generated Files

These paths are generated locally and should not be committed:

```text
node_modules/
coverage/
dist/
build/
.env
test-results/
playwright-report/
```

They are already listed in `.gitignore`.

## Common Notes

- Vite may print warnings about deprecated `esbuild` options during frontend coverage. These warnings do not fail the tests.
- Playwright uses local Chrome or Edge if available. If neither browser is found, install a supported browser or set `E2E_BROWSER_PATH`.
- The backend requires `DATABASE_URL`; without it, database initialization will fail.
- `RESEND_API_KEY` must be non-empty. A real key is required only when actual email delivery is needed.
- Verification and password reset codes are printed in the backend console during local development.
- Regression tests use mocked database calls. Playwright E2E tests use the real database.

