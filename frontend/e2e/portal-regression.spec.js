import { expect, test } from '@playwright/test';
import { Buffer } from 'node:buffer';
import crypto from 'node:crypto';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

function loadBackendEnv() {
  const envPath = path.resolve(__dirname, '../../backend/.env');
  if (!fs.existsSync(envPath)) return;

  for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)\s*$/);
    if (!match) continue;
    const key = match[1];
    let value = match[2].trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

loadBackendEnv();
const db = require('../../backend/db');

const env = process.env;
const credentials = {
  admin: {
    username: env.E2E_ADMIN_USERNAME || 'admin',
    password: env.E2E_ADMIN_PASSWORD || '1'
  },
  moderator: {
    username: env.E2E_MODERATOR_USERNAME || 'moderator',
    password: env.E2E_MODERATOR_PASSWORD || '1'
  },
  support: {
    username: env.E2E_SUPPORT_USERNAME || 'support',
    password: env.E2E_SUPPORT_PASSWORD || '1'
  },
  worker: {
    username: env.E2E_WORKER_USERNAME,
    password: env.E2E_WORKER_PASSWORD
  },
  user: {
    username: env.E2E_USER_USERNAME || env.E2E_CUSTOMER_USERNAME,
    password: env.E2E_USER_PASSWORD || env.E2E_CUSTOMER_PASSWORD
  }
};

const missingCredentials = [
  ['E2E_WORKER_USERNAME', credentials.worker.username],
  ['E2E_WORKER_PASSWORD', credentials.worker.password],
  ['E2E_USER_USERNAME', credentials.user.username],
  ['E2E_USER_PASSWORD', credentials.user.password]
]
  .filter(([, value]) => !value)
  .map(([name]) => name);

const profilePhoto = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII=',
  'base64'
);
const profilePhotoDataUrl = `data:image/png;base64,${profilePhoto.toString('base64')}`;

const serviceName = `E2E Regression Service ${Date.now()}`;
const workerFirstName = 'E2E';
const workerLastName = 'Worker';
const supportMessage = `E2E support ticket ${Date.now()}`;
let serviceId;

function sha256(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

async function resetE2eDatabase() {
  if (missingCredentials.length > 0) return;

  const userName = credentials.user.username;
  const workerName = credentials.worker.username;
  const names = [userName, workerName];

  await db.query(`
    DELETE st FROM support_tickets st
    LEFT JOIN users u ON st.user_id = u.id
    LEFT JOIN orders o ON st.order_id = o.id
    LEFT JOIN users ou ON o.user_id = ou.id
    LEFT JOIN users ow ON o.worker_user_id = ow.id
    WHERE u.username IN (?, ?)
       OR ou.username IN (?, ?)
       OR ow.username IN (?, ?)
  `, [...names, ...names, ...names]);

  await db.query(`
    DELETE o FROM orders o
    LEFT JOIN users u1 ON o.user_id = u1.id
    LEFT JOIN users u2 ON o.worker_user_id = u2.id
    WHERE u1.username IN (?, ?)
       OR u2.username IN (?, ?)
  `, [...names, ...names]);

  await db.query(`
    DELETE ws FROM worker_services ws
    JOIN users u ON ws.user_id = u.id
    WHERE u.username IN (?, ?)
  `, names);

  await db.query(`
    DELETE wa FROM worker_applications wa
    JOIN users u ON wa.user_id = u.id
    WHERE u.username IN (?, ?)
  `, names);

  await db.query('DELETE FROM users WHERE username IN (?, ?)', names);
  await db.query('DELETE FROM services WHERE name LIKE ?', ['E2E Regression Service%']);

  await db.query(`
    INSERT INTO users (
      username, password, phone, email, status, is_worker,
      worker_online, email_verified, language, theme
    ) VALUES (?, ?, ?, ?, 'user', 0, 0, 1, 'en', 'light'),
             (?, ?, ?, ?, 'user', 0, 0, 1, 'en', 'light')
  `, [
    userName,
    sha256(credentials.user.password),
    '+37255510001',
    `${userName}@example.test`,
    workerName,
    sha256(credentials.worker.password),
    '+37255510002',
    `${workerName}@example.test`
  ]);
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function installNetworkStubs(page) {
  await page.route('https://nominatim.openstreetmap.org/**', (route) => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ display_name: 'Narva test location' })
  }));
  await page.route('https://*.tile.openstreetmap.org/**', (route) => route.fulfill({ status: 204, body: '' }));
  await page.route('https://unpkg.com/**', (route) => route.fulfill({ status: 204, body: '' }));
}

