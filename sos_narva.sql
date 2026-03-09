-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Хост: 127.0.0.1
-- Время создания: Фев 21 2026 г., 18:31
-- Версия сервера: 10.4.32-MariaDB
-- Версия PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- База данных: `sos_narva`
--

-- --------------------------------------------------------

--
-- Структура таблицы `company_cars`
--

CREATE TABLE `company_cars` (
  `id` int(11) NOT NULL,
  `provider_id` int(11) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `is_online` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Дамп данных таблицы `company_cars`
--

INSERT INTO `company_cars` (`id`, `provider_id`, `name`, `created_at`, `is_online`) VALUES
(4, 26, '123 ABV', '2026-02-21 15:37:03', 1),
(5, 26, '123 AAA', '2026-02-21 15:37:03', 1);

-- --------------------------------------------------------

--
-- Структура таблицы `company_employees`
--

CREATE TABLE `company_employees` (
  `id` int(11) NOT NULL,
  `provider_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `phone` varchar(20) NOT NULL,
  `languages` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`languages`)),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `is_online` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Дамп данных таблицы `company_employees`
--

INSERT INTO `company_employees` (`id`, `provider_id`, `name`, `phone`, `languages`, `created_at`, `is_online`) VALUES
(1, 26, 'Артем Фетюков', '+111 1111 1111', '[\"RUS\",\"EST\",\"ENG\"]', '2026-02-21 15:37:03', 0),
(2, 26, 'Антон Славянцев', '+222 2222 2222', '[\"RUS\",\"EST\",\"ENG\",\"FIN\"]', '2026-02-21 15:37:03', 0);

-- --------------------------------------------------------

--
-- Структура таблицы `orders`
--

CREATE TABLE `orders` (
  `id` int(11) NOT NULL,
  `vehicleBrand` varchar(255) DEFAULT NULL,
  `vehicleModel` varchar(255) DEFAULT NULL,
  `regNumber` varchar(100) DEFAULT NULL,
  `services` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`services`)),
  `address` text DEFAULT NULL,
  `lat` double DEFAULT NULL,
  `lng` double DEFAULT NULL,
  `paymentType` varchar(50) DEFAULT NULL,
  `provider_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `completed_at` timestamp NULL DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  `employee_id` int(11) DEFAULT NULL,
  `car_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Дамп данных таблицы `orders`
--

INSERT INTO `orders` (`id`, `vehicleBrand`, `vehicleModel`, `regNumber`, `services`, `address`, `lat`, `lng`, `paymentType`, `provider_id`, `created_at`, `completed_at`, `user_id`, `employee_id`, `car_id`) VALUES
(32, 'Volvo', 'X70', '123 ADC', '[\"2\"]', 'улица Пауля Кереса, Kerese, Нарва, город Нарва, Уезд Ида-Вирумаа, 20304, Эстония', 59.37519, 28.18268, 'cash', 26, '2026-02-21 16:36:12', '2026-02-21 16:36:29', 10, 2, 5),
(33, 'Volvo', 'X70', '123 ADC', '[\"3\"]', 'улица Пауля Кереса, Kerese, Нарва, город Нарва, Уезд Ида-Вирумаа, 20304, Эстония', 59.37519, 28.18268, 'cash', 26, '2026-02-21 16:37:00', '2026-02-21 16:37:38', 10, 2, 4),
(34, 'Volvo', 'X70', '123 ADC', '[\"4\"]', 'улица Пауля Кереса, Kerese, Нарва, город Нарва, Уезд Ида-Вирумаа, 20304, Эстония', 59.37519, 28.18268, 'cash', NULL, '2026-02-21 16:38:26', NULL, 10, NULL, NULL),
(35, 'Volvo', 'X70', '123 ADC', '[\"4\"]', 'улица Пауля Кереса, Kerese, Нарва, город Нарва, Уезд Ида-Вирумаа, 20304, Эстония', 59.37519, 28.18268, 'card', NULL, '2026-02-21 16:38:32', NULL, 10, NULL, NULL),
(36, 'Volvo', 'X70', '123 ADC', '[\"2\"]', 'улица Пауля Кереса, Kerese, Нарва, город Нарва, Уезд Ида-Вирумаа, 20304, Эстония', 59.37519, 28.18268, 'card', 26, '2026-02-21 16:38:42', NULL, 10, 2, 5);

-- --------------------------------------------------------

--
-- Структура таблицы `providers`
--

CREATE TABLE `providers` (
  `id` int(11) NOT NULL,
  `companyName` varchar(255) DEFAULT NULL,
  `regNumber` varchar(100) DEFAULT NULL,
  `accountNumber` varchar(255) DEFAULT NULL,
  `iban` varchar(255) DEFAULT NULL,
  `kmkr` varchar(100) DEFAULT NULL,
  `ownerName` varchar(255) DEFAULT NULL,
  `ownerEmail` varchar(255) DEFAULT NULL,
  `ownerPhone` varchar(100) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `lat` double DEFAULT NULL,
  `lng` double DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Дамп данных таблицы `providers`
--

INSERT INTO `providers` (`id`, `companyName`, `regNumber`, `accountNumber`, `iban`, `kmkr`, `ownerName`, `ownerEmail`, `ownerPhone`, `created_at`, `lat`, `lng`) VALUES
(26, 'SPTV22', '11111111', 'EE111111111111', 'EE111111111111', 'EE111111111', 'Артем Фетюков', 'SPTV22@GMAIL.COM', '+111 1111 11', '2026-02-21 15:37:03', 59.360651, 28.188179);

-- --------------------------------------------------------

--
-- Структура таблицы `provider_services`
--

CREATE TABLE `provider_services` (
  `id` int(11) NOT NULL,
  `provider_id` int(11) NOT NULL,
  `service_id` int(11) NOT NULL,
  `price` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Дамп данных таблицы `provider_services`
--

INSERT INTO `provider_services` (`id`, `provider_id`, `service_id`, `price`) VALUES
(73, 26, 2, 5.00),
(74, 26, 3, 5.00);

-- --------------------------------------------------------

--
-- Структура таблицы `registrations`
--

CREATE TABLE `registrations` (
  `id` int(11) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `phone` varchar(100) DEFAULT NULL,
  `payload` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`payload`)),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Структура таблицы `services`
--

CREATE TABLE `services` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Дамп данных таблицы `services`
--

INSERT INTO `services` (`id`, `name`, `created_at`) VALUES
(1, 'Эвакуатор.', '2026-02-14 09:48:22'),
(2, 'Вскрытие авто.', '2026-02-14 09:48:22'),
(3, 'Замена шин.', '2026-02-14 09:48:22'),
(4, '\"Прикурить\" / Запуск авто.', '2026-02-14 09:48:22'),
(5, 'Подкачка шин.', '2026-02-14 09:48:22');

-- --------------------------------------------------------

--
-- Структура таблицы `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `phone` varchar(20) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `role` varchar(32) DEFAULT 'user',
  `provider_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Дамп данных таблицы `users`
--

INSERT INTO `users` (`id`, `username`, `password`, `phone`, `created_at`, `role`, `provider_id`) VALUES
(10, 'TEST', 'f6e0a1e2ac41945a9aa7ff8a8aaa0cebc12a3bcc981a929ad5cf810a090e11ae', '+111 1111 1111', '2026-02-21 15:34:59', 'user', NULL),
(11, 'Company', 'f6e0a1e2ac41945a9aa7ff8a8aaa0cebc12a3bcc981a929ad5cf810a090e11ae', '+111 1111 1111', '2026-02-21 15:37:03', 'company', 26),
(12, 'testuser_1771691590018', '$2b$10$test', '+37250000000', '2026-02-21 16:33:10', 'user', NULL);

--
-- Индексы сохранённых таблиц
--

--
-- Индексы таблицы `company_cars`
--
ALTER TABLE `company_cars`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_provider` (`provider_id`);

--
-- Индексы таблицы `company_employees`
--
ALTER TABLE `company_employees`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_provider` (`provider_id`);

--
-- Индексы таблицы `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`);

--
-- Индексы таблицы `providers`
--
ALTER TABLE `providers`
  ADD PRIMARY KEY (`id`);

--
-- Индексы таблицы `provider_services`
--
ALTER TABLE `provider_services`
  ADD PRIMARY KEY (`id`),
  ADD KEY `provider_id` (`provider_id`),
  ADD KEY `service_id` (`service_id`);

--
-- Индексы таблицы `registrations`
--
ALTER TABLE `registrations`
  ADD PRIMARY KEY (`id`);

--
-- Индексы таблицы `services`
--
ALTER TABLE `services`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uniq_name` (`name`);

--
-- Индексы таблицы `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`);

--
-- AUTO_INCREMENT для сохранённых таблиц
--

--
-- AUTO_INCREMENT для таблицы `company_cars`
--
ALTER TABLE `company_cars`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT для таблицы `company_employees`
--
ALTER TABLE `company_employees`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT для таблицы `orders`
--
ALTER TABLE `orders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=37;

--
-- AUTO_INCREMENT для таблицы `providers`
--
ALTER TABLE `providers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=27;

--
-- AUTO_INCREMENT для таблицы `provider_services`
--
ALTER TABLE `provider_services`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=75;

--
-- AUTO_INCREMENT для таблицы `registrations`
--
ALTER TABLE `registrations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=53;

--
-- AUTO_INCREMENT для таблицы `services`
--
ALTER TABLE `services`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=58;

--
-- AUTO_INCREMENT для таблицы `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- Ограничения внешнего ключа сохраненных таблиц
--

--
-- Ограничения внешнего ключа таблицы `company_cars`
--
ALTER TABLE `company_cars`
  ADD CONSTRAINT `company_cars_ibfk_1` FOREIGN KEY (`provider_id`) REFERENCES `providers` (`id`) ON DELETE CASCADE;

--
-- Ограничения внешнего ключа таблицы `company_employees`
--
ALTER TABLE `company_employees`
  ADD CONSTRAINT `company_employees_ibfk_1` FOREIGN KEY (`provider_id`) REFERENCES `providers` (`id`) ON DELETE CASCADE;

--
-- Ограничения внешнего ключа таблицы `provider_services`
--
ALTER TABLE `provider_services`
  ADD CONSTRAINT `provider_services_ibfk_1` FOREIGN KEY (`provider_id`) REFERENCES `providers` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `provider_services_ibfk_2` FOREIGN KEY (`service_id`) REFERENCES `services` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
