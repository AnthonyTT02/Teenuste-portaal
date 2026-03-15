USE `sos_narva`;

-- Ensure providers table has lat/lng columns
ALTER TABLE providers ADD COLUMN IF NOT EXISTS lat DOUBLE;
ALTER TABLE providers ADD COLUMN IF NOT EXISTS lng DOUBLE;

-- Seed providers
INSERT INTO providers (companyName, regNumber, accountNumber, iban, kmkr, ownerName, ownerEmail, ownerPhone, employees, lat, lng)
VALUES (
  'Elite Car Service OÜ',
  '12102527',
  'Ee252200221052270573',
  'Ee13101022046204543',
  'KMKR-EXAMPLE',
  'Белозеров Максим',
  'info@multiweb.ee',
  '+3725296507',
  JSON_ARRAY(
    JSON_OBJECT('name','Иван Иванов','phone','+37250123456'),
    JSON_OBJECT('name','Мария Петрова','phone','+37250987654')
  ),
  59.3690,
  28.6562
);

-- Premium Tow Service
INSERT INTO providers (companyName, regNumber, accountNumber, iban, kmkr, ownerName, ownerEmail, ownerPhone, employees, lat, lng)
VALUES (
  'Premium Tow Service',
  '11234567',
  'EE11234567890123456',
  'EE98110011234567890',
  'KMKR-PTS',
  'Петр Сергеев',
  'info@premiumtow.ee',
  '+37256789123',
  JSON_ARRAY(
    JSON_OBJECT('name','Алексей Морозов','phone','+37256789124'),
    JSON_OBJECT('name','Дмитрий Волков','phone','+37256789125')
  ),
  59.3750,
  28.6480
);

-- Narva Speed Service
INSERT INTO providers (companyName, regNumber, accountNumber, iban, kmkr, ownerName, ownerEmail, ownerPhone, employees, lat, lng)
VALUES (
  'Narva Speed Service',
  '12345678',
  'EE12345678901234567',
  'EE98121234567890123',
  'KMKR-NSS',
  'Ольга Федорова',
  'contact@narvaspeed.ee',
  '+37255123456',
  JSON_ARRAY(
    JSON_OBJECT('name','Сергей Козлов','phone','+37255123457'),
    JSON_OBJECT('name','Виктор Сахаров','phone','+37255123458')
  ),
  59.3720,
  28.6540
);

-- Auto Rescue 24/7
INSERT INTO providers (companyName, regNumber, accountNumber, iban, kmkr, ownerName, ownerEmail, ownerPhone, employees, lat, lng)
VALUES (
  'Auto Rescue 24/7',
  '13456789',
  'EE13456789012345678',
  'EE98132345678901234',
  'KMKR-AR24',
  'Николай Голубев',
  'help@autorescue24.ee',
  '+37257654321',
  JSON_ARRAY(
    JSON_OBJECT('name','Владимир Азаров','phone','+37257654322'),
    JSON_OBJECT('name','Евгений Ефремов','phone','+37257654323')
  ),
  59.3800,
  28.6400
);

-- City Tow Narva
INSERT INTO providers (companyName, regNumber, accountNumber, iban, kmkr, ownerName, ownerEmail, ownerPhone, employees, lat, lng)
VALUES (
  'City Tow Narva',
  '14567890',
  'EE14567890123456789',
  'EE98143456789012345',
  'KMKR-CTN',
  'Виталий Кулаков',
  'dispatch@citytow.ee',
  '+37258456789',
  JSON_ARRAY(
    JSON_OBJECT('name','Игорь Фисенко','phone','+37258456790'),
    JSON_OBJECT('name','Михаил Шестов','phone','+37258456791')
  ),
  59.3680,
  28.6600
);

-- Baltic Emergency Transport
INSERT INTO providers (companyName, regNumber, accountNumber, iban, kmkr, ownerName, ownerEmail, ownerPhone, employees, lat, lng)
VALUES (
  'Baltic Emergency Transport',
  '15678901',
  'EE15678901234567890',
  'EE98154567890123456',
  'KMKR-BET',
  'Станислав Романенко',
  'admin@baltrem.ee',
  '+37259567890',
  JSON_ARRAY(
    JSON_OBJECT('name','Борис Чернецов','phone','+37259567891'),
    JSON_OBJECT('name','Леонид Яковлев','phone','+37259567892')
  ),
  59.3710,
  28.6480
);

