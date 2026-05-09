import React from 'react';
import { Link } from 'react-router-dom';
import { useSidebar } from '../context/SidebarContext';

function VerifyEmail() {
  const { openSidebar } = useSidebar();

  return (
    <div className="w-full max-w-md animate-fade-in-up mt-8 relative">
      <button 
        onClick={openSidebar}
        className="absolute -top-4 -right-4 p-3 rounded-full bg-white shadow-xl hover:bg-gray-50 transition-colors text-gray-600 border border-gray-100 z-50"
      >
        <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
      </button>

      <div className="backdrop-blur-xl bg-white/60 border border-white/40 shadow-2xl rounded-[2rem] p-10 text-center relative overflow-hidden">
        
        {/* Декоративный круг на фоне карточки */}
        <div className="absolute top-[-20%] left-[-20%] w-48 h-48 bg-green-400/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70"></div>

        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
          <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76" />
          </svg>
        </div>

        <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600 mb-4 tracking-tight">
          Verify your Email
        </h1>
        
        <p className="text-gray-500 font-medium mb-8 leading-relaxed">
          We've sent a verification link to your email address. Please click the link to activate your account.
        </p>

        <Link to="/">
          <button className="w-full bg-gradient-to-r from-[#4f46e5] to-[#3b82f6] text-white font-bold py-4 rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            Return to Login
          </button>
        </Link>
        
        <p className="mt-6 text-sm text-gray-400">
          Didn't receive the email? <button className="text-[#4f46e5] font-semibold hover:underline">Resend</button>
        </p>
      </div>
    </div>
  );
}

export default VerifyEmail;