<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> f6dfbbf69b75ceb173df6b2e55d64e1943954ee2
-- Создать таблицу company_cars
CREATE TABLE IF NOT EXISTS company_cars (
  id INT AUTO_INCREMENT PRIMARY KEY,
  provider_id INT NOT NULL,
  brand VARCHAR(255) NOT NULL,
  model VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (provider_id) REFERENCES providers(id) ON DELETE CASCADE,
  INDEX idx_provider (provider_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Добавить столбцы в таблицу providers если их еще нет
ALTER TABLE providers ADD COLUMN carsCount INT DEFAULT NULL;
ALTER TABLE providers ADD COLUMN companyCars LONGTEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(companyCars));
<<<<<<< HEAD
=======
=======
-- Создать таблицу company_cars
CREATE TABLE IF NOT EXISTS company_cars (
  id INT AUTO_INCREMENT PRIMARY KEY,
  provider_id INT NOT NULL,
  brand VARCHAR(255) NOT NULL,
  model VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (provider_id) REFERENCES providers(id) ON DELETE CASCADE,
  INDEX idx_provider (provider_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Добавить столбцы в таблицу providers если их еще нет
ALTER TABLE providers ADD COLUMN carsCount INT DEFAULT NULL;
ALTER TABLE providers ADD COLUMN companyCars LONGTEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(companyCars));
>>>>>>> 749d43b93c75b07192de6f04c21877c6ff7a531e
>>>>>>> f6dfbbf69b75ceb173df6b2e55d64e1943954ee2
