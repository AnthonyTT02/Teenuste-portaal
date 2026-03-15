import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../api';

export function ProviderPage() {
  const [params] = useSearchParams();
  const [provider, setProvider] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const id = params.get('providerId');
    if (!id) return;
    const userId = localStorage.getItem('userId') || '';
    api('/api/provider/' + encodeURIComponent(id) + '?userId=' + encodeURIComponent(userId))
      .then((j) => setProvider(j.provider))
      .catch((e) => setError(e.payload?.error || e.message));
  }, [params]);

  if (error) return <div style={{ padding: 20 }} className="error">{error}</div>;
  if (!provider) return <div style={{ padding: 20 }}>Загрузка...</div>;

  return (
    <div style={{ padding: 20 }}>
      <h2>{provider.companyName}</h2>
      <div className="card">Рег. номер: {provider.regNumber || '-'}</div>
      <h3 className="mt-16">Машины</h3>
      <div className="card">{(provider.cars || []).map((c) => c.regNumber).join(', ') || 'Нет'}</div>
      <h3 className="mt-16">Сотрудники</h3>
      <div className="card">{(provider.employees || []).map((e) => e.name).join(', ') || 'Нет'}</div>
    </div>
  );
}
