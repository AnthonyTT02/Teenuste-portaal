<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> f6dfbbf69b75ceb173df6b2e55d64e1943954ee2
-- Seed test employees and cars for providers
-- These are sample data to support testing the order matching workflow

-- Add test employees to Elite Car Service OÜ
INSERT IGNORE INTO company_employees (provider_id, name, phone, is_online)
SELECT p.id, 'Иван Иванов', '+37250123456', 1
FROM providers p WHERE p.companyName = 'Elite Car Service OÜ'
LIMIT 1;

INSERT IGNORE INTO company_employees (provider_id, name, phone, is_online)
SELECT p.id, 'Мария Петрова', '+37250987654', 1
FROM providers p WHERE p.companyName = 'Elite Car Service OÜ'
LIMIT 1;

-- Add test cars to Elite Car Service OÜ
INSERT IGNORE INTO company_cars (provider_id, name, is_online)
SELECT p.id, 'AB 123', 1
FROM providers p WHERE p.companyName = 'Elite Car Service OÜ'
LIMIT 1;

INSERT IGNORE INTO company_cars (provider_id, name, is_online)
SELECT p.id, 'CD 456', 1
FROM providers p WHERE p.companyName = 'Elite Car Service OÜ'
LIMIT 1;

-- Add test employees to Premium Tow Service
INSERT IGNORE INTO company_employees (provider_id, name, phone, is_online)
SELECT p.id, 'Алексей Морозов', '+37256789124', 1
FROM providers p WHERE p.companyName = 'Premium Tow Service'
LIMIT 1;

INSERT IGNORE INTO company_employees (provider_id, name, phone, is_online)
SELECT p.id, 'Дмитрий Волков', '+37256789125', 1
FROM providers p WHERE p.companyName = 'Premium Tow Service'
LIMIT 1;

-- Add test cars to Premium Tow Service
INSERT IGNORE INTO company_cars (provider_id, name, is_online)
SELECT p.id, 'EF 789', 1
FROM providers p WHERE p.companyName = 'Premium Tow Service'
LIMIT 1;

INSERT IGNORE INTO company_cars (provider_id, name, is_online)
SELECT p.id, 'GH 101', 1
FROM providers p WHERE p.companyName = 'Premium Tow Service'
LIMIT 1;

-- Add test employees to Narva Speed Service
INSERT IGNORE INTO company_employees (provider_id, name, phone, is_online)
SELECT p.id, 'Сергей Козлов', '+37255123457', 1
FROM providers p WHERE p.companyName = 'Narva Speed Service'
LIMIT 1;

INSERT IGNORE INTO company_employees (provider_id, name, phone, is_online)
SELECT p.id, 'Виктор Сахаров', '+37255123458', 1
FROM providers p WHERE p.companyName = 'Narva Speed Service'
LIMIT 1;

-- Add test cars to Narva Speed Service
INSERT IGNORE INTO company_cars (provider_id, name, is_online)
SELECT p.id, 'IJ 202', 1
FROM providers p WHERE p.companyName = 'Narva Speed Service'
LIMIT 1;

INSERT IGNORE INTO company_cars (provider_id, name, is_online)
SELECT p.id, 'KL 303', 1
FROM providers p WHERE p.companyName = 'Narva Speed Service'
LIMIT 1;
<<<<<<< HEAD
=======
=======
-- Seed test employees and cars for providers
-- These are sample data to support testing the order matching workflow

-- Add test employees to Elite Car Service OÜ
INSERT IGNORE INTO company_employees (provider_id, name, phone, is_online)
SELECT p.id, 'Иван Иванов', '+37250123456', 1
FROM providers p WHERE p.companyName = 'Elite Car Service OÜ'
LIMIT 1;

INSERT IGNORE INTO company_employees (provider_id, name, phone, is_online)
SELECT p.id, 'Мария Петрова', '+37250987654', 1
FROM providers p WHERE p.companyName = 'Elite Car Service OÜ'
LIMIT 1;

-- Add test cars to Elite Car Service OÜ
INSERT IGNORE INTO company_cars (provider_id, name, is_online)
SELECT p.id, 'AB 123', 1
FROM providers p WHERE p.companyName = 'Elite Car Service OÜ'
LIMIT 1;

INSERT IGNORE INTO company_cars (provider_id, name, is_online)
SELECT p.id, 'CD 456', 1
FROM providers p WHERE p.companyName = 'Elite Car Service OÜ'
LIMIT 1;

-- Add test employees to Premium Tow Service
INSERT IGNORE INTO company_employees (provider_id, name, phone, is_online)
SELECT p.id, 'Алексей Морозов', '+37256789124', 1
FROM providers p WHERE p.companyName = 'Premium Tow Service'
LIMIT 1;

INSERT IGNORE INTO company_employees (provider_id, name, phone, is_online)
SELECT p.id, 'Дмитрий Волков', '+37256789125', 1
FROM providers p WHERE p.companyName = 'Premium Tow Service'
LIMIT 1;

-- Add test cars to Premium Tow Service
INSERT IGNORE INTO company_cars (provider_id, name, is_online)
SELECT p.id, 'EF 789', 1
FROM providers p WHERE p.companyName = 'Premium Tow Service'
LIMIT 1;

INSERT IGNORE INTO company_cars (provider_id, name, is_online)
SELECT p.id, 'GH 101', 1
FROM providers p WHERE p.companyName = 'Premium Tow Service'
LIMIT 1;

-- Add test employees to Narva Speed Service
INSERT IGNORE INTO company_employees (provider_id, name, phone, is_online)
SELECT p.id, 'Сергей Козлов', '+37255123457', 1
FROM providers p WHERE p.companyName = 'Narva Speed Service'
LIMIT 1;

INSERT IGNORE INTO company_employees (provider_id, name, phone, is_online)
SELECT p.id, 'Виктор Сахаров', '+37255123458', 1
FROM providers p WHERE p.companyName = 'Narva Speed Service'
LIMIT 1;

-- Add test cars to Narva Speed Service
INSERT IGNORE INTO company_cars (provider_id, name, is_online)
SELECT p.id, 'IJ 202', 1
FROM providers p WHERE p.companyName = 'Narva Speed Service'
LIMIT 1;

INSERT IGNORE INTO company_cars (provider_id, name, is_online)
SELECT p.id, 'KL 303', 1
FROM providers p WHERE p.companyName = 'Narva Speed Service'
LIMIT 1;
>>>>>>> 749d43b93c75b07192de6f04c21877c6ff7a531e
>>>>>>> f6dfbbf69b75ceb173df6b2e55d64e1943954ee2
