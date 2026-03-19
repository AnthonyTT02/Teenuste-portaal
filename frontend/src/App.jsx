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

<<<<<<< HEAD
const infoContent = {
  settings: {
    title: 'Настройки',
    text: 'Управляйте безопасностью аккаунта и уведомлениями в одном месте.',
    sections: [
      {
        title: 'Безопасность',
        items: [
          'Двухфакторная аутентификация для входа',
          'Уведомления о входах на email',
          'Сброс сессий на других устройствах'
        ]
      },
      {
        title: 'Уведомления',
        items: [
          'Push-уведомления о назначении исполнителя',
          'SMS-уведомления о статусе заказа',
          'Email-отчеты по завершенным заказам'
        ]
      },
      {
        title: 'Конфиденциальность',
        items: [
          'Управление видимостью профиля',
          'Настройка публикации отзывов',
          'Контроль хранения персональных данных'
        ]
      }
    ],
    actionLabel: 'Сохранить изменения'
  },
  terms: {
    title: 'Условия пользования',
    text: 'Используя сервис SOS Narva, вы принимаете правила платформы и условия оказания услуг.',
    sections: [
      {
        title: '1. Общие положения',
        text: 'Платформа предоставляет доступ к услугам дорожной помощи и взаимодействию между клиентами и партнерами.'
      },
      {
        title: '2. Обязанности пользователя',
        text: 'Пользователь обязуется указывать корректные данные, соблюдать законодательство и правила сервиса.'
      },
      {
        title: '3. Ответственность',
        text: 'Сервис не несет ответственность за ущерб, вызванный неверно указанными данными или нарушением инструкций.'
      },
      {
        title: '4. Обновление условий',
        text: 'Мы можем обновлять правила. Существенные изменения публикуются заранее в приложении.'
      }
    ],
    actionLabel: 'Принимаю условия'
  },
  security: {
    title: 'Правила безопасности',
    text: 'Следуйте этим рекомендациям, чтобы защитить аккаунт и платежные данные.',
    sections: [
      {
        title: 'Защита данных',
        items: [
          'Не передавайте пароль и одноразовые коды',
          'Используйте уникальный сложный пароль',
          'Меняйте пароль при подозрительной активности'
        ]
      },
      {
        title: 'Проверка исполнителей',
        items: [
          'Сверяйте рейтинг и отзывы',
          'Проверяйте подтверждение заказа в приложении',
          'Оплачивайте только через платформу'
        ]
      },
      {
        title: 'Если возникла проблема',
        items: [
          'Сразу обращайтесь в поддержку',
          'Сохраняйте переписку и детали заказа',
          'Сообщайте о нарушениях через форму жалоб'
        ]
      }
    ],
    actionLabel: 'Связаться с поддержкой'
  },
  getStarted: {
    title: 'Как начать работать',
    text: 'Пошаговый сценарий первого заказа.',
    sections: [
      { title: 'Шаг 1: Регистрация', text: 'Создайте аккаунт и заполните профиль с актуальными контактными данными.' },
      { title: 'Шаг 2: Подтверждение', text: 'Подтвердите телефон и email, чтобы открыть все функции платформы.' },
      { title: 'Шаг 3: Создание заказа', text: 'Выберите услугу, укажите адрес и описание проблемы.' },
      { title: 'Шаг 4: Выбор исполнителя', text: 'Сравните предложения по цене, ETA и рейтингу.' },
      { title: 'Шаг 5: Завершение', text: 'После выполнения услуги оставьте отзыв и оценку.' }
    ],
    actionLabel: 'Начать работу'
  },
  forBusiness: {
    title: 'Для юридических лиц',
    text: 'Информация для компаний-партнеров, подключающихся к платформе.',
    sections: [
      {
        title: 'Регистрация компании',
        text: 'Подготовьте регистрационные данные, реквизиты и контактные данные ответственного лица.'
      },
      {
        title: 'Требования к партнерам',
        items: [
          'Актуальные регистрационные документы',
          'Соблюдение SLA и правил платформы',
          'Подтвержденные специалисты и транспорт'
        ]
      },
      {
        title: 'Преимущества',
        items: [
          'Поток заказов от активной клиентской базы',
          'Единая система рейтинга и аналитики',
          'Поддержка и прозрачные выплаты'
        ]
      },
      {
        title: 'Комиссия и выплаты',
        text: 'Комиссия зависит от категории услуг. Выплаты производятся регулярно на расчетный счет компании.'
      }
    ],
    actionLabel: 'Присоединиться как партнер'
  },
  forIndividuals: {
    title: 'Для физических лиц',
    text: 'Возможности сервиса для частных клиентов.',
    sections: [
      {
        title: 'Личный кабинет',
        text: 'Управляйте заказами, историей, сохраненными адресами и платежами.'
      },
      {
        title: 'Быстрый заказ',
        text: 'Создайте заявку за несколько шагов и отслеживайте статус в реальном времени.'
      },
      {
        title: 'Безопасные платежи',
        items: [
          'Оплата картой или наличными',
          'Проверка транзакций в истории',
          'Прозрачные чеки по заказам'
        ]
      },
      {
        title: 'Поддержка',
        text: 'Команда поддержки помогает при спорных ситуациях и технических вопросах.'
      }
    ],
    actionLabel: 'Создать первый заказ'
  },
  contacts: {
    title: 'Контакты',
    text: 'Свяжитесь с нами удобным способом.',
    sections: [
      {
        title: 'Адрес',
        items: [
          'SOS Narva OÜ',
          'Эстония, г. Нарва, ул. Пушкина, 15',
          'Индекс: 20307'
        ]
      },
      {
        title: 'Телефоны',
        items: [
          'Основной: +372 357 51000',
          'Поддержка: +372 357 51001',
          'Партнерский отдел: +372 357 51002'
        ]
      },
      {
        title: 'Email',
        items: [
          'info@sosnarva.ee',
          'support@sosnarva.ee',
          'partners@sosnarva.ee'
        ]
      }
    ],
    actionLabel: 'Отправить сообщение'
  }
};

