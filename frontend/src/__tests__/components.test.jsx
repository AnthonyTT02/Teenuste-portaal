// frontend/src/__tests__/components.test.jsx contains automated tests with comments explaining setup, mocks, actions, and assertions.
// Imports React because this file renders JSX components.
import React from 'react';
// Imports test helpers used to render components, simulate users, and assert behavior.
import { describe, expect, it, beforeEach, vi } from 'vitest';
// Imports React hooks used to manage component state and lifecycle behavior.
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
// Imports the shared API client functions used to communicate with the backend.
import { api } from '../api';
// Imports ../App so this file can use its exported functionality.
import App from '../App';
// Imports ../components/Admin so this file can use its exported functionality.
import Admin from '../components/Admin';
// Imports ../components/Cabinet so this file can use its exported functionality.
import Cabinet from '../components/Cabinet';
// Imports ../components/Contacts so this file can use its exported functionality.
import Contacts from '../components/Contacts';
// Imports ../components/ForgotPassword so this file can use its exported functionality.
import ForgotPassword from '../components/ForgotPassword';
// Imports ../components/ForIndividuals so this file can use its exported functionality.
import ForIndividuals from '../components/ForIndividuals';
// Imports ../components/GetStarted so this file can use its exported functionality.
import GetStarted from '../components/GetStarted';
// Imports ../components/LanguageSwitcher so this file can use its exported functionality.
import LanguageSwitcher from '../components/LanguageSwitcher';
// Imports ../components/Login so this file can use its exported functionality.
import Login from '../components/Login';
// Imports ../components/Moderator so this file can use its exported functionality.
import Moderator from '../components/Moderator';
// Imports ../components/Provider so this file can use its exported functionality.
import Provider from '../components/Provider';
// Imports ../components/ProviderReg so this file can use its exported functionality.
import ProviderReg from '../components/ProviderReg';
// Imports ../components/Register so this file can use its exported functionality.
import Register from '../components/Register';
// Imports ../components/RequestHelp so this file can use its exported functionality.
import RequestHelp from '../components/RequestHelp';
// Imports ../components/Security so this file can use its exported functionality.
import Security from '../components/Security';
// Imports ../components/Settings so this file can use its exported functionality.
import Settings from '../components/Settings';
// Imports ../components/Sidebar so this file can use its exported functionality.
import Sidebar from '../components/Sidebar';
// Imports ../components/Support so this file can use its exported functionality.
import Support from '../components/Support';
// Imports ../components/Terms so this file can use its exported functionality.
import Terms from '../components/Terms';
// Imports ../context/SidebarContext so this file can use its exported functionality.
import { SidebarProvider } from '../context/SidebarContext';
// Imports ../i18n so this file can use its exported functionality.
import i18n from '../i18n';

// Imports the shared API client functions used to communicate with the backend.
vi.mock('../api', () => ({ api: vi.fn() }));

// This shared services fixture gives component tests realistic service data without calling the backend.
// The service records below are reused by multiple component tests so every screen receives the same predictable catalogue.
const services = [
  { id: 1, name: 'Towing', price: 49.9, description: 'Tow service' },
  { id: 2, name: 'Battery Jump', price: 29.5 }
];

// renderPage prepares or runs a test scenario for this module.
// renderPage wraps every tested component with router and sidebar context, matching the real app shell closely enough for user-flow tests.
function renderPage(ui, entries = ['/']) {
  return render(
    <MemoryRouter initialEntries={entries}>
      <SidebarProvider>{ui}</SidebarProvider>
    </MemoryRouter>
  );
}

// mockApi prepares or runs a test scenario for this module.
// mockApi replaces the shared API helper with route-aware responses, allowing each test to describe only the backend calls it needs.
function mockApi(routes) {
  // This API mock controls what the component receives from the backend during the test.
  api.mockImplementation(async (path, options = {}) => {
    const entry = routes.find(([matcher]) => {
      if (typeof matcher === 'string') return String(path).includes(matcher);
      return matcher(path, options);
    });
    if (!entry) throw new Error(`Unexpected API call: ${path}`);
    const value = typeof entry[1] === 'function' ? entry[1](path, options) : entry[1];
    if (value instanceof Error) throw value;
    return value;
  });
}

