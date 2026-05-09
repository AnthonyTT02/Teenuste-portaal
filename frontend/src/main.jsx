import { GoogleOAuthProvider } from '@react-oauth/google';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { SidebarProvider } from './context/SidebarContext';
import './index.css';

const GOOGLE_CLIENT_ID = '32910920723-oi72keskjbos419jb2a9t0asss37eit0.apps.googleusercontent.com';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <BrowserRouter>
        <SidebarProvider>
          <App />
        </SidebarProvider>
      </BrowserRouter>
    </GoogleOAuthProvider>
  </React.StrictMode>
);
