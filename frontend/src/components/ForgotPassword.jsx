import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api';
import LanguageSwitcher from './LanguageSwitcher';
import { useTranslation } from 'react-i18next';

export default function ForgotPassword() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [step, setStep] = useState(1);
  const [isFocused, setIsFocused] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleSendCode = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsSubmitting(true);
    try {
      const result = await api('/api/send-reset-code', {
        method: 'POST',
        body: JSON.stringify({ email: email.trim(), username: username.trim() })
      });

      if (result.ok) {
        setSuccess(t('reset_code_sent'));
        setStep(2);
      } else {
        setError(result.error || t('failed_send_code'));
      }
    } catch (err) {
      setError(err.payload?.error || err.message || t('failed_send_code'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsSubmitting(true);
    try {
      const result = await api('/api/reset-password', {
        method: 'POST',
        body: JSON.stringify({ email: email.trim(), username: username.trim(), code: code.trim(), newPassword })
      });

      if (result.ok) {
        setSuccess(t('password_changed'));
        setTimeout(() => {
          navigate('/');
        }, 2000);
      } else {
        setError(result.error || t('failed_reset_password'));
      }
    } catch (err) {
      setError(err.payload?.error || err.message || t('failed_reset_password'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="tp-page-card tp-page-card-hover max-w-md p-10">
      <div className="tp-page-card-shine"></div>
      
      <div className="relative z-10">
        <div className="flex justify-between items-center mb-10">
          <h1 className="tp-brand-title">
            Teenuste<span className="tp-brand-accent">Portaal</span>
          </h1>
          <LanguageSwitcher />
        </div>

        <div className="animate-float" style={{ animationDuration: '8s' }}>
          <h2 className="text-[2.75rem] leading-none font-extrabold text-[#111827] mb-3 tracking-tight">
            {t('reset_title_first')}{' '}
            <span className="tp-brand-accent drop-shadow-sm">{t('reset_title_second')}</span>
          </h2>
        </div>
        <p className="text-gray-500 mb-10 text-[15px] font-medium tracking-wide">
          {step === 1 ? t('reset_subtitle_step1') : t('reset_subtitle_step2')}
        </p>

        {step === 1 ? (
          <form onSubmit={handleSendCode} className="space-y-6">
            <div className="group/input relative">
              <label className={`tp-label ${isFocused === 'username' ? 'text-brand' : ''}`}>
                {t('username')}
              </label>
              <input
                type="text"
                required
                autoComplete="username"
                value={username}
                onFocus={() => setIsFocused('username')}
                onBlur={() => setIsFocused(null)}
                onChange={(e) => setUsername(e.target.value)}
                className="tp-input"
                placeholder={t('username')}
              />
            </div>

            <div className="group/input relative">
              <label className={`tp-label ${isFocused === 'email' ? 'text-brand' : ''}`}>
                {t('email_address')}
              </label>
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onFocus={() => setIsFocused('email')}
                onBlur={() => setIsFocused(null)}
                onChange={(e) => setEmail(e.target.value)}
                className="tp-input"
                placeholder={t('email_placeholder')}
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="group relative tp-btn-primary tp-btn-form mt-2 overflow-hidden hover:-translate-y-1 active:translate-y-0 active:shadow-inner ease-out"
            >
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-brand via-[#7482f6] to-brand opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <span className="relative z-10 tracking-wide">{isSubmitting ? t('sending') : t('send_reset_code')}</span>
            </button>
          </form>
        ) : (
          <form onSubmit={handleReset} className="space-y-6">
            <div className="group/input relative">
              <label className={`tp-label ${isFocused === 'code' ? 'text-brand' : ''}`}>
                {t('verification_code')}
              </label>
              <input
                type="text"
                required
                value={code}
                onFocus={() => setIsFocused('code')}
                onBlur={() => setIsFocused(null)}
                onChange={(e) => setCode(e.target.value)}
                className="tp-input tracking-widest text-center"
                placeholder="000000"
                maxLength={6}
              />
            </div>

            <div className="group/input relative">
              <label className={`tp-label ${isFocused === 'newPassword' ? 'text-brand' : ''}`}>
                {t('new_password')}
              </label>
              <input
                type="password"
                required
                value={newPassword}
                onFocus={() => setIsFocused('newPassword')}
                onBlur={() => setIsFocused(null)}
                onChange={(e) => setNewPassword(e.target.value)}
                className="tp-input"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="group relative tp-btn-primary tp-btn-form mt-2 overflow-hidden hover:-translate-y-1 active:translate-y-0 active:shadow-inner ease-out"
            >
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-brand via-[#7482f6] to-brand opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <span className="relative z-10 tracking-wide">{isSubmitting ? t('resetting') : t('reset_password')}</span>
            </button>
          </form>
        )}

        {error ? (
          <div className="tp-alert-error mt-6">
            {error}
          </div>
        ) : null}

        {success ? (
          <div className="tp-alert-success mt-6">
            {success}
          </div>
        ) : null}

        <p className="text-center mt-10 text-[14px] text-gray-500 font-semibold tracking-wide">
          {t('remembered_your_password')}{' '}
          <Link to="/" className="font-bold text-brand hover:text-brand-dark transition-colors drop-shadow-sm hover:drop-shadow-md">
            {t('sign_in')}
          </Link>
        </p>
      </div>
    </div>
  );
}
