import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api';

export function ProviderReg2() {
  const nav = useNavigate();
  const [f, setF] = useState(() => JSON.parse(sessionStorage.getItem('providerCompany') || '{}'));
  const [err, setErr] = useState('');

  async function next() {
    setErr('');
    try {
      await api('/api/validate-provider', {
        method: 'POST',
        body: JSON.stringify({
          companyName: f.companyName,
          regNumber: f.regNumber,
          accountNumber: f.accountNumber
        })
      });
      sessionStorage.setItem('providerCompany', JSON.stringify(f));
      nav('/provider-reg/3');
    } catch (e) {
      setErr(e.payload?.error || e.message);
    }
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Шаг 2: Компания</h2>
      <input className="input" placeholder="Название" value={f.companyName || ''} onChange={(e) => setF({ ...f, companyName: e.target.value })} />
      <input className="input mt-12" placeholder="Рег. номер" value={f.regNumber || ''} onChange={(e) => setF({ ...f, regNumber: e.target.value })} />
      <input className="input mt-12" placeholder="Номер счета" value={f.accountNumber || ''} onChange={(e) => setF({ ...f, accountNumber: e.target.value })} />
      <input className="input mt-12" placeholder="IBAN" value={f.iban || ''} onChange={(e) => setF({ ...f, iban: e.target.value })} />
      <input className="input mt-12" placeholder="KMKR" value={f.kmkr || ''} onChange={(e) => setF({ ...f, kmkr: e.target.value })} />
      <input className="input mt-12" type="number" placeholder="Количество машин" value={f.carsCount || ''} onChange={(e) => setF({ ...f, carsCount: Number(e.target.value) })} />
      <textarea className="input mt-12" style={{ height: 80 }} placeholder="Машины через запятую" value={(f.companyCars || []).join(', ')} onChange={(e) => setF({ ...f, companyCars: e.target.value.split(',').map((x) => x.trim()).filter(Boolean) })} />
      <input className="input mt-12" placeholder="Latitude" value={f.latitude || ''} onChange={(e) => setF({ ...f, latitude: e.target.value })} />
      <input className="input mt-12" placeholder="Longitude" value={f.longitude || ''} onChange={(e) => setF({ ...f, longitude: e.target.value })} />
      {err ? <div className="error">{err}</div> : null}
      <button className="btn-sos-primary mt-16" onClick={next}>Далее</button>
    </div>
  );
}
