import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api';

export function ProviderReg6() {
  const nav = useNavigate();
  const [employees, setEmployees] = useState([{ name: '', phone: '', languages: ['RUS'] }]);
  const [err, setErr] = useState('');

  function setEmployee(idx, patch) {
    const copy = employees.slice();
    copy[idx] = { ...copy[idx], ...patch };
    setEmployees(copy);
  }

  function addEmployee() {
    setEmployees([...employees, { name: '', phone: '', languages: ['RUS'] }]);
  }

  async function submit() {
    setErr('');
    try {
      const company = JSON.parse(sessionStorage.getItem('providerCompany') || '{}');
      const owner = JSON.parse(sessionStorage.getItem('providerOwner') || '{}');
      const services = JSON.parse(sessionStorage.getItem('providerServices') || '{}');

      const payload = {
        services,
        companyName: company.companyName || '',
        regNumber: company.regNumber || '',
        legalAddress: company.legalAddress || '',
        lat: company.latitude ? Number(company.latitude) : null,
        lng: company.longitude ? Number(company.longitude) : null,
        carsCount: Number(company.carsCount || 0),
        companyCars: company.companyCars || [],
        ownerName: owner.ownerName || '',
        ownerEmail: owner.email || '',
        ownerPhone: owner.phone || '',
        companyLogin: owner.companyLogin || '',
        companyPassword: owner.companyPassword || '',
        companyPhone: owner.companyPhone || '',
        accountNumber: company.accountNumber || '',
        iban: company.iban || '',
        kmkr: company.kmkr || '',
        employees
      };

      const j = await api('/api/register-provider-full', { method: 'POST', body: JSON.stringify(payload) });
      alert('Провайдер зарегистрирован: ' + j.providerId);
      sessionStorage.clear();
      nav('/');
    } catch (e) {
      setErr(e.payload?.error || e.message);
    }
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Шаг 6: Сотрудники и финал</h2>
      <div className="list-col">
        {employees.map((emp, idx) => (
          <div className="card" key={idx}>
            <input className="input" placeholder="Имя" value={emp.name} onChange={(e) => setEmployee(idx, { name: e.target.value })} />
            <input className="input mt-12" placeholder="Телефон" value={emp.phone} onChange={(e) => setEmployee(idx, { phone: e.target.value })} />
            <input className="input mt-12" placeholder="Языки (через запятую)" value={(emp.languages || []).join(', ')} onChange={(e) => setEmployee(idx, { languages: e.target.value.split(',').map((x) => x.trim()).filter(Boolean) })} />
          </div>
        ))}
      </div>
      <button className="btn-sos-secondary mt-12" onClick={addEmployee}>Добавить сотрудника</button>
      {err ? <div className="error">{err}</div> : null}
      <button className="btn-sos-primary mt-16" onClick={submit}>Завершить регистрацию</button>
    </div>
  );
}
