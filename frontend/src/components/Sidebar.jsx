import { Link } from 'react-router-dom';
import { useSidebar } from '../context/SidebarContext';

export default function Sidebar() {
  const { isOpen, closeSidebar } = useSidebar();

  const menuItems = [
    { name: 'Личный кабинет', path: '/cabinet' },
    { name: 'Настройки', path: '/settings' },
    { name: 'Условия пользования', path: '/terms' },
    { name: 'Правила безопасности', path: '/security' },
    { name: 'Как начать работать', path: '/get-started' },
    { name: 'Для юр. лиц', path: '/for-business' },
    { name: 'Для физ. лиц', path: '/for-individuals' },
    { name: 'Контакты', path: '/contacts' },
    { name: 'Регистрация поставщика', path: '/provider-reg' },
  ];

  return (
    <>
      {/* Overlay */}
      <div 
        className={`fixed inset-0 bg-[#0f172a]/20 backdrop-blur-sm z-40 transition-all duration-500 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={closeSidebar}
      ></div>

      {/* Sidebar Panel */}
      <div 
        className={`fixed top-0 right-0 h-full w-[300px] bg-white/95 backdrop-blur-2xl z-50 rounded-l-[2.5rem] shadow-[-20px_0_40px_rgba(0,0,0,0.05),0_0_80px_rgba(91,108,249,0.08)] transform transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] py-10 px-8 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        } overflow-y-auto`}
      >
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-xl font-bold tracking-tight text-[#111827]">
            Меню
          </h2>
          <button 
            onClick={closeSidebar}
            className="p-2 rounded-full hover:bg-gray-100/80 active:scale-95 transition-all text-gray-500"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <nav className="flex flex-col gap-5">
          {menuItems.map((item, index) => (
            <Link 
              key={index} 
              to={item.path}
              onClick={closeSidebar}
              className="text-[15px] font-bold text-[#111827] hover:text-[#4f46e5] transition-colors tracking-wide drop-shadow-sm hover:drop-shadow-md flex items-center gap-3"
            >
              {item.name}
            </Link>
          ))}
          
          {/* Разделитель */}
          <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent my-2 opacity-50"></div>
          
          <div className="flex flex-col gap-3">
            <span className="text-xs uppercase tracking-widest font-extrabold text-gray-400 mb-2">Рабочие области</span>
            <div className="relative overflow-hidden rounded-[1.75rem] border border-gray-200 bg-white/70 p-4 shadow-sm">
              <div className="grid grid-cols-2 gap-2 opacity-45 blur-[2px] select-none pointer-events-none">
                <div className="bg-white/70 border border-gray-100 rounded-xl p-3 flex flex-col items-center justify-center gap-2">
                  <div className="p-2 bg-blue-50 text-blue-500 rounded-lg">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                  </div>
                  <span className="text-xs font-bold text-gray-700 text-center">Провайдер</span>
                </div>
                <div className="bg-white/70 border border-gray-100 rounded-xl p-3 flex flex-col items-center justify-center gap-2">
                  <div className="p-2 bg-purple-50 text-purple-500 rounded-lg">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-.553.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                  </div>
                  <span className="text-xs font-bold text-gray-700 text-center">Диспетчер</span>
                </div>
                <div className="bg-white/70 border border-gray-100 rounded-xl p-3 flex flex-col items-center justify-center gap-2">
                  <div className="p-2 bg-emerald-50 text-emerald-500 rounded-lg">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                  </div>
                  <span className="text-xs font-bold text-gray-700 text-center">Компания</span>
                </div>
                <div className="bg-white/70 border border-gray-100 rounded-xl p-3 flex flex-col items-center justify-center gap-2">
                  <div className="p-2 bg-red-50 text-red-500 rounded-lg">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                  </div>
                  <span className="text-xs font-bold text-gray-700 text-center">Админ</span>
                </div>
              </div>

              <div className="absolute inset-0 flex items-center justify-center px-4 text-center">
                <div className="max-w-[210px]">
                  <p className="text-[13px] font-bold text-gray-700">Доступ закрыт</p>
                  <p className="mt-1 text-[12px] leading-relaxed text-gray-600">Зарегестрируйтесь в качестве поставщика услуг, чтобы получить доступ</p>
                </div>
              </div>
            </div>
          </div>
        </nav>
      </div>
    </>
  );
}
