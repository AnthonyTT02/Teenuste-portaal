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
    <div className="w-full max-w-md bg-white/80 backdrop-blur-xl border border-white/40 rounded-[2.5rem] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05),0_0_80px_rgba(91,108,249,0.08)] p-10 overflow-hidden relative transition-all duration-500 hover:shadow-[0_30px_60px_-15px_rgba(91,108,249,0.15)] group">

      <div className="absolute inset-0 bg-gradient-to-br from-white/60 to-transparent pointer-events-none opacity-50 rounded-[2.5rem]"></div>
      
      <div className="relative z-10">
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-2xl font-black tracking-tighter text-[#111827]">
            Teenuste<span className="text-transparent bg-clip-text bg-gradient-to-r from-brand to-brand-light">Portaal</span>
          </h1>
        </div>

        <div className="animate-float" style={{ animationDuration: '8s' }}>
          <h2 className="text-[2.75rem] leading-none font-extrabold text-[#111827] mb-3 tracking-tight">
            Moderator <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand to-brand-light drop-shadow-sm">Panel</span>
          </h2>
        </div>
        <p className="text-gray-500 mb-10 text-[15px] font-medium tracking-wide">Moderator staff login</p>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="group/input relative">
            <label className={`block text-[13px] font-bold tracking-wide mb-2 transition-colors duration-300 ${isFocused === 'username' ? 'text-brand' : 'text-gray-700'}`}>
              Username
            </label>
            <input
              type="text"
              required
              value={username}
              onFocus={() => setIsFocused('username')}
              onBlur={() => setIsFocused(null)}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-5 py-4 rounded-2xl bg-gray-50/50 border border-gray-200/60 focus:border-brand/40 focus:bg-white focus:ring-[4px] focus:ring-brand/15 transition-all duration-300 shadow-inner hover:bg-white text-gray-900 font-medium text-[15px]"
              placeholder="Username"
            />
          </div>

          <div className="group/input relative">
            <label className={`block text-[13px] font-bold tracking-wide mb-2 transition-colors duration-300 ${isFocused === 'password' ? 'text-brand' : 'text-gray-700'}`}>
              Password
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

          <button
            type="submit"
            disabled={isSubmitting}
            className="group relative w-full py-4 mt-2 overflow-hidden bg-brand rounded-2xl font-bold text-lg text-white shadow-[0_8px_20px_rgba(91,108,249,0.25)] hover:shadow-[0_15px_30px_rgba(91,108,249,0.4)] transform hover:-translate-y-1 active:scale-[0.97] active:translate-y-0 active:shadow-inner transition-all duration-300 ease-out"
          >
            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-brand via-[#7482f6] to-brand opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <span className="relative z-10 tracking-wide">{isSubmitting ? 'Signing in...' : 'Sign in'}</span>
          </button>

          {error ? (
            <div className="text-sm font-semibold text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              {error}
            </div>
          ) : null}
        </form>
      </div>
    </div>
  );
}
