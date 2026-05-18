import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';

function AdminLogin() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      const result = await api('/api/admin-login', {
        method: 'POST',
        body: JSON.stringify({ username: username.trim(), password })
      });
      localStorage.setItem('userId', String(result.userId || ''));
      navigate('/admin');
    } catch (err) {
      setError(err.payload?.error || err.message || 'Admin login failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md animate-fade-in-up">
      <div className="backdrop-blur-xl bg-white/60 border border-white/40 shadow-2xl rounded-[2rem] p-10 relative overflow-hidden">
        {/* Декоративный блик внутри карточки */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#4f46e5] to-transparent opacity-50"></div>
        
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600 mb-3 tracking-tight">Admin System</h1>
          <p className="text-gray-500 font-medium">Restricted access area</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700 ml-1">Admin Username</label>
            <input 
              type="text" 
              autoComplete="username"
              className="w-full px-5 py-4 bg-white/50 border border-white/50 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#4f46e5]/20 transition-all duration-300 backdrop-blur-sm shadow-inner text-gray-800 placeholder-gray-400"
              placeholder="admin"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700 ml-1">Password</label>
            <input 
              type="password" 
              className="w-full px-5 py-4 bg-white/50 border border-white/50 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#4f46e5]/20 transition-all duration-300 backdrop-blur-sm shadow-inner text-gray-800 placeholder-gray-400"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full bg-[#1e293b] text-white font-bold py-4 rounded-2xl shadow-xl hover:shadow-2xl hover:bg-black hover:-translate-y-1 transition-all duration-300 mt-4"
          >
            {isSubmitting ? 'Authenticating...' : 'Authenticate'}
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

export default AdminLogin;
