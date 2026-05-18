import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';

export default function ModeratorLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isFocused, setIsFocused] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      const result = await api('/api/moderator-login', {
        method: 'POST',
        body: JSON.stringify({ username: username.trim(), password })
      });

      localStorage.setItem('userId', String(result.userId || ''));
      localStorage.setItem('username', username.trim());
      localStorage.setItem('userRole', 'moderator');
      navigate('/moderator');
    } catch (err) {
      setError(err.payload?.error || err.message || 'Login failed');
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
        </div>

        <div className="animate-float" style={{ animationDuration: '8s' }}>
          <h2 className="text-[2.75rem] leading-none font-extrabold text-[#111827] mb-3 tracking-tight">
            Moderator <span className="tp-brand-accent drop-shadow-sm">Panel</span>
          </h2>
        </div>
        <p className="text-gray-500 mb-10 text-[15px] font-medium tracking-wide">Moderator staff login</p>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="group/input relative">
            <label className={`tp-label ${isFocused === 'username' ? 'text-brand' : ''}`}>
              Username
            </label>
            <input
              type="text"
              required
              value={username}
              onFocus={() => setIsFocused('username')}
              onBlur={() => setIsFocused(null)}
              onChange={(e) => setUsername(e.target.value)}
              className="tp-input"
              placeholder="Username"
            />
          </div>

          <div className="group/input relative">
            <label className={`tp-label ${isFocused === 'password' ? 'text-brand' : ''}`}>
              Password
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

          <button
            type="submit"
            disabled={isSubmitting}
            className="group relative tp-btn-primary tp-btn-form mt-2 overflow-hidden hover:-translate-y-1 active:translate-y-0 active:shadow-inner ease-out"
          >
            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-brand via-[#7482f6] to-brand opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <span className="relative z-10 tracking-wide">{isSubmitting ? 'Signing in...' : 'Sign in'}</span>
          </button>

          {error ? (
            <div className="tp-alert-error">
              {error}
            </div>
          ) : null}
        </form>
      </div>
    </div>
  );
}