=======
>>>>>>> f6dfbbf69b75ceb173df6b2e55d64e1943954ee2
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

<<<<<<< HEAD
      <Route path="/settings" element={wrap(<InfoPage {...infoContent.settings} />)} />
      <Route path="/terms" element={wrap(<InfoPage {...infoContent.terms} />)} />
      <Route path="/security" element={wrap(<InfoPage {...infoContent.security} />)} />
      <Route path="/get-started" element={wrap(<InfoPage {...infoContent.getStarted} />)} />
      <Route path="/for-business" element={wrap(<InfoPage {...infoContent.forBusiness} />)} />
      <Route path="/for-individuals" element={wrap(<InfoPage {...infoContent.forIndividuals} />)} />
      <Route path="/contacts" element={wrap(<InfoPage {...infoContent.contacts} />)} />
=======
      <Route path="/settings" element={wrap(<InfoPage title="Настройки" text="Раздел настроек перенесен в React. Здесь можно продолжить развитие переключателей и сохранение параметров через API." />)} />
      <Route path="/terms" element={wrap(<InfoPage title="Условия пользования" text="Статическая страница условий доступна в React-версии." />)} />
      <Route path="/security" element={wrap(<InfoPage title="Правила безопасности" text="Рекомендации безопасности перенесены в React-версию." />)} />
      <Route path="/get-started" element={wrap(<InfoPage title="Как начать работать" text="Пошаговая инструкция доступна в React-версии." />)} />
      <Route path="/for-business" element={wrap(<InfoPage title="Для юридических лиц" text="Информация для компаний перенесена в React-версию." />)} />
      <Route path="/for-individuals" element={wrap(<InfoPage title="Для физических лиц" text="Информация для пользователей перенесена в React-версию." />)} />
      <Route path="/contacts" element={wrap(<InfoPage title="Контакты" text="Контактные данные и каналы поддержки доступны в React-версии." />)} />
>>>>>>> f6dfbbf69b75ceb173df6b2e55d64e1943954ee2

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