-- Narva Professional Towing
INSERT INTO providers (companyName, regNumber, accountNumber, iban, kmkr, ownerName, ownerEmail, ownerPhone, employees, lat, lng)
VALUES (
  'Narva Professional Towing',
  '16789012',
  'EE16789012345678901',
  'EE98165678901234567',
  'KMKR-NPT',
  'Геннадий Иванов',
  'service@narvapro.ee',
  '+37254123456',
  JSON_ARRAY(
    JSON_OBJECT('name','Юрий Сафин','phone','+37254123457'),
    JSON_OBJECT('name','Павел Нечипоренко','phone','+37254123458')
  ),
  59.3760,
  28.6520
);

-- Express Auto Help
INSERT INTO providers (companyName, regNumber, accountNumber, iban, kmkr, ownerName, ownerEmail, ownerPhone, employees, lat, lng)
VALUES (
  'Express Auto Help',
  '17890123',
  'EE17890123456789012',
  'EE98176789012345678',
  'KMKR-EAH',
  'Артём Третьяков',
  'quick@expressauto.ee',
  '+37253234567',
  JSON_ARRAY(
    JSON_OBJECT('name','Константин Орлов','phone','+37253234568')
  ),
  59.3730,
  28.6450
);

-- Road Service Plus
INSERT INTO providers (companyName, regNumber, accountNumber, iban, kmkr, ownerName, ownerEmail, ownerPhone, employees, lat, lng)
VALUES (
  'Road Service Plus',
  '18901234',
  'EE18901234567890123',
  'EE98187890123456789',
  'KMKR-RSP',
  'Яков Беленьский',
  'ops@roadplus.ee',
  '+37252345678',
  JSON_ARRAY(
    JSON_OBJECT('name','Родион Ушаков','phone','+37252345679'),
    JSON_OBJECT('name','Сергей Лавров','phone','+37252345680')
  ),
  59.3690,
  28.6580
);

-- Eco Tow Service
INSERT INTO providers (companyName, regNumber, accountNumber, iban, kmkr, ownerName, ownerEmail, ownerPhone, employees, lat, lng)
VALUES (
  'Eco Tow Service',
  '19012345',
  'EE19012345678901234',
  'EE98198901234567890',
  'KMKR-ETS',
  'Ян Петровский',
  'green@ecotow.ee',
  '+37251456789',
  JSON_ARRAY(
    JSON_OBJECT('name','Валерий Кольцов','phone','+37251456790')
  ),
  59.3810,
  28.6350
);

-- All Roads Service
INSERT INTO providers (companyName, regNumber, accountNumber, iban, kmkr, ownerName, ownerEmail, ownerPhone, employees, lat, lng)
VALUES (
  'All Roads Service',
  '20123456',
  'EE20123456789012345',
  'EE98209012345678901',
  'KMKR-ARS',
  'Вадим Лебедев',
  'main@allroads.ee',
  '+37250567890',
  JSON_ARRAY(
    JSON_OBJECT('name','Анатолий Денисов','phone','+37250567891'),
    JSON_OBJECT('name','Тимофей Гаврилов','phone','+37250567892'),
    JSON_OBJECT('name','Кирилл Демьянов','phone','+37250567893')
  ),
  59.3740,
  28.6510
);

-- FastTrack Towing
INSERT INTO providers (companyName, regNumber, accountNumber, iban, kmkr, ownerName, ownerEmail, ownerPhone, employees, lat, lng)
VALUES (
  'FastTrack Towing',
  '21234567',
  'EE21234567890123456',
  'EE98210234567890123',
  'KMKR-FT',
  'Александр Кравченко',
  'dispatch@fasttrack.ee',
  '+37256543210',
  JSON_ARRAY(
    JSON_OBJECT('name','Валентин Москаленко','phone','+37256543211'),
    JSON_OBJECT('name','Роман Козлов','phone','+37256543212')
  ),
  59.3680,
  28.6620
);