// jsonFetch prepares or runs a test scenario for this module.
// jsonFetch mocks direct fetch calls used by geolocation/address features that do not go through the shared API helper.
function jsonFetch(routes) {
  global.fetch = vi.fn(async (url, options = {}) => {
    const entry = routes.find(([matcher]) => {
      if (typeof matcher === 'string') return String(url).includes(matcher);
      return matcher(url, options);
    });
    const body = entry ? (typeof entry[1] === 'function' ? entry[1](url, options) : entry[1]) : { ok: true };
    return { json: async () => body };
  });
}

// mockGeo prepares or runs a test scenario for this module.
// mockGeo provides deterministic coordinates so GPS-dependent components can be tested without browser permission dialogs.
function mockGeo(lat = 59.377, lng = 28.186) {
  Object.defineProperty(navigator, 'geolocation', {
    configurable: true,
    value: {
      getCurrentPosition: vi.fn((success) => success({ coords: { latitude: lat, longitude: lng } }))
    }
  });
}

// Resets mocks and shared state before each test case.
beforeEach(async () => {
  // This API mock controls what the component receives from the backend during the test.
  api.mockReset();
  // This browser storage setup reproduces saved login or language state for the test.
  localStorage.setItem('i18nextLng', 'en');
  await i18n.changeLanguage('en');
  global.confirm = vi.fn(() => true);
  global.fetch = vi.fn(async () => ({ json: async () => ({ display_name: 'Narva test location' }) }));
  mockGeo();
});

// Groups tests for static pages and app shell.
describe('static pages and app shell', () => {
  // Verifies that renders informational pages and worker sidebar links.
  it('renders informational pages and worker sidebar links', () => {
    // This table keeps static page smoke tests compact while still checking every informational component.
    const pages = [
      [Contacts, 'Contacts'],
      [ForIndividuals, 'For Individuals (B2C)'],
      [GetStarted, 'How to Become a Worker'],
      [Security, 'Security Guidelines'],
      [Terms, 'Terms of Service']
    ];

    // Each static page is rendered separately so one page failure does not hide which component broke.
    for (const [Component, text] of pages) {
      const view = renderPage(<Component />);
      // Asserts that the route or component produced the expected result.
      expect(screen.getByText(text)).toBeInTheDocument();
      view.unmount();
    }

    // This browser storage setup reproduces saved login or language state for the test.
    localStorage.setItem('is_worker', '1');
    // This render call mounts the component so the test can inspect what the user would see.
    renderPage(<><Contacts /><Sidebar /></>);
    // Asserts that the route or component produced the expected result.
    expect(screen.getByText(/Go to Work|go_to_work/i)).toBeInTheDocument();
    // This event simulates a user interaction such as typing, clicking, or submitting a form.
    fireEvent.click(screen.getAllByRole('button')[0]);
    // Asserts that the route or component produced the expected result.
    expect(screen.getByText(/Menu|menu/i)).toBeInTheDocument();
  });

  // Verifies that routes through App with the shared sidebar provider.
  it('routes through App with the shared sidebar provider', () => {
    // This render call mounts the component so the test can inspect what the user would see.
    renderPage(<App />, ['/contacts']);
    // Asserts that the route or component produced the expected result.
    expect(screen.getAllByText('Contacts').length).toBeGreaterThan(0);
  });
});

