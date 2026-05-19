import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import ForgotPassword from './components/ForgotPassword';
import Cabinet from './components/Cabinet';
import Sidebar from './components/Sidebar';
import Settings from './components/Settings';
import Contacts from './components/Contacts';
import Terms from './components/Terms';
import Security from './components/Security';
import GetStarted from './components/GetStarted';
import ForIndividuals from './components/ForIndividuals';
import ProviderReg from './components/ProviderReg';
import RequestHelp from './components/RequestHelp';
import Admin from './components/Admin';
import Moderator from './components/Moderator';
import Support from './components/Support';
import Provider from './components/Provider';

export default function App() {
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

