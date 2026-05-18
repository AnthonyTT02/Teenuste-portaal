import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import { useSidebar } from '../context/SidebarContext';
import LanguageSwitcher from './LanguageSwitcher';
import { useTranslation } from 'react-i18next';

export default function Cabinet() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { openSidebar } = useSidebar();
  const userId = localStorage.getItem('userId');
  const userStatus = localStorage.getItem('userStatus');
  const isWorkerLocal = userStatus === 'worker' || localStorage.getItem('userRole') === 'worker' || localStorage.getItem('is_worker') === '1';
  const storedUser = {
    id: userId ? Number(userId) : null,
    username: localStorage.getItem('username') || '',
    email: localStorage.getItem('userEmail') || '',
    phone: localStorage.getItem('userPhone') || '',
    status: userStatus || 'user',
    is_worker: localStorage.getItem('is_worker') === '1' ? 1 : 0
  };

  const [user, setUser] = useState(storedUser);
  const [activeOrders, setActiveOrders] = useState([]);
  const [completedOrders, setCompletedOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showWorkerPopup, setShowWorkerPopup] = useState(false);
  const [ticketModal, setTicketModal] = useState(null);
  const [ticketMsg, setTicketMsg] = useState('');
  const [ticketSent, setTicketSent] = useState(false);
  const [ticketSentOrders, setTicketSentOrders] = useState(new Set());
  const [services, setServices] = useState([]);
  const [tab, setTab] = useState('active');
  const [hasPendingApp, setHasPendingApp] = useState(false);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [photoError, setPhotoError] = useState('');
  const [ticketStatusByOrder, setTicketStatusByOrder] = useState({});
  const profilePhoto = user?.profile_photo;
  const profileStatus = user?.status || userStatus || 'user';

  useEffect(() => {
    if (!userId) { navigate('/'); return; }
    const newWorker = localStorage.getItem('newWorker');
    if (newWorker === 'true') { setShowWorkerPopup(true); localStorage.removeItem('newWorker'); }
    fetchData();
  }, [userId]);

  const fetchData = async () => {
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
        if (nextUser.username) localStorage.setItem('username', nextUser.username);
        if (nextUser.email) localStorage.setItem('userEmail', nextUser.email);
        if (nextUser.phone) localStorage.setItem('userPhone', nextUser.phone);
        if (nextUser.status) {
          localStorage.setItem('userStatus', nextUser.status);
          localStorage.setItem('userRole', nextUser.status);
        }
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
        try {
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
    finally { setLoading(false); }
  };

  const handleSignOut = () => { localStorage.clear(); navigate('/'); };

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
      try {
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

  const completeOrder = async (orderId) => {
    await api(`/api/order/${orderId}/complete`, { method: 'POST' });
    fetchData();
  };

  const sendTicket = async () => {
    if (!ticketMsg.trim()) return;
    try {
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

  const getServiceNames = (servicesJson) => {
    try {
      const ids = JSON.parse(servicesJson || '[]');
      return ids.map(id => services.find(s => s.id === Number(id))?.name || `#${id}`).join(', ');
    } catch { return '—'; }
  };

  if (!userId) return null;

  return (
    <div className="tp-page-card max-w-2xl p-5 sm:p-8">
      <div className="tp-page-card-shine" />

      {showWorkerPopup && (
        <div className="tp-modal-backdrop">
          <div className="tp-modal max-w-sm p-10 text-center">
            <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Congratulations!</h2>
            <p className="text-gray-500 mb-6">You became a worker! You can now accept orders.</p>
            <button onClick={() => setShowWorkerPopup(false)} className="tp-btn-primary w-full py-3">Let's go!</button>
          </div>
        </div>
      )}

      {ticketModal && (
        <div className="tp-modal-backdrop">
          <div className="tp-modal max-w-sm p-8">
            <h2 className="text-xl font-extrabold text-gray-900 mb-4">Contact Support</h2>
            {ticketSent ? (
              <p className="text-green-600 font-bold text-center py-4">Ticket sent!</p>
            ) : (
              <>
                <textarea value={ticketMsg} onChange={e => setTicketMsg(e.target.value)} rows={4}
                  className="tp-textarea mb-4"
                  placeholder="Describe your problem..." />
                <div className="flex gap-3">
                  <button onClick={() => setTicketModal(null)} className="tp-btn-secondary flex-1 py-3">Cancel</button>
                  <button onClick={sendTicket} className="tp-btn-primary flex-1 py-3">Send</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <div className="relative z-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-start mb-5">
          <div className="min-w-0">
            <h1 className="tp-brand-title text-[22px] sm:text-2xl mt-1 mb-1 break-words leading-tight">
              Teenuste<span className="tp-brand-accent">Portaal</span>
            </h1>
            <h1 className="text-[28px] sm:text-3xl font-extrabold text-[#111827] tracking-tight leading-tight break-words">{t('greeting', { name: user?.username || '' })}</h1>
            <p className="text-sm text-gray-500 mt-1">{t('cabinet')}</p>
          </div>
          <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:justify-end">
            <LanguageSwitcher className="shrink-0" />
            <button onClick={handleSignOut} className="tp-btn-ghost-danger px-3 sm:px-4 py-2 ml-auto sm:ml-0 shrink-0 text-[12px] sm:text-[13px] whitespace-nowrap">{t('sign_out')}</button>
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
              <div className="flex items-center gap-4 mb-3">
                <label className="relative shrink-0 w-12 h-12 rounded-2xl overflow-hidden bg-brand/10 border border-gray-100 text-brand flex items-center justify-center text-xl font-bold cursor-pointer transition-all hover:ring-4 hover:ring-brand/15">
                  {profilePhoto ? (
                    <img src={profilePhoto} alt={user?.username || 'Profile'} className="w-full h-full object-cover" />
                  ) : (
                    <span>{(user?.username || '?')[0].toUpperCase()}</span>
                  )}
                  {photoUploading && <div className="absolute inset-0 bg-white/70 flex items-center justify-center text-[10px] font-bold text-brand">...</div>}
                  <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" disabled={photoUploading} />
                </label>
                <div className="min-w-0">
                  <h3 className="font-bold text-gray-900 text-[17px] truncate">{user?.username}</h3>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-brand/10 text-brand capitalize">{profileStatus}</span>
                </div>
              </div>
              {photoError && <p className="mb-3 text-xs font-semibold text-red-500">{photoError}</p>}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                {user?.phone && <div className="min-w-0"><p className="text-xs text-gray-400 uppercase">Phone</p><p className="font-medium text-gray-700 break-words">{user.phone}</p></div>}
                {user?.email && <div className="min-w-0"><p className="text-xs text-gray-400 uppercase">Email</p><p className="font-medium text-gray-700 break-all">{user.email}</p></div>}
              </div>
            </div>

            {/* Tabs */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              {['active', 'history'].map(tabKey => (
                <button key={tabKey} onClick={() => setTab(tabKey)} className={`tp-tab px-2 text-[13px] sm:text-sm ${tab === tabKey ? 'tp-tab-active' : ''}`}>
                  {tabKey === 'active' ? `${t('active_orders')} (${activeOrders.length})` : `${t('history')} (${completedOrders.length})`}
                </button>
              ))}
            </div>

            {/* Active Orders */}
            {tab === 'active' && (
              <div className="space-y-3 mb-4">
                {activeOrders.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-6">No active orders.</p>
                ) : activeOrders.map(o => (
                  <div key={o.id} className="bg-white/70 border border-gray-100 rounded-2xl p-4 shadow-sm">
                    <div className="flex flex-wrap justify-between items-start gap-2 mb-2">
                      <div className="min-w-0">
                        <p className="font-bold text-gray-800 break-words">{o.vehicleBrand} {o.vehicleModel}</p>
                        <p className="text-xs text-gray-500">{getServiceNames(o.services)}</p>
                      </div>
                      <span className="shrink-0 px-2 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-full capitalize">{o.status}</span>
                    </div>
                    {o.worker_user && <p className="text-sm text-gray-600 mb-1">Worker: {o.worker_user.government_name} {o.worker_user.government_surname}</p>}
                    {(o.worker_phone || o.worker_user?.phone) && <p className="text-xs text-gray-500 mb-1">Worker Phone: {o.worker_phone || o.worker_user?.phone}</p>}
                    {o.price && <p className="text-sm font-bold text-brand mb-1">Price: €{Number(o.price).toFixed(2)}</p>}
                    {o.paymentType && <p className="text-xs text-gray-400">Payment: {o.paymentType}</p>}
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
                {completedOrders.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-6">No completed orders yet.</p>
                ) : completedOrders.map(o => {
                  const workerName = o.worker_name || (o.worker_user ? `${o.worker_user.government_name || ''} ${o.worker_user.government_surname || ''}`.trim() : null);
                  const workerPhone = o.worker_phone || o.worker_user?.phone;
                  const alreadySubmitted = ticketSentOrders.has(o.id);
                  return (
                    <div key={o.id} className="bg-white/70 border border-gray-100 rounded-2xl p-4 shadow-sm">
                      <div className="flex flex-wrap justify-between items-start gap-2 mb-2">
                        <div className="min-w-0">
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
