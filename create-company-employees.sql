<<<<<<< HEAD
=======
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> f6dfbbf69b75ceb173df6b2e55d64e1943954ee2
>>>>>>> 6f3e1231dbbf21d9e9191af2350e9486e8609650
-- Create company_employees table
CREATE TABLE IF NOT EXISTS `company_employees` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `provider_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `phone` varchar(20) NOT NULL,
  `languages` json DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_provider` (`provider_id`),
  FOREIGN KEY (`provider_id`) REFERENCES `providers` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Remove old columns from providers table
ALTER TABLE `providers` 
DROP COLUMN IF EXISTS `employees`,
DROP COLUMN IF EXISTS `companyCars`,
DROP COLUMN IF EXISTS `carsCount`,
DROP COLUMN IF EXISTS `smartId`,
DROP COLUMN IF EXISTS `company_login`,
DROP COLUMN IF EXISTS `company_password`,
DROP COLUMN IF EXISTS `company_phone`;
<<<<<<< HEAD
=======
<<<<<<< HEAD
=======
=======
-- Create company_employees table
CREATE TABLE IF NOT EXISTS `company_employees` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `provider_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `phone` varchar(20) NOT NULL,
  `languages` json DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_provider` (`provider_id`),
  FOREIGN KEY (`provider_id`) REFERENCES `providers` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Remove old columns from providers table
ALTER TABLE `providers` 
DROP COLUMN IF EXISTS `employees`,
DROP COLUMN IF EXISTS `companyCars`,
DROP COLUMN IF EXISTS `carsCount`,
DROP COLUMN IF EXISTS `smartId`,
DROP COLUMN IF EXISTS `company_login`,
DROP COLUMN IF EXISTS `company_password`,
DROP COLUMN IF EXISTS `company_phone`;
>>>>>>> 749d43b93c75b07192de6f04c21877c6ff7a531e
>>>>>>> f6dfbbf69b75ceb173df6b2e55d64e1943954ee2
>>>>>>> 6f3e1231dbbf21d9e9191af2350e9486e8609650
