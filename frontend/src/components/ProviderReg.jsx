// frontend/src/components/ProviderReg.jsx defines a React UI component and documents the state, handlers, and render flow used by this screen.
// Imports React because this file renders JSX components.
import React, { useEffect, useState } from 'react';
// Imports React hooks used to manage component state and lifecycle behavior.
import { useNavigate } from 'react-router-dom';
// Imports the shared API client functions used to communicate with the backend.
import { api } from '../api';
// Imports ../context/SidebarContext so this file can use its exported functionality.
import { useSidebar } from '../context/SidebarContext';

/**
 * ProviderReg Component
 * Handles the 3-step professional Worker registration application:
 * Step 1: Select services/specialties (towing, tires, etc.) and view pricing.
 * Step 2: Input personal details (government name, Estonian Isikukood, bank account IBAN, and profile photo base64 upload).
 * Step 3: Review all compiled information and submit the application for moderator approval.
 */
// ProviderReg renders the page component and keeps its UI behavior in one place.
export default function ProviderReg() {
  const { openSidebar } = useSidebar();
  // This navigation helper redirects the user after successful actions or role-based decisions.
  const navigate = useNavigate();
  // This value is read from localStorage to restore existing session or preference data.
  const userId = localStorage.getItem('userId');
  // This value is read from localStorage to restore existing session or preference data.
  const userPhone = localStorage.getItem('userPhone') || '';

  // Stores the step value so the UI can update when it changes.
  const [step, setStep] = useState(1);
  // Stores the services value so the UI can update when it changes.
  const [services, setServices] = useState([]);
  // Stores the selectedServices value so the UI can update when it changes.
  const [selectedServices, setSelectedServices] = useState([]);
  // Stores the loading value so the UI can update when it changes.
  const [loading, setLoading] = useState(true);
  // Stores the error value so the UI can update when it changes.
  const [error, setError] = useState('');
  // Stores the isSubmitting value so the UI can update when it changes.
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Stores the success value so the UI can update when it changes.
  const [success, setSuccess] = useState(false);
  // Stores the accountEmail value so the UI can update when it changes.
  const [accountEmail, setAccountEmail] = useState('');
  // Stores the accountPhone value so the UI can update when it changes.
  const [accountPhone, setAccountPhone] = useState(userPhone);
  // Stores the photoPreview value so the UI can update when it changes.
  const [photoPreview, setPhotoPreview] = useState('');
  // Stores the photoSaving value so the UI can update when it changes.
  const [photoSaving, setPhotoSaving] = useState(false);
  // Stores the formData value so the UI can update when it changes.
  const [formData, setFormData] = useState({
    government_name: '',
    government_surname: '',
    isikukood: '',
    bank_account: '',
    email: '',
  });

  // useEffect keeps this component behavior synchronized with its dependencies.
  useEffect(() => {
    if (!userId) { navigate('/'); return; }
    api('/api/services').then(res => { setServices(res.services || []); setLoading(false); }).catch(() => setLoading(false));
    api(`/api/user/${userId}`).then(res => {
      if (res.user) {
        setAccountEmail(res.user.email || '');
        setAccountPhone(res.user.phone || userPhone);
        setPhotoPreview(res.user.profile_photo || '');
        setFormData(p => ({ ...p, email: res.user.email || '' }));
      }
    }).catch(() => {});
  }, []);

  // handleInput handles the related user action and updates the component state or API data.
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

  // handlePhotoChange handles the related user action and updates the component state or API data.
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    e.target.value = '';
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError('Photo size must be less than 5MB');
        return;
      }
      setPhotoSaving(true);
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64 = event.target.result;
        // The try block wraps operations that may fail, such as API requests or browser storage updates.
        try {
          // This API call sends data to the backend or retrieves data needed by the component.
          await api(`/api/user/${userId}/photo`, {
            method: 'PUT',
            body: JSON.stringify({ photo: base64 })
          });
          setPhotoPreview(base64);
        } catch (err) {
          setError(err.payload?.error || err.message || 'Photo upload failed');
        } finally {
          setPhotoSaving(false);
        }
      };
      reader.onerror = () => {
        setError('Photo upload failed');
        setPhotoSaving(false);
      };
      reader.readAsDataURL(file);
    }
  };

  // toggleService contains reusable logic for this file.
  const toggleService = (id) => {
    setSelectedServices(p => p.includes(id) ? p.filter(s => s !== id) : [...p, id]);
  };

  // handleSubmit handles the related user action and updates the component state or API data.
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const { government_name, government_surname, isikukood, bank_account } = formData;
    if (!government_name || !government_surname || !isikukood || !bank_account) {
      return setError('Please fill all required fields');
    }
    if (!accountEmail) return setError('Your account has no email. Please update your profile first.');
    if (!photoPreview) return setError('Profile photo is required. Upload it in your account before submitting.');
    if (!/^\d{12}$/.test(isikukood)) {
      return setError('Isikukood must be exactly 12 digits');
    }
    if (!/^EE\d{18}$/.test(bank_account)) {
      return setError('Bank account (IBAN) must start with EE followed by 18 digits');
    }
    if (selectedServices.length === 0) return setError('Please select at least one service');
    setIsSubmitting(true);
    // The try block wraps operations that may fail, such as API requests or browser storage updates.
    try {
      // This API call sends data to the backend or retrieves data needed by the component.
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
    // Renders the JSX markup for this component.
    return (
      <div className="tp-page-card max-w-md p-10 text-center">
        {/* This container groups related UI elements and keeps the layout consistent. */}
        <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Registration Complete!</h2>
        <p className="text-gray-500">Your application will be reviewed by a moderator. We'll notify you when it's approved.</p>
        <p className="text-sm text-gray-400 mt-4">Redirecting to cabinet...</p>
      </div>
    );
  }

  // Renders the JSX markup for this component.
  return (
    <div className="tp-page-card max-w-xl p-8 md:p-10">
      {/* This container groups related UI elements and keeps the layout consistent. */}
      <div className="tp-page-card-shine" />
      <div className="relative z-10">
        {/* This container groups related UI elements and keeps the layout consistent. */}
        <div className="flex justify-between items-center mb-6">
          {/* This container groups related UI elements and keeps the layout consistent. */}
          <h1 className="tp-brand-title">Teenuste<span className="tp-brand-accent">Portaal</span></h1>
          {/* This button triggers the main action for this part of the screen. */}
          <button onClick={openSidebar} className="tp-icon-btn">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          </button>
        </div>

        <h2 className="text-3xl font-extrabold text-[#111827] mb-1 tracking-tight">Become a Worker</h2>
        <p className="text-gray-400 mb-6 text-sm">Step {step} of 3 — {step === 1 ? 'Select Services' : step === 2 ? 'Personal Details' : 'Review & Submit'}</p>

        {/* Step progress */}
        <div className="flex gap-2 mb-6">
          {/* This container groups related UI elements and keeps the layout consistent. */}
          {[1, 2, 3].map(s => (
            <div key={s} className={`h-1.5 flex-1 rounded-full transition-colors ${s <= step ? 'bg-brand' : 'bg-gray-200'}`} />
          ))}
        </div>

        {error && <div className="tp-alert-error mb-4">{error}</div>}

        {loading ? <div className="text-center py-8 text-gray-400">Loading services...</div> : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Step 1: Services */}
            {step === 1 && (
              <div>
                {/* This container groups related UI elements and keeps the layout consistent. */}
                <h3 className="text-sm font-bold text-gray-700 uppercase mb-3">Select services you can perform</h3>
                <div className="space-y-2">
                  {/* This container groups related UI elements and keeps the layout consistent. */}
                  {services.map(s => (
                    <button key={s.id} type="button" onClick={() => toggleService(s.id)}
                      className={`tp-choice justify-between ${selectedServices.includes(s.id) ? 'tp-choice-active' : ''}`}>
                      <div className="flex items-center">
                        {/* This container groups related UI elements and keeps the layout consistent. */}
                        <div className={`tp-choice-check rounded-md ${selectedServices.includes(s.id) ? 'tp-choice-check-active' : ''}`}>
                          {/* This container groups related UI elements and keeps the layout consistent. */}
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
                {/* Photo Upload */}
                <div>
                  {/* This container groups related UI elements and keeps the layout consistent. */}
                  <label className="tp-label-sm">Profile Photo</label>
                  <div className="flex items-end gap-4">
                    {/* This container groups related UI elements and keeps the layout consistent. */}
                    <div className="flex-1">
                      {/* This container groups related UI elements and keeps the layout consistent. */}
                      <label htmlFor="photo-input" className="w-full flex items-center justify-center p-4 border-2 border-dashed border-gray-200/60 hover:border-brand/40 rounded-2xl bg-gray-50/50 hover:bg-gray-50 cursor-pointer transition-all">
                        <div className="text-center">
                          {/* This container groups related UI elements and keeps the layout consistent. */}
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mx-auto text-gray-400 mb-1">
                            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>
                          </svg>
                          <p className="text-xs font-semibold text-gray-600">{photoPreview ? 'Change profile photo (max 5MB)' : 'Click to upload photo (max 5MB)'}</p>
                          {photoSaving && <p className="text-[11px] font-semibold text-brand mt-1">Saving...</p>}
                        </div>
                      </label>
                      {/* This input keeps its value connected to component state. */}
                      <input id="photo-input" type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" disabled={photoSaving} />
                    </div>
                    {photoPreview && (
                      <div className="w-20 h-20 rounded-2xl overflow-hidden border border-gray-200/60 flex-shrink-0">
                        {/* This container groups related UI elements and keeps the layout consistent. */}
                        <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {/* This container groups related UI elements and keeps the layout consistent. */}
                  <div>
                    {/* This container groups related UI elements and keeps the layout consistent. */}
                    <label className="tp-label-sm">First Name</label>
                    {/* This input keeps its value connected to component state. */}
                    <input name="government_name" value={formData.government_name} onChange={handleInput}
                      className="tp-input-sm"
                      placeholder="Artjom" />
                  </div>
                  <div>
                    {/* This container groups related UI elements and keeps the layout consistent. */}
                    <label className="tp-label-sm">Last Name</label>
                    {/* This input keeps its value connected to component state. */}
                    <input name="government_surname" value={formData.government_surname} onChange={handleInput}
                      className="tp-input-sm"
                      placeholder="Slavyantsev" />
                  </div>
                </div>
                <div>
                  {/* This container groups related UI elements and keeps the layout consistent. */}
                  <label className="tp-label-sm">Isikukood</label>
                  {/* This input keeps its value connected to component state. */}
                  <input name="isikukood" value={formData.isikukood} onChange={handleInput}
                    className="tp-input-sm"
                    placeholder="38001010000" />
                </div>
                <div>
                  {/* This container groups related UI elements and keeps the layout consistent. */}
                  <label className="tp-label-sm">Bank Account (IBAN)</label>
                  {/* This input keeps its value connected to component state. */}
                  <input name="bank_account" value={formData.bank_account} onChange={handleInput}
                    className="tp-input-sm"
                    placeholder="EE382200221020145685" />
                </div>
                <div>
                  {/* This container groups related UI elements and keeps the layout consistent. */}
                  <label className="tp-label-sm">Email (from account)</label>
                  {/* This input keeps its value connected to component state. */}
                  <input value={accountEmail || '(no email on account)'} readOnly disabled
                    className="tp-input-sm" />
                  {!accountEmail && <p className="text-xs text-amber-600 mt-1">No email associated with your account. Please update your profile.</p>}
                </div>
                <div>
                  {/* This container groups related UI elements and keeps the layout consistent. */}
                  <label className="tp-label-sm">Phone (from account)</label>
                  {/* This input keeps its value connected to component state. */}
                  <input value={accountPhone || '(no phone on account)'} readOnly disabled
                    className="tp-input-sm" />
                </div>
              </div>
            )}

            {/* Step 3: Review */}
            {step === 3 && (
              <div className="bg-gray-50 rounded-2xl p-5 space-y-3">
                {/* This container groups related UI elements and keeps the layout consistent. */}
                {photoPreview && (
                  <div className="flex justify-center mb-4">
                    {/* This container groups related UI elements and keeps the layout consistent. */}
                    <div className="w-32 h-32 rounded-2xl overflow-hidden border-2 border-gray-200 shadow-sm">
                      {/* This container groups related UI elements and keeps the layout consistent. */}
                      <img src={photoPreview} alt="Profile" className="w-full h-full object-cover" />
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {/* This container groups related UI elements and keeps the layout consistent. */}
                  <div><p className="text-xs text-gray-400 uppercase mb-0.5">Name</p><p className="font-bold text-gray-800">{formData.government_name} {formData.government_surname}</p></div>
                  <div><p className="text-xs text-gray-400 uppercase mb-0.5">Isikukood</p><p className="font-bold text-gray-800">{formData.isikukood}</p></div>
                  <div><p className="text-xs text-gray-400 uppercase mb-0.5">Bank Account</p><p className="font-bold text-gray-800 truncate">{formData.bank_account}</p></div>
                  <div><p className="text-xs text-gray-400 uppercase mb-0.5">Email</p><p className="font-bold text-gray-800 truncate">{formData.email}</p></div>
                  <div className="col-span-2">
                    {/* This container groups related UI elements and keeps the layout consistent. */}
                    <p className="text-xs text-gray-400 uppercase mb-1">Services ({selectedServices.length})</p>
                    <div className="flex flex-wrap gap-2">
                      {/* This container groups related UI elements and keeps the layout consistent. */}
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
              {/* This container groups related UI elements and keeps the layout consistent. */}
              {step > 1 && (
                <button type="button" onClick={() => setStep(p => p - 1)} className="tp-btn-secondary flex-1 py-3">Back</button>
              )}
              {step < 3 ? (
                <button type="button" onClick={() => {
                  setError('');
                  if (step === 2 && photoSaving) {
                    setError('Please wait until the photo is saved.');
                    return;
                  }
                  if (step === 2 && !photoPreview) {
                    setError('Profile photo is required. Upload it in your account before continuing.');
                    return;
                  }
                  setStep(p => p + 1);
                }} className="tp-btn-primary flex-1 py-3">
                  Next Step
                </button>
              ) : (
                <button type="submit" disabled={isSubmitting} className="tp-btn-primary flex-1 py-3">
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
