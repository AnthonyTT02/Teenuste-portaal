import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export function ProviderReg3() {
  const nav = useNavigate();
  const [f, setF] = useState(() => JSON.parse(sessionStorage.getItem('providerOwner') || '{}'));

  function next() {
    sessionStorage.setItem('providerOwner', JSON.stringify(f));
    nav('/provider-reg/4');
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Шаг 3: Владелец и доступ компании</h2>
      <input className="input" placeholder="Имя владельца" value={f.ownerName || ''} onChange={(e) => setF({ ...f, ownerName: e.target.value })} />
      <input className="input mt-12" placeholder="Телефон" value={f.phone || ''} onChange={(e) => setF({ ...f, phone: e.target.value })} />
      <input className="input mt-12" placeholder="Email" value={f.email || ''} onChange={(e) => setF({ ...f, email: e.target.value })} />
      <input className="input mt-12" placeholder="Логин компании" value={f.companyLogin || ''} onChange={(e) => setF({ ...f, companyLogin: e.target.value })} />
      <input className="input mt-12" type="password" placeholder="Пароль компании" value={f.companyPassword || ''} onChange={(e) => setF({ ...f, companyPassword: e.target.value })} />
      <input className="input mt-12" placeholder="Телефон компании" value={f.companyPhone || ''} onChange={(e) => setF({ ...f, companyPhone: e.target.value })} />
      <button className="btn-sos-primary mt-16" onClick={next}>Далее</button>
    </div>
  );
}
