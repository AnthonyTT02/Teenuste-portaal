import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';

export function AuthPage() {
  const nav = useNavigate();
  const [login, setLogin] = useState({ username: '', password: '' });
  const [company, setCompany] = useState({ username: '', password: '' });
  const [reg, setReg] = useState({ username: '', password: '', phone: '' });
  const [err, setErr] = useState('');

  async function userLogin() {
    setErr('');
    try {
      const j = await api('/api/login', { method: 'POST', body: JSON.stringify(login) });
      localStorage.setItem('userId', String(j.userId));
      localStorage.setItem('username', login.username);
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
    }
  }

  async function register() {
    setErr('');
    try {
      await api('/api/register-user', { method: 'POST', body: JSON.stringify(reg) });
      alert('Аккаунт создан');
      setReg({ username: '', password: '', phone: '' });
    } catch (e) {
      setErr(e.payload?.error || e.message);
    }
  }

  return (
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
    </div>
  );
}
