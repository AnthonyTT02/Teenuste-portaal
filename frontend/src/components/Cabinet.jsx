// frontend/src/components/Cabinet.jsx defines a React UI component and documents the state, handlers, and render flow used by this screen.
// Imports React hooks used to manage component state and lifecycle behavior.
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
// Imports the shared API client functions used to communicate with the backend.
import { api } from '../api';
// Imports ../context/SidebarContext so this file can use its exported functionality.
import { useSidebar } from '../context/SidebarContext';
// Imports ./LanguageSwitcher so this file can use its exported functionality.
import LanguageSwitcher from './LanguageSwitcher';
// Imports React hooks used to manage component state and lifecycle behavior.
import { useTranslation } from 'react-i18next';

/**
 * Cabinet Component
 * The central Customer Dashboard. Enables regular users to:
 * 1. Request roadside assistance (using Leaflet maps to drop location pins).
 * 2. Select professional services, input vehicle details, and calculate prices.
 * 3. Track active & completed emergency requests with assigned workers.
 * 4. Manage favorite towing/assistance providers.
 */
// Cabinet renders the page component and keeps its UI behavior in one place.
export default function Cabinet() {
  // The translation hook provides localized labels and lets the component react to language changes.
  const { t } = useTranslation();
  // This navigation helper redirects the user after successful actions or role-based decisions.
  const navigate = useNavigate();
  const { openSidebar } = useSidebar();
  // This value is read from localStorage to restore existing session or preference data.
  const userId = localStorage.getItem('userId');
  // This value is read from localStorage to restore existing session or preference data.
  const userStatus = localStorage.getItem('userStatus');
  // This value is read from localStorage to restore existing session or preference data.
  const isWorkerLocal = userStatus === 'worker' || localStorage.getItem('userRole') === 'worker' || localStorage.getItem('is_worker') === '1';
  const storedUser = {
    id: userId ? Number(userId) : null,
    // This value is read from localStorage to restore existing session or preference data.
    username: localStorage.getItem('username') || '',
    // This value is read from localStorage to restore existing session or preference data.
    email: localStorage.getItem('userEmail') || '',
    // This value is read from localStorage to restore existing session or preference data.
    phone: localStorage.getItem('userPhone') || '',
    status: userStatus || 'user',
    // This value is read from localStorage to restore existing session or preference data.
    is_worker: localStorage.getItem('is_worker') === '1' ? 1 : 0
  };

  // Stores the user value so the UI can update when it changes.
  const [user, setUser] = useState(storedUser);
  // Stores the activeOrders value so the UI can update when it changes.
  const [activeOrders, setActiveOrders] = useState([]);
  // Stores the completedOrders value so the UI can update when it changes.
  const [completedOrders, setCompletedOrders] = useState([]);
  // Stores the loading value so the UI can update when it changes.
  const [loading, setLoading] = useState(true);
  // Stores the showWorkerPopup value so the UI can update when it changes.
  const [showWorkerPopup, setShowWorkerPopup] = useState(false);
  // Stores the ticketModal value so the UI can update when it changes.
  const [ticketModal, setTicketModal] = useState(null);
  // Stores the ticketMsg value so the UI can update when it changes.
  const [ticketMsg, setTicketMsg] = useState('');
  // Stores the ticketSent value so the UI can update when it changes.
  const [ticketSent, setTicketSent] = useState(false);
  // Stores the ticketSentOrders value so the UI can update when it changes.
  const [ticketSentOrders, setTicketSentOrders] = useState(new Set());
  // Stores the services value so the UI can update when it changes.
  const [services, setServices] = useState([]);
  // Stores the tab value so the UI can update when it changes.
  const [tab, setTab] = useState('active');
  // Stores the hasPendingApp value so the UI can update when it changes.
  const [hasPendingApp, setHasPendingApp] = useState(false);
  // Stores the photoUploading value so the UI can update when it changes.
  const [photoUploading, setPhotoUploading] = useState(false);
  // Stores the photoError value so the UI can update when it changes.
  const [photoError, setPhotoError] = useState('');
  // Stores the ticketStatusByOrder value so the UI can update when it changes.
  const [ticketStatusByOrder, setTicketStatusByOrder] = useState({});
  const profilePhoto = user?.profile_photo;
  const profileStatus = user?.status || userStatus || 'user';

  // useEffect keeps this component behavior synchronized with its dependencies.
  useEffect(() => {
    if (!userId) { navigate('/'); return; }
    // This value is read from localStorage to restore existing session or preference data.
    const newWorker = localStorage.getItem('newWorker');
    // This removes outdated session data so the browser does not keep stale user information.
    if (newWorker === 'true') { setShowWorkerPopup(true); localStorage.removeItem('newWorker'); }
    fetchData();
  }, [userId]);

  // fetchData loads the required data and returns it to the caller.
  const fetchData = async () => {
    // The try block wraps operations that may fail, such as API requests or browser storage updates.
    try {
      setLoading(true);
      const [userRes, svcRes, activeRes, completedRes, appRes] = await Promise.allSettled([
        api(`/api/user/${userId}`),
        api('/api/services'),
        api(`/api/user/${userId}/orders/active`),
        api(`/api/user/${userId}/orders/completed`),
        api(`/api/worker/application-status/${userId}`)
      ]);

      [userRes, svcRes, activeRes, completedRes, appRes].forEach(result => {
        if (result.status === 'rejected') console.error(result.reason);
      });

      if (userRes.status === 'fulfilled' && userRes.value.user) {
        const nextUser = userRes.value.user;
        setUser(nextUser);
        // This value is saved in localStorage so the session or preference survives page reloads.
        if (nextUser.username) localStorage.setItem('username', nextUser.username);
        // This value is saved in localStorage so the session or preference survives page reloads.
        if (nextUser.email) localStorage.setItem('userEmail', nextUser.email);
        // This value is saved in localStorage so the session or preference survives page reloads.
        if (nextUser.phone) localStorage.setItem('userPhone', nextUser.phone);
        if (nextUser.status) {
          // This value is saved in localStorage so the session or preference survives page reloads.
          localStorage.setItem('userStatus', nextUser.status);
          // This value is saved in localStorage so the session or preference survives page reloads.
          localStorage.setItem('userRole', nextUser.status);
        }
        // This value is saved in localStorage so the session or preference survives page reloads.
        localStorage.setItem('is_worker', nextUser.is_worker ? '1' : '0');
      }

      setServices(svcRes.status === 'fulfilled' ? (svcRes.value.services || []) : []);
      setActiveOrders(activeRes.status === 'fulfilled' ? (activeRes.value.orders || []) : []);
      setCompletedOrders(completedRes.status === 'fulfilled' ? (completedRes.value.orders || []) : []);
      setHasPendingApp(appRes.status === 'fulfilled' ? (appRes.value.hasPending || false) : false);
      // Pre-check which orders already have tickets
      const completedOrdersData = completedRes.status === 'fulfilled' ? (completedRes.value.orders || []) : [];
      const sentSet = new Set();
      const statusMap = {};
      await Promise.all(completedOrdersData.map(async (o) => {
        // The try block wraps operations that may fail, such as API requests or browser storage updates.
        try {
          // This API call sends data to the backend or retrieves data needed by the component.
          const r = await api(`/api/support/tickets/check?userId=${userId}&orderId=${o.id}`);
          if (r.exists) {
            sentSet.add(o.id);
            statusMap[o.id] = r.status || 'open';
          }
        } catch {}
      }));
      setTicketSentOrders(sentSet);
      setTicketStatusByOrder(statusMap);
    } catch (e) { console.error(e); }
    // The finally block restores loading state after the action finishes, no matter whether it passed or failed.
    finally { setLoading(false); }
  };

  // handleSignOut handles the related user action and updates the component state or API data.
  const handleSignOut = () => { localStorage.clear(); navigate('/'); };

  // handlePhotoChange handles the related user action and updates the component state or API data.
  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    setPhotoError('');
    if (!file.type.startsWith('image/')) {
      setPhotoError('Please select an image file.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setPhotoError('Photo size must be less than 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const photo = event.target.result;
      setPhotoUploading(true);
      // The try block wraps operations that may fail, such as API requests or browser storage updates.
      try {
        // This API call sends data to the backend or retrieves data needed by the component.
        await api(`/api/user/${userId}/photo`, {
          method: 'PUT',
          body: JSON.stringify({ photo })
        });
        setUser(prev => ({ ...prev, profile_photo: photo }));
      } catch (err) {
        setPhotoError(err.payload?.error || err.message || 'Photo upload failed.');
      } finally {
        setPhotoUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // completeOrder contains reusable logic for this file.
  const completeOrder = async (orderId) => {
    // This API call sends data to the backend or retrieves data needed by the component.
    await api(`/api/order/${orderId}/complete`, { method: 'POST' });
    fetchData();
  };

  // sendTicket contains reusable logic for this file.
  const sendTicket = async () => {
    if (!ticketMsg.trim()) return;
    // The try block wraps operations that may fail, such as API requests or browser storage updates.
    try {
      // This API call sends data to the backend or retrieves data needed by the component.
      const result = await api('/api/support/tickets', { method: 'POST', body: JSON.stringify({ userId, orderId: ticketModal, message: ticketMsg }) });
      setTicketSent(true);
      setTicketSentOrders(prev => new Set([...prev, ticketModal]));
      setTicketStatusByOrder(prev => ({ ...prev, [ticketModal]: result.status || 'open' }));
      setTimeout(() => { setTicketModal(null); setTicketMsg(''); setTicketSent(false); }, 2000);
    } catch (err) {
      if (err.payload?.alreadyExists) {
        setTicketSentOrders(prev => new Set([...prev, ticketModal]));
        setTicketStatusByOrder(prev => ({ ...prev, [ticketModal]: err.payload.status || 'open' }));
        setTicketModal(null);
      }
    }
  };

  // getServiceNames loads the required data and returns it to the caller.
  const getServiceNames = (servicesJson) => {
    // The try block wraps operations that may fail, such as API requests or browser storage updates.
    try {
      const ids = JSON.parse(servicesJson || '[]');
      return ids.map(id => services.find(s => s.id === Number(id))?.name || `#${id}`).join(', ');
    } catch { return '—'; }
  };

  if (!userId) return null;

  // Renders the JSX markup for this component.
  return (
    <div className="tp-page-card max-w-2xl p-5 sm:p-8">
      {/* This container groups related UI elements and keeps the layout consistent. */}
      <div className="tp-page-card-shine" />

      {showWorkerPopup && (
        <div className="tp-modal-backdrop">
          {/* This container groups related UI elements and keeps the layout consistent. */}
          <div className="tp-modal max-w-sm p-10 text-center">
            {/* This container groups related UI elements and keeps the layout consistent. */}
            <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Congratulations!</h2>
            <p className="text-gray-500 mb-6">You became a worker! You can now accept orders.</p>
            {/* This button triggers the main action for this part of the screen. */}
            <button onClick={() => setShowWorkerPopup(false)} className="tp-btn-primary w-full py-3">Let's go!</button>
          </div>
        </div>
      )}

      {ticketModal && (
        <div className="tp-modal-backdrop">
          {/* This container groups related UI elements and keeps the layout consistent. */}
          <div className="tp-modal max-w-sm p-8">
            {/* This container groups related UI elements and keeps the layout consistent. */}
            <h2 className="text-xl font-extrabold text-gray-900 mb-4">Contact Support</h2>
            {ticketSent ? (
              <p className="text-green-600 font-bold text-center py-4">Ticket sent!</p>
            ) : (
              <>
                {/* This textarea collects longer user-written text for the request. */}
                <textarea value={ticketMsg} onChange={e => setTicketMsg(e.target.value)} rows={4}
                  className="tp-textarea mb-4"
                  placeholder="Describe your problem..." />
                <div className="flex gap-3">
                  {/* This button triggers the main action for this part of the screen. */}
                  <button onClick={() => setTicketModal(null)} className="tp-btn-secondary flex-1 py-3">Cancel</button>
                  {/* This button triggers the main action for this part of the screen. */}
                  <button onClick={sendTicket} className="tp-btn-primary flex-1 py-3">Send</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <div className="relative z-10">
        {/* This container groups related UI elements and keeps the layout consistent. */}
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-start mb-5">
          {/* This container groups related UI elements and keeps the layout consistent. */}
          <div className="min-w-0">
            {/* This container groups related UI elements and keeps the layout consistent. */}
            <h1 className="tp-brand-title text-[22px] sm:text-2xl mt-1 mb-1 break-words leading-tight">
              Teenuste<span className="tp-brand-accent">Portaal</span>
            </h1>
            <h1 className="text-[28px] sm:text-3xl font-extrabold text-[#111827] tracking-tight leading-tight break-words">{t('greeting', { name: user?.username || '' })}</h1>
            <p className="text-sm text-gray-500 mt-1">{t('cabinet')}</p>
          </div>
          <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:justify-end">
            {/* This container groups related UI elements and keeps the layout consistent. */}
            <LanguageSwitcher className="shrink-0" />
            {/* This button triggers the main action for this part of the screen. */}
            <button onClick={handleSignOut} className="tp-btn-ghost-danger px-3 sm:px-4 py-2 ml-auto sm:ml-0 shrink-0 text-[12px] sm:text-[13px] whitespace-nowrap">{t('sign_out')}</button>
            {/* This button triggers the main action for this part of the screen. */}
            <button onClick={openSidebar} className="tp-icon-btn shrink-0 bg-brand/10 hover:bg-brand/20 text-brand hover:text-brand" aria-label="Open menu">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            </button>
          </div>
        </div>
        {loading ? (
          <div className="text-center py-12 text-gray-400">{t('loading')}</div>
        ) : (
          <>
            {/* Profile Card */}
            <div className="tp-panel rounded-[1.75rem] sm:rounded-3xl p-4 sm:p-5 mb-4">
              {/* This container groups related UI elements and keeps the layout consistent. */}
              <div className="flex items-center gap-4 mb-3">
                {/* This container groups related UI elements and keeps the layout consistent. */}
                <label className="relative shrink-0 w-12 h-12 rounded-2xl overflow-hidden bg-brand/10 border border-gray-100 text-brand flex items-center justify-center text-xl font-bold cursor-pointer transition-all hover:ring-4 hover:ring-brand/15">
                  {profilePhoto ? (
                    <img src={profilePhoto} alt={user?.username || 'Profile'} className="w-full h-full object-cover" />
                  ) : (
                    <span>{(user?.username || '?')[0].toUpperCase()}</span>
                  )}
                  {photoUploading && <div className="absolute inset-0 bg-white/70 flex items-center justify-center text-[10px] font-bold text-brand">...</div>}
                  {/* This input keeps its value connected to component state. */}
                  <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" disabled={photoUploading} />
                </label>
                <div className="min-w-0">
                  {/* This container groups related UI elements and keeps the layout consistent. */}
                  <h3 className="font-bold text-gray-900 text-[17px] truncate">{user?.username}</h3>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-brand/10 text-brand capitalize">{profileStatus}</span>
                </div>
              </div>
              {photoError && <p className="mb-3 text-xs font-semibold text-red-500">{photoError}</p>}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                {/* This container groups related UI elements and keeps the layout consistent. */}
                {user?.phone && <div className="min-w-0"><p className="text-xs text-gray-400 uppercase">Phone</p><p className="font-medium text-gray-700 break-words">{user.phone}</p></div>}
                {user?.email && <div className="min-w-0"><p className="text-xs text-gray-400 uppercase">Email</p><p className="font-medium text-gray-700 break-all">{user.email}</p></div>}
              </div>
            </div>

            {/* Tabs */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              {/* This container groups related UI elements and keeps the layout consistent. */}
              {['active', 'history'].map(tabKey => (
                <button key={tabKey} onClick={() => setTab(tabKey)} className={`tp-tab px-2 text-[13px] sm:text-sm ${tab === tabKey ? 'tp-tab-active' : ''}`}>
                  {tabKey === 'active' ? `${t('active_orders')} (${activeOrders.length})` : `${t('history')} (${completedOrders.length})`}
                </button>
              ))}
            </div>

            {/* Active Orders */}
            {tab === 'active' && (
              <div className="space-y-3 mb-4">
                {/* This container groups related UI elements and keeps the layout consistent. */}
                {activeOrders.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-6">No active orders.</p>
                ) : activeOrders.map(o => (
                  <div key={o.id} className="bg-white/70 border border-gray-100 rounded-2xl p-4 shadow-sm">
                    {/* This container groups related UI elements and keeps the layout consistent. */}
                    <div className="flex flex-wrap justify-between items-start gap-2 mb-2">
                      {/* This container groups related UI elements and keeps the layout consistent. */}
                      <div className="min-w-0">
                        {/* This container groups related UI elements and keeps the layout consistent. */}
                        <p className="font-bold text-gray-800 break-words">{o.vehicleBrand} {o.vehicleModel}</p>
                        <p className="text-xs text-gray-500">{getServiceNames(o.services)}</p>
                      </div>
                      <span className="shrink-0 px-2 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-full capitalize">{o.status}</span>
                    </div>
                    {o.worker_user && <p className="text-sm text-gray-600 mb-1">Worker: {o.worker_user.government_name} {o.worker_user.government_surname}</p>}
                    {(o.worker_phone || o.worker_user?.phone) && <p className="text-xs text-gray-500 mb-1">Worker Phone: {o.worker_phone || o.worker_user?.phone}</p>}
                    {o.price && <p className="text-sm font-bold text-brand mb-1">Price: €{Number(o.price).toFixed(2)}</p>}
                    {o.paymentType && <p className="text-xs text-gray-400">Payment: {o.paymentType}</p>}
                    {/* This button triggers the main action for this part of the screen. */}
                    <button onClick={() => completeOrder(o.id)} className="tp-btn-success tp-btn-sm mt-3 w-full">
                      Mark as Completed
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Order History */}
            {tab === 'history' && (
              <div className="space-y-3 mb-4">
                {/* This container groups related UI elements and keeps the layout consistent. */}
                {completedOrders.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-6">No completed orders yet.</p>
                ) : completedOrders.map(o => {
                  const workerName = o.worker_name || (o.worker_user ? `${o.worker_user.government_name || ''} ${o.worker_user.government_surname || ''}`.trim() : null);
                  const workerPhone = o.worker_phone || o.worker_user?.phone;
                  const alreadySubmitted = ticketSentOrders.has(o.id);
                  // Renders the JSX markup for this component.
                  return (
                    <div key={o.id} className="bg-white/70 border border-gray-100 rounded-2xl p-4 shadow-sm">
                      {/* This container groups related UI elements and keeps the layout consistent. */}
                      <div className="flex flex-wrap justify-between items-start gap-2 mb-2">
                        {/* This container groups related UI elements and keeps the layout consistent. */}
                        <div className="min-w-0">
                          {/* This container groups related UI elements and keeps the layout consistent. */}
                          <p className="font-bold text-gray-800 break-words">{o.vehicleBrand} {o.vehicleModel}</p>
                          <p className="text-xs text-gray-500">{getServiceNames(o.services)}</p>
                        </div>
                        <span className="shrink-0 px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">Completed</span>
                      </div>
                      <p className="text-xs text-gray-400 mb-1">{new Date(o.completed_at).toLocaleDateString()}</p>
                      {o.price && <p className="text-sm font-bold text-brand mb-1">Price: €{Number(o.price).toFixed(2)}</p>}
                      {workerName && <p className="text-xs text-gray-600 mb-1">Worker: {workerName}</p>}
                      {workerPhone && <p className="text-xs text-gray-500 mb-3">Worker Phone: {workerPhone}</p>}
                      {alreadySubmitted ? (
                        <div className="w-full py-2 text-center text-xs text-gray-400 border border-gray-100 rounded-xl bg-gray-50">
                          {/* This container groups related UI elements and keeps the layout consistent. */}
                          {ticketStatusByOrder[o.id] === 'resolved' ? 'Support ticket resolved' : 'Support ticket submitted'}
                        </div>
                      ) : (
                        <button onClick={() => setTicketModal(o.id)} className="tp-btn-secondary tp-btn-sm w-full">
                          Contact Support
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* CTA Buttons */}
            {/* This button triggers the main action for this part of the screen. */}
            <button onClick={() => navigate('/request-help')} className="group relative tp-btn-primary w-full py-4 mt-2 overflow-hidden hover:-translate-y-1 text-[17px] gap-2">
              <div className="absolute inset-0 bg-gradient-to-r from-brand via-[#7482f6] to-brand opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <span className="relative z-10">{t('request_assistance')}</span>
            </button>

            {(isWorkerLocal || user?.is_worker) ? (
              <button onClick={() => navigate('/provider')} className="tp-btn-success w-full py-3 mt-3">
                {t('go_to_work')}
              </button>
            ) : hasPendingApp ? (
              <div className="w-full py-3 mt-3 border-2 border-gray-300 bg-gray-50 text-gray-700 font-bold rounded-2xl text-sm text-center">
                {/* This container groups related UI elements and keeps the layout consistent. */}
                {t('app_pending')}
              </div>
            ) : (
              <button onClick={() => navigate('/provider-reg')} className="tp-btn-outline w-full py-3 mt-3 text-sm">
                {t('become_worker')}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