// Groups tests for auth forms.
describe('auth forms', () => {
  // Verifies that logs in, stores session state, saves language, and handles failures.
  it('logs in, stores session state, saves language, and handles failures', async () => {
    // This API mock controls what the component receives from the backend during the test.
    // The first login response simulates a successful admin session with all fields that Login stores in localStorage.
    api.mockResolvedValueOnce({
      ok: true,
      userId: 10,
      username: 'admin',
      status: 'admin',
      is_worker: 0,
      phone: '+372',
      email: 'a@test.ee',
      language: 'et'
    });

    const view = renderPage(<Login />);
    // This event simulates a user interaction such as typing, clicking, or submitting a form.
    fireEvent.change(screen.getByPlaceholderText(/username/i), { target: { value: ' admin ' } });
    // This event simulates a user interaction such as typing, clicking, or submitting a form.
    fireEvent.change(view.container.querySelector('input[type="password"]'), { target: { value: '1' } });
    // This event simulates a user interaction such as typing, clicking, or submitting a form.
    fireEvent.click(view.container.querySelector('form button[type="submit"]'));

    // This wait waits for asynchronous UI updates before making assertions.
    await waitFor(() => expect(globalThis.__navigateMock).toHaveBeenCalledWith('/admin'));
    // Asserts that the route or component produced the expected result.
    expect(localStorage.getItem('userStatus')).toBe('admin');
    // Asserts that the route or component produced the expected result.
    expect(localStorage.getItem('userEmail')).toBe('a@test.ee');

    // This API mock controls what the component receives from the backend during the test.
    api.mockRejectedValueOnce(Object.assign(new Error('Bad login'), { payload: { error: 'Bad login' } }));
    // This event simulates a user interaction such as typing, clicking, or submitting a form.
    fireEvent.click(view.container.querySelector('form button[type="submit"]'));
    // Asserts that the route or component produced the expected result.
    expect(await screen.findByText('Bad login')).toBeInTheDocument();
  });

  // Verifies that registers with phone/password validation and verification.
  it('registers with phone/password validation and verification', async () => {
    // This API mock controls what the component receives from the backend during the test.
    api.mockResolvedValue({ ok: true });
    // The register component is kept mounted through both registration steps to verify the full email-code flow.
    const view = renderPage(<Register />);

    // This event simulates a user interaction such as typing, clicking, or submitting a form.
    fireEvent.click(view.container.querySelector('input[type="checkbox"]'));
    // This event simulates a user interaction such as typing, clicking, or submitting a form.
    fireEvent.change(screen.getByPlaceholderText(/username/i), { target: { value: 'newuser' } });
    // This event simulates a user interaction such as typing, clicking, or submitting a form.
    fireEvent.change(screen.getByPlaceholderText('you@example.com'), { target: { value: 'new@test.ee' } });
    // This event simulates a user interaction such as typing, clicking, or submitting a form.
    fireEvent.change(view.container.querySelector('input[type="password"]'), { target: { value: 'short' } });
    // This event simulates a user interaction such as typing, clicking, or submitting a form.
    fireEvent.click(screen.getByRole('button', { name: /send.*code/i }));
    // Asserts that the route or component produced the expected result.
    expect(await screen.findByText(/phone/i)).toBeInTheDocument();

    // This event simulates a user interaction such as typing, clicking, or submitting a form.
    fireEvent.change(screen.getByPlaceholderText('+372 1234 5678'), { target: { value: '+37255556666' } });
    // This event simulates a user interaction such as typing, clicking, or submitting a form.
    fireEvent.click(screen.getByRole('button', { name: /send.*code/i }));
    // Asserts that the route or component produced the expected result.
    expect(await screen.findByText(/continue at your own risk/i)).toBeInTheDocument();

    // This event simulates a user interaction such as typing, clicking, or submitting a form.
    fireEvent.change(view.container.querySelector('input[type="password"]'), { target: { value: 'Stronger1!' } });
    // This event simulates a user interaction such as typing, clicking, or submitting a form.
    fireEvent.click(screen.getByRole('button', { name: /send.*code/i }));

    // Asserts that the route or component produced the expected result.
    expect(await screen.findByText(/valid for 10 minutes/i)).toBeInTheDocument();
    // This event simulates a user interaction such as typing, clicking, or submitting a form.
    fireEvent.change(view.container.querySelector('input[maxlength="6"]'), { target: { value: '123456' } });
    // This event simulates a user interaction such as typing, clicking, or submitting a form.
    fireEvent.click(screen.getByRole('button', { name: /confirm code/i }));

    // This wait waits for asynchronous UI updates before making assertions.
    await waitFor(() => expect(globalThis.__navigateMock).toHaveBeenCalledWith('/'));
  });

  // Verifies that resets a password and redirects after success.
  it('resets a password and redirects after success', async () => {
    // This API mock controls what the component receives from the backend during the test.
    api.mockResolvedValue({ ok: true });
    // The forgot-password test keeps one rendered view while moving from code request to final password reset.
    const view = renderPage(<ForgotPassword />);

    // This event simulates a user interaction such as typing, clicking, or submitting a form.
    fireEvent.change(screen.getByPlaceholderText(/username/i), { target: { value: 'user' } });
    // This event simulates a user interaction such as typing, clicking, or submitting a form.
    fireEvent.change(screen.getByPlaceholderText('name@example.com'), { target: { value: 'user@test.ee' } });
    // This event simulates a user interaction such as typing, clicking, or submitting a form.
    fireEvent.click(screen.getByRole('button', { name: /send reset code/i }));
    // Asserts that the route or component produced the expected result.
    expect(await screen.findByPlaceholderText('000000')).toBeInTheDocument();

    // This event simulates a user interaction such as typing, clicking, or submitting a form.
    fireEvent.change(screen.getByPlaceholderText('000000'), { target: { value: '654321' } });
    // This event simulates a user interaction such as typing, clicking, or submitting a form.
    fireEvent.change(view.container.querySelector('input[type="password"]'), { target: { value: 'newpass' } });
    // This event simulates a user interaction such as typing, clicking, or submitting a form.
    fireEvent.click(screen.getByRole('button', { name: /^reset password/i }));
    // Asserts that the route or component produced the expected result.
    expect(await screen.findByText(/password.*changed/i)).toBeInTheDocument();

    // This wait waits for asynchronous UI updates before making assertions.
    await waitFor(() => expect(globalThis.__navigateMock).toHaveBeenCalledWith('/'), { timeout: 2500 });
  });

  // Verifies that changes language locally and persists it for logged-in users.
  it('changes language locally and persists it for logged-in users', async () => {
    // This browser storage setup reproduces saved login or language state for the test.
    localStorage.setItem('userId', '5');
    // This API mock controls what the component receives from the backend during the test.
    api.mockResolvedValue({ ok: true });
    const onLanguageChange = vi.fn();

    // This render call mounts the component so the test can inspect what the user would see.
    renderPage(<LanguageSwitcher onLanguageChange={onLanguageChange} />);
    // This event simulates a user interaction such as typing, clicking, or submitting a form.
    fireEvent.click(screen.getByRole('button', { name: 'RU' }));

    // This wait waits for asynchronous UI updates before making assertions.
    await waitFor(() => expect(api).toHaveBeenCalledWith('/api/user/5/language', expect.objectContaining({ method: 'PUT' })));
    // Asserts that the route or component produced the expected result.
    expect(onLanguageChange).toHaveBeenCalledWith('ru');
    // Asserts that the route or component produced the expected result.
    expect(localStorage.getItem('i18nextLng')).toBe('ru');
  });
});

