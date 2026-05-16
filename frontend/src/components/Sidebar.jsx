import { Link } from 'react-router-dom';
import { useSidebar } from '../context/SidebarContext';
import { useTranslation } from 'react-i18next';

export default function Sidebar() {
  const { t } = useTranslation();
  const { isOpen, closeSidebar } = useSidebar();
  const userStatus = localStorage.getItem('userStatus');
  const isWorker = userStatus === 'worker' || localStorage.getItem('userRole') === 'worker' || localStorage.getItem('is_worker') === '1';

  const menuItems = [
    { name: t('cabinet'), path: '/cabinet' },
    ...(isWorker ? [{ name: t('go_to_work'), path: '/provider' }] : []),
    { name: t('menu_settings'), path: '/settings' },
    { name: t('terms'), path: '/terms' },
    { name: t('security'), path: '/security' },
    { name: t('get_started'), path: '/get-started' },
    { name: t('for_individuals'), path: '/for-individuals' },
    { name: t('contacts'), path: '/contacts' },
  ];

  return (
    <>
      <div 
        className={`fixed inset-0 bg-[#0f172a]/20 backdrop-blur-sm z-40 transition-all duration-500 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={closeSidebar}
      ></div>

      <div 
        className={`fixed top-0 right-0 h-full w-[300px] bg-white/95 backdrop-blur-2xl z-50 rounded-l-[2.5rem] shadow-[-20px_0_40px_rgba(0,0,0,0.05),0_0_80px_rgba(91,108,249,0.08)] transform transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] py-10 px-8 flex flex-col ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        } overflow-y-auto`}
      >
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-xl font-bold tracking-tight text-[#111827]">
            {t('menu')}
          </h2>
          <button 
            onClick={closeSidebar}
            className="p-2 rounded-full hover:bg-gray-100/80 active:scale-95 transition-all text-gray-500"
            aria-label="Закрыть меню"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <nav className="flex flex-col gap-5 flex-1">
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
        </nav>
      </div>
    </>
  );
}
