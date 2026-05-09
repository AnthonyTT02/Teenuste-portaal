import React from 'react';
import { useSidebar } from '../context/SidebarContext';

function Company() {
  const { openSidebar } = useSidebar();

  return (
    <div className="w-full max-w-5xl animate-fade-in-up">
      <div className="backdrop-blur-xl bg-white/60 border border-white/40 shadow-2xl rounded-[2rem] p-10 mt-8 relative">
        <button 
          onClick={openSidebar}
          className="absolute -top-3 -right-3 p-3 rounded-full bg-white shadow-xl hover:bg-gray-50 transition-colors text-gray-600 border border-gray-100 z-20"
        >
          <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
        </button>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#4f46e5] to-[#3b82f6] mb-2 tracking-tight">
              Company Portal
            </h1>
            <p className="text-gray-500 font-medium">Manage your employees, fleet, and invoices</p>
          </div>
          <button className="bg-gradient-to-r from-[#4f46e5] to-[#3b82f6] text-white font-bold py-3 px-8 rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all">
            + Add Employee
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white/50 border border-white/60 rounded-3xl p-8 shadow-sm hover:shadow-md transition-shadow">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
              <svg className="w-6 h-6 text-[#4f46e5]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
              Employees
            </h2>
            <ul className="space-y-4">
              {[1, 2, 3].map((e) => (
                <li key={e} className="flex justify-between items-center p-4 bg-white/60 rounded-2xl shadow-sm">
                  <div>
                    <p className="font-semibold text-gray-800">John Doe {e}</p>
                    <p className="text-sm text-gray-500">Driver • john{e}@company.com</p>
                  </div>
                  <button className="text-sm text-red-500 hover:text-red-700 font-medium">Remove</button>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white/50 border border-white/60 rounded-3xl p-8 shadow-sm hover:shadow-md transition-shadow">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
              <svg className="w-6 h-6 text-[#4f46e5]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"></path></svg>
              Fleet & Vehicles
            </h2>
            <ul className="space-y-4">
              {[1, 2].map((v) => (
                <li key={v} className="flex justify-between items-center p-4 bg-white/60 rounded-2xl shadow-sm">
                  <div>
                    <p className="font-semibold text-gray-800">Volvo FH16</p>
                    <p className="text-sm text-gray-500">Reg: 123 ABC</p>
                  </div>
                  <button className="text-sm text-[#4f46e5] hover:text-[#3b82f6] font-medium">Edit</button>
                </li>
              ))}
              <li className="flex justify-center items-center p-4 border-2 border-dashed border-gray-300 rounded-2xl hover:border-[#4f46e5] hover:bg-[#4f46e5]/5 transition-colors cursor-pointer">
                <span className="font-semibold text-gray-500 hover:text-[#4f46e5]">+ Add Vehicle</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Company;