-- Seed registrations
INSERT INTO registrations (name, email, phone, payload)
VALUES (
  'Белозеров Максим',
  'info@multiweb.ee',
  '+3725296507',
  JSON_OBJECT('source','Provider_Reg_3','companyName','Elite Car Service OÜ','regNumber','12102527')
);

INSERT INTO registrations (name, email, phone, payload)
VALUES (
  'Белозеров Максим',
  'noreply@example.com',
  '+3725298507',
  JSON_OBJECT('source','Slide_3','note','sample registration from slide 3')
);

-- Services table and seed (unique by name so re-running seed is safe)
CREATE TABLE IF NOT EXISTS `services` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `uniq_name` (`name`)
);

INSERT IGNORE INTO services (name) VALUES
('Эвакуатор'),
('Вскрытие авто. Замена замков'),
('Замена шин, ремонт на дороге'),
('Закончилось топливо'),
('Поиск ближайшего автосервиса');

-- Provider specific prices for services
CREATE TABLE IF NOT EXISTS `provider_services` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `provider_id` INT NOT NULL,
  `service_id` INT NOT NULL,
  `price` DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (`provider_id`) REFERENCES providers(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`service_id`) REFERENCES services(`id`) ON DELETE CASCADE
);

-- Orders table
CREATE TABLE IF NOT EXISTS `orders` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `vehicleBrand` VARCHAR(255),
  `vehicleModel` VARCHAR(255),
  `regNumber` VARCHAR(100),
  `services` JSON,
  `address` TEXT,
  `lat` DOUBLE,
  `lng` DOUBLE,
  `paymentType` VARCHAR(50),
  `provider_id` INT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sample provider prices (assumes providers and services exist)
INSERT IGNORE INTO provider_services (provider_id, service_id, price)
VALUES
((SELECT id FROM providers WHERE companyName = 'Elite Car Service OÜ'), (SELECT id FROM services WHERE name = 'Эвакуатор'), 35.00),
((SELECT id FROM providers WHERE companyName = 'Elite Car Service OÜ'), (SELECT id FROM services WHERE name = 'Вскрытие авто. Замена замков'), 50.00),
((SELECT id FROM providers WHERE companyName = 'Elite Car Service OÜ'), (SELECT id FROM services WHERE name = 'Замена шин, ремонт на дороге'), 45.00),
((SELECT id FROM providers WHERE companyName = 'Elite Car Service OÜ'), (SELECT id FROM services WHERE name = 'Закончилось топливо'), 20.00),
((SELECT id FROM providers WHERE companyName = 'Elite Car Service OÜ'), (SELECT id FROM services WHERE name = 'Поиск ближайшего автосервиса'), 25.00),

((SELECT id FROM providers WHERE companyName = 'Premium Tow Service'), (SELECT id FROM services WHERE name = 'Эвакуатор'), 38.00),
((SELECT id FROM providers WHERE companyName = 'Premium Tow Service'), (SELECT id FROM services WHERE name = 'Вскрытие авто. Замена замков'), 55.00),
((SELECT id FROM providers WHERE companyName = 'Premium Tow Service'), (SELECT id FROM services WHERE name = 'Замена шин, ремонт на дороге'), 48.00),
((SELECT id FROM providers WHERE companyName = 'Premium Tow Service'), (SELECT id FROM services WHERE name = 'Закончилось топливо'), 22.00),
((SELECT id FROM providers WHERE companyName = 'Premium Tow Service'), (SELECT id FROM services WHERE name = 'Поиск ближайшего автосервиса'), 28.00),

((SELECT id FROM providers WHERE companyName = 'Narva Speed Service'), (SELECT id FROM services WHERE name = 'Эвакуатор'), 40.00),
((SELECT id FROM providers WHERE companyName = 'Narva Speed Service'), (SELECT id FROM services WHERE name = 'Вскрытие авто. Замена замков'), 58.00),
((SELECT id FROM providers WHERE companyName = 'Narva Speed Service'), (SELECT id FROM services WHERE name = 'Замена шин, ремонт на дороге'), 52.00),
((SELECT id FROM providers WHERE companyName = 'Narva Speed Service'), (SELECT id FROM services WHERE name = 'Закончилось топливо'), 25.00),
((SELECT id FROM providers WHERE companyName = 'Narva Speed Service'), (SELECT id FROM services WHERE name = 'Поиск ближайшего автосервиса'), 32.00),

