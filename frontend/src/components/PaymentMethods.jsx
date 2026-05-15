import React from 'react';
import { useNavigate } from 'react-router-dom';
import LanguageSwitcher from './LanguageSwitcher';
import { useTranslation } from 'react-i18next';

export default function PaymentMethods(){
  const { t } = useTranslation();
  const navigate = useNavigate();

  const paymentOptions = [
    { id: 'apple', label: 'Apple Pay' },
    { id: 'card', label: '•••• 0054' },
    { id: 'bank', label: 'Bank transfer' }
  ];

  return (
    <div className="w-full max-w-2xl bg-white/80 backdrop-blur-xl border border-white/40 rounded-[2.5rem] p-8 overflow-hidden relative animate-fade-in-up">
      <div className="relative z-10">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">{t('payment_method', 'Payment method')}</h1>
          </div>
          <div className="flex gap-2 items-center">
            <LanguageSwitcher />
            <button onClick={() => navigate('/settings')} className="text-sm text-brand font-semibold">{t('edit', 'Edit')}</button>
          </div>
        </div>

        <div className="bg-white/60 border border-gray-100 rounded-2xl p-4 mb-6 shadow-sm">
          <p className="text-sm text-gray-500">{t('bolt_balance')}: <span className="font-bold text-gray-800">0,00 €</span></p>
          <a className="text-sm text-brand font-semibold mt-2 inline-block">{t('view_transactions', 'View transactions')}</a>
        </div>

        <div className="space-y-3">
          {paymentOptions.map(opt => (
            <div key={opt.id} className="flex items-center justify-between p-4 bg-white/70 border border-white/60 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-md bg-gray-100 flex items-center justify-center text-sm font-bold">{opt.label[0]}</div>
                <div className="text-sm font-medium text-gray-800">{opt.label}</div>
              </div>
              <div>
                <input type="radio" name="payment" />
              </div>
            </div>
          ))}
        </div>

        <button onClick={() => alert('Add card flow') } className="mt-4 w-full py-3 border border-gray-200 rounded-2xl text-sm font-semibold text-gray-700 bg-gray-50">+ {t('add_payment_method', 'Add payment method')}</button>
      </div>
    </div>
  );
}
