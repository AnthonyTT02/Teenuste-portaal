// frontend/src/components/GetStarted.jsx defines a React UI component and documents the state, handlers, and render flow used by this screen.
// Imports React because this file renders JSX components.
import React from 'react';
// Imports ../context/SidebarContext so this file can use its exported functionality.
import { useSidebar } from '../context/SidebarContext';

// GetStarted renders the get started screen and connects its UI behavior.
export default function GetStarted() {
  const { openSidebar } = useSidebar();

  // Renders the JSX markup for this component.
  return (
    <div className="tp-page-card max-w-3xl p-8 md:p-12">
      {/* This container groups related UI elements and keeps the layout consistent. */}
      <div className="tp-page-card-shine"></div>
      
      <div className="relative z-10">
        {/* This container groups related UI elements and keeps the layout consistent. */}
        <div className="flex justify-between items-center mb-8">
          {/* This container groups related UI elements and keeps the layout consistent. */}
          <h1 className="tp-brand-title">
            Teenuste<span className="tp-brand-accent">Portaal</span>
          </h1>
          {/* This button triggers the main action for this part of the screen. */}
          <button onClick={openSidebar} className="tp-icon-btn">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>
        </div>

        <h2 className="text-3xl font-extrabold text-[#111827] mb-6 tracking-tight">How to Become a Worker</h2>
        
        <div className="grid grid-cols-1 gap-4">
          {/* This container groups related UI elements and keeps the layout consistent. */}
          {[1, 2, 3].map(step => (
            <div key={step} className="tp-panel flex items-center gap-4">
              {/* This container groups related UI elements and keeps the layout consistent. */}
              <div className="w-10 h-10 rounded-xl bg-brand text-white font-bold flex items-center justify-center shrink-0">{step}</div>
              <div>
                {/* This container groups related UI elements and keeps the layout consistent. */}
                <h3 className="font-bold text-gray-900">Step {step}</h3>
                <p className="text-sm text-gray-500">
                  {step === 1 && "Make your account"}
                  {step === 2 && "Make an application through a 'Become a worker' button"}
                  {step === 3 && "Go to Worker Dashboard and youre free to go!"}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
