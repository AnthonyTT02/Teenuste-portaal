import React from 'react';
import { useSidebar } from '../context/SidebarContext';

export default function Contacts() {
  const { openSidebar } = useSidebar();

  return (
    <div className="tp-page-card tp-page-card-hover max-w-2xl p-8 md:p-12">
      <div className="tp-page-card-shine"></div>
      
      <div className="relative z-10">
        <div className="flex justify-between items-center mb-8">
          <h1 className="tp-brand-title">
            Teenuste<span className="tp-brand-accent">Portaal</span>
          </h1>
          <button 
            type="button"
            onClick={openSidebar}
            className="tp-icon-btn"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>
        </div>

        <h2 className="text-3xl font-extrabold text-[#111827] mb-6 tracking-tight">
          Contacts
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="tp-panel hover:shadow-md transition-shadow flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center mb-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
              </svg>
            </div>
            <h3 className="font-bold text-gray-900 text-[17px] mb-1">Phone Support</h3>
            <p className="text-sm text-gray-500 font-medium">+372 123 4567</p>
          </div>

          <div className="tp-panel hover:shadow-md transition-shadow flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-2xl bg-brand/10 text-brand flex items-center justify-center mb-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                <polyline points="22,6 12,13 2,6"></polyline>
              </svg>
            </div>
            <h3 className="font-bold text-gray-900 text-[17px] mb-1">Email</h3>
            <p className="text-sm text-gray-500 font-medium">info@teenusteportaal.ee</p>
          </div>
        </div>

      </div>
    </div>
  );
}
