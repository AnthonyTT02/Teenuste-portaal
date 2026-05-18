import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api';
import LanguageSwitcher from './LanguageSwitcher';
import { useTranslation } from 'react-i18next';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isFocused, setIsFocused] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
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
    <div className="tp-page-card tp-page-card-hover max-w-md p-10">

      {/* Soft glass shine */}
      <div className="tp-page-card-shine"></div>
      
      <div className="relative z-10">
        {/* Header */}
        <div className="flex justify-between items-center mb-10">
          <h1 className="tp-brand-title">
            Teenuste<span className="tp-brand-accent">Portaal</span>
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
            <label className={`tp-label ${isFocused === 'email' ? 'text-brand' : ''}`}>
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
              className="tp-input"
              placeholder={t('username')}
            />
          </div>

          <div className="group/input relative">
            <label className={`tp-label ${isFocused === 'password' ? 'text-brand' : ''}`}>
              {t('password')}
            </label>
            <input
              type="password"
              required
              value={password}
              onFocus={() => setIsFocused('password')}
              onBlur={() => setIsFocused(null)}
              onChange={(e) => setPassword(e.target.value)}
              className="tp-input"
              placeholder="••••••••"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center group/check cursor-pointer">
              <div className="relative flex items-center justify-center">
                <input
                  id="remember"
                  type="checkbox"
                  className="tp-checkbox-custom peer"
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
            className="group relative tp-btn-primary tp-btn-form mt-2 overflow-hidden hover:-translate-y-1 active:translate-y-0 active:shadow-inner ease-out"
          >
            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-brand via-[#7482f6] to-brand opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <span className="relative z-10 tracking-wide">{isSubmitting ? t('loading') : t('sign_in')}</span>
          </button>

          {error ? (
            <div className="tp-alert-error">
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
