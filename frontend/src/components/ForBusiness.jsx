import React from 'react';
import { useSidebar } from '../context/SidebarContext';

export default function ForBusiness() {
  const { openSidebar } = useSidebar();

  return (
    <div className="w-full max-w-3xl bg-white/80 backdrop-blur-xl border border-white/40 rounded-[2.5rem] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05),0_0_80px_rgba(91,108,249,0.08)] p-8 md:p-12 overflow-hidden relative transition-all duration-500 group animate-fade-in-up">
      <div className="absolute inset-0 bg-gradient-to-br from-white/60 to-transparent pointer-events-none opacity-50 rounded-[2.5rem]"></div>
      
      <div className="relative z-10">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-black tracking-tighter text-[#111827]">
            Teenuste<span className="text-transparent bg-clip-text bg-gradient-to-r from-brand to-brand-light">Portaal</span>
          </h1>
          <button onClick={openSidebar} className="p-2.5 rounded-full hover:bg-gray-100/80 active:scale-95 transition-all text-gray-500 shadow-sm border border-transparent hover:border-gray-200/50">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>
        </div>

        <h2 className="text-3xl font-extrabold text-[#111827] mb-6 tracking-tight">For Business (B2B)</h2>
        
        <div className="bg-white/60 border border-gray-100 rounded-3xl p-6 shadow-sm text-gray-700 text-sm leading-relaxed mb-6">
          <p>We provide exclusive corporate tools to manage your fleets, employees, and operations withsecurely.</p>
        </div>

        <button className="group relative w-full py-4 mt-2 overflow-hidden bg-brand rounded-2xl font-bold text-lg text-white shadow-[0_8px_20px_rgba(91,108,249,0.25)] hover:shadow-[0_15px_30px_rgba(91,108,249,0.4)] transform hover:-translate-y-1 active:scale-[0.97] transition-all">
          <span className="relative z-10">Apply for Partnership</span>
        </button>
      </div>
    </div>
  );
}