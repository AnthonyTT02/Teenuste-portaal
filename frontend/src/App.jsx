import { Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from './layout';
import { AuthPage } from './pages/AuthPage';
import { CabinetPage } from './pages/CabinetPage';
import { CompanyPage } from './pages/CompanyPage';
import { ProviderPage } from './pages/ProviderPage';
import { InfoPage } from './pages/InfoPage';
import { ProviderReg1 } from './pages/provider/ProviderReg1';
import { ProviderReg2 } from './pages/provider/ProviderReg2';
import { ProviderReg3 } from './pages/provider/ProviderReg3';
import { ProviderReg4 } from './pages/provider/ProviderReg4';
import { ProviderReg5 } from './pages/provider/ProviderReg5';
import { ProviderReg6 } from './pages/provider/ProviderReg6';
import { Slide1 } from './pages/order/Slide1';
import { Slide2 } from './pages/order/Slide2';
import { Slide5 } from './pages/order/Slide5';
import { Slide6 } from './pages/order/Slide6';

function wrap(node) {
  return <AppLayout>{node}</AppLayout>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={wrap(<AuthPage />)} />
      <Route path="/cabinet" element={wrap(<CabinetPage />)} />
      <Route path="/company" element={wrap(<CompanyPage />)} />
      <Route path="/provider" element={wrap(<ProviderPage />)} />

      <Route path="/provider-reg/1" element={wrap(<ProviderReg1 />)} />
      <Route path="/provider-reg/2" element={wrap(<ProviderReg2 />)} />
      <Route path="/provider-reg/3" element={wrap(<ProviderReg3 />)} />
      <Route path="/provider-reg/4" element={wrap(<ProviderReg4 />)} />
      <Route path="/provider-reg/5" element={wrap(<ProviderReg5 />)} />
      <Route path="/provider-reg/6" element={wrap(<ProviderReg6 />)} />

      <Route path="/order/1" element={wrap(<Slide1 />)} />
      <Route path="/order/2" element={wrap(<Slide2 />)} />
      <Route path="/order/5" element={wrap(<Slide5 />)} />
      <Route path="/order/6" element={wrap(<Slide6 />)} />

      <Route path="/settings" element={wrap(<InfoPage title="Настройки" text="Раздел настроек перенесен в React. Здесь можно продолжить развитие переключателей и сохранение параметров через API." />)} />
      <Route path="/terms" element={wrap(<InfoPage title="Условия пользования" text="Статическая страница условий доступна в React-версии." />)} />
      <Route path="/security" element={wrap(<InfoPage title="Правила безопасности" text="Рекомендации безопасности перенесены в React-версию." />)} />
      <Route path="/get-started" element={wrap(<InfoPage title="Как начать работать" text="Пошаговая инструкция доступна в React-версии." />)} />
      <Route path="/for-business" element={wrap(<InfoPage title="Для юридических лиц" text="Информация для компаний перенесена в React-версию." />)} />
      <Route path="/for-individuals" element={wrap(<InfoPage title="Для физических лиц" text="Информация для пользователей перенесена в React-версию." />)} />
      <Route path="/contacts" element={wrap(<InfoPage title="Контакты" text="Контактные данные и каналы поддержки доступны в React-версии." />)} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
