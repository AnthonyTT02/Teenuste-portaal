import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';

export function AuthPage() {
  const nav = useNavigate();
  const [login, setLogin] = useState({ username: '', password: '' });
<<<<<<< HEAD
  const [reg, setReg] = useState({ username: '', password: '', phone: '' });
  const [rememberMe, setRememberMe] = useState(false);
  const [loginErr, setLoginErr] = useState('');
  const [regErr, setRegErr] = useState('');
  const [isSignupOpen, setIsSignupOpen] = useState(false);
  const [isLoginBusy, setIsLoginBusy] = useState(false);
  const [isRegBusy, setIsRegBusy] = useState(false);

  async function signIn() {
    setLoginErr('');
    setIsLoginBusy(true);
=======
  const [company, setCompany] = useState({ username: '', password: '' });
  const [reg, setReg] = useState({ username: '', password: '', phone: '' });
  const [err, setErr] = useState('');

  async function userLogin() {
    setErr('');
>>>>>>> 6f3e1231dbbf21d9e9191af2350e9486e8609650
    try {
      const j = await api('/api/login', { method: 'POST', body: JSON.stringify(login) });
      localStorage.setItem('userId', String(j.userId));
      localStorage.setItem('username', login.username);
<<<<<<< HEAD
      localStorage.removeItem('providerId');
      localStorage.setItem('rememberMe', rememberMe ? '1' : '0');

      // Unified login: if account is company, route to company panel.
      if (j.role === 'company' || j.providerId) {
        localStorage.setItem('providerId', String(j.providerId || ''));
        nav('/company?providerId=' + encodeURIComponent(j.providerId || ''));
      } else {
        nav('/cabinet');
      }
    } catch (e) {
      // Backward compatibility for environments where company users still use separate endpoint.
      try {
        const j = await api('/api/company-login', { method: 'POST', body: JSON.stringify(login) });
        localStorage.setItem('userId', String(j.userId));
        localStorage.setItem('username', login.username);
        localStorage.setItem('providerId', String(j.providerId || ''));
        nav('/company?providerId=' + encodeURIComponent(j.providerId || ''));
      } catch (fallbackErr) {
        setLoginErr(fallbackErr.payload?.error || fallbackErr.message || e.payload?.error || e.message);
      }
    } finally {
      setIsLoginBusy(false);
=======
      nav('/cabinet');
    } catch (e) {
      setErr(e.payload?.error || e.message);
    }
  }

  async function companyLogin() {
    setErr('');
    try {
      const j = await api('/api/company-login', { method: 'POST', body: JSON.stringify(company) });
      localStorage.setItem('userId', String(j.userId));
      localStorage.setItem('providerId', String(j.providerId || ''));
      nav('/company?providerId=' + encodeURIComponent(j.providerId));
    } catch (e) {
      setErr(e.payload?.error || e.message);
>>>>>>> 6f3e1231dbbf21d9e9191af2350e9486e8609650
    }
  }

  async function register() {
<<<<<<< HEAD
    setRegErr('');
    setIsRegBusy(true);
=======
    setErr('');
>>>>>>> 6f3e1231dbbf21d9e9191af2350e9486e8609650
    try {
      await api('/api/register-user', { method: 'POST', body: JSON.stringify(reg) });
      alert('Аккаунт создан');
      setReg({ username: '', password: '', phone: '' });
<<<<<<< HEAD
      setIsSignupOpen(false);
    } catch (e) {
      setRegErr(e.payload?.error || e.message);
    } finally {
      setIsRegBusy(false);
=======
    } catch (e) {
      setErr(e.payload?.error || e.message);
>>>>>>> 6f3e1231dbbf21d9e9191af2350e9486e8609650
    }
  }

  return (
<<<<<<< HEAD
    <div className="auth-layout">
      <div className="auth-shell">
        <h1 className="auth-main-title">Welcome back</h1>
        <p className="auth-subtitle">Please enter your details</p>

        <form
          className="auth-form"
          onSubmit={(e) => {
            e.preventDefault();
            signIn();
          }}
        >
          <label className="auth-label" htmlFor="signin-username">Email address</label>
          <input
            id="signin-username"
            className="input auth-input"
            placeholder="Enter username"
            value={login.username}
            onChange={(e) => setLogin({ ...login, username: e.target.value })}
          />

          <label className="auth-label auth-label-spaced" htmlFor="signin-password">Password</label>
          <input
            id="signin-password"
            className="input auth-input"
            type="password"
            placeholder="Enter password"
            value={login.password}
            onChange={(e) => setLogin({ ...login, password: e.target.value })}
          />

          <div className="auth-options-row">
            <label className="auth-check">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <span>Remember for 30 days</span>
            </label>
            <button
              type="button"
              className="auth-link"
              onClick={() => setLoginErr('Восстановление пароля будет добавлено в следующем шаге.')}
            >
              Forgot password
            </button>
          </div>

          {loginErr ? <div className="error">{loginErr}</div> : null}

          <button className="btn-sos-primary auth-signin-btn mt-16" type="submit" disabled={isLoginBusy}>
            {isLoginBusy ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <button
          className="auth-google-btn mt-12"
          type="button"
          onClick={() => setLoginErr('Google sign-in пока не подключен.')}
        >
          <span className="auth-google-mark">G</span>
          <span>Sign in with Google</span>
        </button>

        <p className="auth-signup-note">
          Don't have an account?
          <button
            type="button"
            className="auth-link auth-signup-link"
            onClick={() => {
              setRegErr('');
              setIsSignupOpen(true);
            }}
          >
            Sign up
          </button>
        </p>
      </div>

      {isSignupOpen ? (
        <div className="auth-modal-backdrop" onClick={() => setIsSignupOpen(false)}>
          <div className="card auth-modal" onClick={(e) => e.stopPropagation()}>
            <h3 className="auth-modal-title">Create account</h3>

            <input
              className="input auth-modal-input mt-16"
              placeholder="Имя"
              value={reg.username}
              onChange={(e) => setReg({ ...reg, username: e.target.value })}
            />
            <input
              className="input auth-modal-input mt-12"
              type="password"
              placeholder="Пароль"
              value={reg.password}
              onChange={(e) => setReg({ ...reg, password: e.target.value })}
            />
            <input
              className="input auth-modal-input mt-12"
              placeholder="Телефон"
              value={reg.phone}
              onChange={(e) => setReg({ ...reg, phone: e.target.value })}
            />

            {regErr ? <div className="error">{regErr}</div> : null}

            <div className="inline-row mt-16 auth-modal-actions">
              <button className="btn-sos-secondary" type="button" onClick={() => setIsSignupOpen(false)}>
                Отмена
              </button>
              <button className="btn-sos-primary" type="button" onClick={register} disabled={isRegBusy}>
                {isRegBusy ? 'Сохраняем...' : 'Create account'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
=======
    <div style={{ padding: 20 }}>
      <h3>Вход</h3>
      <input className="input" placeholder="Имя" value={login.username} onChange={(e) => setLogin({ ...login, username: e.target.value })} />
      <input className="input mt-12" type="password" placeholder="Пароль" value={login.password} onChange={(e) => setLogin({ ...login, password: e.target.value })} />
      <button className="btn-sos-primary mt-12" onClick={userLogin}>Войти</button>

      <h3 className="mt-16">Регистрация</h3>
      <input className="input" placeholder="Имя" value={reg.username} onChange={(e) => setReg({ ...reg, username: e.target.value })} />
      <input className="input mt-12" type="password" placeholder="Пароль" value={reg.password} onChange={(e) => setReg({ ...reg, password: e.target.value })} />
      <input className="input mt-12" placeholder="Телефон" value={reg.phone} onChange={(e) => setReg({ ...reg, phone: e.target.value })} />
      <button className="btn-sos-primary mt-12" onClick={register}>Зарегистрироваться</button>

      <h3 className="mt-16">Вход компании</h3>
      <input className="input" placeholder="Логин" value={company.username} onChange={(e) => setCompany({ ...company, username: e.target.value })} />
      <input className="input mt-12" type="password" placeholder="Пароль" value={company.password} onChange={(e) => setCompany({ ...company, password: e.target.value })} />
      <button className="btn-sos-primary mt-12" onClick={companyLogin}>Войти как компания</button>

      {err ? <div className="error">{err}</div> : null}
>>>>>>> 6f3e1231dbbf21d9e9191af2350e9486e8609650
    </div>
  );
}
