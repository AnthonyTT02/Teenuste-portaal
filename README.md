# Teenuste Portaal

Teenuste Portaal is a roadside assistance service portal built with React, Express, and MySQL. The app supports role-based workflows for customers, workers, moderators, support staff, and admins.

## Features

- User login and registration with email verification code flow.
- Admin dashboard for users, statistics, and service management.
- Worker application and moderator approval flow.
- Worker dashboard with online/offline availability.
- Customer assistance request flow with service selection, location, payment method, and worker selection.
- Support tickets for completed orders.
- Backend unit and regression tests with Jest/Supertest.
- End-to-end regression workflow with Playwright.

## Tech Stack

- Frontend: React, Vite, Tailwind CSS, React Router, i18next, Leaflet
- Backend: Node.js, Express, express-session
- Database: MySQL/MariaDB
- Tests: Jest, Supertest, Playwright

## Project Structure

```text
Teenuste-portaal/
  backend/
    routes/
    __tests__/
    db.js
    server.js
  frontend/
    e2e/
    src/
    playwright.config.js
  teenusteportaal.sql
  package.json
```

## Requirements

- Node.js 18+
- MySQL or MariaDB
- Chrome installed locally for Playwright e2e on Windows

## Installation

```bat
npm.cmd run install-all
```

Or install separately:

```bat
npm.cmd install --prefix backend
npm.cmd install --prefix frontend
```

## Database Setup

1. Create a MySQL/MariaDB database named:

```sql
CREATE DATABASE teenusteportaal CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

2. Import the dump:

```text
teenusteportaal.sql
```

The dump includes default staff users:

```text
admin / 1
moderator / 1
support / 1
```

## Environment Variables

Create `backend/.env`:

```env
DATABASE_URL="mysql://root:@localhost:3306/teenusteportaal"
RESEND_API_KEY="your_resend_api_key"
SESSION_SECRET="change_this_secret"
```

`RESEND_API_KEY` is used for email verification and password reset email sending. The server also logs verification codes to the console.

## Running the App

Start backend and frontend together:

```bat
npm.cmd run dev
```

Default URLs:

```text
Frontend: http://127.0.0.1:3000
Backend:  http://127.0.0.1:3001
```

Run only backend:

```bat
npm.cmd start --prefix backend
```

Run only frontend:

```bat
npm.cmd run dev --prefix frontend
```

## Tests

### Backend Tests

Runs all backend Jest/Supertest tests, including the regression suite:

```bat
npm.cmd run test:backend
```

Current backend tests:

```text
backend/__tests__/admin.test.js
backend/__tests__/auth.test.js
backend/__tests__/moderator.test.js
backend/__tests__/orders.test.js
backend/__tests__/services.test.js
backend/__tests__/user.test.js
backend/__tests__/worker.test.js
backend/__tests__/regression.workflow.test.js
```

### Backend Regression Test

Runs only the backend regression workflow test:

```bat
npm.cmd run test:regression
```

This test uses mocked database calls. It verifies API behavior without changing the real MySQL database.

The regression flow covers:

```text
admin creates service
worker applies
moderator approves worker
worker goes online
customer creates order
order is completed
customer creates support ticket
duplicate support ticket is blocked
support resolves ticket
admin deletes service
login role/status normalization
```

### Playwright E2E Test

Runs the real end-to-end workflow against the app and the real MySQL database:

```bat
set "E2E_BROWSER_PATH=C:\Program Files\Google\Chrome\Application\chrome.exe"
set E2E_USER_USERNAME=e2e_user
set E2E_USER_PASSWORD=1
set E2E_WORKER_USERNAME=e2e_worker
set E2E_WORKER_PASSWORD=1

npm.cmd run test:e2e --prefix frontend -- --headed
```

Headless mode:

```bat
npm.cmd run test:e2e --prefix frontend
```

The Playwright test automatically resets its own e2e data before running:

```text
e2e_user
e2e_worker
E2E Regression Service*
related orders
related worker applications
related worker services
related support tickets
```

The e2e flow covers:

```text
admin logs in
admin creates service
worker logs in
worker applies for work
moderator logs in
moderator approves application
worker goes online
customer logs in
customer requests assistance
customer selects worker
customer completes order
customer sends support ticket
support logs in
support resolves ticket
admin logs in
admin deletes created service
```

## Build

```bat
npm.cmd run build
```

## Notes

- Staff users can log in through the common login page (`/login` or `/`).
- Playwright is configured to use local Chrome via `E2E_BROWSER_PATH`, so downloading Playwright Chromium is not required on Windows.
- `test-results` and `playwright-report` are ignored by Git.