// Groups tests for admin and staff dashboards.
describe('admin and staff dashboards', () => {
  // Verifies that loads admin data and manages services/users.
  it('loads admin data and manages services/users', async () => {
    // This browser storage setup reproduces saved login or language state for the test.
    localStorage.setItem('userId', '1');
    jsonFetch([
      ['/api/admin/stats', { ok: true, totalUsers: 2, activeWorkers: 1, totalOrders: 4 }],
      ['/admin/users/2', { ok: true }],
      ['/admin/users', { ok: true, users: [{ id: 2, username: 'client', status: 'user', phone: '+372' }] }],
      [(url, opts) => url === '/api/admin/services' && opts.method === 'POST', { ok: true, service: { id: 3, name: 'Fuel', price: 20 } }],
      [(url, opts) => String(url).includes('/api/admin/services/1') && opts.method === 'PUT', { ok: true, service: { id: 1, name: 'Towing+', price: 55 } }],
      [(url, opts) => String(url).includes('/api/admin/services/1') && opts.method === 'DELETE', { ok: true }],
      ['/api/admin/services', { ok: true, services: [{ id: 1, name: 'Towing', price: 49.9, description: 'Tow' }] }],
      ['/admin/logout', { ok: true }]
    ]);

    // This render call mounts the component so the test can inspect what the user would see.
    // The admin dashboard is rendered with mocked users/services/orders so management actions can be tested without a database.
    renderPage(<Admin />);
    // Asserts that the route or component produced the expected result.
    expect((await screen.findAllByText('client')).length).toBeGreaterThan(0);
    // Asserts that the route or component produced the expected result.
    expect(screen.getAllByText('2').length).toBeGreaterThan(0);

    // This event simulates a user interaction such as typing, clicking, or submitting a form.
    fireEvent.click(screen.getAllByText(/delete/i)[0]);
    // This wait waits for asynchronous UI updates before making assertions.
    await waitFor(() => expect(global.confirm).toHaveBeenCalled());

    // This event simulates a user interaction such as typing, clicking, or submitting a form.
    fireEvent.click(screen.getByRole('button', { name: /services/i }));
    // This event simulates a user interaction such as typing, clicking, or submitting a form.
    fireEvent.change(screen.getByPlaceholderText(/service name/i), { target: { value: 'Fuel' } });
    // This event simulates a user interaction such as typing, clicking, or submitting a form.
    fireEvent.change(screen.getByPlaceholderText(/price/i), { target: { value: '20' } });
    // This event simulates a user interaction such as typing, clicking, or submitting a form.
    fireEvent.click(screen.getByRole('button', { name: /^add$/i }));
    // Asserts that the route or component produced the expected result.
    expect(await screen.findByText('Fuel')).toBeInTheDocument();

    // This event simulates a user interaction such as typing, clicking, or submitting a form.
    fireEvent.click(screen.getAllByText(/edit/i)[0]);
    // This event simulates a user interaction such as typing, clicking, or submitting a form.
    fireEvent.change(screen.getByDisplayValue('Towing'), { target: { value: 'Towing+' } });
    // This event simulates a user interaction such as typing, clicking, or submitting a form.
    fireEvent.click(screen.getByRole('button', { name: /save/i }));
    // Asserts that the route or component produced the expected result.
    expect(await screen.findByText('Towing+')).toBeInTheDocument();

    // This event simulates a user interaction such as typing, clicking, or submitting a form.
    fireEvent.click(screen.getByText(/sign out/i));
    // Asserts that the route or component produced the expected result.
    expect(globalThis.__navigateMock).toHaveBeenCalledWith('/');
  });

  // Verifies that approves and rejects moderator applications.
  it('approves and rejects moderator applications', async () => {
    mockApi([
      ['/api/moderator/pending-applications', {
        applications: [
          { id: 7, government_name: 'Ada', government_surname: 'Driver', isikukood: '390', bank_account: 'EE1', email: 'ada@test.ee', created_at: '2026-01-01', services: [1], user: { username: 'ada', phone: '+372' } },
          { id: 8, government_name: 'Ben', government_surname: 'Driver', isikukood: '391', bank_account: 'EE2', email: 'ben@test.ee', created_at: '2026-01-02', services: [2], user: { username: 'ben', phone: '+372' } }
        ]
      }],
      ['/api/services', { services }],
      ['/api/moderator/approve-application/', { ok: true }]
    ]);

    // This render call mounts the component so the test can inspect what the user would see.
    // The moderator screen is rendered with a pending application so approve/reject actions can be verified.
    renderPage(<Moderator />);
    // Asserts that the route or component produced the expected result.
    expect(await screen.findByText(/Ada Driver/i)).toBeInTheDocument();

    // This event simulates a user interaction such as typing, clicking, or submitting a form.
    fireEvent.click(screen.getAllByRole('button', { name: /approve/i })[0]);
    // This wait waits for asynchronous UI updates before making assertions.
    await waitFor(() => expect(screen.queryByText(/Ada Driver/i)).not.toBeInTheDocument());

    // This event simulates a user interaction such as typing, clicking, or submitting a form.
    fireEvent.click(screen.getAllByRole('button', { name: /reject/i })[0]);
    // This wait waits for asynchronous UI updates before making assertions.
    await waitFor(() => expect(screen.queryByText(/Ben Driver/i)).not.toBeInTheDocument());

    // This event simulates a user interaction such as typing, clicking, or submitting a form.
    fireEvent.click(screen.getByText(/sign out/i));
    // Asserts that the route or component produced the expected result.
    expect(globalThis.__navigateMock).toHaveBeenCalledWith('/');
  });

  // Verifies that loads, resolves and filters support tickets.
  it('loads, resolves and filters support tickets', async () => {
    jsonFetch([
      ['/api/support/tickets/12/resolve', { ok: true }],
      ['/api/support/tickets', {
        ok: true,
        tickets: [
          { id: 12, order_id: 90, status: 'open', message: 'Need help', created_at: '2026-01-01', user: { phone: '+372' }, order: { worker_user: { government_name: 'Ada', government_surname: 'Driver' } } },
          { id: 13, order_id: 91, status: 'resolved', message: 'Solved', created_at: '2026-01-02', user: {}, order: {} }
        ]
      }]
    ]);

    // This render call mounts the component so the test can inspect what the user would see.
    renderPage(<Support />);
    // Asserts that the route or component produced the expected result.
    expect(await screen.findByText('Need help')).toBeInTheDocument();

    // This event simulates a user interaction such as typing, clicking, or submitting a form.
    fireEvent.click(screen.getAllByRole('button', { name: /resolve/i }).find((button) => button.textContent === 'Resolve'));
    // This event simulates a user interaction such as typing, clicking, or submitting a form.
    fireEvent.click(screen.getByRole('button', { name: /resolved/i }));

    // Asserts that the route or component produced the expected result.
    expect(await screen.findByText('Solved')).toBeInTheDocument();
    // This event simulates a user interaction such as typing, clicking, or submitting a form.
    fireEvent.click(screen.getByText(/sign out/i));
    // Asserts that the route or component produced the expected result.
    expect(globalThis.__navigateMock).toHaveBeenCalledWith('/');
  });
});

