-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Хост: 127.0.0.1
-- Время создания: Май 04 2026 г., 09:10
-- Версия сервера: 10.4.32-MariaDB
-- Версия PHP: 8.0.30

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
(5, 26, '123 AAA', '2026-02-21 15:37:03', 1),
(6, 27, '765 AXD', '2026-03-11 07:36:01', 1),
(7, 27, '153 HHH', '2026-03-11 07:36:01', 1),
(8, 28, '115AMD', '2026-05-04 06:43:42', 1),
(9, 29, '111BVC', '2026-05-04 06:57:11', 1);

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
(2, 26, 'Антон Славянцев', '+222 2222 2222', '[\"RUS\",\"EST\",\"ENG\",\"FIN\"]', '2026-02-21 15:37:03', 0),
(3, 27, 'Ivan', '+372 9090 9090', '[\"RUS\",\"EST\"]', '2026-03-11 07:36:01', 1),
(4, 27, 'Oleg', '+372 6565 6565', '[\"ENG\",\"FIN\"]', '2026-03-11 07:36:02', 1),
(5, 28, 'Test', '7878787878', '[\"RUS\"]', '2026-05-04 06:43:42', 1),
(6, 29, 'Ivan', '3343434343', '[\"RUS\"]', '2026-05-04 06:57:11', 1);

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
(36, 'Volvo', 'X70', '123 ADC', '[\"2\"]', 'улица Пауля Кереса, Kerese, Нарва, город Нарва, Уезд Ида-Вирумаа, 20304, Эстония', 59.37519, 28.18268, 'card', 26, '2026-02-21 16:38:42', NULL, 10, 2, 5),
(37, 'Volvo', 'X70', '123 ADC', '[\"3\"]', '4, Kulgu, Нарва, город Нарва, Уезд Ида-Вирумаа, 20104, Эстония', 59.35926, 28.18331, 'cash', NULL, '2026-03-11 07:04:08', NULL, 13, NULL, NULL),
(38, 'Volvo', 'X70', '123 ADC', '[\"3\"]', '4, Kulgu, Нарва, город Нарва, Уезд Ида-Вирумаа, 20104, Эстония', 59.35926, 28.18331, 'card', NULL, '2026-03-11 07:21:29', NULL, 13, NULL, NULL),
(39, 'Volvo', 'X70', '123 ADC', '[\"3\"]', '4, Kulgu, Нарва, город Нарва, Уезд Ида-Вирумаа, 20104, Эстония', 59.35926, 28.18331, 'cash', NULL, '2026-03-20 07:01:59', NULL, 13, NULL, NULL),
(40, 'Volvo', 'X70', '123 ADC', '[\"3\"]', '4, Kulgu, Нарва, город Нарва, Уезд Ида-Вирумаа, 20104, Эстония', 59.35926, 28.18331, 'card', NULL, '2026-03-20 07:34:56', NULL, 13, NULL, NULL),
(41, 'Volvo', 'X70', '123 ADC', '[\"3\",\"5\"]', '4, Kulgu, Нарва, город Нарва, Уезд Ида-Вирумаа, 20104, Эстония', 59.35926, 28.18331, 'card', NULL, '2026-03-20 07:35:56', NULL, 13, NULL, NULL),
(42, 'Volvo', 'X70', '123 ADC', '[\"5\"]', '4, Kulgu, Нарва, город Нарва, Уезд Ида-Вирумаа, 20104, Эстония', 59.35926, 28.18331, 'card', NULL, '2026-03-27 10:23:38', NULL, 13, NULL, NULL),
(43, 'Volvo', 'X70', '123 ADC', '[\"5\"]', '4, Kulgu, Нарва, город Нарва, Уезд Ида-Вирумаа, 20104, Эстония', 59.35926, 28.18331, 'card', NULL, '2026-04-06 11:26:33', NULL, 13, NULL, NULL),
(44, 'Volvo', 'X70', '123 ADC', '[]', '4, Kulgu, Нарва, город Нарва, Уезд Ида-Вирумаа, 20104, Эстония', 59.35926, 28.18331, 'card', NULL, '2026-04-06 12:07:49', NULL, 13, NULL, NULL),
(45, 'Audi', 'V30', '402', '[\"2\"]', '4, Kulgu, Нарва, город Нарва, Уезд Ида-Вирумаа, 20104, Эстония', 59.35926, 28.18331, 'cash', NULL, '2026-04-15 06:25:38', NULL, 13, NULL, NULL),
(46, 'Volvo', 'X70', '123 ADC', '[\"1\",\"2\"]', NULL, NULL, NULL, 'card', NULL, '2026-04-15 09:48:32', NULL, 13, NULL, NULL);

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
(26, 'SPTV22', '11111111', 'EE111111111111', 'EE111111111111', 'EE111111111', 'Артем Фетюков', 'SPTV22@GMAIL.COM', '+111 1111 11', '2026-02-21 15:37:03', 59.360651, 28.188179),
(27, 'RoadsideServicw', '121025277', 'EE252200221052270573', 'EE13101022046204543', 'EE100000000', 'Белозеров Максим', 'info@multiweb.com', '+372 8888 8888', '2026-03-11 07:36:01', 59.362042, 28.18275),
(28, 'Test', '45454545454', '333333333333333', '12212', '12121213', 'Test', 'slavyantsev06@mail.ru', '55566666', '2026-05-04 06:43:42', NULL, NULL),
(29, 'Test2', '86868688686', '868787878787', '56776767676', '64545454545', 'Oleg', 'oleg@mail', '545454545', '2026-05-04 06:57:11', NULL, NULL);

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
(74, 26, 3, 5.00),
(75, 27, 1, 20.00),
(76, 28, 3, 5.11),
(77, 29, 1, 4.00);

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
(12, 'testuser_1771691590018', '$2b$10$test', '+37250000000', '2026-02-21 16:33:10', 'user', NULL),
(13, 'Anton', '730f75dafd73e047b86acb2dbd74e75dcb93272fa084a9082848f2341aa1abb6', '+372 5757 5757', '2026-03-11 07:02:25', 'user', NULL),
(14, 'Artjom', 'f284bdc3c1c9e24a494e285cb387c69510f28de51c15bb93179d9c7f28705398', '+372 5555 5555', '2026-03-11 07:22:41', 'user', NULL),
(15, 'Company34', '24d166cd6c8b826c779040b49d5b6708d649b236558e8744339dfee6afe11999', '+372 5555 5555', '2026-03-11 07:36:02', 'company', 27),
(16, 'test@mail', 'f29a448b780745bf2e10667f46c442b102e75e76a46a1fff969641866225ab56', '7777777777', '2026-05-04 06:43:42', 'company', 28),
(17, '333', 'f29a448b780745bf2e10667f46c442b102e75e76a46a1fff969641866225ab56', '232323232', '2026-05-04 06:57:11', 'company', 29);

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT для таблицы `company_employees`
--
ALTER TABLE `company_employees`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT для таблицы `orders`
--
ALTER TABLE `orders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=47;

--
-- AUTO_INCREMENT для таблицы `providers`
--
ALTER TABLE `providers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=30;

--
-- AUTO_INCREMENT для таблицы `provider_services`
--
ALTER TABLE `provider_services`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=78;

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

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
