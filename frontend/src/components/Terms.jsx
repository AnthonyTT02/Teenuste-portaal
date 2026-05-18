import React from 'react';
import { useSidebar } from '../context/SidebarContext';

export default function Terms() {
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

        <h2 className="text-3xl font-extrabold text-[#111827] mb-6 tracking-tight">Terms of Service</h2>
        
        <div className="tp-panel-readable space-y-4">
          <p><strong>1. General Provisions</strong></p>
          <p>By using Teenuste Portaal, you agree to these terms. Our service connects users with service providers efficiently and securely.</p>
          <p><strong>2. User Responsibilities</strong></p>
          <p>You must provide accurate information during registration and keep your account details up to date.</p>
          <p><strong>3. Provider Obligations</strong></p>
          <p>Service providers are required to maintain a high level of professionalism and adhere to all local regulations.</p>
        </div>
      </div>
    </div>
  );
}
