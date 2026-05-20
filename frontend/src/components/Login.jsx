// frontend/src/components/Login.jsx defines a React UI component and documents the state, handlers, and render flow used by this screen.
// Imports React hooks used to manage component state and lifecycle behavior.
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
// Imports the shared API client functions used to communicate with the backend.
import { api } from '../api';
// Imports ./LanguageSwitcher so this file can use its exported functionality.
import LanguageSwitcher from './LanguageSwitcher';
// Imports React hooks used to manage component state and lifecycle behavior.
import { useTranslation } from 'react-i18next';

/**
 * Login Component
 * Handles user credentials authentication (username, password).
 * On success, caches session details in localStorage (userId, role, status, phone, email)
 * and redirects the user to their corresponding role-based landing dashboard.
 */
// Login renders the page component and keeps its UI behavior in one place.
export default function Login() {
  // Stores the username value so the UI can update when it changes.
  const [username, setUsername] = useState('');
  // Stores the password value so the UI can update when it changes.
  const [password, setPassword] = useState('');
  // Stores the isFocused value so the UI can update when it changes.
  const [isFocused, setIsFocused] = useState(null);
  // Stores the isSubmitting value so the UI can update when it changes.
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Stores the error value so the UI can update when it changes.
  const [error, setError] = useState('');
  // This navigation helper redirects the user after successful actions or role-based decisions.
  const navigate = useNavigate();
  // The translation hook provides localized labels and lets the component react to language changes.
  const { i18n, t } = useTranslation();

  // handleLogin handles the related user action and updates the component state or API data.
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    // The try block wraps operations that may fail, such as API requests or browser storage updates.
    try {
      // This API call sends data to the backend or retrieves data needed by the component.
      const result = await api('/api/login', {
        method: 'POST',
        body: JSON.stringify({ username: username.trim(), password })
      });

      const status = result.status || result.role || 'user';
      // This value is saved in localStorage so the session or preference survives page reloads.
      localStorage.setItem('userId', String(result.userId || ''));
      // This value is saved in localStorage so the session or preference survives page reloads.
      localStorage.setItem('username', result.username || username.trim());
      // This value is saved in localStorage so the session or preference survives page reloads.
      localStorage.setItem('userRole', status);
      // This value is saved in localStorage so the session or preference survives page reloads.
      localStorage.setItem('userStatus', status);
      // This value is saved in localStorage so the session or preference survives page reloads.
      localStorage.setItem('is_worker', result.is_worker ? '1' : '0');
      // This value is saved in localStorage so the session or preference survives page reloads.
      if (result.phone) localStorage.setItem('userPhone', result.phone);
      // This removes outdated session data so the browser does not keep stale user information.
      else localStorage.removeItem('userPhone');
      // This value is saved in localStorage so the session or preference survives page reloads.
      if (result.email) localStorage.setItem('userEmail', result.email);
      // This removes outdated session data so the browser does not keep stale user information.
      else localStorage.removeItem('userEmail');
      if (result.language) {
        i18n.changeLanguage(result.language);
        // This value is saved in localStorage so the session or preference survives page reloads.
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



  // Renders the JSX markup for this component.
  return (
    <div className="tp-page-card tp-page-card-hover max-w-md p-10">
      {/* This container groups related UI elements and keeps the layout consistent. */}

      {/* Soft glass shine */}
      <div className="tp-page-card-shine"></div>
      
      <div className="relative z-10">
        {/* Header */}
        <div className="flex justify-between items-center mb-10">
          {/* This container groups related UI elements and keeps the layout consistent. */}
          <h1 className="tp-brand-title">
            Teenuste<span className="tp-brand-accent">Portaal</span>
          </h1>
          <LanguageSwitcher />
        </div>

        {/* Greeting */}
        <div className="animate-float" style={{ animationDuration: '8s' }}>
          {/* This container groups related UI elements and keeps the layout consistent. */}
          <h2 className="text-[2.75rem] leading-none font-extrabold text-[#111827] mb-3 tracking-tight">
            {t('welcome_back')}
          </h2>
        </div>
        <p className="text-gray-500 mb-10 text-[15px] font-medium tracking-wide">{t('enter_details')}</p>

        {/* Form */}
        {/* The form collects user input and submits it through the component handler. */}
        <form onSubmit={handleLogin} className="space-y-6">
          {/* This form groups related fields and connects the submit button to the matching handler. */}
          <div className="group/input relative">
            {/* This container groups related UI elements and keeps the layout consistent. */}
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
            {/* This container groups related UI elements and keeps the layout consistent. */}
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
            {/* This container groups related UI elements and keeps the layout consistent. */}
            <div className="flex items-center group/check cursor-pointer">
              {/* This container groups related UI elements and keeps the layout consistent. */}
              <div className="relative flex items-center justify-center">
                {/* This container groups related UI elements and keeps the layout consistent. */}
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
              {/* This container groups related UI elements and keeps the layout consistent. */}
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
