import React from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../api';

export default function LanguageSwitcher({ className = '', onLanguageChange }) {
  const { i18n } = useTranslation();

  const changeLanguage = async (lng) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('i18nextLng', lng);
    const userId = localStorage.getItem('userId');
    if (userId) {
      try {
        await api(`/api/user/${userId}/language`, {
          method: 'PUT',
          body: JSON.stringify({ language: lng })
        });
      } catch (e) {
        console.error('Failed to save language', e);
      }
    }
    if (onLanguageChange) onLanguageChange(lng);
  };

  return (
    <div className={`flex gap-2 ${className}`}>
      <button onClick={() => changeLanguage('en')} className={`px-2 py-1 text-xs font-bold rounded ${i18n.language === 'en' ? 'bg-brand text-white' : 'bg-gray-100 text-gray-600'}`}>EN</button>
      <button onClick={() => changeLanguage('ru')} className={`px-2 py-1 text-xs font-bold rounded ${i18n.language === 'ru' ? 'bg-brand text-white' : 'bg-gray-100 text-gray-600'}`}>RU</button>
      <button onClick={() => changeLanguage('et')} className={`px-2 py-1 text-xs font-bold rounded ${i18n.language === 'et' ? 'bg-brand text-white' : 'bg-gray-100 text-gray-600'}`}>ET</button>
    </div>
  );
}
