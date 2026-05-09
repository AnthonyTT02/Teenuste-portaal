import React, { useState } from 'react';
import { useSidebar } from '../context/SidebarContext';

function Provider() {
  const [status, setStatus] = useState('offline');
  const { openSidebar } = useSidebar();

  return (
    <div className="w-full max-w-lg animate-fade-in-up mt-8 relative">
      <button 
        onClick={openSidebar}
        className="absolute -top-4 -right-4 p-3 rounded-full bg-white shadow-xl hover:bg-gray-50 transition-colors text-gray-600 border border-gray-100 z-50"
      >
        <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
      </button>

      <div className="backdrop-blur-xl bg-white/60 border border-white/40 shadow-2xl rounded-[2rem] p-6 text-center">
        
        {/* Status Toggle Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="text-left">
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Provider Hub</h1>
            <p className="text-sm font-medium text-gray-500">John Master</p>
          </div>
          <div className="flex items-center gap-3 bg-white/50 px-4 py-2 rounded-xl shadow-inner border border-white">
            <span className={`w-3 h-3 rounded-full ${status === 'online' ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.6)]' : 'bg-gray-400'}`}></span>
            <span className="font-bold text-gray-700">{status === 'online' ? 'Online' : 'Offline'}</span>
            <div 
              onClick={() => setStatus(status === 'online' ? 'offline' : 'online')}
              className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors duration-300 flex items-center ${status === 'online' ? 'bg-green-500' : 'bg-gray-300'}`}
            >
              <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-300 ${status === 'online' ? 'translate-x-6' : 'translate-x-0'}`}></div>
            </div>
          </div>
        </div>

        {/* Current / Incoming Order (Demo) */}
        {status === 'online' ? (
          <div className="bg-gradient-to-br from-white to-gray-50 border border-white shadow-lg rounded-3xl p-6 relative overflow-hidden animate-pulse-slow">
            <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-400/10 rounded-full filter blur-xl"></div>
            <h2 className="text-lg font-bold text-gray-800 mb-1">New Order Nearby!</h2>
            <p className="text-sm text-gray-500 mb-6">Battery Jump Start • 2.5 km away</p>
            
            <div className="space-y-3">
              <button className="w-full bg-[#4f46e5] text-white font-bold py-4 rounded-2xl shadow-lg hover:shadow-xl hover:bg-[#4338ca] hover:-translate-y-0.5 transition-all">
                Accept Job
              </button>
              <button className="w-full bg-white text-gray-700 font-bold py-4 rounded-2xl shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors">
                Decline
              </button>
            </div>
          </div>
        ) : (
          <div className="py-12 px-6 bg-white/40 rounded-3xl border border-white border-dashed text-gray-400">
            <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg>
            <p className="font-medium">You are currently offline.</p>
            <p className="text-sm">Go online to start receiving orders.</p>
          </div>
        )}

      </div>
    </div>
  );
}

export default Provider;