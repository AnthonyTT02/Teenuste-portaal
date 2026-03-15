# SOS Narva React Frontend

This folder contains a React migration of the original static HTML frontend.

## Included flows

- Auth: user login, registration, company login
- Cabinet: profile and active/completed orders
- Company dashboard: cars, employees, active orders
- Provider registration wizard: steps 1-6
- Order flow: steps 1, 2, 5, 6
- Static sections: settings, terms, security, get-started, contacts

## Run

1. Install Node.js 18+ and npm
2. In this folder run:

```bash
npm install
npm run dev
```

Vite dev server uses a proxy to backend `http://localhost:3000`.

## Notes

- Backend API is reused as-is.
- State is kept in localStorage/sessionStorage to stay compatible with current backend behavior.
- Some legacy screens (old Slide_3/4/7/8 visual variants) are consolidated into modern React routes.
