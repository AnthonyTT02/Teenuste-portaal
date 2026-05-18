import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api';
import LanguageSwitcher from './LanguageSwitcher';
import { useTranslation } from 'react-i18next';

/**
 * Register Component
 * Handles a secure 2-step registration process:
 * 1. User details form (username, password, Estonian phone number, email).
 * 2. 6-digit email verification code check sent via Resend API.
 */
export default function Register() {
  const { t } = useTranslation();
  const [step, setStep] = useState(1); // 1=form, 2=verify
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [phoneDigits, setPhoneDigits] = useState('');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [isFocused, setIsFocused] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [weakPasswordWarningSeen, setWeakPasswordWarningSeen] = useState(false);
  const navigate = useNavigate();

  const formatEstonianPhone = (digits) => {
    const cleanDigits = String(digits || '').replace(/\D/g, '').slice(0, 8);
    const firstGroup = cleanDigits.slice(0, 4);
    const secondGroup = cleanDigits.slice(4, 8);
    if (!cleanDigits) return '+372 ';
    return `+372 ${firstGroup}${secondGroup ? ` ${secondGroup}` : ''}`;
  };

  const phoneValue = formatEstonianPhone(phoneDigits);

  const getPasswordStrength = (value) => {
    const score = [
      value.length >= 8,
      /[a-z]/.test(value),
      /[A-Z]/.test(value),
      /\d/.test(value),
      /[^A-Za-z0-9]/.test(value)
    ].filter(Boolean).length;
    if (value.length < 6) return { label: t('password_strength_very_weak'), color: 'text-red-600', bar: 'bg-red-500', width: 'w-[20%]' };
    if (score <= 2) return { label: t('password_strength_too_weak'), color: 'text-red-600', bar: 'bg-red-500', width: 'w-[30%]' };
    if (score === 3) return { label: t('password_strength_normal'), color: 'text-amber-600', bar: 'bg-amber-500', width: 'w-[55%]' };
    if (score === 4) return { label: t('password_strength_good'), color: 'text-emerald-600', bar: 'bg-emerald-500', width: 'w-[78%]' };
    return { label: t('password_strength_strong'), color: 'text-emerald-700', bar: 'bg-emerald-600', width: 'w-full' };
  };

  const passwordStrength = getPasswordStrength(password);
  const phoneIsComplete = phoneDigits.length === 8;

  const handleSendCode = async (e) => {
    e.preventDefault();
    setError('');
    if (phoneDigits.length !== 8) return setError(t('error_invalid_phone'));
    if (!email.includes('@') || !email.includes('.')) return setError(t('error_invalid_email'));
    if (password.length < 8 && !weakPasswordWarningSeen) { setWeakPasswordWarningSeen(true); return; }
    setIsSubmitting(true);
    try {
      await api('/api/register-user/send-code', {
        method: 'POST',
        body: JSON.stringify({ username: username.trim(), password, phone: phoneValue.trim(), email: email.trim() })
      });
      setStep(2);
    } catch (err) {
      setError(err.payload?.error || err.message || t('error_sending_failed'));
    } finally { setIsSubmitting(false); }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    if (!code.trim()) return setError(t('error_enter_code'));
    setIsSubmitting(true);
    try {
      await api('/api/register-user', { method: 'POST', body: JSON.stringify({ code: code.trim() }) });
      navigate('/');
    } catch (err) {
      setError(err.payload?.error || err.message || t('error_invalid_code'));
    } finally { setIsSubmitting(false); }
  };

  return (
    <div className="tp-page-card tp-page-card-hover max-w-md p-10">
      <div className="tp-page-card-shine"></div>
      <div className="relative z-10">
        <div className="flex justify-between items-center mb-8">
          <h1 className="tp-brand-title">
            Teenuste<span className="tp-brand-accent">Portaal</span>
          </h1>
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
          </div>
        </div>

        <div className="animate-float" style={{ animationDuration: '8s' }}>
          <h2 className="text-[2.75rem] leading-none font-extrabold text-[#111827] mb-3 tracking-tight">
            {step === 1 ? t('create_account') : t('verify')}
          </h2>
        </div>
        <p className="text-gray-500 mb-10 text-[15px] font-medium tracking-wide">
          {step === 1 ? t('enter_details') : t('enter_code')}
        </p>

        {step === 1 ? (
          <form onSubmit={handleSendCode} className="space-y-6" noValidate>
            <div className="group/input relative">
              <label className={`tp-label ${isFocused === 'user' ? 'text-brand' : ''}`}>{t('username')}</label>
              <input type="text" required autoComplete="username" value={username}
                onFocus={() => setIsFocused('user')} onBlur={() => setIsFocused(null)}
                onChange={(e) => setUsername(e.target.value)}
                className="tp-input"
                placeholder={t('username')} />
            </div>

            <div className="group/input relative">
              <label className={`tp-label ${isFocused === 'email' ? 'text-brand' : ''}`}>{t('email')}</label>
              <input type="email" required value={email}
                onFocus={() => setIsFocused('email')} onBlur={() => setIsFocused(null)}
                onChange={(e) => setEmail(e.target.value)}
                className="tp-input"
                placeholder="you@example.com" />
            </div>

            <div className="group/input relative">
              <label className={`tp-label ${isFocused === 'password' ? 'text-brand' : ''}`}>{t('password')}</label>
              <input type="password" required value={password}
                onFocus={() => setIsFocused('password')} onBlur={() => setIsFocused(null)}
                onChange={(e) => { setPassword(e.target.value); setWeakPasswordWarningSeen(false); if (error) setError(''); }}
                className="tp-input"
                placeholder="••••••••" />
              <div className="mt-3 space-y-2">
                <div className="flex items-center justify-between text-[13px] font-semibold">
                  <span className={passwordStrength.color}>{passwordStrength.label}</span>
                  <span className="text-gray-400">{t('password_min_8_chars')}</span>
                </div>
                <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-300 ${passwordStrength.bar} ${passwordStrength.width}`}></div>
                </div>
                {error ? (
                  <div className="tp-alert-error text-[12px] px-3 py-2">{error}</div>
                ) : weakPasswordWarningSeen && password.length < 8 ? (
                  <p className="tp-alert-warning text-[12px] px-3 py-2">
                    {t('password_too_weak_warning')}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="group/input relative">
              <label className={`tp-label ${isFocused === 'phone' ? 'text-brand' : ''}`}>{t('phone')}</label>
              <input type="text" required inputMode="numeric" autoComplete="tel"
                value={phoneValue}
                onFocus={() => setIsFocused('phone')} onBlur={() => setIsFocused(null)}
                onChange={(e) => { const digits = e.target.value.replace(/\D/g, '').replace(/^372/, '').slice(0, 8); setPhoneDigits(digits); }}
                className="tp-input"
                placeholder="+372 1234 5678" />
              <p className={`mt-3 text-[12px] font-medium leading-relaxed ${phoneIsComplete ? 'text-emerald-600' : 'text-gray-500'}`}>
                {t('phone_format_hint')}
              </p>
            </div>

            <button type="submit" disabled={isSubmitting}
              className="group relative tp-btn-primary tp-btn-form mt-2 overflow-hidden hover:-translate-y-1 active:translate-y-0 active:shadow-inner ease-out">
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-brand via-[#7482f6] to-brand opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <span className="relative z-10 tracking-wide">{isSubmitting ? t('loading') : t('send_code')}</span>
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerify} className="space-y-6">
            <div className="bg-brand/5 border border-brand/20 rounded-2xl p-4 text-center">
              <p className="text-sm text-gray-600">{t('code_sent_to')} <strong>{email}</strong></p>
              <p className="text-xs text-gray-400 mt-1">{t('valid_for_10_minutes')}</p>
            </div>
            <div className="group/input relative">
              <label className={`tp-label ${isFocused === 'code' ? 'text-brand' : ''}`}>{t('six_digit_code')}</label>
              <input type="text" required inputMode="numeric" maxLength={6} value={code}
                onFocus={() => setIsFocused('code')} onBlur={() => setIsFocused(null)}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="tp-input font-bold text-2xl text-center tracking-[0.5em]"
                placeholder="——————" />
              {error && <div className="tp-alert-error mt-2 text-[12px] px-3 py-2">{error}</div>}
            </div>
            <button type="submit" disabled={isSubmitting}
              className="group relative tp-btn-primary tp-btn-form overflow-hidden hover:-translate-y-1">
              <span className="relative z-10 tracking-wide">{isSubmitting ? t('loading') : t('confirm_code')}</span>
            </button>
            <button type="button" onClick={() => { setStep(1); setError(''); setCode(''); }}
              className="tp-btn-secondary w-full py-3 text-sm">
              {t('back_to_login')}
            </button>
          </form>
        )}

        <p className="text-center mt-10 text-[14px] text-gray-500 font-semibold tracking-wide">
          {t('have_account')}{' '}
          <Link to="/" className="font-bold text-brand hover:text-brand-dark transition-colors drop-shadow-sm hover:drop-shadow-md">{t('sign_in')}</Link>
        </p>
      </div>
    </div>
  );
}
