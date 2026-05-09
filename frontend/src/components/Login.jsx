import { useGoogleLogin } from '@react-oauth/google';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api';
import { useSidebar } from '../context/SidebarContext';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isFocused, setIsFocused] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { openSidebar } = useSidebar();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      const result = await api('/api/login', {
        method: 'POST',
        body: JSON.stringify({ username: username.trim(), password })
      });

      localStorage.setItem('userId', String(result.userId || ''));
      localStorage.setItem('username', username.trim());

      if (result.providerId) {
        localStorage.setItem('providerId', String(result.providerId));
        navigate('/company');
        return;
      }

      localStorage.removeItem('providerId');
      navigate('/cabinet');
    } catch (err) {
      setError(err.payload?.error || err.message || 'Login failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Хук для вызова окна Google авторизации
  const loginWithGoogle = useGoogleLogin({
    onSuccess: (codeResponse) => {
      console.log('Google login successful:', codeResponse);
      // Здесь код Response можно отправить на ваш бэкенд (Node.js) для верификации и создания сессии
      navigate('/cabinet');
    },
    onError: (error) => {
      console.error('Google Login Failed:', error);
    }
  });

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
          <button 
            type="button"
            onClick={openSidebar}
            className="p-2.5 rounded-full hover:bg-gray-100/80 active:scale-95 transition-all duration-300 text-gray-500 hover:text-gray-900 shadow-sm border border-transparent hover:border-gray-200/50"
          >
            {/* Иконка бургера с 3 полосками */}
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* Greeting */}
        <div className="animate-float" style={{ animationDuration: '8s' }}>
          <h2 className="text-[2.75rem] leading-none font-extrabold text-[#111827] mb-3 tracking-tight">
            Welcome <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand to-brand-light drop-shadow-sm">back</span>
          </h2>
        </div>
        <p className="text-gray-500 mb-10 text-[15px] font-medium tracking-wide">Please enter your details</p>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-6">
          <div className="group/input relative">
            <label className={`block text-[13px] font-bold tracking-wide mb-2 transition-colors duration-300 ${isFocused === 'email' ? 'text-brand' : 'text-gray-700'}`}>
              Username
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
                Remember for 30 days
              </label>
            </div>
            <a href="#" className="text-[14px] font-bold text-brand hover:text-brand-dark transition-colors drop-shadow-sm hover:drop-shadow-md">
              Forgot password
            </a>
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

          <button
            type="button"
            onClick={() => loginWithGoogle()}
            className="w-full py-4 bg-white/80 border-[1.5px] border-gray-100 hover:border-gray-200 hover:bg-gray-50/80 rounded-2xl font-bold text-[15px] text-gray-700 flex items-center justify-center gap-3 transform hover:-translate-y-1 hover:shadow-[0_10px_20px_rgba(0,0,0,0.04)] active:scale-[0.97] active:translate-y-0 active:shadow-none transition-all duration-300 ease-out backdrop-blur-sm"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="transition-transform duration-300 group-hover:scale-110">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Sign in with Google
          </button>
        </form>

        <p className="text-center mt-10 text-[14px] text-gray-500 font-semibold tracking-wide">
          Don't have an account?{' '}
          <Link to="/register" className="font-bold text-brand hover:text-brand-dark transition-colors drop-shadow-sm hover:drop-shadow-md">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