async function resetBrowserState(page) {
  await page.goto('/');
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
    localStorage.setItem('i18nextLng', 'en');
  });
}

async function login(page, path, username, password, expectedPath) {
  await resetBrowserState(page);
  await page.goto(path);
  await page.locator('input[type="text"]').first().fill(username);
  await page.locator('input[type="password"]').first().fill(password);
  await page.locator('form button[type="submit"]').click();
  await expect(page).toHaveURL(new RegExp(`${escapeRegExp(expectedPath)}$`), { timeout: 15000 });
  await page.evaluate(() => localStorage.setItem('i18nextLng', 'en'));
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(page).toHaveURL(new RegExp(`${escapeRegExp(expectedPath)}$`), { timeout: 15000 });
}

async function loginAdmin(page) {
  await login(page, '/login', credentials.admin.username, credentials.admin.password, '/admin');
}

async function openAdminServicesTab(page) {
  await page.getByRole('button', { name: /services/i }).click();
  await expect(page.locator('input[placeholder="Service name"]')).toBeVisible();
}

async function createService(page) {
  await loginAdmin(page);
  await openAdminServicesTab(page);
  await page.locator('input[placeholder="Service name"]').fill(serviceName);
  await page.locator('input[type="number"]').first().fill('49.90');
  await page.getByRole('button', { name: /^add$/i }).click();
  await expect(page.getByText(serviceName, { exact: true })).toBeVisible();

  const servicesResponse = await page.request.get('/api/services');
  await expect(servicesResponse).toBeOK();
  const servicesPayload = await servicesResponse.json();
  serviceId = servicesPayload.services.find((service) => service.name === serviceName)?.id;
  expect(serviceId).toBeTruthy();
}

async function deleteService(page) {
  await loginAdmin(page);
  await openAdminServicesTab(page);
  const serviceCard = page.locator('div').filter({
    has: page.getByText(serviceName, { exact: true })
  }).filter({
    has: page.getByRole('button', { name: /^delete$/i })
  }).last();

  if (!(await serviceCard.count())) return;

  page.once('dialog', (dialog) => dialog.accept());
  await serviceCard.getByRole('button', { name: /^delete$/i }).click();
  await expect(page.getByText(serviceName, { exact: true })).toHaveCount(0);
}

async function registerWorker(page) {
  await login(page, '/login', credentials.worker.username, credentials.worker.password, '/cabinet');
  const workerUserId = await page.evaluate(() => localStorage.getItem('userId'));
  const workerEmail = await page.evaluate(() => localStorage.getItem('userEmail')) || 'e2e_worker@example.test';

  if (await page.getByRole('button', { name: /go to work dashboard/i }).isVisible().catch(() => false)) {
    throw new Error('e2e_worker is already a worker. Reset the database before running the full e2e flow.');
  }

  if (await page.getByText(/application pending/i).isVisible().catch(() => false)) {
    throw new Error('e2e_worker already has a pending worker application. Reset the database before running the full e2e flow.');
  }

  const photoResponse = await page.request.put(`/api/user/${workerUserId}/photo`, {
    data: { photo: profilePhotoDataUrl }
  });
  await expect(photoResponse).toBeOK();

  await page.getByRole('button', { name: /become a worker/i }).click();
  await expect(page).toHaveURL(/\/provider-reg$/);

  await page.getByRole('button', { name: new RegExp(escapeRegExp(serviceName)) }).click();

  const response = await page.request.post('/api/worker/apply', {
    data: {
      userId: workerUserId,
      government_name: workerFirstName,
      government_surname: workerLastName,
      isikukood: '390010100001',
      bank_account: 'EE382200221020145685',
      email: workerEmail,
      services: [serviceId]
    }
  });
      await expect(response).toBeOK();
  return true;
}

async function approveWorker(page) {
  await login(page, '/login', credentials.moderator.username, credentials.moderator.password, '/moderator');
  const applicationCard = page.locator('div').filter({
    hasText: `${workerFirstName} ${workerLastName}`
  }).filter({
    has: page.getByRole('button', { name: /^approve$/i })
  }).last();

  await expect(applicationCard).toBeVisible();
  await applicationCard.getByRole('button', { name: /^approve$/i }).click();
  await expect(applicationCard).toHaveCount(0);
}