((SELECT id FROM providers WHERE companyName = 'Auto Rescue 24/7'), (SELECT id FROM services WHERE name = 'Эвакуатор'), 36.00),
((SELECT id FROM providers WHERE companyName = 'Auto Rescue 24/7'), (SELECT id FROM services WHERE name = 'Вскрытие авто. Замена замков'), 52.00),
((SELECT id FROM providers WHERE companyName = 'Auto Rescue 24/7'), (SELECT id FROM services WHERE name = 'Замена шин, ремонт на дороге'), 46.00),
((SELECT id FROM providers WHERE companyName = 'Auto Rescue 24/7'), (SELECT id FROM services WHERE name = 'Закончилось топливо'), 21.00),
((SELECT id FROM providers WHERE companyName = 'Auto Rescue 24/7'), (SELECT id FROM services WHERE name = 'Поиск ближайшего автосервиса'), 26.00),

((SELECT id FROM providers WHERE companyName = 'City Tow Narva'), (SELECT id FROM services WHERE name = 'Эвакуатор'), 33.00),
((SELECT id FROM providers WHERE companyName = 'City Tow Narva'), (SELECT id FROM services WHERE name = 'Вскрытие авто. Замена замков'), 48.00),
((SELECT id FROM providers WHERE companyName = 'City Tow Narva'), (SELECT id FROM services WHERE name = 'Замена шин, ремонт на дороге'), 43.00),
((SELECT id FROM providers WHERE companyName = 'City Tow Narva'), (SELECT id FROM services WHERE name = 'Закончилось топливо'), 20.00),
((SELECT id FROM providers WHERE companyName = 'City Tow Narva'), (SELECT id FROM services WHERE name = 'Поиск ближайшего автосервиса'), 24.00),

((SELECT id FROM providers WHERE companyName = 'Baltic Emergency Transport'), (SELECT id FROM services WHERE name = 'Эвакуатор'), 37.50),
((SELECT id FROM providers WHERE companyName = 'Baltic Emergency Transport'), (SELECT id FROM services WHERE name = 'Вскрытие авто. Замена замков'), 51.00),
((SELECT id FROM providers WHERE companyName = 'Baltic Emergency Transport'), (SELECT id FROM services WHERE name = 'Замена шин, ремонт на дороге'), 47.00),
((SELECT id FROM providers WHERE companyName = 'Baltic Emergency Transport'), (SELECT id FROM services WHERE name = 'Закончилось топливо'), 23.00),
((SELECT id FROM providers WHERE companyName = 'Baltic Emergency Transport'), (SELECT id FROM services WHERE name = 'Поиск ближайшего автосервиса'), 29.00),

((SELECT id FROM providers WHERE companyName = 'Narva Professional Towing'), (SELECT id FROM services WHERE name = 'Эвакуатор'), 39.00),
((SELECT id FROM providers WHERE companyName = 'Narva Professional Towing'), (SELECT id FROM services WHERE name = 'Вскрытие авто. Замена замков'), 56.00),
((SELECT id FROM providers WHERE companyName = 'Narva Professional Towing'), (SELECT id FROM services WHERE name = 'Замена шин, ремонт на дороге'), 50.00),
((SELECT id FROM providers WHERE companyName = 'Narva Professional Towing'), (SELECT id FROM services WHERE name = 'Закончилось топливо'), 24.00),
((SELECT id FROM providers WHERE companyName = 'Narva Professional Towing'), (SELECT id FROM services WHERE name = 'Поиск ближайшего автосервиса'), 31.00),

