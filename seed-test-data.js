const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'sos_narva',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

(async () => {
  try {
    console.log('Seeding test employees and cars...');
    
    // Get connection to read seed file or execute queries directly
    const queries = [
      // Elite Car Service OÜ
      `INSERT IGNORE INTO company_employees (provider_id, name, phone, is_online)
       SELECT p.id, 'Иван Иванов', '+37250123456', 1
       FROM providers p WHERE p.companyName = 'Elite Car Service OÜ' LIMIT 1`,
      
      `INSERT IGNORE INTO company_employees (provider_id, name, phone, is_online)
       SELECT p.id, 'Мария Петрова', '+37250987654', 1
       FROM providers p WHERE p.companyName = 'Elite Car Service OÜ' LIMIT 1`,
      
      `INSERT IGNORE INTO company_cars (provider_id, name, is_online)
       SELECT p.id, 'AB 123', 1
       FROM providers p WHERE p.companyName = 'Elite Car Service OÜ' LIMIT 1`,
      
      `INSERT IGNORE INTO company_cars (provider_id, name, is_online)
       SELECT p.id, 'CD 456', 1
       FROM providers p WHERE p.companyName = 'Elite Car Service OÜ' LIMIT 1`,
      
      // Premium Tow Service
      `INSERT IGNORE INTO company_employees (provider_id, name, phone, is_online)
       SELECT p.id, 'Алексей Морозов', '+37256789124', 1
       FROM providers p WHERE p.companyName = 'Premium Tow Service' LIMIT 1`,
      
      `INSERT IGNORE INTO company_employees (provider_id, name, phone, is_online)
       SELECT p.id, 'Дмитрий Волков', '+37256789125', 1
       FROM providers p WHERE p.companyName = 'Premium Tow Service' LIMIT 1`,
      
      `INSERT IGNORE INTO company_cars (provider_id, name, is_online)
       SELECT p.id, 'EF 789', 1
       FROM providers p WHERE p.companyName = 'Premium Tow Service' LIMIT 1`,
      
      `INSERT IGNORE INTO company_cars (provider_id, name, is_online)
       SELECT p.id, 'GH 101', 1
       FROM providers p WHERE p.companyName = 'Premium Tow Service' LIMIT 1`,
      
      // Narva Speed Service
      `INSERT IGNORE INTO company_employees (provider_id, name, phone, is_online)
       SELECT p.id, 'Сергей Козлов', '+37255123457', 1
       FROM providers p WHERE p.companyName = 'Narva Speed Service' LIMIT 1`,
      
      `INSERT IGNORE INTO company_employees (provider_id, name, phone, is_online)
       SELECT p.id, 'Виктор Сахаров', '+37255123458', 1
       FROM providers p WHERE p.companyName = 'Narva Speed Service' LIMIT 1`,
      
      `INSERT IGNORE INTO company_cars (provider_id, name, is_online)
       SELECT p.id, 'IJ 202', 1
       FROM providers p WHERE p.companyName = 'Narva Speed Service' LIMIT 1`,
      
      `INSERT IGNORE INTO company_cars (provider_id, name, is_online)
       SELECT p.id, 'KL 303', 1
       FROM providers p WHERE p.companyName = 'Narva Speed Service' LIMIT 1`
    ];
    
    for (const query of queries) {
      await pool.query(query);
    }
    
    console.log('✓ Test employees and cars seeded successfully');
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
})();
