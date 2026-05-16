import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import { useSidebar } from '../context/SidebarContext';
import { useTranslation } from 'react-i18next';

export default function Settings() {
  const { t } = useTranslation();
  const { openSidebar } = useSidebar();
  const navigate = useNavigate();
  const userId = localStorage.getItem('userId');
  const [user, setUser] = useState(null);
  const [editingUsername, setEditingUsername] = useState(false);
  const [usernameDraft, setUsernameDraft] = useState('');
  const [usernameSaving, setUsernameSaving] = useState(false);
  const [usernameError, setUsernameError] = useState('');

  useEffect(() => {
    if (!userId) { navigate('/'); return; }
    api(`/api/user/${userId}`)
      .then(res => setUser(res.user))
      .catch(err => console.error(err));
  }, [userId]);

  const handleSignOut = () => { localStorage.clear(); navigate('/'); };

  const startUsernameEdit = () => {
    setUsernameDraft(user?.username || '');
    setUsernameError('');
    setEditingUsername(true);
  };

  const cancelUsernameEdit = () => {
    setUsernameDraft(user?.username || '');
    setUsernameError('');
    setEditingUsername(false);
  };

  const saveUsername = async (e) => {
    e.preventDefault();
    const nextUsername = usernameDraft.trim();

    if (!nextUsername) {
      setUsernameError(t('username_required', { defaultValue: 'Username is required' }));
      return;
    }

    if (nextUsername === user?.username) {
      setEditingUsername(false);
      setUsernameError('');
      return;
    }

    setUsernameSaving(true);
    setUsernameError('');

    try {
      const res = await api(`/api/user/${userId}`, {
        method: 'PUT',
        body: JSON.stringify({ username: nextUsername })
      });
      setUser(res.user || { ...user, username: nextUsername });
      setEditingUsername(false);
    } catch (err) {
      const message = err.payload?.error || err.message || 'Failed to update username';
      setUsernameError(message === 'Username already taken'
        ? t('username_taken', { defaultValue: 'Username already taken' })
        : message);
    } finally {
      setUsernameSaving(false);
    }
  };

  return (
    <div className="w-full max-w-2xl bg-white/80 backdrop-blur-xl border border-white/40 rounded-[2.5rem] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05),0_0_80px_rgba(91,108,249,0.08)] p-8 md:p-12 overflow-hidden relative transition-all duration-500 hover:shadow-[0_30px_60px_-15px_rgba(91,108,249,0.15)] group animate-fade-in-up">
      <div className="absolute inset-0 bg-gradient-to-br from-white/60 to-transparent pointer-events-none opacity-50 rounded-[2.5rem]"></div>

      <div className="relative z-10">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-black tracking-tighter text-[#111827]">
            Teenuste<span className="text-transparent bg-clip-text bg-gradient-to-r from-brand to-brand-light">Portaal</span>
          </h1>
          <div className="flex gap-2">
            <button onClick={handleSignOut} className="px-4 py-2 rounded-xl bg-gray-50 hover:bg-red-50 text-gray-600 hover:text-red-500 font-bold text-[13px] transition-colors border border-gray-200/60">{t('sign_out')}</button>
            <button
              type="button"
              onClick={openSidebar}
              className="p-2.5 rounded-full hover:bg-gray-100/80 active:scale-95 transition-all duration-300 text-gray-500 hover:text-gray-900 shadow-sm border border-transparent hover:border-gray-200/50"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>

        <h2 className="text-3xl font-extrabold text-[#111827] mb-6 tracking-tight">
          {t('menu_settings')}
        </h2>

        <div className="space-y-4">
          <div className="bg-white/60 border border-gray-100 rounded-3xl p-5 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-gray-900">{t('favorites')}</h3>
                <p className="text-sm text-gray-500 mt-2 whitespace-pre-line">{t('empty_favorites')}</p>
              </div>
              <div className="flex items-start">
                <button className="ml-3 px-3 py-2 rounded-xl bg-gray-100 text-gray-700 text-sm font-semibold">+</button>
              </div>
            </div>
          </div>

          <div className="bg-white/60 border border-gray-100 rounded-3xl p-5 shadow-sm">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold text-gray-900">{t('payment_method')}</h3>
              <button onClick={() => navigate('/payment-methods')} className="text-sm text-brand font-semibold">{t('edit')}</button>
            </div>
            <p className="text-sm text-gray-500 mb-3">{t('bolt_balance')}: <span className="font-bold text-gray-800">0,00 EUR</span></p>
            <div className="flex flex-col gap-2">
              <button onClick={() => navigate('/payment-methods')} className="text-left px-3 py-2 rounded-xl bg-gray-100 text-gray-700">+ {t('add_payment_method')}</button>
            </div>
          </div>

          <div className="bg-white/60 border border-gray-100 rounded-3xl p-5 shadow-sm">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold text-gray-900">{t('profile')}</h3>
            </div>
            <div className="space-y-3">
              <div>
                {editingUsername ? (
                  <form onSubmit={saveUsername} className="space-y-3">
                    <div>
                      <label className="text-xs text-gray-400 uppercase font-semibold" htmlFor="settings-username">
                        {t('username')}
                      </label>
                      <input
                        id="settings-username"
                        type="text"
                        value={usernameDraft}
                        onChange={(e) => {
                          setUsernameDraft(e.target.value);
                          setUsernameError('');
                        }}
                        className="mt-1 w-full px-3 py-2 rounded-xl bg-white border border-gray-200 text-sm font-medium text-gray-800 outline-none focus:border-brand focus:ring-4 focus:ring-brand/10"
                        autoComplete="username"
                        disabled={usernameSaving}
                        autoFocus
                      />
                    </div>
                    {usernameError && (
                      <p className="text-xs font-semibold text-red-500">{usernameError}</p>
                    )}
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        disabled={usernameSaving}
                        className="px-4 py-2 rounded-xl bg-brand text-white text-sm font-bold disabled:opacity-60"
                      >
                        {usernameSaving ? t('saving', { defaultValue: 'Saving...' }) : t('save')}
                      </button>
                      <button
                        type="button"
                        onClick={cancelUsernameEdit}
                        disabled={usernameSaving}
                        className="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 text-sm font-bold disabled:opacity-60"
                      >
                        {t('cancel', { defaultValue: 'Cancel' })}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-xs text-gray-400 uppercase">{t('username')}</p>
                      <p className="font-medium text-gray-700">{user?.username}</p>
                    </div>
                    <button
                      type="button"
                      onClick={startUsernameEdit}
                      className="text-sm text-brand font-semibold"
                    >
                      {t('edit')}
                    </button>
                  </div>
                )}
              </div>
              {user?.phone && (
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-xs text-gray-400 uppercase">{t('phone')}</p>
                    <p className="font-medium text-gray-700">{user.phone}</p>
                  </div>
                </div>
              )}
              {user?.email && (
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-xs text-gray-400 uppercase">{t('email')}</p>
                    <p className="font-medium text-gray-700">{user.email}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
          </div>
        </div>
      </div>
  );
}
