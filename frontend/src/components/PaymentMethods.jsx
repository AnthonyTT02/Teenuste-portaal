import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LanguageSwitcher from './LanguageSwitcher';
import { useTranslation } from 'react-i18next';

export default function PaymentMethods(){
  const { t } = useTranslation();
  const navigate = useNavigate();
  const userId = localStorage.getItem('userId') || 'guest';

  const storageKey = `paymentMethods:${userId}`;
  const [methods, setMethods] = useState([]);
  const [defaultId, setDefaultId] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [newMethod, setNewMethod] = useState({ type: 'card', label: '', number: '' });
  const [showTx, setShowTx] = useState(false);

  useEffect(()=>{
    try{
      const raw = localStorage.getItem(storageKey);
      if(raw){
        const parsed = JSON.parse(raw);
        setMethods(parsed.methods || []);
        setDefaultId(parsed.default || (parsed.methods[0] && parsed.methods[0].id) || null);
      } else {
        // seed defaults
        const seed = [
          { id: 'apple', type: 'apple', label: 'Apple Pay', createdAt: Date.now() },
          { id: 'card-1', type: 'card', label: '•••• 0054', number: '****0054', createdAt: Date.now() },
          { id: 'bank-1', type: 'bank', label: 'Bank transfer', createdAt: Date.now() }
        ];
        setMethods(seed);
        setDefaultId(seed[0].id);
        localStorage.setItem(storageKey, JSON.stringify({ methods: seed, default: seed[0].id }));
      }
    }catch(e){ console.error(e); }
  }, [storageKey]);

  const persist = (nextMethods, nextDefault=defaultId)=>{
    setMethods(nextMethods);
    setDefaultId(nextDefault);
    localStorage.setItem(storageKey, JSON.stringify({ methods: nextMethods, default: nextDefault }));
  };

  const handleSelect = (id)=>{
    setDefaultId(id);
    const raw = JSON.parse(localStorage.getItem(storageKey) || '{}');
    raw.default = id;
    localStorage.setItem(storageKey, JSON.stringify(raw));
  };

  const handleRemove = (id)=>{
    const next = methods.filter(m=>m.id!==id);
    const nextDefault = defaultId===id ? (next[0] && next[0].id) : defaultId;
    persist(next, nextDefault);
  };

  const handleAdd = ()=>{
    if(!newMethod.label && !newMethod.number) return;
    const id = `${newMethod.type}-${Date.now()}`;
    const label = newMethod.type==='card' ? `•••• ${newMethod.number.slice(-4)}` : newMethod.label || (newMethod.type==='bank'?'Bank transfer':'Method');
    const entry = { id, type: newMethod.type, label, number: newMethod.type==='card'?`****${newMethod.number.slice(-4)}`:undefined, createdAt: Date.now() };
    const next = [entry, ...methods];
    persist(next, entry.id);
    setShowAdd(false);
    setNewMethod({ type: 'card', label: '', number: '' });
  };

  const transactions = [
    { id: 1, date: '2026-05-10', desc: 'Service payment', amount: '-€25.00' },
    { id: 2, date: '2026-05-01', desc: 'Top-up', amount: '+€50.00' }
  ];

  return (
    <div className="w-full max-w-md bg-white/80 backdrop-blur-xl border border-white/40 rounded-[2.5rem] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05),0_0_80px_rgba(91,108,249,0.08)] p-8 overflow-hidden relative transition-all duration-500 hover:shadow-[0_30px_60px_-15px_rgba(91,108,249,0.15)] group">

      <div className="absolute inset-0 bg-gradient-to-br from-white/60 to-transparent pointer-events-none opacity-50 rounded-[2.5rem]"></div>
      <div className="relative z-10">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-black tracking-tighter text-[#111827]">
            Teenuste<span className="text-transparent bg-clip-text bg-gradient-to-r from-brand to-brand-light">Portaal</span>
          </h1>
          <div className="flex gap-2 items-center">
            <LanguageSwitcher />
          </div>
        </div>

        <h2 className="text-3xl font-extrabold text-[#111827] mb-4">{t('payment_method', 'Payment method')}</h2>

        <div className="bg-white/60 border border-gray-100 rounded-2xl p-4 mb-6 shadow-sm">
          <p className="text-sm text-gray-500">{t('bolt_balance')}: <span className="font-bold text-gray-800">0,00 €</span></p>
          <button onClick={() => setShowTx(true)} className="text-sm text-brand font-semibold mt-2 inline-block">{t('view_transactions', 'View transactions')}</button>
        </div>

        <div className="space-y-3">
          {methods.map(opt => (
            <div key={opt.id} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-lg font-bold text-gray-700">{opt.label[0]}</div>
                <div>
                  <div className="text-sm font-semibold text-gray-900">{opt.label}</div>
                  <div className="text-xs text-gray-400">{new Date(opt.createdAt).toLocaleDateString()}</div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <label className={`w-5 h-5 rounded-full border ${defaultId===opt.id ? 'border-brand flex items-center justify-center' : 'border-gray-300'} `}>
                  <input type="radio" name="payment" checked={defaultId===opt.id} onChange={() => handleSelect(opt.id)} className="hidden" />
                  {defaultId===opt.id && <span className="w-3 h-3 bg-brand rounded-full" />}
                </label>
                <button onClick={() => handleRemove(opt.id)} className="text-sm text-red-500">Remove</button>
              </div>
            </div>
          ))}
        </div>

        <button onClick={() => setShowAdd(true)} className="mt-4 w-full py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-semibold text-gray-700 hover:bg-gray-100 transition">+ {t('add_payment_method', 'Add payment method')}</button>

        {/* Add modal */}
        {showAdd && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-lg">
              <h3 className="text-lg font-bold mb-3">{t('add_payment_method', 'Add payment method')}</h3>
              <div className="space-y-3">
                <label className="block text-xs text-gray-500">Type</label>
                <select value={newMethod.type} onChange={e=>setNewMethod({...newMethod,type:e.target.value})} className="w-full p-2 border rounded-lg">
                  <option value="card">Card</option>
                  <option value="bank">Bank transfer</option>
                  <option value="apple">Apple Pay</option>
                </select>

                {newMethod.type==='card' && (
                  <>
                    <label className="block text-xs text-gray-500">Card number</label>
                    <input value={newMethod.number} onChange={e=>setNewMethod({...newMethod,number:e.target.value.replace(/\D/g,'')})} className="w-full p-3 border rounded-lg" placeholder="4111 1111 1111 1111" />
                  </>
                )}

                {newMethod.type==='bank' && (
                  <>
                    <label className="block text-xs text-gray-500">Account label</label>
                    <input value={newMethod.label} onChange={e=>setNewMethod({...newMethod,label:e.target.value})} className="w-full p-3 border rounded-lg" placeholder="My bank account" />
                  </>
                )}
              </div>

              <div className="flex gap-2 mt-4">
                <button onClick={()=>setShowAdd(false)} className="flex-1 py-3 rounded-xl bg-gray-100">Cancel</button>
                <button onClick={handleAdd} className="flex-1 py-3 rounded-xl bg-brand text-white">Add</button>
              </div>
            </div>
          </div>
        )}

        {/* Transactions modal */}
        {showTx && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-lg">
              <h3 className="text-lg font-bold mb-3">{t('transactions', 'Transactions')}</h3>
              <div className="space-y-2 max-h-64 overflow-auto">
                {transactions.map(tx => (
                  <div key={tx.id} className="flex justify-between text-sm p-3 border-b">
                    <div>
                      <div className="font-medium">{tx.desc}</div>
                      <div className="text-xs text-gray-500">{tx.date}</div>
                    </div>
                    <div className="font-medium">{tx.amount}</div>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 mt-4">
                <button onClick={()=>setShowTx(false)} className="flex-1 py-3 rounded-xl bg-gray-100">Close</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
