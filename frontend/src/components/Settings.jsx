import React from 'react';
import { useSidebar } from '../context/SidebarContext';

export default function Settings() {
  const { openSidebar } = useSidebar();

  return (
    <div className="w-full max-w-2xl bg-white/80 backdrop-blur-xl border border-white/40 rounded-[2.5rem] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05),0_0_80px_rgba(91,108,249,0.08)] p-8 md:p-12 overflow-hidden relative transition-all duration-500 hover:shadow-[0_30px_60px_-15px_rgba(91,108,249,0.15)] group animate-fade-in-up">
      <div className="absolute inset-0 bg-gradient-to-br from-white/60 to-transparent pointer-events-none opacity-50 rounded-[2.5rem]"></div>
      
      <div className="relative z-10">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-black tracking-tighter text-[#111827]">
            Teenuste<span className="text-transparent bg-clip-text bg-gradient-to-r from-brand to-brand-light">Portaal</span>
          </h1>
          <button 
            type="button"
            onClick={openSidebar}
            className="p-2.5 rounded-full hover:bg-gray-100/80 active:scale-95 transition-all duration-300 text-gray-500 hover:text-gray-900 shadow-sm border border-transparent hover:border-gray-200/50"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>
        </div>

        <h2 className="text-3xl font-extrabold text-[#111827] mb-6 tracking-tight">
          Settings
        </h2>

        <div className="space-y-4">
          <div className="bg-white/60 border border-gray-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-bold text-gray-900 text-[17px] mb-1">Notifications</h3>
                <p className="text-sm text-gray-500 font-medium">Receive updates on your orders</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand"></div>
              </label>
            </div>
          </div>

          <div className="bg-white/60 border border-gray-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-bold text-gray-900 text-[17px] mb-1">Language</h3>
                <p className="text-sm text-gray-500 font-medium">Select your preferred language</p>
              </div>
              <select className="bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-brand focus:border-brand block p-2.5 outline-none">
                <option value="en">English</option>
                <option value="ru">Русский</option>
                <option value="et">Eesti</option>
              </select>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
