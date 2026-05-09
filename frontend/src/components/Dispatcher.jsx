import React from 'react';
import { useSidebar } from '../context/SidebarContext';

function Dispatcher() {
  const { openSidebar } = useSidebar();

  return (
    <div className="w-full max-w-7xl h-[85vh] animate-fade-in-up flex gap-6 mt-6 p-4 relative">
      <button 
        onClick={openSidebar}
        className="absolute top-0 right-0 p-3 rounded-full bg-white shadow-xl hover:bg-gray-50 transition-colors text-gray-600 border border-gray-100 z-50"
      >
        <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
      </button>

      {/* Sidebar / Orders List */}
      <div className="w-1/3 backdrop-blur-xl bg-white/60 border border-white/40 shadow-2xl rounded-[2rem] p-6 flex flex-col h-full">
        <h2 className="text-2xl font-extrabold text-gray-900 mb-6 tracking-tight">Active Orders</h2>
        
        <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
          {[1, 2, 3, 4, 5].map((order) => (
            <div key={order} className="bg-white/80 border border-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer border-l-4 border-l-yellow-400">
              <div className="flex justify-between items-start mb-2">
                <span className="font-bold text-gray-800">Order #{1000 + order}</span>
                <span className="text-xs font-semibold px-2 py-1 bg-yellow-100 text-yellow-700 rounded-lg">Pending</span>
              </div>
              <p className="text-sm text-gray-600 mb-1 font-medium">Tire Replacement - Tallinn 4</p>
              <div className="flex justify-between items-center mt-3">
                <span className="text-xs text-gray-400">2 mins ago</span>
                <button className="text-xs bg-[#4f46e5] text-white px-3 py-1.5 rounded-lg hover:bg-[#4338ca] transition-colors">
                  Assign
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Map / Dispatch Area */}
      <div className="w-2/3 backdrop-blur-xl bg-white/60 border border-white/40 shadow-2xl rounded-[2rem] p-4 flex flex-col relative overflow-hidden">
        <div className="absolute top-8 left-8 z-10 bg-white/80 backdrop-blur-md px-6 py-3 rounded-2xl shadow-lg border border-white/50">
          <h3 className="font-bold text-gray-800">Live Map Hub</h3>
          <p className="text-xs text-gray-500">2 Providers Online</p>
        </div>
        
        {/* Placeholder Map Area */}
        <div className="flex-1 w-full bg-blue-50/50 rounded-2xl overflow-hidden border border-white/50 relative flex items-center justify-center">
          <div className="text-center">
            <svg className="w-16 h-16 text-blue-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"></path></svg>
            <p className="text-gray-400 font-medium">Map Integration Layer (Google Maps / Leaflet)</p>
          </div>
          
          {/* Fake Markers */}
          <div className="absolute top-1/3 left-1/4 w-4 h-4 bg-[#4f46e5] rounded-full shadow-[0_0_15px_rgba(79,70,229,0.8)] animate-pulse"></div>
          <div className="absolute bottom-1/3 right-1/4 w-4 h-4 bg-green-500 rounded-full shadow-[0_0_15px_rgba(34,197,94,0.8)] animate-pulse"></div>
        </div>
      </div>
    </div>
  );
}

export default Dispatcher;