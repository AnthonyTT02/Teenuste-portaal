<<<<<<< HEAD
=======
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> f6dfbbf69b75ceb173df6b2e55d64e1943954ee2
>>>>>>> 6f3e1231dbbf21d9e9191af2350e9486e8609650
-- Миграция для добавления email verification

-- Создать таблицу users если её нет
CREATE TABLE IF NOT EXISTS `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `username` varchar(100) NOT NULL UNIQUE,
  `phone` varchar(100) DEFAULT NULL,
  `email` varchar(255) NOT NULL UNIQUE,
  `password` varchar(255) NOT NULL,
  `is_verified` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Создать таблицу email_confirmations
CREATE TABLE IF NOT EXISTS `email_confirmations` (
  `id` int(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `user_id` int(11) NOT NULL,
  `token` varchar(255) NOT NULL UNIQUE,
  `email` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `expires_at` datetime NOT NULL,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Создать индексы
CREATE INDEX IF NOT EXISTS `idx_token` ON `email_confirmations`(`token`);
CREATE INDEX IF NOT EXISTS `idx_user_id` ON `email_confirmations`(`user_id`);
CREATE INDEX IF NOT EXISTS `idx_expires_at` ON `email_confirmations`(`expires_at`);

-- Если таблица уже существует, добавить колонки если их нет
ALTER TABLE `users` ADD COLUMN IF NOT EXISTS `email` varchar(255) UNIQUE;
ALTER TABLE `users` ADD COLUMN IF NOT EXISTS `is_verified` tinyint(1) NOT NULL DEFAULT 0;
ALTER TABLE `users` ADD COLUMN IF NOT EXISTS `phone` varchar(100) DEFAULT NULL;
<<<<<<< HEAD
=======
<<<<<<< HEAD
=======
=======
-- Миграция для добавления email verification

-- Создать таблицу users если её нет
CREATE TABLE IF NOT EXISTS `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `username` varchar(100) NOT NULL UNIQUE,
  `phone` varchar(100) DEFAULT NULL,
  `email` varchar(255) NOT NULL UNIQUE,
  `password` varchar(255) NOT NULL,
  `is_verified` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Создать таблицу email_confirmations
CREATE TABLE IF NOT EXISTS `email_confirmations` (
  `id` int(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `user_id` int(11) NOT NULL,
  `token` varchar(255) NOT NULL UNIQUE,
  `email` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `expires_at` datetime NOT NULL,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Создать индексы
CREATE INDEX IF NOT EXISTS `idx_token` ON `email_confirmations`(`token`);
CREATE INDEX IF NOT EXISTS `idx_user_id` ON `email_confirmations`(`user_id`);
CREATE INDEX IF NOT EXISTS `idx_expires_at` ON `email_confirmations`(`expires_at`);

-- Если таблица уже существует, добавить колонки если их нет
ALTER TABLE `users` ADD COLUMN IF NOT EXISTS `email` varchar(255) UNIQUE;
ALTER TABLE `users` ADD COLUMN IF NOT EXISTS `is_verified` tinyint(1) NOT NULL DEFAULT 0;
ALTER TABLE `users` ADD COLUMN IF NOT EXISTS `phone` varchar(100) DEFAULT NULL;
>>>>>>> 749d43b93c75b07192de6f04c21877c6ff7a531e
>>>>>>> f6dfbbf69b75ceb173df6b2e55d64e1943954ee2
>>>>>>> 6f3e1231dbbf21d9e9191af2350e9486e8609650
