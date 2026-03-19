import { Link } from 'react-router-dom';
import { useState } from 'react';

const navItems = [
  ['Личный кабинет', '/cabinet'],
  ['Настройки', '/settings'],
  ['Условия пользования', '/terms'],
  ['Правила безопасности', '/security'],
  ['Как начать работать', '/get-started'],
  ['Для юр. лиц', '/for-business'],
  ['Для физ. лиц', '/for-individuals'],
  ['Контакты', '/contacts'],
  ['Регистрация поставщика', '/provider-reg/1'],
  ['Заказать помощь', '/order/1']
];

export function AppLayout({ children }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="sos-page">
<<<<<<< HEAD
      <div className="sos-bg sos-bg-1" />
      <div className="sos-bg sos-bg-2" />
=======
>>>>>>> f6dfbbf69b75ceb173df6b2e55d64e1943954ee2
      {open && <div className="sos-overlay active" onClick={() => setOpen(false)} />}
      <div className={`sos-sidebar ${open ? 'active' : ''}`}>
        <h4>Меню</h4>
        {navItems.map(([label, to]) => (
<<<<<<< HEAD
          <Link className="sos-nav-link" key={to} to={to} onClick={() => setOpen(false)}>{label}</Link>
=======
          <Link key={to} to={to} onClick={() => setOpen(false)}>{label}</Link>
>>>>>>> f6dfbbf69b75ceb173df6b2e55d64e1943954ee2
        ))}
      </div>

      <div className="phone-frame">
        <div className="sos-header">
          <Link to="/" className="sos-logo">SOS Narva</Link>
<<<<<<< HEAD
          <button className="sos-menu-btn" type="button" aria-label="Открыть меню" onClick={() => setOpen(true)}>
=======
          <button className="sos-menu-btn" onClick={() => setOpen(true)}>
>>>>>>> f6dfbbf69b75ceb173df6b2e55d64e1943954ee2
            <svg className="sos-menu-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 12h16M4 18h6" />
            </svg>
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