async function putWorkerOnline(page) {
  await login(page, '/login', credentials.worker.username, credentials.worker.password, '/cabinet');
  const workerUserId = await page.evaluate(() => localStorage.getItem('userId'));
  const servicesResponse = await page.request.put(`/api/worker/${workerUserId}/services`, {
    data: { serviceIds: [serviceId] }
  });
  await expect(servicesResponse).toBeOK();

  await page.goto('/provider');
  await expect(page.getByText(/worker hub/i)).toBeVisible();
  const onlineToggle = page.locator('button').filter({ has: page.locator('div.w-5.h-5') }).first();
  await onlineToggle.click();
  await expect(page.getByText(/^Online$/)).toBeVisible();
}

async function orderAssistanceAndSendTicket(page) {
  await login(page, '/login', credentials.user.username, credentials.user.password, '/cabinet');

  await page.goto('/request-help');
  await page.getByRole('button', { name: new RegExp(escapeRegExp(serviceName)) }).click();
  await page.getByRole('button', { name: /next/i }).click();

  await page.getByRole('button', { name: /use gps/i }).click();
  await expect(page.getByText(/address: narva test location/i)).toBeVisible();
  await page.locator('input[placeholder="Toyota, BMW..."]').fill('Toyota');
  await page.locator('input[placeholder="Model or type"]').fill('Corolla');
  await page.locator('input[placeholder="123 ABC"]').fill('123ABC');
  await page.locator('input[placeholder="Short note for the worker"]').fill('E2E regression');
  await page.getByRole('button', { name: /next/i }).click();
  await page.getByRole('button', { name: /send request/i }).click();

  await expect(page.getByText(/available workers/i)).toBeVisible();
  const workerCard = page.locator('button').filter({ hasText: `${workerFirstName} ${workerLastName}` }).first();
  await expect(workerCard).toBeVisible();
  await workerCard.click();
  await page.getByRole('button', { name: /confirm order/i }).click();
  await expect(page.getByText(/order confirmed/i)).toBeVisible();
  await page.getByRole('button', { name: /go to my cabinet/i }).click();

  const activeOrder = page.locator('div').filter({
    hasText: 'Toyota Corolla'
  }).filter({
    has: page.getByRole('button', { name: /mark as completed/i })
  }).last();
  await expect(activeOrder).toBeVisible();
  await activeOrder.getByRole('button', { name: /mark as completed/i }).click();
  await page.locator('.grid.grid-cols-2.gap-2.mb-4 button').nth(1).click();

  const completedOrder = page.locator('div').filter({ hasText: 'Toyota Corolla' }).filter({
    has: page.locator('button.tp-btn-secondary')
  }).last();
  await expect(completedOrder).toBeVisible();
  await completedOrder.locator('button.tp-btn-secondary').click();
  await page.locator('textarea').fill(supportMessage);
  await page.getByRole('button', { name: /^send$/i }).click();
  await expect(page.getByText(/ticket sent/i)).toBeVisible();
}

async function resolveSupportTicket(page) {
  await login(page, '/login', credentials.support.username, credentials.support.password, '/support');
  const ticketCard = page.locator('div').filter({ hasText: supportMessage }).filter({
    has: page.getByRole('button', { name: /^resolve$/i })
  }).last();
  await expect(ticketCard).toBeVisible();
  await ticketCard.getByRole('button', { name: /^resolve$/i }).click();
  await page.getByRole('button', { name: /resolved/i }).click();
  await expect(page.getByText(supportMessage)).toBeVisible();
}

test.describe('Teenuste Portaal role workflow regression', () => {
  test.skip(missingCredentials.length > 0, `Missing e2e credentials: ${missingCredentials.join(', ')}`);
  test.setTimeout(180000);

  test.beforeAll(async () => {
    await resetE2eDatabase();
  });

  test.afterAll(async () => {
    await db.end();
  });

  test.beforeEach(async ({ page }) => {
    await installNetworkStubs(page);
    await page.addInitScript(() => {
      localStorage.setItem('i18nextLng', 'en');
    });
  });

  test('creates admin service, approves a worker, orders help, resolves support ticket, and deletes the service', async ({ page }) => {
    let serviceDeleted = false;

    await createService(page);

    try {
      await registerWorker(page);
      await approveWorker(page);
      await putWorkerOnline(page);
      await orderAssistanceAndSendTicket(page);
      await resolveSupportTicket(page);
      await deleteService(page);
      serviceDeleted = true;
    } finally {
      if (!serviceDeleted) {
        try {
          await deleteService(page);
        } catch (error) {
          console.warn(`Could not clean up ${serviceName}: ${error.message}`);
        }
      }
    }
  });
});
