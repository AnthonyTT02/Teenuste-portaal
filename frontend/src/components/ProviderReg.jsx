import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import { useSidebar } from '../context/SidebarContext';

export default function ProviderReg() {
  const { openSidebar } = useSidebar();
  const navigate = useNavigate();
  const userId = localStorage.getItem('userId');
  const userPhone = localStorage.getItem('userPhone') || '';

  const [step, setStep] = useState(1);
  const [services, setServices] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [accountEmail, setAccountEmail] = useState('');
  const [accountPhone, setAccountPhone] = useState(userPhone);
  const [formData, setFormData] = useState({
    government_name: '',
    government_surname: '',
    isikukood: '',
    bank_account: '',
    email: '',
  });

  useEffect(() => {
    if (!userId) { navigate('/'); return; }
    api('/api/services').then(res => { setServices(res.services || []); setLoading(false); }).catch(() => setLoading(false));
    api(`/api/user/${userId}`).then(res => {
      if (res.user) {
        setAccountEmail(res.user.email || '');
        setAccountPhone(res.user.phone || userPhone);
        setFormData(p => ({ ...p, email: res.user.email || '' }));
      }
    }).catch(() => {});
  }, []);

  const handleInput = (e) => {
    let { name, value } = e.target;
    if (name === 'isikukood') {
      value = value.replace(/\D/g, '').slice(0, 12);
    }
    if (name === 'bank_account') {
      value = value.toUpperCase().replace(/\s/g, '').slice(0, 20);
    }
    setFormData(p => ({ ...p, [name]: value }));
  };

  const toggleService = (id) => {
    setSelectedServices(p => p.includes(id) ? p.filter(s => s !== id) : [...p, id]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const { government_name, government_surname, isikukood, bank_account } = formData;
    if (!government_name || !government_surname || !isikukood || !bank_account) {
      return setError('Please fill all required fields');
    }
    if (!accountEmail) return setError('Your account has no email. Please update your profile first.');
    if (!/^\d{12}$/.test(isikukood)) {
      return setError('Isikukood must be exactly 12 digits');
    }
    if (!/^EE\d{18}$/.test(bank_account)) {
      return setError('Bank account (IBAN) must start with EE followed by 18 digits');
    }
    if (selectedServices.length === 0) return setError('Please select at least one service');
    setIsSubmitting(true);
    try {
      await api('/api/worker/apply', {
        method: 'POST',
        body: JSON.stringify({ userId, ...formData, email: accountEmail, services: selectedServices })
      });
      setSuccess(true);
      setTimeout(() => navigate('/cabinet'), 3000);
    } catch (err) {
      setError(err.payload?.error || err.message || 'Submission failed');
    } finally { setIsSubmitting(false); }
  };

  if (success) {
    return (
      <div className="w-full max-w-md bg-white/80 backdrop-blur-xl border border-white/40 rounded-[2.5rem] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] p-10 text-center animate-fade-in-up">
        <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Registration Complete!</h2>
        <p className="text-gray-500">Your application will be reviewed by a moderator. We'll notify you when it's approved.</p>
        <p className="text-sm text-gray-400 mt-4">Redirecting to cabinet...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-xl bg-white/80 backdrop-blur-xl border border-white/40 rounded-[2.5rem] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05),0_0_80px_rgba(91,108,249,0.08)] p-8 md:p-10 overflow-hidden relative transition-all duration-500 animate-fade-in-up">
      <div className="absolute inset-0 bg-gradient-to-br from-white/60 to-transparent pointer-events-none opacity-50 rounded-[2.5rem]" />
      <div className="relative z-10">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-black tracking-tighter text-[#111827]">Teenuste<span className="text-transparent bg-clip-text bg-gradient-to-r from-brand to-brand-light">Portaal</span></h1>
          <button onClick={openSidebar} className="p-2.5 rounded-full hover:bg-gray-100/80 transition-all text-gray-500">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          </button>
        </div>

        <h2 className="text-3xl font-extrabold text-[#111827] mb-1 tracking-tight">Become a Worker</h2>
        <p className="text-gray-400 mb-6 text-sm">Step {step} of 3 — {step === 1 ? 'Select Services' : step === 2 ? 'Personal Details' : 'Review & Submit'}</p>

        {/* Step progress */}
        <div className="flex gap-2 mb-6">
          {[1, 2, 3].map(s => (
            <div key={s} className={`h-1.5 flex-1 rounded-full transition-colors ${s <= step ? 'bg-brand' : 'bg-gray-200'}`} />
          ))}
        </div>

        {error && <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm font-semibold">{error}</div>}

        {loading ? <div className="text-center py-8 text-gray-400">Loading services...</div> : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Step 1: Services */}
            {step === 1 && (
              <div>
                <h3 className="text-sm font-bold text-gray-700 uppercase mb-3">Select services you can perform</h3>
                <div className="space-y-2">
                  {services.map(s => (
                    <button key={s.id} type="button" onClick={() => toggleService(s.id)}
                      className={`w-full flex items-center justify-between p-4 border rounded-2xl transition-all text-left ${selectedServices.includes(s.id) ? 'bg-brand/5 border-brand/40 shadow-sm' : 'bg-gray-50/50 border-gray-200/60 hover:bg-white'}`}>
                      <div className="flex items-center">
                        <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-colors ${selectedServices.includes(s.id) ? 'bg-brand border-brand' : 'border-gray-300'}`}>
                          {selectedServices.includes(s.id) && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>}
                        </div>
                        <p className="ml-3 font-semibold text-gray-800">{s.name}</p>
                      </div>
                      <p className="font-semibold text-brand">€{(s.price || 0).toFixed(2)}</p> 
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2: Personal Details */}
            {step === 2 && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold tracking-wide mb-1.5 text-gray-700">First Name *</label>
                    <input name="government_name" value={formData.government_name} onChange={handleInput}
                      className="w-full px-4 py-3 rounded-2xl bg-gray-50/50 border border-gray-200/60 focus:border-brand/40 focus:ring-[4px] focus:ring-brand/15 transition-all outline-none text-sm"
                      placeholder="John" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold tracking-wide mb-1.5 text-gray-700">Last Name *</label>
                    <input name="government_surname" value={formData.government_surname} onChange={handleInput}
                      className="w-full px-4 py-3 rounded-2xl bg-gray-50/50 border border-gray-200/60 focus:border-brand/40 focus:ring-[4px] focus:ring-brand/15 transition-all outline-none text-sm"
                      placeholder="Doe" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold tracking-wide mb-1.5 text-gray-700">Isikukood *</label>
                  <input name="isikukood" value={formData.isikukood} onChange={handleInput}
                    className="w-full px-4 py-3 rounded-2xl bg-gray-50/50 border border-gray-200/60 focus:border-brand/40 focus:ring-[4px] focus:ring-brand/15 transition-all outline-none text-sm"
                    placeholder="38001010000" />
                </div>
                <div>
                  <label className="block text-xs font-bold tracking-wide mb-1.5 text-gray-700">Bank Account (IBAN) *</label>
                  <input name="bank_account" value={formData.bank_account} onChange={handleInput}
                    className="w-full px-4 py-3 rounded-2xl bg-gray-50/50 border border-gray-200/60 focus:border-brand/40 focus:ring-[4px] focus:ring-brand/15 transition-all outline-none text-sm"
                    placeholder="EE382200221020145685" />
                </div>
                <div>
                  <label className="block text-xs font-bold tracking-wide mb-1.5 text-gray-700">Email (from account)</label>
                  <input value={accountEmail || '(no email on account)'} readOnly
                    className="w-full px-4 py-3 rounded-2xl bg-gray-100 border border-gray-200/60 text-gray-500 text-sm cursor-not-allowed" />
                  {!accountEmail && <p className="text-xs text-amber-600 mt-1">No email associated with your account. Please update your profile.</p>}
                </div>
                <div>
                  <label className="block text-xs font-bold tracking-wide mb-1.5 text-gray-700">Phone (from account)</label>
                  <input value={accountPhone || '(no phone on account)'} readOnly
                    className="w-full px-4 py-3 rounded-2xl bg-gray-100 border border-gray-200/60 text-gray-500 text-sm cursor-not-allowed" />
                </div>
              </div>
            )}

            {/* Step 3: Review */}
            {step === 3 && (
              <div className="bg-gray-50 rounded-2xl p-5 space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><p className="text-xs text-gray-400 uppercase mb-0.5">Name</p><p className="font-bold text-gray-800">{formData.government_name} {formData.government_surname}</p></div>
                  <div><p className="text-xs text-gray-400 uppercase mb-0.5">Isikukood</p><p className="font-bold text-gray-800">{formData.isikukood}</p></div>
                  <div><p className="text-xs text-gray-400 uppercase mb-0.5">Bank Account</p><p className="font-bold text-gray-800 truncate">{formData.bank_account}</p></div>
                  <div><p className="text-xs text-gray-400 uppercase mb-0.5">Email</p><p className="font-bold text-gray-800 truncate">{formData.email}</p></div>
                  <div className="col-span-2">
                    <p className="text-xs text-gray-400 uppercase mb-1">Services ({selectedServices.length})</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedServices.map(id => {
                        const s = services.find(sv => sv.id === id);
                        return s ? <span key={id} className="px-3 py-1 bg-brand/10 text-brand rounded-full text-xs font-semibold">{s.name}</span> : null;
                      })}
                    </div>
                  </div>
                </div>
                <p className="text-xs text-gray-500 pt-2 border-t border-gray-200">Your application will be reviewed by a moderator before you can start working.</p>
              </div>
            )}

            {/* Navigation */}
            <div className="flex gap-3 pt-2">
              {step > 1 && (
                <button type="button" onClick={() => setStep(p => p - 1)} className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-2xl transition-colors">Back</button>
              )}
              {step < 3 ? (
                <button type="button" onClick={() => { setError(''); setStep(p => p + 1); }} className="flex-1 py-3 bg-brand hover:bg-brand-dark text-white font-bold rounded-2xl transition-colors">
                  Next Step
                </button>
              ) : (
                <button type="submit" disabled={isSubmitting} className="flex-1 py-3 bg-brand hover:bg-brand-dark text-white font-bold rounded-2xl transition-colors disabled:opacity-50">
                  {isSubmitting ? 'Submitting...' : 'Submit Application'}
                </button>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
