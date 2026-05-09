import { useNavigate } from 'react-router-dom';
import { useSidebar } from '../context/SidebarContext';

export default function Cabinet() {
  const navigate = useNavigate();
  const { openSidebar } = useSidebar();

  return (
    <div className="w-full max-w-lg bg-white/80 backdrop-blur-xl border border-white/40 rounded-[2.5rem] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05),0_0_80px_rgba(91,108,249,0.08)] p-8 overflow-hidden relative transition-all duration-500 hover:shadow-[0_30px_60px_-15px_rgba(91,108,249,0.15)] group animate-fade-in-up">
      <div className="absolute inset-0 bg-gradient-to-br from-white/60 to-transparent pointer-events-none opacity-50 rounded-[2.5rem]"></div>
      
      <div className="relative z-10">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-black tracking-tighter text-[#111827]">
            Teenuste<span className="text-transparent bg-clip-text bg-gradient-to-r from-brand to-brand-light">Portaal</span>
          </h1>
          <div className="flex gap-2">
            <button 
              onClick={() => navigate('/')}
              className="px-4 py-2 rounded-xl bg-gray-50 hover:bg-red-50 text-gray-600 hover:text-red-500 font-bold text-[13px] transition-colors border border-gray-200/60 hover:border-red-200"
            >
              Sign Out
            </button>
            <button 
              onClick={openSidebar}
              className="p-2.5 rounded-full bg-brand/10 hover:bg-brand/20 active:scale-95 transition-all duration-300 text-brand shadow-sm border border-transparent"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>

        {/* Title */}
        <h2 className="text-3xl font-extrabold text-[#111827] mb-6 tracking-tight">
          Personal <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand to-brand-light">Cabinet</span>
        </h2>

        {/* Profile Card */}
        <div className="bg-white/60 border border-gray-100 rounded-3xl p-5 mb-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-brand/10 text-brand flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-[17px]">Profile</h3>
                <p className="text-sm text-gray-500 font-medium">user@example.com</p>
              </div>
            </div>
            <button className="p-2 text-gray-400 hover:text-brand bg-gray-50 hover:bg-brand/10 rounded-xl transition-colors">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L21 7"></path>
              </svg>
            </button>
          </div>
        </div>

        {/* Active Orders Card */}
        <div className="bg-white/60 border border-gray-100 rounded-3xl p-5 mb-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="8" cy="21" r="2"></circle>
                  <circle cx="20" cy="21" r="2"></circle>
                  <path d="M 5 9 H 4 c -1.1 0 -2 -0.9 -2 -2 V 5 c 0 -1.1 0.9 -2 2 -2 h 4 l 0 13 a 2 2 0 0 0 2 1.61 h 11 a 2 2 0 0 0 2 -1.61 L 23 6 H 5"></path>
                </svg>
              </div>
              <h3 className="font-bold text-gray-900 text-[17px]">Active Orders</h3>
            </div>
          </div>
          <p className="text-sm font-medium text-gray-500">No active orders right now.</p>
        </div>

         {/* Call to action */}
         <button
          onClick={() => navigate('/request-assistance')}
            className="group relative w-full py-4 mt-4 overflow-hidden bg-brand rounded-2xl font-bold text-[17px] text-white shadow-[0_8px_20px_rgba(91,108,249,0.25)] hover:shadow-[0_15px_30px_rgba(91,108,249,0.4)] transform hover:-translate-y-1 active:scale-[0.97] transition-all duration-300 ease-out flex items-center justify-center gap-2"
          >
            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-brand via-[#7482f6] to-brand opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <svg className="relative z-10" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14M5 12h14"></path>
            </svg>
            <span className="relative z-10 tracking-wide">Request Assistance</span>
          </button>

      </div>
    </div>
  );
}
