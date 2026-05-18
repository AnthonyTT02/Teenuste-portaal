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
      {['en', 'ru', 'et'].map((lng) => (
        <button
          key={lng}
          onClick={() => changeLanguage(lng)}
          className={`tp-lang-btn ${i18n.language === lng ? 'tp-lang-btn-active' : 'tp-lang-btn-inactive'}`}
        >
          {lng.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