((SELECT id FROM providers WHERE companyName = 'Express Auto Help'), (SELECT id FROM services WHERE name = 'Эвакуатор'), 34.00),
((SELECT id FROM providers WHERE companyName = 'Express Auto Help'), (SELECT id FROM services WHERE name = 'Вскрытие авто. Замена замков'), 47.00),
((SELECT id FROM providers WHERE companyName = 'Express Auto Help'), (SELECT id FROM services WHERE name = 'Замена шин, ремонт на дороге'), 41.00),
((SELECT id FROM providers WHERE companyName = 'Express Auto Help'), (SELECT id FROM services WHERE name = 'Закончилось топливо'), 20.00),
((SELECT id FROM providers WHERE companyName = 'Express Auto Help'), (SELECT id FROM services WHERE name = 'Поиск ближайшего автосервиса'), 23.00),

((SELECT id FROM providers WHERE companyName = 'Road Service Plus'), (SELECT id FROM services WHERE name = 'Эвакуатор'), 35.50),
((SELECT id FROM providers WHERE companyName = 'Road Service Plus'), (SELECT id FROM services WHERE name = 'Вскрытие авто. Замена замков'), 49.00),
((SELECT id FROM providers WHERE companyName = 'Road Service Plus'), (SELECT id FROM services WHERE name = 'Замена шин, ремонт на дороге'), 44.00),
((SELECT id FROM providers WHERE companyName = 'Road Service Plus'), (SELECT id FROM services WHERE name = 'Закончилось топливо'), 21.50),
((SELECT id FROM providers WHERE companyName = 'Road Service Plus'), (SELECT id FROM services WHERE name = 'Поиск ближайшего автосервиса'), 27.00),

((SELECT id FROM providers WHERE companyName = 'Eco Tow Service'), (SELECT id FROM services WHERE name = 'Эвакуатор'), 36.50),
((SELECT id FROM providers WHERE companyName = 'Eco Tow Service'), (SELECT id FROM services WHERE name = 'Вскрытие авто. Замена замков'), 50.00),
((SELECT id FROM providers WHERE companyName = 'Eco Tow Service'), (SELECT id FROM services WHERE name = 'Замена шин, ремонт на дороге'), 45.50),
((SELECT id FROM providers WHERE companyName = 'Eco Tow Service'), (SELECT id FROM services WHERE name = 'Закончилось топливо'), 22.50),
((SELECT id FROM providers WHERE companyName = 'Eco Tow Service'), (SELECT id FROM services WHERE name = 'Поиск ближайшего автосервиса'), 30.00),

((SELECT id FROM providers WHERE companyName = 'All Roads Service'), (SELECT id FROM services WHERE name = 'Эвакуатор'), 34.50),
((SELECT id FROM providers WHERE companyName = 'All Roads Service'), (SELECT id FROM services WHERE name = 'Вскрытие авто. Замена замков'), 48.50),
((SELECT id FROM providers WHERE companyName = 'All Roads Service'), (SELECT id FROM services WHERE name = 'Замена шин, ремонт на дороге'), 43.50),
((SELECT id FROM providers WHERE companyName = 'All Roads Service'), (SELECT id FROM services WHERE name = 'Закончилось топливо'), 19.50),
((SELECT id FROM providers WHERE companyName = 'All Roads Service'), (SELECT id FROM services WHERE name = 'Поиск ближайшего автосервиса'), 26.00),

((SELECT id FROM providers WHERE companyName = 'FastTrack Towing'), (SELECT id FROM services WHERE name = 'Эвакуатор'), 42.00),
((SELECT id FROM providers WHERE companyName = 'FastTrack Towing'), (SELECT id FROM services WHERE name = 'Вскрытие авто. Замена замков'), 60.00),
((SELECT id FROM providers WHERE companyName = 'FastTrack Towing'), (SELECT id FROM services WHERE name = 'Замена шин, ремонт на дороге'), 55.00),
((SELECT id FROM providers WHERE companyName = 'FastTrack Towing'), (SELECT id FROM services WHERE name = 'Закончилось топливо'), 28.00),
((SELECT id FROM providers WHERE companyName = 'FastTrack Towing'), (SELECT id FROM services WHERE name = 'Поиск ближайшего автосервиса'), 35.00);

-- Add completed_at column to orders table if not exists
ALTER TABLE `orders` ADD COLUMN IF NOT EXISTS `completed_at` TIMESTAMP NULL DEFAULT NULL;
