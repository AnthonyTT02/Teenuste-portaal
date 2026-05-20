// frontend/src/components/LanguageSwitcher.jsx defines a React UI component and documents the state, handlers, and render flow used by this screen.
// Imports React because this file renders JSX components.
import React from 'react';
// Imports React hooks used to manage component state and lifecycle behavior.
import { useTranslation } from 'react-i18next';
// Imports the shared API client functions used to communicate with the backend.
import { api } from '../api';

// LanguageSwitcher renders the language switcher screen and connects its UI behavior.
export default function LanguageSwitcher({ className = '', onLanguageChange }) {
  // The translation hook provides localized labels and lets the component react to language changes.
  const { i18n } = useTranslation();

  // changeLanguage contains reusable logic for this file.
  const changeLanguage = async (lng) => {
    i18n.changeLanguage(lng);
    // This value is saved in localStorage so the session or preference survives page reloads.
    localStorage.setItem('i18nextLng', lng);
    // This value is read from localStorage to restore existing session or preference data.
    const userId = localStorage.getItem('userId');
    if (userId) {
      // The try block wraps operations that may fail, such as API requests or browser storage updates.
      try {
        // This API call sends data to the backend or retrieves data needed by the component.
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

  // Renders the JSX markup for this component.
  return (
    <div className={`flex gap-2 ${className}`}>
      {/* This container groups related UI elements and keeps the layout consistent. */}
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