// Groups tests for customer and worker flows.
describe('customer and worker flows', () => {
  // Verifies that edits settings usernames and handles duplicate errors.
  it('edits settings usernames and handles duplicate errors', async () => {
    // This browser storage setup reproduces saved login or language state for the test.
    localStorage.setItem('userId', '5');
    const duplicate = Object.assign(new Error('Username already taken'), { payload: { error: 'Username already taken' } });
    api
      .mockResolvedValueOnce({ user: { id: 5, username: 'oldname', phone: '+372', email: 'old@test.ee' } })
      .mockRejectedValueOnce(duplicate)
      .mockResolvedValueOnce({ user: { id: 5, username: 'newname', phone: '+372', email: 'old@test.ee' } });

    // This render call mounts the component so the test can inspect what the user would see.
    renderPage(<Settings />);
    // Asserts that the route or component produced the expected result.
    expect(await screen.findByText('oldname')).toBeInTheDocument();

    // This event simulates a user interaction such as typing, clicking, or submitting a form.
    fireEvent.click(screen.getByText(/edit/i));
    // This event simulates a user interaction such as typing, clicking, or submitting a form.
    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'taken' } });
    // This event simulates a user interaction such as typing, clicking, or submitting a form.
    fireEvent.click(screen.getByRole('button', { name: /save/i }));
    // Asserts that the route or component produced the expected result.
    expect(await screen.findByText(/username already taken/i)).toBeInTheDocument();

    // This event simulates a user interaction such as typing, clicking, or submitting a form.
    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'newname' } });
    // This event simulates a user interaction such as typing, clicking, or submitting a form.
    fireEvent.click(screen.getByRole('button', { name: /save/i }));
    // Asserts that the route or component produced the expected result.
    expect(await screen.findByText('newname')).toBeInTheDocument();
  });

  // Verifies that loads cabinet orders, completes active work, and sends support tickets.
  it('loads cabinet orders, completes active work, and sends support tickets', async () => {
    // This browser storage setup reproduces saved login or language state for the test.
    localStorage.setItem('userId', '5');
    // This browser storage setup reproduces saved login or language state for the test.
    localStorage.setItem('username', 'local');
    mockApi([
      ['/api/user/5/orders/active', { orders: [{ id: 20, vehicleBrand: 'Toyota', vehicleModel: 'Corolla', services: '[1]', status: 'active', worker_user: { government_name: 'Ada', government_surname: 'Driver', phone: '+372' }, price: 49.9, paymentType: 'cash' }] }],
      ['/api/user/5/orders/completed', { orders: [{ id: 21, vehicleBrand: 'BMW', vehicleModel: 'X5', services: '[2]', completed_at: '2026-01-01', worker_user: { government_name: 'Ben', government_surname: 'Driver', phone: '+372' }, price: 29.5 }] }],
      ['/api/support/tickets/check', { exists: false }],
      ['/api/support/tickets', { status: 'open' }],
      ['/api/order/20/complete', { ok: true }],
      ['/api/worker/application-status/5', { hasPending: false }],
      ['/api/services', { services }],
      ['/api/user/5', { user: { id: 5, username: 'customer', email: 'c@test.ee', phone: '+372', status: 'user', is_worker: 0 } }]
    ]);

    // This render call mounts the component so the test can inspect what the user would see.
    // The cabinet screen is rendered as a logged-in user area with profile, orders, and worker-application states.
    renderPage(<Cabinet />);
    // Asserts that the route or component produced the expected result.
    expect(await screen.findByText(/Toyota Corolla/i)).toBeInTheDocument();

    // This event simulates a user interaction such as typing, clicking, or submitting a form.
    fireEvent.click(screen.getByRole('button', { name: /mark as completed/i }));
    // This wait waits for asynchronous UI updates before making assertions.
    await waitFor(() => expect(api).toHaveBeenCalledWith('/api/order/20/complete', { method: 'POST' }));

    // This event simulates a user interaction such as typing, clicking, or submitting a form.
    fireEvent.click(screen.getByRole('button', { name: /history/i }));
    // This event simulates a user interaction such as typing, clicking, or submitting a form.
    fireEvent.click(await screen.findByRole('button', { name: /contact support/i }));
    // This event simulates a user interaction such as typing, clicking, or submitting a form.
    fireEvent.change(screen.getByPlaceholderText(/describe your problem/i), { target: { value: 'Please call me' } });
    // This event simulates a user interaction such as typing, clicking, or submitting a form.
    fireEvent.click(screen.getByRole('button', { name: /^send$/i }));
    // Asserts that the route or component produced the expected result.
    expect(await screen.findByText(/ticket sent/i)).toBeInTheDocument();
  });

  // Verifies that submits a provider registration application.
  it('submits a provider registration application', async () => {
    // This browser storage setup reproduces saved login or language state for the test.
    localStorage.setItem('userId', '9');
    // This browser storage setup reproduces saved login or language state for the test.
    localStorage.setItem('userPhone', '+372');
    mockApi([
      ['/api/worker/apply', { ok: true }],
      ['/api/services', { services }],
      ['/api/user/9', { user: { id: 9, email: 'worker@test.ee', phone: '+372', profile_photo: 'data:image/png;base64,abc' } }]
    ]);

    // This render call mounts the component so the test can inspect what the user would see.
    renderPage(<ProviderReg />);
    // Asserts that the route or component produced the expected result.
    expect(await screen.findByText('Towing')).toBeInTheDocument();

    // This event simulates a user interaction such as typing, clicking, or submitting a form.
    fireEvent.click(screen.getByRole('button', { name: /towing/i }));
    // This event simulates a user interaction such as typing, clicking, or submitting a form.
    fireEvent.click(screen.getByRole('button', { name: /next step/i }));
    // This event simulates a user interaction such as typing, clicking, or submitting a form.
    fireEvent.change(screen.getByPlaceholderText('Artjom'), { target: { value: 'Ada' } });
    // This event simulates a user interaction such as typing, clicking, or submitting a form.
    fireEvent.change(screen.getByPlaceholderText('Slavyantsev'), { target: { value: 'Driver' } });
    // This event simulates a user interaction such as typing, clicking, or submitting a form.
    fireEvent.change(screen.getByPlaceholderText('38001010000'), { target: { value: '390010100001' } });
    // This event simulates a user interaction such as typing, clicking, or submitting a form.
    fireEvent.change(screen.getByPlaceholderText('EE382200221020145685'), { target: { value: 'ee382200221020145685' } });
    // This event simulates a user interaction such as typing, clicking, or submitting a form.
    fireEvent.click(screen.getByRole('button', { name: /next step/i }));
    // Asserts that the route or component produced the expected result.
    expect(screen.getAllByText(/review/i).length).toBeGreaterThan(0);
    // This event simulates a user interaction such as typing, clicking, or submitting a form.
    fireEvent.click(screen.getByRole('button', { name: /submit application/i }));

    // Asserts that the route or component produced the expected result.
    expect(await screen.findByText(/registration complete/i)).toBeInTheDocument();
  });

  // Verifies that runs provider dashboard service management and online toggle.
  it('runs provider dashboard service management and online toggle', async () => {
    // This browser storage setup reproduces saved login or language state for the test.
    localStorage.setItem('userId', '9');
    // These mocked endpoints represent the worker dashboard backend contract for services, location, and active orders.
    mockApi([
      ['/api/worker/9/services', { ok: true }],
      ['/api/worker/online', { ok: true }],
      ['/api/worker/location', { ok: true }],
      ['/api/user/9/orders/active', { orders: [{ id: 31, worker_user_id: 9, vehicleBrand: 'Toyota', vehicleModel: 'Corolla', regNumber: '123ABC', address: 'Narva', note: 'Fast', lat: 59.37, lng: 28.18, price: 49.9, paymentType: 'cash' }] }],
      ['/api/services', { services }],
      ['/api/worker/9', { user: { id: 9, username: 'worker', government_name: 'Ada', government_surname: 'Driver', worker_online: 0, worker_lat: 59.37, worker_lng: 28.18 }, services: [services[0]] }]
    ]);

    // The provider dashboard test covers worker service management, online status, and active order visibility in one realistic flow.
    const view = renderPage(<Provider />);
    // Asserts that the route or component produced the expected result.
    expect(await screen.findByText(/worker hub/i)).toBeInTheDocument();
    // Asserts that the route or component produced the expected result.
    expect(screen.getAllByText(/offline/i).length).toBeGreaterThan(0);

    // This event simulates a user interaction such as typing, clicking, or submitting a form.
    fireEvent.click(screen.getByText(/\+ manage services/i));
    // This event simulates a user interaction such as typing, clicking, or submitting a form.
    fireEvent.click(screen.getByRole('button', { name: /battery jump/i }));
    // This event simulates a user interaction such as typing, clicking, or submitting a form.
    fireEvent.click(screen.getByRole('button', { name: /^save$/i }));
    // This wait waits for asynchronous UI updates before making assertions.
    await waitFor(() => expect(api).toHaveBeenCalledWith('/api/worker/9/services', expect.objectContaining({ method: 'PUT' })));

    // This event simulates a user interaction such as typing, clicking, or submitting a form.
    fireEvent.click(view.container.querySelector('button.w-14'));
    // This wait waits for asynchronous UI updates before making assertions.
    await waitFor(() => expect(api).toHaveBeenCalledWith('/api/worker/online', expect.objectContaining({ method: 'PATCH' })));
  });

  // Verifies that books roadside help through the multi-step request flow.
  it('books roadside help through the multi-step request flow', async () => {
    // This browser storage setup reproduces saved login or language state for the test.
    localStorage.setItem('userId', '5');
    // These mocked endpoints represent the complete booking backend contract used by the request wizard.
    mockApi([
      ['/api/order', { orderId: 901 }],
      ['/api/workers/for-service/1', { workers: [{ id: 9, name: 'Ada', surname: 'Driver', phone: '+372', eta: 12, price: 49.9 }], workerStats: { total: 3, online: 1 } }],
      ['/api/services', { services }]
    ]);

    // This render call mounts the component so the test can inspect what the user would see.
    // RequestHelp is rendered as a real booking wizard so the test can move through service, location, vehicle, worker, and confirmation steps.
    renderPage(<RequestHelp />);
    // Asserts that the route or component produced the expected result.
    expect(await screen.findByText('Towing')).toBeInTheDocument();

    // This event simulates a user interaction such as typing, clicking, or submitting a form.
    fireEvent.click(screen.getByRole('button', { name: /towing/i }));
    // This event simulates a user interaction such as typing, clicking, or submitting a form.
    fireEvent.click(screen.getByRole('button', { name: /next/i }));
    // This event simulates a user interaction such as typing, clicking, or submitting a form.
    fireEvent.click(screen.getByRole('button', { name: /use gps/i }));
    // Asserts that the route or component produced the expected result.
    expect(await screen.findByText(/address: narva test location/i)).toBeInTheDocument();
    // This event simulates a user interaction such as typing, clicking, or submitting a form.
    fireEvent.change(screen.getByPlaceholderText(/Toyota, BMW/i), { target: { value: 'Toyota' } });
    // This event simulates a user interaction such as typing, clicking, or submitting a form.
    fireEvent.change(screen.getByPlaceholderText(/model or type/i), { target: { value: 'Corolla' } });
    // This event simulates a user interaction such as typing, clicking, or submitting a form.
    fireEvent.change(screen.getByPlaceholderText(/123 ABC/i), { target: { value: '123ABC' } });
    // This event simulates a user interaction such as typing, clicking, or submitting a form.
    fireEvent.change(screen.getByPlaceholderText(/short note/i), { target: { value: 'Fast please' } });
    // This event simulates a user interaction such as typing, clicking, or submitting a form.
    fireEvent.click(screen.getByRole('button', { name: /next/i }));
    // This event simulates a user interaction such as typing, clicking, or submitting a form.
    fireEvent.click(screen.getByRole('button', { name: /send request/i }));

    // Asserts that the route or component produced the expected result.
    expect(await screen.findByText(/available workers/i)).toBeInTheDocument();
    // This event simulates a user interaction such as typing, clicking, or submitting a form.
    fireEvent.click(screen.getByRole('button', { name: /Ada Driver/i }));
    // This event simulates a user interaction such as typing, clicking, or submitting a form.
    fireEvent.click(screen.getByRole('button', { name: /confirm order/i }));

    // Asserts that the route or component produced the expected result.
    expect(await screen.findByText(/order confirmed/i)).toBeInTheDocument();
    // Asserts that the route or component produced the expected result.
    expect(screen.getByText(/order #901/i)).toBeInTheDocument();
  });
});
