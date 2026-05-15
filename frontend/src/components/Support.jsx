import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api } from '../api';
import LanguageSwitcher from './LanguageSwitcher';

function Support() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('open');

  useEffect(() => { fetchTickets(); }, []);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/support/tickets', { credentials: 'include' }).then(r => r.json());
      if (res.ok) setTickets(res.tickets || []);
      else setError(res.error || 'Failed to load tickets');
    } catch (e) { setError('Failed to load tickets'); }
    setLoading(false);
  };

  const resolveTicket = async (id) => {
    await fetch(`/api/support/tickets/${id}/resolve`, { method: 'PATCH', credentials: 'include' });
    setTickets(prev => prev.map(t => t.id === id ? { ...t, status: 'resolved' } : t));
  };

  const handleSignOut = () => {
    localStorage.clear();
    navigate('/');
  };

  const openTickets = tickets.filter(t => t.status === 'open');
  const resolvedTickets = tickets.filter(t => t.status === 'resolved');
  const displayTickets = tab === 'open' ? openTickets : resolvedTickets;

  return (
    <div className="w-full max-w-5xl animate-fade-in-up">
      <div className="backdrop-blur-xl bg-white/60 border border-white/40 shadow-2xl rounded-[2rem] p-10 mt-8 relative">

        <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#4f46e5] to-[#3b82f6] mb-2 tracking-tight">{t('support_dashboard', 'Support Dashboard')}</h1>
              <p className="text-gray-500 font-medium">{openTickets.length} {t('open', 'open')} · {resolvedTickets.length} {t('resolved', 'resolved')}</p>
            </div>
          <div className="flex gap-3 items-center">
            <LanguageSwitcher />
            <button onClick={handleSignOut} className="px-5 py-2.5 rounded-xl bg-gray-50 hover:bg-red-50 text-gray-600 hover:text-red-500 font-bold text-sm transition-colors border border-gray-200/60 hover:border-red-200">
              {t('sign_out', 'Sign Out')}
            </button>
          </div>
        </div>

        {error && <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm font-semibold">{error}</div>}

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {['open', 'resolved'].map(key => (
            <button key={key} onClick={() => setTab(key)} className={`px-5 py-2 rounded-xl font-bold text-sm transition-colors capitalize ${tab === key ? 'bg-brand text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {t(key, key)} ({key === 'open' ? openTickets.length : resolvedTickets.length})
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-400">{t('loading_tickets', 'Loading tickets...')}</div>
        ) : displayTickets.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg font-medium">{tab === 'open' ? t('no_open_tickets', 'No open tickets!') : t('no_resolved_tickets', 'No resolved tickets yet')}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {displayTickets.map(t => (
              <div key={t.id} className="bg-white/70 border border-white/60 rounded-2xl p-5 shadow-sm">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-bold text-gray-800">{t('ticket', 'Ticket')} #{t.id}</h3>
                    <p className="text-sm text-gray-500">{t('worker', 'Worker')}: <span className="font-semibold text-gray-700">{t.order?.worker_user ? `${t.order.worker_user.government_name} ${t.order.worker_user.government_surname}` : t('not_assigned', 'Not assigned')}</span> · {t('ticket', 'Ticket')} #{t.order_id}</p>
                    {t.user?.phone && <p className="text-xs text-gray-400">{t('customer_phone', 'Customer Phone')}: {t.user.phone}</p>}
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${t.status === 'open' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
                    {t(t.status, t.status)}
                  </span>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 mb-3">
                  <p className="text-sm text-gray-700">{t.message}</p>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-xs text-gray-400">{new Date(t.created_at).toLocaleString()}</p>
                  {t.status === 'open' && (
                    <button onClick={() => resolveTicket(t.id)} className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl text-sm transition-colors">
                      {t('resolve', 'Resolve')}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Support;
