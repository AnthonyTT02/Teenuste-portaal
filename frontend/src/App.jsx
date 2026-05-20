// frontend/src/App.jsx contains project logic or configuration with inline comments for maintainability.
// Imports React because this file renders JSX components.
import React from 'react';
// Imports React hooks used to manage component state and lifecycle behavior.
import { Navigate, Route, Routes } from 'react-router-dom';
// Imports ./components/Login so this file can use its exported functionality.
import Login from './components/Login';
// Imports ./components/Register so this file can use its exported functionality.
import Register from './components/Register';
// Imports ./components/ForgotPassword so this file can use its exported functionality.
import ForgotPassword from './components/ForgotPassword';
// Imports ./components/Cabinet so this file can use its exported functionality.
import Cabinet from './components/Cabinet';
// Imports ./components/Sidebar so this file can use its exported functionality.
import Sidebar from './components/Sidebar';
// Imports ./components/Settings so this file can use its exported functionality.
import Settings from './components/Settings';
// Imports ./components/Contacts so this file can use its exported functionality.
import Contacts from './components/Contacts';
// Imports ./components/Terms so this file can use its exported functionality.
import Terms from './components/Terms';
// Imports ./components/Security so this file can use its exported functionality.
import Security from './components/Security';
// Imports ./components/GetStarted so this file can use its exported functionality.
import GetStarted from './components/GetStarted';
// Imports ./components/ForIndividuals so this file can use its exported functionality.
import ForIndividuals from './components/ForIndividuals';
// Imports ./components/ProviderReg so this file can use its exported functionality.
import ProviderReg from './components/ProviderReg';
// Imports ./components/RequestHelp so this file can use its exported functionality.
import RequestHelp from './components/RequestHelp';
// Imports ./components/Admin so this file can use its exported functionality.
import Admin from './components/Admin';
// Imports ./components/Moderator so this file can use its exported functionality.
import Moderator from './components/Moderator';
// Imports ./components/Support so this file can use its exported functionality.
import Support from './components/Support';
// Imports ./components/Provider so this file can use its exported functionality.
import Provider from './components/Provider';

// App renders the app screen and connects its UI behavior.
export default function App() {
  // Renders the JSX markup for this component.
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8f9fc] via-[#f3f5fa] to-[#e4e9fc] flex items-center justify-center p-4 relative overflow-x-hidden">
      <Sidebar />

      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-brand/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-pulse-slow pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-[#a8b8ff]/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-pulse-slow object-right-bottom delay-1000 pointer-events-none"></div>
      <div className="absolute w-[40vw] h-[40vw] max-w-[600px] max-h-[600px] left-[50%] top-[50%] -translate-x-1/2 -translate-y-1/2 bg-white/40 rounded-full blur-[100px] opacity-60 z-0 pointer-events-none"></div>

      <div className="z-10 w-full flex justify-center animate-fade-in-up">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/register" element={<Register />} />
          <Route path="/cabinet" element={<Cabinet />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/contacts" element={<Contacts />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/security" element={<Security />} />
          <Route path="/get-started" element={<GetStarted />} />
          <Route path="/for-individuals" element={<ForIndividuals />} />
          <Route path="/provider-reg" element={<ProviderReg />} />
          <Route path="/request-help" element={<RequestHelp />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/moderator" element={<Moderator />} />
          <Route path="/support" element={<Support />} />
          <Route path="/provider" element={<Provider />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  );
}

