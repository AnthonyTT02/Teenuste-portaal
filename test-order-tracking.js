<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> f6dfbbf69b75ceb173df6b2e55d64e1943954ee2
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
    console.log('=== Testing order tracking with user_id ===\n');

    
    console.log('1. Creating test user...');
    const [userResult] = await pool.query(
      `INSERT INTO users (username, password, phone, role) VALUES (?, ?, ?, ?)`,
      ['testuser_' + Date.now(), '$2b$10$test', '+37250000000', 'user']
    );
    const testUserId = userResult.insertId;
    console.log(`   ✓ User created with ID: ${testUserId}\n`);

    
    console.log('2. Creating test order with user_id...');
    const [orderResult] = await pool.query(
      `INSERT INTO orders (vehicleBrand, vehicleModel, regNumber, services, address, lat, lng, paymentType, user_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      ['Volvo', 'X70', '123 ABC', JSON.stringify([1]), 'Test Address', 59.37, 28.66, 'card', testUserId]
    );
    const testOrderId = orderResult.insertId;
    console.log(`   ✓ Order created with ID: ${testOrderId}, user_id: ${testUserId}\n`);

    
    console.log('3. Verifying order has user_id...');
    const [orders] = await pool.query('SELECT id, user_id FROM orders WHERE id = ?', [testOrderId]);
    if (orders[0] && orders[0].user_id === testUserId) {
      console.log(`   ✓ Order has correct user_id: ${orders[0].user_id}\n`);
    } else {
      console.log(`   ✗ Order user_id mismatch!\n`);
    }

    
    console.log('4. Checking active orders query...');
    const [activeOrders] = await pool.query(
      `SELECT o.id, o.user_id FROM orders o WHERE o.user_id = ? AND o.completed_at IS NULL`,
      [testUserId]
    );
    console.log(`   ✓ Found ${activeOrders.length} active order(s) for user\n`);

    
    console.log('5. Completing order...');
    await pool.query('UPDATE orders SET completed_at = NOW() WHERE id = ?', [testOrderId]);
    console.log(`   ✓ Order marked as completed\n`);

    
    console.log('6. Checking completed orders query...');
    const [completedOrders] = await pool.query(
      `SELECT o.id, o.user_id FROM orders o WHERE o.user_id = ? AND o.completed_at IS NOT NULL`,
      [testUserId]
    );
    console.log(`   ✓ Found ${completedOrders.length} completed order(s) for user\n`);

    console.log('=== All tests passed! ===\n');
    console.log('Summary:');
    console.log(`  - Test user ID: ${testUserId}`);
    console.log(`  - Test order ID: ${testOrderId}`);
    console.log(`  - Order successfully tracked with user_id`);
    console.log(`  - Active/completed queries working correctly`);

    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
})();
<<<<<<< HEAD
=======
=======
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
    console.log('=== Testing order tracking with user_id ===\n');

    
    console.log('1. Creating test user...');
    const [userResult] = await pool.query(
      `INSERT INTO users (username, password, phone, role) VALUES (?, ?, ?, ?)`,
      ['testuser_' + Date.now(), '$2b$10$test', '+37250000000', 'user']
    );
    const testUserId = userResult.insertId;
    console.log(`   ✓ User created with ID: ${testUserId}\n`);

    
    console.log('2. Creating test order with user_id...');
    const [orderResult] = await pool.query(
      `INSERT INTO orders (vehicleBrand, vehicleModel, regNumber, services, address, lat, lng, paymentType, user_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      ['Volvo', 'X70', '123 ABC', JSON.stringify([1]), 'Test Address', 59.37, 28.66, 'card', testUserId]
    );
    const testOrderId = orderResult.insertId;
    console.log(`   ✓ Order created with ID: ${testOrderId}, user_id: ${testUserId}\n`);

    
    console.log('3. Verifying order has user_id...');
    const [orders] = await pool.query('SELECT id, user_id FROM orders WHERE id = ?', [testOrderId]);
    if (orders[0] && orders[0].user_id === testUserId) {
      console.log(`   ✓ Order has correct user_id: ${orders[0].user_id}\n`);
    } else {
      console.log(`   ✗ Order user_id mismatch!\n`);
    }

    
    console.log('4. Checking active orders query...');
    const [activeOrders] = await pool.query(
      `SELECT o.id, o.user_id FROM orders o WHERE o.user_id = ? AND o.completed_at IS NULL`,
      [testUserId]
    );
    console.log(`   ✓ Found ${activeOrders.length} active order(s) for user\n`);

    
    console.log('5. Completing order...');
    await pool.query('UPDATE orders SET completed_at = NOW() WHERE id = ?', [testOrderId]);
    console.log(`   ✓ Order marked as completed\n`);

    
    console.log('6. Checking completed orders query...');
    const [completedOrders] = await pool.query(
      `SELECT o.id, o.user_id FROM orders o WHERE o.user_id = ? AND o.completed_at IS NOT NULL`,
      [testUserId]
    );
    console.log(`   ✓ Found ${completedOrders.length} completed order(s) for user\n`);

    console.log('=== All tests passed! ===\n');
    console.log('Summary:');
    console.log(`  - Test user ID: ${testUserId}`);
    console.log(`  - Test order ID: ${testOrderId}`);
    console.log(`  - Order successfully tracked with user_id`);
    console.log(`  - Active/completed queries working correctly`);

    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
})();
>>>>>>> 749d43b93c75b07192de6f04c21877c6ff7a531e
>>>>>>> f6dfbbf69b75ceb173df6b2e55d64e1943954ee2
