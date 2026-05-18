import React from 'react';
import { useSidebar } from '../context/SidebarContext';

export default function Security() {
  const { openSidebar } = useSidebar();

  return (
    <div className="tp-page-card max-w-3xl p-8 md:p-12">
      <div className="tp-page-card-shine"></div>
      
      <div className="relative z-10">
        <div className="flex justify-between items-center mb-8">
          <h1 className="tp-brand-title">
            Teenuste<span className="tp-brand-accent">Portaal</span>
          </h1>
          <button onClick={openSidebar} className="tp-icon-btn">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>
        </div>

        <h2 className="text-3xl font-extrabold text-[#111827] mb-6 tracking-tight">Security Guidelines</h2>
        
        <div className="tp-panel-readable space-y-4">
          <div className="flex gap-4 items-start">
            <div className="text-brand mt-1"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg></div>
            <div>
              <p className="font-bold text-gray-900">Data Protection</p>
              <p>We use industry-standard encryption to protect your personal and payment data.</p>
            </div>
          </div>
          <div className="flex gap-4 items-start">
            <div className="text-brand mt-1"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg></div>
            <div>
              <p className="font-bold text-gray-900">Account Safety</p>
              <p>Never share your password or OTP. Use strong, unique passwords.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
