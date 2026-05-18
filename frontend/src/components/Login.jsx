import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api';
import { useSidebar } from '../context/SidebarContext';
import LanguageSwitcher from './LanguageSwitcher';
import { useTranslation } from 'react-i18next';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isFocused, setIsFocused] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { openSidebar } = useSidebar();
  const { i18n, t } = useTranslation();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      const result = await api('/api/login', {
        method: 'POST',
        body: JSON.stringify({ username: username.trim(), password })
      });

      const status = result.status || result.role || 'user';
      localStorage.setItem('userId', String(result.userId || ''));
      localStorage.setItem('username', result.username || username.trim());
      localStorage.setItem('userRole', status);
      localStorage.setItem('userStatus', status);
      localStorage.setItem('is_worker', result.is_worker ? '1' : '0');
      if (result.phone) localStorage.setItem('userPhone', result.phone);
      else localStorage.removeItem('userPhone');
      if (result.email) localStorage.setItem('userEmail', result.email);
      else localStorage.removeItem('userEmail');
      if (result.language) {
        i18n.changeLanguage(result.language);
        localStorage.setItem('i18nextLng', result.language);
      }

      // Navigation based on user status
      if (status === 'admin') {
        navigate('/admin');
      } else if (status === 'moderator') {
        navigate('/moderator');
      } else if (status === 'support') {
        navigate('/support');
      } else {
        // All regular users (including workers) go to cabinet
        navigate('/cabinet');
      }
    } catch (err) {
      setError(err.payload?.error || err.message || 'Login failed');
    } finally {
      setIsSubmitting(false);
    }
  };



  return (
    <div className="w-full max-w-md bg-white/80 backdrop-blur-xl border border-white/40 rounded-[2.5rem] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05),0_0_80px_rgba(91,108,249,0.08)] p-10 overflow-hidden relative transition-all duration-500 hover:shadow-[0_30px_60px_-15px_rgba(91,108,249,0.15)] group">

      {/* Легкий блик (эффект стекла) */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/60 to-transparent pointer-events-none opacity-50 rounded-[2.5rem]"></div>
      
      <div className="relative z-10">
        {/* Header */}
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-2xl font-black tracking-tighter text-[#111827]">
            Teenuste<span className="text-transparent bg-clip-text bg-gradient-to-r from-brand to-brand-light">Portaal</span>
          </h1>
          <LanguageSwitcher />
        </div>

        {/* Greeting */}
        <div className="animate-float" style={{ animationDuration: '8s' }}>
          <h2 className="text-[2.75rem] leading-none font-extrabold text-[#111827] mb-3 tracking-tight">
            {t('welcome_back')}
          </h2>
        </div>
        <p className="text-gray-500 mb-10 text-[15px] font-medium tracking-wide">{t('enter_details')}</p>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-6">
          <div className="group/input relative">
            <label className={`block text-[13px] font-bold tracking-wide mb-2 transition-colors duration-300 ${isFocused === 'email' ? 'text-brand' : 'text-gray-700'}`}>
              {t('username')}
            </label>
            <input
              type="text"
              required
              autoComplete="username"
              value={username}
              onFocus={() => setIsFocused('email')}
              onBlur={() => setIsFocused(null)}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-5 py-4 rounded-2xl bg-gray-50/50 border border-gray-200/60 focus:border-brand/40 focus:bg-white focus:ring-[4px] focus:ring-brand/15 transition-all duration-300 shadow-inner hover:bg-white text-gray-900 font-medium text-[15px]"
              placeholder={t('username')}
            />
          </div>

          <div className="group/input relative">
            <label className={`block text-[13px] font-bold tracking-wide mb-2 transition-colors duration-300 ${isFocused === 'password' ? 'text-brand' : 'text-gray-700'}`}>
              {t('password')}
            </label>
            <input
              type="password"
              required
              value={password}
              onFocus={() => setIsFocused('password')}
              onBlur={() => setIsFocused(null)}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-5 py-4 rounded-2xl bg-gray-50/50 border border-gray-200/60 focus:border-brand/40 focus:bg-white focus:ring-[4px] focus:ring-brand/15 transition-all duration-300 shadow-inner hover:bg-white text-gray-900 font-medium text-[15px]"
              placeholder="••••••••"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center group/check cursor-pointer">
              <div className="relative flex items-center justify-center">
                <input
                  id="remember"
                  type="checkbox"
                  className="peer w-5 h-5 appearance-none border-[1.5px] border-gray-300 rounded-lg checked:bg-brand checked:border-brand transition-all duration-300 focus:ring-4 focus:ring-brand/20 cursor-pointer hover:border-brand"
                />
                <svg className="absolute w-3.5 h-3.5 text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity duration-300 scale-50 peer-checked:scale-100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
              <label htmlFor="remember" className="ml-3 text-[14px] font-semibold text-gray-600 cursor-pointer group-hover/check:text-gray-900 transition-colors">
                {t('remember_me')}
              </label>
            </div>
            <Link to="/forgot-password" className="text-[14px] font-bold text-brand hover:text-brand-dark transition-colors drop-shadow-sm hover:drop-shadow-md">
              {t('forgot_password')}
            </Link>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="group relative w-full py-4 mt-2 overflow-hidden bg-brand rounded-2xl font-bold text-lg text-white shadow-[0_8px_20px_rgba(91,108,249,0.25)] hover:shadow-[0_15px_30px_rgba(91,108,249,0.4)] transform hover:-translate-y-1 active:scale-[0.97] active:translate-y-0 active:shadow-inner transition-all duration-300 ease-out"
          >
            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-brand via-[#7482f6] to-brand opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <span className="relative z-10 tracking-wide">{isSubmitting ? t('loading') : t('sign_in')}</span>
          </button>

          {error ? (
            <div className="text-sm font-semibold text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              {error}
            </div>
          ) : null}
        </form>

        <p className="text-center mt-10 text-[14px] text-gray-500 font-semibold tracking-wide">
          {t('no_account')}{' '}
          <Link to="/register" className="font-bold text-brand hover:text-brand-dark transition-colors drop-shadow-sm hover:drop-shadow-md">
            {t('sign_up')}
          </Link>
        </p>
      </div>
    </div>
  );
}
