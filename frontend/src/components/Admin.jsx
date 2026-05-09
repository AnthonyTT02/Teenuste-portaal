import React from 'react';
import { useSidebar } from '../context/SidebarContext';

function Admin() {
  const { openSidebar } = useSidebar();
  return (
    <div className="w-full max-w-6xl animate-fade-in-up">
      <div className="backdrop-blur-xl bg-white/60 border border-white/40 shadow-2xl rounded-[2rem] p-10 mt-8 relative">
        <button 
          onClick={openSidebar}
          className="absolute -top-3 -right-3 p-3 rounded-full bg-white shadow-xl hover:bg-gray-50 transition-colors text-gray-600 border border-gray-100 z-20"
        >
          <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
        </button>

        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Admin Dashboard</h1>
            <p className="text-gray-500">System overview and management</p>
          </div>
          <button className="px-6 py-2 bg-red-500 text-white rounded-xl shadow-lg hover:bg-red-600 transition-colors">
            Logout
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {/* Stats Cards */}
          {['Total Users', 'Active Providers', 'Total Orders'].map((stat, i) => (
            <div key={i} className="bg-white/50 border border-white/60 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-gray-500 font-medium mb-1">{stat}</h3>
              <p className="text-3xl font-bold text-gray-800">
                {i === 0 ? '1,245' : i === 1 ? '84' : '3,892'}
              </p>
            </div>
          ))}
        </div>

        <div className="bg-white/70 border border-white/60 rounded-2xl p-6 shadow-inner">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Recent Users Breakdown</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="py-4 px-4 font-semibold text-gray-600">ID</th>
                  <th className="py-4 px-4 font-semibold text-gray-600">Name</th>
                  <th className="py-4 px-4 font-semibold text-gray-600">Role</th>
                  <th className="py-4 px-4 font-semibold text-gray-600">Status</th>
                  <th className="py-4 px-4 font-semibold text-gray-600">Action</th>
                </tr>
              </thead>
              <tbody>
                {[1, 2, 3].map((item) => (
                  <tr key={item} className="border-b border-gray-100/50 hover:bg-white/40 transition-colors">
                    <td className="py-4 px-4 text-gray-500">#{100 + item}</td>
                    <td className="py-4 px-4 font-medium text-gray-800">User Name {item}</td>
                    <td className="py-4 px-4 text-gray-600">{item === 1 ? 'Client' : 'Provider'}</td>
                    <td className="py-4 px-4">
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">Active</span>
                    </td>
                    <td className="py-4 px-4">
                      <button className="text-[#4f46e5] font-medium hover:underline">Edit</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Admin;