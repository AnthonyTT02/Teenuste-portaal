// frontend/src/test/setup.jsx contains project logic or configuration with inline comments for maintainability.
// Imports React because this file renders JSX components.
import React from 'react';
// Imports test helpers used to render components, simulate users, and assert behavior.
import '@testing-library/jest-dom/vitest';
import { afterEach, vi } from 'vitest';
// Imports React hooks used to manage component state and lifecycle behavior.
import { cleanup } from '@testing-library/react';
// Imports ../i18n so this file can use its exported functionality.
import i18n from '../i18n';

const routerMocks = vi.hoisted(() => ({
  navigate: vi.fn()
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => routerMocks.navigate
  };
});

vi.mock('leaflet', () => ({
  default: {
    Icon: {
      Default: {
        prototype: { _getIconUrl: null },
        mergeOptions: vi.fn()
      }
    }
  }
}));

vi.mock('react-leaflet', () => ({
  MapContainer: ({ children }) => <div data-testid="map">{children}</div>,
  TileLayer: () => <div data-testid="tile-layer" />,
  Marker: ({ position }) => <div data-testid="marker">{Array.isArray(position) ? position.join(',') : ''}</div>,
  useMap: () => ({ setView: vi.fn(), flyTo: vi.fn() }),
  useMapEvents: (handlers) => {
    globalThis.__leafletHandlers = handlers;
    return null;
  }
}));

globalThis.__navigateMock = routerMocks.navigate;

// Defines a test helper block.
afterEach(async () => {
  cleanup();
  routerMocks.navigate.mockClear();
  vi.restoreAllMocks();
  vi.useRealTimers();
  localStorage.clear();
  sessionStorage.clear();
  await i18n.changeLanguage('en');
  delete globalThis.__leafletHandlers;
});
