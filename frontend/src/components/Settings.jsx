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
    <div className="tp-page-card tp-page-card-hover max-w-2xl p-8 md:p-12">
      <div className="tp-page-card-shine"></div>

      <div className="relative z-10">
        <div className="flex justify-between items-center mb-8">
          <h1 className="tp-brand-title">
            Teenuste<span className="tp-brand-accent">Portaal</span>
          </h1>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={openSidebar}
              className="tp-icon-btn"
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
          <div className="tp-panel">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold text-gray-900">{t('profile')}</h3>
            </div>
            <div className="space-y-3">
              <div>
                {editingUsername ? (
                  <form onSubmit={saveUsername} className="space-y-3">
                    <div>
                      <label className="tp-label-sm uppercase text-gray-400" htmlFor="settings-username">
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
                        className="tp-input-compact mt-1"
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
                        className="tp-btn-primary tp-btn-sm"
                      >
                        {usernameSaving ? t('saving', { defaultValue: 'Saving...' }) : t('save')}
                      </button>
                      <button
                        type="button"
                        onClick={cancelUsernameEdit}
                        disabled={usernameSaving}
                        className="tp-btn-secondary tp-btn-sm"
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
                      className="tp-text-link"
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
