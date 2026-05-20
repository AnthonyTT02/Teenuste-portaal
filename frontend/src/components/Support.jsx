// frontend/src/components/Support.jsx defines a React UI component and documents the state, handlers, and render flow used by this screen.
// Imports React because this file renders JSX components.
import React, { useState, useEffect } from 'react';
// Imports React hooks used to manage component state and lifecycle behavior.
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
// Imports the shared API client functions used to communicate with the backend.
import { api } from '../api';
// Imports ./LanguageSwitcher so this file can use its exported functionality.
import LanguageSwitcher from './LanguageSwitcher';

// Support renders the support screen and connects its UI behavior.
function Support() {
  // The translation hook provides localized labels and lets the component react to language changes.
  const { t } = useTranslation();
  // This navigation helper redirects the user after successful actions or role-based decisions.
  const navigate = useNavigate();
  // Stores the tickets value so the UI can update when it changes.
  const [tickets, setTickets] = useState([]);
  // Stores the loading value so the UI can update when it changes.
  const [loading, setLoading] = useState(true);
  // Stores the error value so the UI can update when it changes.
  const [error, setError] = useState('');
  // Stores the tab value so the UI can update when it changes.
  const [tab, setTab] = useState('open');

  // useEffect keeps this component behavior synchronized with its dependencies.
  useEffect(() => { fetchTickets(); }, []);

  // fetchTickets loads the required data and returns it to the caller.
  const fetchTickets = async () => {
    // The try block wraps operations that may fail, such as API requests or browser storage updates.
    try {
      setLoading(true);
      const res = await fetch('/api/support/tickets', { credentials: 'include' }).then(r => r.json());
      if (res.ok) setTickets(res.tickets || []);
      else setError(res.error || 'Failed to load tickets');
    } catch (e) { setError('Failed to load tickets'); }
    setLoading(false);
  };

  // resolveTicket contains reusable logic for this file.
  const resolveTicket = async (id) => {
    await fetch(`/api/support/tickets/${id}/resolve`, { method: 'PATCH', credentials: 'include' });
    setTickets(prev => prev.map(t => t.id === id ? { ...t, status: 'resolved' } : t));
  };

  // handleSignOut handles the related user action and updates the component state or API data.
  const handleSignOut = () => {
    localStorage.clear();
    navigate('/');
  };

  const openTickets = tickets.filter(t => t.status === 'open');
  const resolvedTickets = tickets.filter(t => t.status === 'resolved');
  const displayTickets = tab === 'open' ? openTickets : resolvedTickets;

  // Renders the JSX markup for this component.
  return (
    <div className="w-full max-w-5xl">
      {/* This container groups related UI elements and keeps the layout consistent. */}
      <div className="tp-page-card p-5 sm:p-8 mt-4 sm:mt-8">
        {/* This container groups related UI elements and keeps the layout consistent. */}

        <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-start mb-8">
          {/* This container groups related UI elements and keeps the layout consistent. */}
          <div className="min-w-0">
            {/* This container groups related UI elements and keeps the layout consistent. */}
            <h1 className="text-[36px] sm:text-4xl leading-tight font-extrabold text-gray-900 mb-1 break-words">{t('support_dashboard', 'Support Dashboard')}</h1>
            <p className="text-gray-500 leading-relaxed">{openTickets.length} {t('open', 'open')} - {resolvedTickets.length} {t('resolved', 'resolved')}</p>
            </div>
          <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:justify-end">
            {/* This container groups related UI elements and keeps the layout consistent. */}
            <LanguageSwitcher className="shrink-0" />
            {/* This button triggers the main action for this part of the screen. */}
            <button onClick={handleSignOut} className="tp-btn-ghost-danger tp-btn-md ml-auto sm:ml-0 shrink-0">
              {t('sign_out', 'Sign Out')}
            </button>
          </div>
        </div>

        {error && <div className="tp-alert-error mb-6">{error}</div>}

        {/* Tabs */}
        <div className="grid grid-cols-2 gap-2 mb-6 sm:flex">
          {/* This container groups related UI elements and keeps the layout consistent. */}
          {['open', 'resolved'].map(key => (
            <button key={key} onClick={() => setTab(key)} className={`tp-tab ${tab === key ? 'tp-tab-active' : ''}`}>
              {t(key, key)} ({key === 'open' ? openTickets.length : resolvedTickets.length})
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-400">{t('loading_tickets', 'Loading tickets...')}</div>
        ) : displayTickets.length === 0 ? (
          <div className="text-center py-16">
            {/* This container groups related UI elements and keeps the layout consistent. */}
            <p className="text-gray-500 text-lg font-medium">{tab === 'open' ? t('no_open_tickets', 'No open tickets!') : t('no_resolved_tickets', 'No resolved tickets yet')}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {/* This container groups related UI elements and keeps the layout consistent. */}
            {displayTickets.map(ticket => (
              <div key={ticket.id} className="bg-white/70 border border-white/60 rounded-2xl p-4 sm:p-5 shadow-sm">
                {/* This container groups related UI elements and keeps the layout consistent. */}
                <div className="flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-start mb-3">
                  {/* This container groups related UI elements and keeps the layout consistent. */}
                  <div className="min-w-0">
                    {/* This container groups related UI elements and keeps the layout consistent. */}
                    <h3 className="font-bold text-gray-800 break-words">{t('ticket', 'Ticket')} #{ticket.id}</h3>
                    <p className="text-sm text-gray-500 break-words">{t('worker', 'Worker')}: <span className="font-semibold text-gray-700">{ticket.order?.worker_user ? `${ticket.order.worker_user.government_name} ${ticket.order.worker_user.government_surname}` : t('not_assigned', 'Not assigned')}</span> - {t('ticket', 'Ticket')} #{ticket.order_id}</p>
                    {ticket.user?.phone && <p className="text-xs text-gray-400 break-words">{t('customer_phone', 'Customer Phone')}: {ticket.user.phone}</p>}
                  </div>
                  <span className={`self-start shrink-0 px-2 py-0.5 rounded-full text-xs font-bold ${ticket.status === 'open' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
                    {t(ticket.status, ticket.status)}
                  </span>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 mb-3">
                  {/* This container groups related UI elements and keeps the layout consistent. */}
                  <p className="text-sm text-gray-700 break-words">{ticket.message}</p>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center">
                  {/* This container groups related UI elements and keeps the layout consistent. */}
                  <p className="text-xs text-gray-400 break-words">{new Date(ticket.created_at).toLocaleString()}</p>
                  {ticket.status === 'open' && (
                    <button onClick={() => resolveTicket(ticket.id)} className="tp-btn-success tp-btn-sm w-full sm:w-auto">
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
