// frontend/src/main.jsx contains project logic or configuration with inline comments for maintainability.
// Imports React because this file renders JSX components.
import React from 'react';
import ReactDOM from 'react-dom/client';
// Imports React hooks used to manage component state and lifecycle behavior.
import { BrowserRouter } from 'react-router-dom';
// Imports ./App.jsx so this file can use its exported functionality.
import App from './App.jsx';
// Imports ./context/SidebarContext so this file can use its exported functionality.
import { SidebarProvider } from './context/SidebarContext';
// Imports dependency so this file can use its exported functionality.
import './index.css';
import './i18n';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <SidebarProvider>
        <App />
      </SidebarProvider>
    </BrowserRouter>
  </React.StrictMode>
);
