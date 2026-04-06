<<<<<<< HEAD
const express = require('express');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const pool = require('./db');
require('dotenv').config();
=======
<<<<<<< HEAD
const express = require('express');
const path = require('path');
const fs = require('fs');
=======
<<<<<<< HEAD
const express = require('express');
const path = require('path');
>>>>>>> f6dfbbf69b75ceb173df6b2e55d64e1943954ee2
const pool = require('./db');
require('dotenv').config();
const nodemailer = require('nodemailer');
>>>>>>> 6f3e1231dbbf21d9e9191af2350e9486e8609650

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '2mb' }));

<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 6f3e1231dbbf21d9e9191af2350e9486e8609650
const frontendDistPath = path.join(__dirname, 'frontend', 'dist');
const frontendIndexPath = path.join(frontendDistPath, 'index.html');
const hasFrontendBuild = fs.existsSync(frontendIndexPath);

<<<<<<< HEAD
if (hasFrontendBuild) {
	app.use(express.static(frontendDistPath));
}

function hashPassword(password) {
	return crypto.createHash('sha256').update(String(password || '')).digest('hex');
}

function haversineDistance(lat1, lon1, lat2, lon2) {
	const R = 6371;
	const dLat = ((lat2 - lat1) * Math.PI) / 180;
	const dLon = ((lon2 - lon1) * Math.PI) / 180;
	const a =
		Math.sin(dLat / 2) * Math.sin(dLat / 2) +
		Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
		Math.sin(dLon / 2) * Math.sin(dLon / 2);
	return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

async function verifyCompanyAccess(userId, providerId) {
	const [rows] = await pool.query(
		'SELECT id FROM users WHERE id = ? AND role = ? AND provider_id = ?',
		[userId, 'company', providerId]
	);
	return Array.isArray(rows) && rows.length > 0;
}

// Basic health endpoint
app.get('/db-test', async (req, res) => {
	try {
		const [rows] = await pool.query('SELECT 1 + 1 AS result');
		res.json({ ok: true, result: rows[0].result });
	} catch (err) {
		res.status(500).json({ ok: false, error: err.message });
	}
});

app.post('/api/register-user', async (req, res) => {
	try {
		const { username, password, phone } = req.body || {};
		if (!username || !password || !phone) {
			return res.status(400).json({ ok: false, error: 'Имя пользователя, пароль и телефон обязательны' });
		}
		if (String(password).length < 3) {
			return res.status(400).json({ ok: false, error: 'Пароль должен быть минимум 3 символа' });
		}

		const [result] = await pool.query(
			'INSERT INTO users (username, password, phone) VALUES (?, ?, ?)',
			[username, hashPassword(password), phone]
		);
		res.json({ ok: true, userId: result.insertId, message: 'Аккаунт создан успешно!' });
	} catch (err) {
		if (err.code === 'ER_DUP_ENTRY') {
			return res.status(400).json({ ok: false, error: 'Это имя пользователя уже занято' });
		}
		res.status(500).json({ ok: false, error: err.message });
	}
});

app.post('/api/login', async (req, res) => {
	try {
		const { username, password } = req.body || {};
		if (!username || !password) {
			return res.status(400).json({ ok: false, error: 'Имя пользователя и пароль обязательны' });
		}

		const [rows] = await pool.query(
			'SELECT id, username, role, provider_id FROM users WHERE username = ? AND password = ?',
			[username, hashPassword(password)]
		);

		if (!rows || rows.length === 0) {
			return res.status(401).json({ ok: false, error: 'Неправильное имя пользователя или пароль' });
		}

		const user = rows[0];
		res.json({ ok: true, userId: user.id, role: user.role || 'user', providerId: user.provider_id || null });
	} catch (err) {
		res.status(500).json({ ok: false, error: err.message });
	}
});

app.post('/api/company-login', async (req, res) => {
	try {
		const { username, password } = req.body || {};
		if (!username || !password) {
			return res.status(400).json({ ok: false, error: 'Логин и пароль обязательны' });
		}

		const [rows] = await pool.query(
			'SELECT id, username, provider_id FROM users WHERE username = ? AND password = ? AND role = ?',
			[username, hashPassword(password), 'company']
		);

		if (!rows || rows.length === 0) {
			return res.status(401).json({ ok: false, error: 'Неправильный логин или пароль компании' });
		}

		const user = rows[0];
		res.json({ ok: true, userId: user.id, providerId: user.provider_id, companyName: user.username });
	} catch (err) {
		res.status(500).json({ ok: false, error: err.message });
	}
});

app.post('/api/validate-provider', async (req, res) => {
	try {
		const { companyName, regNumber, accountNumber } = req.body || {};
		if (!companyName && !regNumber && !accountNumber) {
			return res.status(400).json({ ok: false, error: 'At least one field required' });
		}

		const conditions = [];
		const values = [];
		if (companyName) {
			conditions.push('companyName = ?');
			values.push(companyName);
		}
		if (regNumber) {
			conditions.push('regNumber = ?');
			values.push(regNumber);
		}
		if (accountNumber) {
			conditions.push('accountNumber = ?');
			values.push(accountNumber);
		}

		const [rows] = await pool.query(
			`SELECT id, companyName, regNumber, accountNumber FROM providers WHERE ${conditions.join(' OR ')}`,
			values
		);

		if (rows.length > 0) {
			return res.status(400).json({ ok: false, error: 'Один из реквизитов уже используется' });
		}

		res.json({ ok: true, message: 'Данные доступны для регистрации' });
	} catch (err) {
		res.status(500).json({ ok: false, error: err.message });
	}
});

app.post('/api/register-provider-full', async (req, res) => {
	try {
		const {
			services,
			companyName,
			regNumber,
			lat,
			lng,
			companyCars,
			ownerName,
			ownerEmail,
			ownerPhone,
			companyLogin,
			companyPassword,
			companyPhone,
			accountNumber,
			iban,
			kmkr,
			employees
		} = req.body || {};

		if (!companyName || !regNumber || !ownerName || !ownerEmail || !ownerPhone || !accountNumber || !iban) {
			return res.status(400).json({ ok: false, error: 'Missing required fields' });
		}

		const [providerResult] = await pool.query(
			`INSERT INTO providers (companyName, regNumber, accountNumber, iban, kmkr, ownerName, ownerEmail, ownerPhone, lat, lng, created_at)
			 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
			[companyName, regNumber, accountNumber, iban, kmkr || null, ownerName, ownerEmail, ownerPhone, lat || null, lng || null]
		);

		const providerId = providerResult.insertId;

		for (const car of Array.isArray(companyCars) ? companyCars : []) {
			if (car && String(car).trim()) {
				await pool.query('INSERT INTO company_cars (provider_id, name) VALUES (?, ?)', [providerId, String(car).trim()]);
			}
		}

		for (const emp of Array.isArray(employees) ? employees : []) {
			if (emp && emp.name && emp.phone) {
				await pool.query(
					'INSERT INTO company_employees (provider_id, name, phone, languages) VALUES (?, ?, ?, ?)',
					[providerId, emp.name, emp.phone, emp.languages ? JSON.stringify(emp.languages) : null]
				);
			}
		}

		if (services && typeof services === 'object') {
			for (const [serviceName, serviceData] of Object.entries(services)) {
				let serviceId = null;
				let price = null;

				if (serviceData && typeof serviceData === 'object') {
					serviceId = serviceData.id || null;
					price = serviceData.price || null;
				} else {
					price = serviceData;
					const [serviceRows] = await pool.query('SELECT id FROM services WHERE name = ?', [serviceName]);
					if (serviceRows.length > 0) serviceId = serviceRows[0].id;
				}

				if (serviceId && Number(price) > 0) {
					await pool.query(
						'INSERT INTO provider_services (provider_id, service_id, price) VALUES (?, ?, ?)',
						[providerId, serviceId, Number(price)]
					);
				}
			}
		}

		if (companyLogin && companyPassword) {
			try {
				await pool.query(
					'INSERT INTO users (username, password, phone, role, provider_id) VALUES (?, ?, ?, ?, ?)',
					[companyLogin, hashPassword(companyPassword), companyPhone || null, 'company', providerId]
				);
			} catch (_) {
				// Keep provider registration successful even if company account already exists.
			}
		}

		res.json({ ok: true, providerId, message: 'Provider registered successfully' });
	} catch (err) {
		res.status(500).json({ ok: false, error: err.message });
	}
});

app.get('/api/services', async (req, res) => {
	try {
		const [rows] = await pool.query('SELECT id, name FROM services ORDER BY id');
		res.json({ ok: true, services: rows });
	} catch (err) {
		res.status(500).json({ ok: false, error: err.message });
	}
});

app.post('/api/order', async (req, res) => {
	try {
		const { vehicleBrand, vehicleModel, regNumber, services, address, lat, lng, paymentType, userId } = req.body || {};
		const [result] = await pool.query(
			`INSERT INTO orders (vehicleBrand, vehicleModel, regNumber, services, address, lat, lng, paymentType, user_id)
			 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
			[
				vehicleBrand || null,
				vehicleModel || null,
				regNumber || null,
				JSON.stringify(Array.isArray(services) ? services : []),
				address || null,
				lat || null,
				lng || null,
				paymentType || null,
				userId || null
			]
		);
		res.json({ ok: true, orderId: result.insertId });
	} catch (err) {
		res.status(500).json({ ok: false, error: err.message });
	}
});

app.get('/api/orders/:id', async (req, res) => {
	try {
		const [rows] = await pool.query('SELECT * FROM orders WHERE id = ?', [req.params.id]);
		if (!rows || rows.length === 0) return res.status(404).json({ ok: false, error: 'Not found' });
		res.json({ ok: true, order: rows[0] });
	} catch (err) {
		res.status(500).json({ ok: false, error: err.message });
	}
});

app.get('/api/user/:id', async (req, res) => {
	try {
		const [rows] = await pool.query('SELECT id, username, phone FROM users WHERE id = ?', [req.params.id]);
		if (!rows || rows.length === 0) return res.status(404).json({ ok: false, error: 'User not found' });
		res.json({ ok: true, user: rows[0] });
	} catch (err) {
		res.status(500).json({ ok: false, error: err.message });
	}
});

app.get('/api/user/:userId/orders/active', async (req, res) => {
	try {
		const [rows] = await pool.query(
			`SELECT o.*, p.companyName, p.ownerPhone, ce.name as employee_name, cc.name as car_name
			 FROM orders o
			 LEFT JOIN providers p ON o.provider_id = p.id
			 LEFT JOIN company_employees ce ON o.employee_id = ce.id
			 LEFT JOIN company_cars cc ON o.car_id = cc.id
			 WHERE o.user_id = ? AND o.completed_at IS NULL
			 ORDER BY o.created_at DESC`,
			[req.params.userId]
		);
		res.json({ ok: true, orders: rows || [] });
	} catch (err) {
		res.status(500).json({ ok: false, error: err.message });
	}
});

app.get('/api/user/:userId/orders/completed', async (req, res) => {
	try {
		const [rows] = await pool.query(
			`SELECT o.*, p.companyName, p.ownerPhone, ce.name as employee_name, cc.name as car_name
			 FROM orders o
			 LEFT JOIN providers p ON o.provider_id = p.id
			 LEFT JOIN company_employees ce ON o.employee_id = ce.id
			 LEFT JOIN company_cars cc ON o.car_id = cc.id
			 WHERE o.user_id = ? AND o.completed_at IS NOT NULL
			 ORDER BY o.completed_at DESC`,
			[req.params.userId]
		);
		res.json({ ok: true, orders: rows || [] });
	} catch (err) {
		res.status(500).json({ ok: false, error: err.message });
	}
});

app.get('/api/provider/:id', async (req, res) => {
	try {
		const providerId = req.params.id;
		const userId = req.query.userId || req.headers['x-user-id'];

		if (!userId || !(await verifyCompanyAccess(userId, providerId))) {
			return res.status(403).json({ ok: false, error: 'Access denied' });
		}

		const [providers] = await pool.query('SELECT * FROM providers WHERE id = ?', [providerId]);
		if (!providers || providers.length === 0) {
			return res.status(404).json({ ok: false, error: 'Provider not found' });
		}

		const provider = providers[0];

		try {
			const [cars] = await pool.query('SELECT id, name, regNumber FROM company_cars WHERE provider_id = ? ORDER BY created_at ASC', [providerId]);
			provider.cars = (cars || []).map((c) => ({ id: c.id, regNumber: c.name || c.regNumber || '' }));
		} catch (_) {
			provider.cars = [];
		}

		try {
			const [employees] = await pool.query(
				'SELECT id, name, phone, languages FROM company_employees WHERE provider_id = ? ORDER BY created_at ASC',
				[providerId]
			);
			provider.employees = (employees || []).map((e) => ({
				id: String(e.id),
				name: e.name,
				phone: e.phone,
				languages: e.languages ? JSON.parse(e.languages) : []
			}));
		} catch (_) {
			provider.employees = [];
		}

		res.json({ ok: true, provider });
	} catch (err) {
		res.status(500).json({ ok: false, error: err.message });
	}
});

app.get('/api/provider/:id/orders', async (req, res) => {
	try {
		const providerId = req.params.id;
		const userId = req.query.userId || req.headers['x-user-id'];
		if (!userId || !(await verifyCompanyAccess(userId, providerId))) {
			return res.status(403).json({ ok: false, error: 'Access denied' });
		}

		const [rows] = await pool.query(
			'SELECT id, vehicleBrand, vehicleModel, regNumber, services, address, lat, lng, paymentType, created_at FROM orders WHERE provider_id = ? AND completed_at IS NULL ORDER BY created_at DESC',
			[providerId]
		);
		res.json({ ok: true, orders: rows || [] });
	} catch (err) {
		res.status(500).json({ ok: false, error: err.message });
	}
});

app.post('/api/provider/:id/car', async (req, res) => {
	try {
		const providerId = req.params.id;
		const userId = req.body.userId || req.query.userId || req.headers['x-user-id'];
		if (!userId || !(await verifyCompanyAccess(userId, providerId))) {
			return res.status(403).json({ ok: false, error: 'Access denied' });
		}

		const plate = (req.body.regNumber || req.body.name || '').trim();
		if (!plate) return res.status(400).json({ ok: false, error: 'regNumber required' });

		const [result] = await pool.query('INSERT INTO company_cars (provider_id, name) VALUES (?, ?)', [providerId, plate]);
		res.json({ ok: true, insertId: result.insertId, plate });
	} catch (err) {
		res.status(500).json({ ok: false, error: err.message });
	}
});

app.delete('/api/provider/:id/car/:carId', async (req, res) => {
	try {
		const { id, carId } = req.params;
		const userId = req.query.userId || req.headers['x-user-id'];
		if (!userId || !(await verifyCompanyAccess(userId, id))) {
			return res.status(403).json({ ok: false, error: 'Access denied' });
		}

		await pool.query('DELETE FROM company_cars WHERE id = ? AND provider_id = ?', [carId, id]);
		res.json({ ok: true });
	} catch (err) {
		res.status(500).json({ ok: false, error: err.message });
	}
});

app.post('/api/provider/:id/employee', async (req, res) => {
	try {
		const providerId = req.params.id;
		const userId = req.body.userId || req.query.userId || req.headers['x-user-id'];
		const { name, phone, languages } = req.body || {};

		if (!userId || !(await verifyCompanyAccess(userId, providerId))) {
			return res.status(403).json({ ok: false, error: 'Access denied' });
		}
		if (!name || !phone) {
			return res.status(400).json({ ok: false, error: 'name and phone required' });
		}

		const [result] = await pool.query(
			'INSERT INTO company_employees (provider_id, name, phone, languages, is_online) VALUES (?, ?, ?, ?, true)',
			[providerId, name, phone, languages ? JSON.stringify(languages) : null]
		);
		res.json({ ok: true, employeeId: result.insertId });
	} catch (err) {
		res.status(500).json({ ok: false, error: err.message });
	}
});

app.delete('/api/provider/:id/employee/:empId', async (req, res) => {
	try {
		const { id, empId } = req.params;
		const userId = req.query.userId || req.headers['x-user-id'];
		if (!userId || !(await verifyCompanyAccess(userId, id))) {
			return res.status(403).json({ ok: false, error: 'Access denied' });
		}

		await pool.query('DELETE FROM company_employees WHERE id = ? AND provider_id = ?', [empId, id]);
		res.json({ ok: true });
	} catch (err) {
		res.status(500).json({ ok: false, error: err.message });
	}
});

app.get('/api/employee/:id', async (req, res) => {
	try {
		const [rows] = await pool.query('SELECT id, name, phone, languages, is_online FROM company_employees WHERE id = ?', [req.params.id]);
		if (!rows || rows.length === 0) return res.status(404).json({ ok: false, error: 'Employee not found' });
		res.json({ ok: true, employee: rows[0] });
	} catch (err) {
		res.status(500).json({ ok: false, error: err.message });
	}
});

app.patch('/api/employee/:empId/status', async (req, res) => {
	try {
		const { isOnline } = req.body || {};
		if (typeof isOnline !== 'boolean') {
			return res.status(400).json({ ok: false, error: 'isOnline must be boolean' });
		}
		await pool.query('UPDATE company_employees SET is_online = ? WHERE id = ?', [isOnline, req.params.empId]);
		res.json({ ok: true });
	} catch (err) {
		res.status(500).json({ ok: false, error: err.message });
	}
});

app.get('/api/car/:id', async (req, res) => {
	try {
		const [rows] = await pool.query('SELECT id, name, provider_id, is_online FROM company_cars WHERE id = ?', [req.params.id]);
		if (!rows || rows.length === 0) return res.status(404).json({ ok: false, error: 'Car not found' });
		res.json({ ok: true, car: rows[0] });
	} catch (err) {
		res.status(500).json({ ok: false, error: err.message });
	}
});

app.get('/api/providers-for-service/:serviceId', async (req, res) => {
	try {
		const { serviceId } = req.params;
		const [providers] = await pool.query(
			`SELECT DISTINCT p.id, p.companyName, p.lat, p.lng, p.ownerPhone, ps.price
			 FROM providers p
			 JOIN provider_services ps ON p.id = ps.provider_id
			 WHERE ps.service_id = ?
			 ORDER BY p.id`,
			[serviceId]
		);

		const result = [];
		for (const provider of providers || []) {
			let employees = [];
			let cars = [];

			try {
				const [rows] = await pool.query(
					'SELECT id, name, phone, languages FROM company_employees WHERE provider_id = ? AND is_online = true',
					[provider.id]
				);
				employees = rows || [];
			} catch {
				const [rows] = await pool.query('SELECT id, name, phone, languages FROM company_employees WHERE provider_id = ?', [provider.id]);
				employees = rows || [];
			}

			try {
				const [rows] = await pool.query('SELECT id, name FROM company_cars WHERE provider_id = ? AND is_online = true', [provider.id]);
				cars = rows || [];
			} catch {
				const [rows] = await pool.query('SELECT id, name FROM company_cars WHERE provider_id = ?', [provider.id]);
				cars = rows || [];
			}

			result.push({ ...provider, onlineEmployees: employees, onlineCars: cars });
		}

		res.json({ ok: true, providers: result.filter((p) => p.onlineEmployees.length > 0 && p.onlineCars.length > 0) });
	} catch (err) {
		res.status(500).json({ ok: false, error: err.message });
	}
});

app.get('/api/providers/prices', async (req, res) => {
	try {
		const orderId = req.query.orderId;
		if (!orderId) return res.status(400).json({ ok: false, error: 'orderId required' });

		const [orders] = await pool.query('SELECT * FROM orders WHERE id = ?', [orderId]);
		if (!orders || orders.length === 0) return res.status(404).json({ ok: false, error: 'Order not found' });
		const order = orders[0];

		const serviceIds = JSON.parse(order.services || '[]');
		const [providers] = await pool.query('SELECT id, companyName, ownerName, ownerPhone, lat, lng FROM providers');

		const results = [];
		for (const p of providers || []) {
			let total = 0;
			const breakdown = [];

			if (Array.isArray(serviceIds) && serviceIds.length > 0) {
				const placeholders = serviceIds.map(() => '?').join(',');
				const [rows] = await pool.query(
					`SELECT s.id as service_id, s.name, ps.price
					 FROM provider_services ps
					 JOIN services s ON ps.service_id = s.id
					 WHERE ps.provider_id = ? AND s.id IN (${placeholders})`,
					[p.id, ...serviceIds]
				);

				for (const r of rows || []) {
					const price = Number(r.price || 0);
					total += price;
					breakdown.push({ service_id: r.service_id, name: r.name, price });
				}
			}

			let distance = null;
			let eta_minutes = Math.floor(Math.random() * 36) + 10;
			if (p.lat && p.lng && order.lat && order.lng) {
				distance = haversineDistance(order.lat, order.lng, p.lat, p.lng);
				const baseEta = Math.round((distance / 40) * 60);
				const jitter = Math.floor(Math.random() * 11) - 5;
				eta_minutes = Math.max(10, Math.min(45, baseEta + jitter));
			}

			results.push({ provider: p, total, breakdown, distance, eta_minutes });
		}

		res.json({ ok: true, providers: results, order });
	} catch (err) {
		res.status(500).json({ ok: false, error: err.message });
	}
});

app.post('/api/order/attach', async (req, res) => {
	try {
		const { orderId, providerId, employeeId, carId } = req.body || {};
		if (!orderId || !providerId) {
			return res.status(400).json({ ok: false, error: 'orderId and providerId required' });
		}

		await pool.query(
			'UPDATE orders SET provider_id = ?, employee_id = ?, car_id = ? WHERE id = ?',
			[providerId, employeeId || null, carId || null, orderId]
		);
		res.json({ ok: true });
	} catch (err) {
		res.status(500).json({ ok: false, error: err.message });
	}
});

app.post('/api/order/:orderId/complete', async (req, res) => {
	try {
		await pool.query('UPDATE orders SET completed_at = NOW() WHERE id = ?', [req.params.orderId]);
		res.json({ ok: true, message: 'Order completed successfully' });
	} catch (err) {
		res.status(500).json({ ok: false, error: err.message });
	}
});

app.use((err, req, res, next) => {
	if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
		return res.status(400).json({ ok: false, error: 'Некорректный JSON' });
	}
	return res.status(500).json({ ok: false, error: err.message || 'Ошибка сервера' });
});

if (hasFrontendBuild) {
	app.get('*', (req, res, next) => {
		if (req.path.startsWith('/api') || req.path === '/db-test' || path.extname(req.path)) {
			return next();
		}
		return res.sendFile(frontendIndexPath);
	});
}

app.listen(PORT, () => {
	console.log(`Server running on http://localhost:${PORT}`);
});
=======
// Serve React build first (single-port mode) when available.
if (hasFrontendBuild) {
  app.use(express.static(frontendDistPath));
}

// Serve static site (existing HTML files)
=======
// Serve static site (your existing HTML files)
>>>>>>> f6dfbbf69b75ceb173df6b2e55d64e1943954ee2
app.use(express.static(path.join(__dirname)));

const crypto = require('crypto');

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

function generateToken() {
  return crypto.randomBytes(32).toString('hex');
}

// Helper function to verify company access
async function verifyCompanyAccess(userId, providerId) {
  try {
    const [rows] = await pool.query(
      'SELECT id, provider_id FROM users WHERE id = ? AND role = ? AND provider_id = ?',
      [userId, 'company', providerId]
    );
    return rows && rows.length > 0;
  } catch (err) {
    console.error('Verify company access error:', err.message);
    return false;
  }
}

// Конфигурация nodemailer (для демонстрации используем test account)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'your-email@gmail.com',
    pass: process.env.EMAIL_PASSWORD || 'your-app-password'
  }
});

// Test DB connection
app.get('/db-test', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT 1+1 AS result');
    res.json({ ok: true, result: rows[0].result });
  } catch (err) {
    console.error('DB test error:', err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// РЕГИСТРАЦИЯ ПОЛЬЗОВАТЕЛЯ (простая без email)
app.post('/api/register-user', async (req, res) => {
  try {
    const { username, password, phone } = req.body;
    console.log('Register request:', { username, phone });
    
    if (!username || !password || !phone) {
      return res.status(400).json({ ok: false, error: 'Имя пользователя, пароль и телефон обязательны' });
    }
    
    if (password.length < 3) {
      return res.status(400).json({ ok: false, error: 'Пароль должен быть минимум 3 символа' });
    }
    
    const hashed = hashPassword(password);
    
    // Создать пользователя
    const [result] = await pool.query(
      'INSERT INTO users (username, password, phone) VALUES (?, ?, ?)',
      [username, hashed, phone]
    );
    
    const userId = result.insertId;
    console.log('User registered:', userId);
    
    res.json({ 
      ok: true, 
      userId,
      message: 'Аккаунт создан успешно!'
    });
  } catch (err) {
    console.error('Register error:', err.message, err.code);
    if (err.code === 'ER_DUP_ENTRY') {
      res.status(400).json({ ok: false, error: 'Это имя пользователя уже занято' });
    } else {
      res.status(500).json({ ok: false, error: 'Ошибка регистрации: ' + err.message });
    }
  }
});
// ЛОГИН ПОЛЬЗОВАТЕЛЯ
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log('Login request:', { username });
    
    if (!username || !password) {
      return res.status(400).json({ ok: false, error: 'Имя пользователя и пароль обязательны' });
    }
    
    const hashed = hashPassword(password);
    console.log('Login hashed password:', hashed);
    
    const [rows] = await pool.query(
      'SELECT id, username, role, provider_id FROM users WHERE username = ? AND password = ?',
      [username, hashed]
    );
    
    console.log('Login query result:', rows);
    
    if (rows && rows.length > 0) {
      const user = rows[0];
      console.log('Login successful for user:', user.username, 'role:', user.role);
      res.json({ ok: true, userId: user.id, role: user.role || 'user', providerId: user.provider_id || null });
    } else {
      console.log('Login failed: user not found or wrong password');
      res.status(401).json({ ok: false, error: 'Неправильное имя пользователя или пароль' });
    }
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ ok: false, error: 'Ошибка входа: ' + err.message });
  }
});

// ВХОД В КОМПАНИЮ
app.post('/api/company-login', async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log('Company login request:', { username, password });
    if (!username || !password) {
      return res.status(400).json({ ok: false, error: 'Логин и пароль обязательны' });
    }
    const hashed = hashPassword(password);
    console.log('Hashed password:', hashed);
    const [rows] = await pool.query(
      'SELECT id, username, provider_id FROM users WHERE username = ? AND password = ? AND role = ?',
      [username, hashed, 'company']
    );
    console.log('Company login query result:', rows);
    if (rows && rows.length > 0) {
      const user = rows[0];
      console.log('Company login successful for:', user.username);
      res.json({ ok: true, userId: user.id, providerId: user.provider_id, companyName: user.username });
    } else {
      console.log('Company login failed: company user not found or wrong password');
      res.status(401).json({ ok: false, error: 'Неправильный логин или пароль компании' });
    }
  } catch (err) {
    console.error('Company login error:', err.message);
    res.status(500).json({ ok: false, error: 'Ошибка входа: ' + err.message });
  }
});

// Check username availability (used by client-side validation)
app.get('/api/check-username', async (req, res) => {
  try {
    const username = (req.query.username || '').trim();
    if (!username) return res.json({ ok: false, available: false, error: 'username required' });
    const [rows] = await pool.query('SELECT id FROM users WHERE username = ?', [username]);
    const available = !(rows && rows.length > 0);
    res.json({ ok: true, available });
  } catch (err) {
    console.error('Check username error:', err.message);
    res.status(500).json({ ok: false, available: false, error: err.message });
  }
});
// Insert provider (expects JSON matching form fields)
app.post('/api/provider', async (req, res) => {
  try {
    const p = req.body || {};
    const employees = p.employees ? JSON.stringify(p.employees) : JSON.stringify([]);
    const [result] = await pool.query(
      `INSERT INTO providers (companyName, regNumber, accountNumber, iban, kmkr, ownerName, ownerEmail, ownerPhone, employees, lat, lng) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [p.companyName||null, p.regNumber||null, p.accountNumber||null, p.iban||null, p.kmkr||null, p.ownerName||null, p.ownerEmail||null, p.ownerPhone||null, employees, p.latitude||p.lat||null, p.longitude||p.lng||null]
    );
    res.json({ ok: true, insertId: result.insertId });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Generic registration endpoint
app.post('/api/register', async (req, res) => {
  try {
    const { name, email, phone, payload } = req.body || {};
    const [result] = await pool.query(
      `INSERT INTO registrations (name, email, phone, payload) VALUES (?, ?, ?, ?)`,
      [name||null, email||null, phone||null, JSON.stringify(payload||{})]
    );
    res.json({ ok: true, insertId: result.insertId });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// List providers
app.get('/api/providers', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, companyName, ownerName, ownerEmail, ownerPhone, employees, created_at FROM providers ORDER BY created_at DESC');
    res.json({ ok: true, providers: rows });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Get provider by id (full details + cars)
app.get('/api/provider/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const userId = req.query.userId || req.headers['x-user-id'];
    
    // Verify that user has access to this provider
    if (!userId || !(await verifyCompanyAccess(userId, id))) {
      return res.status(403).json({ ok: false, error: 'Access denied' });
    }
    
    const [rows] = await pool.query('SELECT * FROM providers WHERE id = ?', [id]);
    if (!rows || rows.length === 0) return res.status(404).json({ ok: false, error: 'Provider not found' });
    const provider = rows[0];
    // Try to load company cars (handle different schemas gracefully)
    try {
      // Many schemas store plate/identifier in `name` column for company_cars
      const [cars] = await pool.query('SELECT id, name FROM company_cars WHERE provider_id = ? ORDER BY created_at ASC', [id]);
      provider.cars = (cars || []).map(c => ({ id: c.id, regNumber: c.name || '' }));
    } catch (err) {
      console.warn('Failed to load company_cars by name, falling back to other schemas', err.message);
      try {
        const [carsRaw] = await pool.query('SELECT * FROM company_cars WHERE provider_id = ? ORDER BY created_at ASC', [id]);
        provider.cars = (carsRaw || []).map(r => ({ id: r.id, regNumber: r.name || r.regNumber || r.reg_number || r.plate || ( (r.brand||'') + ' ' + (r.model||'') ).trim() }));
      } catch (err2) {
        console.error('Failed to load company_cars fallback:', err2.message);
        provider.cars = [];
      }
    }

    // Load employees from company_employees table
    try {
      const [employees] = await pool.query(
        'SELECT id, name, phone, languages FROM company_employees WHERE provider_id = ? ORDER BY created_at ASC',
        [id]
      );
      provider.employees = (employees || []).map(e => ({
        id: e.id.toString(),
        name: e.name,
        phone: e.phone,
        languages: e.languages ? JSON.parse(e.languages) : []
      }));
    } catch (err) {
      console.warn('Failed to load employees:', err.message);
      provider.employees = [];
    }
<<<<<<< HEAD

    res.json({ ok: true, provider });
=======
>>>>>>> f6dfbbf69b75ceb173df6b2e55d64e1943954ee2
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Get active orders for provider
app.get('/api/provider/:id/orders', async (req, res) => {
  try {
    const id = req.params.id;
    const userId = req.query.userId || req.headers['x-user-id'];
    
    // Verify that user has access to this provider
    if (!userId || !(await verifyCompanyAccess(userId, id))) {
      return res.status(403).json({ ok: false, error: 'Access denied' });
    }
    
    const [rows] = await pool.query('SELECT id, vehicleBrand, vehicleModel, regNumber, services, address, lat, lng, paymentType, created_at FROM orders WHERE provider_id = ? ORDER BY created_at DESC', [id]);
    res.json({ ok: true, orders: rows });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Add company car for provider
app.post('/api/provider/:id/car', async (req, res) => {
  try {
    const id = req.params.id;
    const userId = req.body.userId || req.query.userId || req.headers['x-user-id'];
    
    // Verify that user has access to this provider
    if (!userId || !(await verifyCompanyAccess(userId, id))) {
      return res.status(403).json({ ok: false, error: 'Access denied' });
    }
    const { regNumber, brand, model, name } = req.body || {};
    // Prefer inserting into `name` column which exists in current schema
    const plate = regNumber || name || ((brand || '') + ' ' + (model || '')).trim();
    if (!plate) return res.status(400).json({ ok: false, error: 'regNumber/name/brand required' });
    try {
      const [result] = await pool.query('INSERT INTO company_cars (provider_id, name) VALUES (?, ?)', [id, plate]);
      return res.json({ ok: true, insertId: result.insertId, plate });
    } catch (errInner) {
      // If `name` column doesn't exist, try other known schemas
      console.warn('Insert into name failed, trying fallback schemas:', errInner.message);
      try {
        const [res2] = await pool.query('INSERT INTO company_cars (provider_id, regNumber) VALUES (?, ?)', [id, plate]);
        return res.json({ ok: true, insertId: res2.insertId, regNumber: plate });
      } catch (err2) {
        try {
          const [res3] = await pool.query('INSERT INTO company_cars (provider_id, brand, model) VALUES (?, ?, ?)', [id, brand || '', model || '']);
          return res.json({ ok: true, insertId: res3.insertId, brand: brand || '', model: model || '' });
        } catch (err3) {
          console.error('Add car error fallback:', err3.message);
          return res.status(500).json({ ok: false, error: err3.message });
        }
      }
    }
  } catch (err) {
    console.error('Add car error:', err.message);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Delete company car
app.delete('/api/provider/:id/car/:carId', async (req, res) => {
  try {
    const { id, carId } = req.params;
    const userId = req.query.userId || req.headers['x-user-id'];
    
    // Verify that user has access to this provider
    if (!userId || !(await verifyCompanyAccess(userId, id))) {
      return res.status(403).json({ ok: false, error: 'Access denied' });
    }
    
    await pool.query('DELETE FROM company_cars WHERE id = ? AND provider_id = ?', [carId, id]);
    res.json({ ok: true });
  } catch (err) {
    console.error('Delete car error:', err.message);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Update employees for provider (delete all and insert from array)
app.put('/api/provider/:id/employees', async (req, res) => {
  try {
    const id = req.params.id;
    const userId = req.body.userId || req.query.userId || req.headers['x-user-id'];
    
    // Verify that user has access to this provider
    if (!userId || !(await verifyCompanyAccess(userId, id))) {
      return res.status(403).json({ ok: false, error: 'Access denied' });
    }
    
    const employees = req.body.employees || [];
    // Basic validation
    if (!Array.isArray(employees)) return res.status(400).json({ ok: false, error: 'employees must be array' });
    
    // Delete all existing employees for this provider
    await pool.query('DELETE FROM company_employees WHERE provider_id = ?', [id]);
    
    // Insert new employees
    for (const emp of employees) {
      if (emp.name && emp.phone) {
        await pool.query(
          'INSERT INTO company_employees (provider_id, name, phone, languages) VALUES (?, ?, ?, ?)',
          [id, emp.name, emp.phone, emp.languages ? JSON.stringify(emp.languages) : null]
        );
      }
    }
    
    res.json({ ok: true });
  } catch (err) {
    console.error('Update employees error:', err.message);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Delete single employee
app.delete('/api/provider/:id/employee/:empId', async (req, res) => {
  try {
    const { id, empId } = req.params;
    const userId = req.query.userId || req.headers['x-user-id'];
    
    // Verify that user has access to this provider
    if (!userId || !(await verifyCompanyAccess(userId, id))) {
      return res.status(403).json({ ok: false, error: 'Access denied' });
    }
    
    await pool.query('DELETE FROM company_employees WHERE id = ? AND provider_id = ?', [empId, id]);
    res.json({ ok: true });
  } catch (err) {
    console.error('Delete employee error:', err.message);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Add single employee
app.post('/api/provider/:id/employee', async (req, res) => {
  try {
    const id = req.params.id;
    const userId = req.body.userId || req.query.userId || req.headers['x-user-id'];
    const { name, phone, languages } = req.body;
    
    // Verify that user has access to this provider
    if (!userId || !(await verifyCompanyAccess(userId, id))) {
      return res.status(403).json({ ok: false, error: 'Access denied' });
    }
    
    if (!name || !phone) {
      return res.status(400).json({ ok: false, error: 'name and phone required' });
    }
    
    const [result] = await pool.query(
      'INSERT INTO company_employees (provider_id, name, phone, languages, is_online) VALUES (?, ?, ?, ?, true)',
      [id, name, phone, languages ? JSON.stringify(languages) : null]
    );
    
    res.json({ ok: true, employeeId: result.insertId });
  } catch (err) {
    console.error('Add employee error:', err.message);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Set employee online/offline status
app.patch('/api/employee/:empId/status', async (req, res) => {
  try {
    const empId = req.params.empId;
    const { isOnline } = req.body;
    
    if (typeof isOnline !== 'boolean') {
      return res.status(400).json({ ok: false, error: 'isOnline must be boolean' });
    }
    
    await pool.query(
      'UPDATE company_employees SET is_online = ? WHERE id = ?',
      [isOnline, empId]
    );
    
    res.json({ ok: true });
  } catch (err) {
    console.error('Update employee status error:', err.message);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Validate provider fields for duplicates
app.post('/api/validate-provider', async (req, res) => {
  try {
    console.log('Validation request body:', req.body);
    const { companyName, regNumber, accountNumber } = req.body || {};
    console.log('Extracted fields:', { companyName, regNumber, accountNumber });
    
    if (!companyName && !regNumber && !accountNumber) {
      console.log('All fields are empty');
      return res.status(400).json({ ok: false, error: 'At least one field required' });
    }
    
    // Check if any of these fields already exist
    let query = 'SELECT id, companyName, regNumber, accountNumber FROM providers WHERE ';
    let conditions = [];
    let values = [];
    
    if (companyName) {
      conditions.push('companyName = ?');
      values.push(companyName);
    }
    if (regNumber) {
      conditions.push('regNumber = ?');
      values.push(regNumber);
    }
    if (accountNumber) {
      conditions.push('accountNumber = ?');
      values.push(accountNumber);
    }
    
    query += conditions.join(' OR ');
    console.log('Executing query:', query, 'with values:', values);
    
    const [rows] = await pool.query(query, values);
    console.log('Query results:', rows);
    
    if (rows.length > 0) {
      const duplicate = rows[0];
      let conflictField = '';
      if (companyName && duplicate.companyName === companyName) {
        conflictField = 'Название фирмы';
      } else if (regNumber && duplicate.regNumber === regNumber) {
        conflictField = 'Регистрационный номер';
      } else if (accountNumber && duplicate.accountNumber === accountNumber) {
        conflictField = 'Номер счёта';
      }
      
      console.log('Duplicate found:', conflictField);
      return res.json({ 
        ok: false, 
        error: `${conflictField} уже зарегистрирован(а) в системе`,
        conflictField: conflictField
      });
    }
    
    console.log('No duplicates found, validation passed');
    res.json({ ok: true, message: 'Данные доступны для регистрации' });
  } catch (err) {
    console.error('Validation error:', err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Get user by id (returns username, email, phone)
app.get('/api/user/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const [rows] = await pool.query('SELECT id, username, phone FROM users WHERE id = ?', [id]);
    if (!rows || rows.length === 0) return res.status(404).json({ ok: false, error: 'User not found' });
    res.json({ ok: true, user: rows[0] });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Update user profile (username, phone)
app.put('/api/user/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const { username, phone } = req.body;
    console.log('PUT /api/user/:id request', { id, username, phone });
    
    if (!username && !phone) {
      return res.status(400).json({ ok: false, error: 'At least one field is required' });
    }
    
    let query = 'UPDATE users SET';
    let values = [];
    let updates = [];
    
    if (username) {
      updates.push('username = ?');
      values.push(username);
    }
    if (phone) {
      updates.push('phone = ?');
      values.push(phone);
    }
    
    query += ' ' + updates.join(', ') + ' WHERE id = ?';
    values.push(id);
    
    console.log('Executing query:', query, 'with values:', values);
    const [result] = await pool.query(query, values);
    console.log('Query result:', result);
    
    if (result.affectedRows === 0) {
      console.log('No rows affected, returning 404');
      return res.status(404).json({ ok: false, error: 'User not found' });
    }
    
    console.log('About to send success response');
    res.json({ ok: true, message: 'Profile updated successfully' });
    console.log('Response sent');
  } catch (err) {
    console.error('PUT error:', err.message, err.code);
    if (err.code === 'ER_DUP_ENTRY') {
      res.status(400).json({ ok: false, error: 'Username already taken' });
    } else {
      res.status(500).json({ ok: false, error: err.message });
    }
  }
});

// List registrations
app.get('/api/registrations', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, name, email, phone, payload, created_at FROM registrations ORDER BY created_at DESC');
    res.json({ ok: true, registrations: rows });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// List services
app.get('/api/services', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, name FROM services ORDER BY id');
    res.json({ ok: true, services: rows });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Get providers offering a specific service with online employees and cars
app.get('/api/providers-for-service/:serviceId', async (req, res) => {
  try {
    const serviceId = req.params.serviceId;
    
    // Get all providers that offer this service
    const [providers] = await pool.query(`
      SELECT DISTINCT p.id, p.companyName, p.lat, p.lng, p.ownerPhone, ps.price
      FROM providers p
      JOIN provider_services ps ON p.id = ps.provider_id
      WHERE ps.service_id = ?
      ORDER BY p.id
    `, [serviceId]);
    
    if (!providers || providers.length === 0) {
      return res.json({ ok: true, providers: [] });
    }
    
    // For each provider, load online employees and cars
    const result = await Promise.all(providers.map(async (provider) => {
      const [employees] = await pool.query(`
        SELECT id, name, phone, languages 
        FROM company_employees 
        WHERE provider_id = ? AND is_online = true
      `, [provider.id]);
      
      const [cars] = await pool.query(`
        SELECT id, name 
        FROM company_cars 
        WHERE provider_id = ? AND is_online = true
      `, [provider.id]);
      
      return {
        ...provider,
        onlineEmployees: employees || [],
        onlineCars: cars || []
      };
    }));
    
    // Filter only providers with at least one online employee and car
    const availableProviders = result.filter(p => p.onlineEmployees.length > 0 && p.onlineCars.length > 0);
    
    res.json({ ok: true, providers: availableProviders });
  } catch (err) {
    console.error('Error getting providers for service:', err.message);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Create order
app.post('/api/order', async (req, res) => {
  try {
    const { vehicleBrand, vehicleModel, regNumber, services, address, lat, lng, paymentType, userId } = req.body || {};
    const [result] = await pool.query(
      `INSERT INTO orders (vehicleBrand, vehicleModel, regNumber, services, address, lat, lng, paymentType, user_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [vehicleBrand||null, vehicleModel||null, regNumber||null, JSON.stringify(services||[]), address||null, lat||null, lng||null, paymentType||null, userId||null]
    );
    res.json({ ok: true, orderId: result.insertId });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Get order
app.get('/api/orders/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const [rows] = await pool.query('SELECT * FROM orders WHERE id = ?', [id]);
    if (!rows || rows.length === 0) return res.status(404).json({ ok: false, error: 'Not found' });
    res.json({ ok: true, order: rows[0] });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Get user's active orders (not completed)
app.get('/api/user/:userId/orders/active', async (req, res) => {
  try {
    const userId = req.params.userId;
    const [rows] = await pool.query(
      `SELECT o.*, p.companyName, p.ownerPhone, ce.name as employee_name, cc.name as car_name
       FROM orders o
       LEFT JOIN providers p ON o.provider_id = p.id
       LEFT JOIN company_employees ce ON o.employee_id = ce.id
       LEFT JOIN company_cars cc ON o.car_id = cc.id
       WHERE o.user_id = ? AND o.completed_at IS NULL
       ORDER BY o.created_at DESC`,
      [userId]
    );
    res.json({ ok: true, orders: rows || [] });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Get user's completed orders (history)
app.get('/api/user/:userId/orders/completed', async (req, res) => {
  try {
    const userId = req.params.userId;
    const [rows] = await pool.query(
      `SELECT o.*, p.companyName, p.ownerPhone, ce.name as employee_name, cc.name as car_name
       FROM orders o
       LEFT JOIN providers p ON o.provider_id = p.id
       LEFT JOIN company_employees ce ON o.employee_id = ce.id
       LEFT JOIN company_cars cc ON o.car_id = cc.id
       WHERE o.user_id = ? AND o.completed_at IS NOT NULL
       ORDER BY o.completed_at DESC`,
      [userId]
    );
    res.json({ ok: true, orders: rows || [] });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Compute provider prices for an order
app.get('/api/providers/prices', async (req, res) => {
  try {
    const orderId = req.query.orderId;
    if (!orderId) return res.status(400).json({ ok: false, error: 'orderId required' });
    const [orders] = await pool.query('SELECT * FROM orders WHERE id = ?', [orderId]);
    if (!orders || orders.length === 0) return res.status(404).json({ ok: false, error: 'Order not found' });
    const order = orders[0];
    const services = JSON.parse(order.services || '[]');
    const userLat = order.lat;
    const userLng = order.lng;

    // get all providers with coordinates
    const [providers] = await pool.query('SELECT id, companyName, ownerName, ownerPhone, lat, lng FROM providers');

    // for each provider, sum prices of services and calculate ETA
    const results = [];
    for (const p of providers) {
      if (!services || services.length === 0) {
        results.push({ provider: p, total: 0, breakdown: [], distance: null, eta_minutes: null });
        continue;
      }
      // select prices for this provider for services in order
      const placeholders = services.map(() => '?').join(',');
      const [rows] = await pool.query(
        `SELECT s.id as service_id, s.name, ps.price FROM provider_services ps JOIN services s ON ps.service_id = s.id WHERE ps.provider_id = ? AND s.id IN (${placeholders})`,
        [p.id, ...services]
      );
      let total = 0;
      const breakdown = [];
      for (const r of rows) {
        total += Number(r.price || 0);
        breakdown.push({ service_id: r.service_id, name: r.name, price: Number(r.price) });
      }
      
        // Calculate ETA: distance / average speed in city (40 km/h) * 60 min
        // Ensure eta is in 8..50 minutes and add small random jitter so different
        // providers don't all report near-identical ETAs.
        let distance = null;
        let eta_minutes = null;
        const MIN_ETA = 10;
        const MAX_ETA = 45;
        if (p.lat && p.lng && userLat && userLng) {
          distance = haversineDistance(userLat, userLng, p.lat, p.lng);
          const avgCitySpeed = 40; // km/h
          const baseEta = Math.round((distance / avgCitySpeed) * 60);
          // small jitter between -5 and +5 minutes
          const jitter = Math.floor(Math.random() * 11) - 5;
          eta_minutes = Math.max(MIN_ETA, Math.min(MAX_ETA, baseEta + jitter));
        } else {
          // no coordinates — assign a random ETA in range
          eta_minutes = Math.floor(Math.random() * (MAX_ETA - MIN_ETA + 1)) + MIN_ETA;
        }
      
      results.push({ provider: p, total, breakdown, distance, eta_minutes });
    }
    res.json({ ok: true, providers: results, order });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Register new provider with services pricing (full registration)
app.post('/api/register-provider-full', async (req, res) => {
  try {
    console.log('=== REGISTER PROVIDER FULL REQUEST ===');
    console.log('Full Request body:', JSON.stringify(req.body, null, 2));
    
    const {
      // Provider_Reg_1
      services,
      // Provider_Reg_2
      companyName,
      regNumber,
      legalAddress,
      lat,
      lng,
      carsCount,
      companyCars,
      // Provider_Reg_3
      ownerName,
      ownerEmail,
      ownerPhone,
      // company account fields (from Provider_Reg_3 form)
      companyLogin,
      companyPassword,
      companyPhone,
      bkaartDocument,
      // Provider_Reg_4
      accountNumber,
      iban,
      kmkr,
      // Provider_Reg_6
      employees,
      languages
    } = req.body;

    if (!companyName || !regNumber || !ownerName || !ownerEmail || !ownerPhone || !accountNumber || !iban) {
      console.log('Missing required fields');
      return res.status(400).json({ ok: false, error: 'Missing required fields' });
    }

    // If companyLogin was provided, ensure it's not already taken
    if (companyLogin) {
      try {
        const [existing] = await pool.query('SELECT id FROM users WHERE username = ?', [companyLogin]);
        if (existing && existing.length > 0) {
          console.log('Company login already taken:', companyLogin);
          return res.status(400).json({ ok: false, error: 'Login компании уже занят. Выберите другой логин.' });
        }
      } catch (err) {
        console.error('Error checking existing company login:', err.message);
        return res.status(500).json({ ok: false, error: 'Ошибка проверки логина' });
      }
    }
    
    // Insert provider (only main fields)
    console.log('Inserting provider...');
    const [providerResult] = await pool.query(
      `INSERT INTO providers (companyName, regNumber, accountNumber, iban, kmkr, ownerName, ownerEmail, ownerPhone, lat, lng, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [companyName, regNumber, accountNumber, iban, kmkr || null, ownerName, ownerEmail, ownerPhone, lat || null, lng || null]
    );
    
    const providerId = providerResult.insertId;
    console.log('Provider created with ID:', providerId);
    
    // Insert company cars into company_cars table
    if (companyCars && Array.isArray(companyCars) && companyCars.length > 0) {
      console.log('🚗 Inserting company cars, count:', companyCars.length);
      let insertedCount = 0;
      for (const car of companyCars) {
        if (car && typeof car === 'string' && car.trim()) {
          console.log(`Inserting car: "${car}"`);
          try {
            await pool.query(
              'INSERT INTO company_cars (provider_id, name) VALUES (?, ?)',
              [providerId, car.trim()]
            );
            insertedCount++;
            console.log(`✓ Added car ${insertedCount}: ${car}`);
          } catch (err) {
            console.error(`✗ Error inserting car: ${err.message}`);
          }
        }
      }
      console.log(`✓ Successfully inserted ${insertedCount} cars for provider ${providerId}`);
    }
    
    // Insert employees into company_employees table
    if (employees && Array.isArray(employees) && employees.length > 0) {
      console.log('👷 Inserting employees, count:', employees.length);
      for (const emp of employees) {
        if (emp && emp.name && emp.phone) {
          console.log(`Inserting employee: "${emp.name}"`);
          try {
            await pool.query(
              'INSERT INTO company_employees (provider_id, name, phone, languages) VALUES (?, ?, ?, ?)',
              [providerId, emp.name, emp.phone, emp.languages ? JSON.stringify(emp.languages) : null]
            );
            console.log(`✓ Added employee: ${emp.name}`);
          } catch (err) {
            console.error(`✗ Error inserting employee: ${err.message}`);
          }
        }
      }
    }
    
    // Insert service prices from Provider_Reg_1
    if (services && typeof services === 'object') {
      console.log('Inserting services...');
      for (const [serviceName, serviceData] of Object.entries(services)) {
        try {
          let serviceId = null;
          let price = null;
          
          // Handle both { serviceName: price } and { serviceName: { id, price } } formats
          if (typeof serviceData === 'object' && serviceData !== null) {
            serviceId = serviceData.id;
            price = serviceData.price;
          } else {
            price = serviceData;
            // Try to find service by name
            const [serviceRows] = await pool.query('SELECT id FROM services WHERE name = ?', [serviceName]);
            if (serviceRows && serviceRows.length > 0) {
              serviceId = serviceRows[0].id;
            }
          }
          
          if (serviceId && price && parseFloat(price) > 0) {
            await pool.query(
              'INSERT INTO provider_services (provider_id, service_id, price) VALUES (?, ?, ?)',
              [providerId, serviceId, parseFloat(price)]
            );
            console.log(`✓ Added service "${serviceName}" (ID: ${serviceId}) with price ${price}`);
          }
        } catch (err) {
          console.error(`✗ Error inserting service: ${err.message}`);
        }
      }
    }
    
    // If company credentials were provided, create a company user linked to this provider
    if (companyLogin && companyPassword) {
      try {
        const hashedCompanyPass = hashPassword(companyPassword);
        await pool.query(
          'INSERT INTO users (username, password, phone, role, provider_id) VALUES (?, ?, ?, ?, ?)',
          [companyLogin, hashedCompanyPass, companyPhone || null, 'company', providerId]
        );
        console.log('Company user created for provider', providerId, 'username:', companyLogin);
      } catch (err) {
        console.error('Failed to create company user:', err.message);
        // don't fail the whole registration on duplicate username; just warn
      }
    }

    console.log('Provider registration successful, returning response...');
    res.json({ ok: true, providerId, message: 'Provider registered successfully' });
  } catch (err) {
    console.error('=== REGISTER PROVIDER ERROR ===');
    console.error('Error message:', err.message);
    console.error('Error stack:', err.stack);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Register new provider with services pricing (legacy - simple endpoint)
app.post('/api/register-provider', async (req, res) => {
  try {
    const { companyName, ownerPhone, smartId, lat, lng, services } = req.body;
    
    console.log('Register provider request:', { companyName, ownerPhone, smartId, lat, lng, services });
    
    if (!companyName || !ownerPhone) {
      return res.status(400).json({ ok: false, error: 'Company name and phone required' });
    }
    
    // Insert provider
    const [providerResult] = await pool.query(
      'INSERT INTO providers (companyName, ownerPhone, smartId, lat, lng, employees, regNumber, accountNumber, iban, kmkr, ownerName, ownerEmail) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [companyName, ownerPhone, smartId || null, lat || null, lng || null, JSON.stringify([]), null, null, null, null, null, null]
    );
    
    const providerId = providerResult.insertId;
    console.log('Provider created with ID:', providerId);
    
    // Insert service prices
    if (services && typeof services === 'object') {
      for (const [serviceId, price] of Object.entries(services)) {
        if (price && price !== '---' && price > 0) {
          await pool.query(
            'INSERT INTO provider_services (provider_id, service_id, price) VALUES (?, ?, ?)',
            [providerId, serviceId, parseFloat(price)]
          );
          console.log(`Added service ${serviceId} with price ${price} for provider ${providerId}`);
        }
      }
    }
    
    res.json({ ok: true, providerId, message: 'Provider registered successfully' });
  } catch (err) {
    console.error('Register provider error:', err.message);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Get provider company cars
app.get('/api/provider/:id/cars', async (req, res) => {
  try {
    const providerId = req.params.id;
    const [rows] = await pool.query(
      'SELECT id, brand, model FROM company_cars WHERE provider_id = ? ORDER BY created_at ASC',
      [providerId]
    );
    res.json({ ok: true, cars: rows });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Get employee details
app.get('/api/employee/:id', async (req, res) => {
  try {
    const employeeId = req.params.id;
    const [rows] = await pool.query('SELECT id, name, phone, languages, is_online FROM company_employees WHERE id = ?', [employeeId]);
    if (!rows || rows.length === 0) {
      return res.status(404).json({ ok: false, error: 'Employee not found' });
    }
    res.json({ ok: true, employee: rows[0] });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Get car details
app.get('/api/car/:id', async (req, res) => {
  try {
    const carId = req.params.id;
    const [rows] = await pool.query('SELECT id, name, provider_id, is_online FROM company_cars WHERE id = ?', [carId]);
    if (!rows || rows.length === 0) {
      return res.status(404).json({ ok: false, error: 'Car not found' });
    }
    res.json({ ok: true, car: rows[0] });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Complete order - mark employee back online and close order
app.post('/api/order/:orderId/complete', async (req, res) => {
  try {
    const orderId = req.params.orderId;
    
    // Get order to find associated employee
    const [orders] = await pool.query('SELECT provider_id FROM orders WHERE id = ?', [orderId]);
    if (!orders || orders.length === 0) {
      return res.status(404).json({ ok: false, error: 'Order not found' });
    }
    
    // Update order status (mark as completed)
    await pool.query('UPDATE orders SET completed_at = NOW() WHERE id = ?', [orderId]);
    
    res.json({ ok: true, message: 'Order completed successfully' });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Attach provider (existing endpoint)
app.post('/api/order/attach', async (req, res) => {
  try {
    const { orderId, providerId, employeeId, carId } = req.body || {};
    if (!orderId || !providerId) return res.status(400).json({ ok: false, error: 'orderId and providerId required' });
    await pool.query('UPDATE orders SET provider_id = ?, employee_id = ?, car_id = ? WHERE id = ?', [providerId, employeeId||null, carId||null, orderId]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

<<<<<<< HEAD
if (hasFrontendBuild) {
  app.get('*', (req, res, next) => {
    // Keep API and file-like routes handled by their own endpoints/static middleware.
    if (req.path.startsWith('/api') || req.path === '/db-test' || req.path.startsWith('/sos-narva') || path.extname(req.path)) {
      return next();
    }
    return res.sendFile(frontendIndexPath);
  });
}
=======
// Глобальный обработчик ошибок - всегда возвращает JSON
app.use((err, req, res, next) => {
  console.error('Global error handler:', err.message);
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ ok: false, error: 'Некорректный JSON' });
  }
  res.status(500).json({ ok: false, error: err.message || 'Ошибка сервера' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// Ensure `name` column exists on company_cars for legacy schemas
(async function ensureCompanyCarsName() {
  try {
    const [cols] = await pool.query("SHOW COLUMNS FROM company_cars LIKE 'name'");
    if (!cols || cols.length === 0) {
      console.log('`name` column missing on company_cars, adding it...');
      await pool.query('ALTER TABLE company_cars ADD COLUMN name VARCHAR(255) NULL');
      console.log('Added `company_cars.name` column');
    }
  } catch (err) {
    console.warn('Could not ensure company_cars.name column:', err && err.message);
  }
})();

// Ensure `completed_at` column exists on orders for tracking completed orders
(async function ensureOrdersCompletedAt() {
  try {
    const [cols] = await pool.query("SHOW COLUMNS FROM orders LIKE 'completed_at'");
    if (!cols || cols.length === 0) {
      console.log('`completed_at` column missing on orders, adding it...');
      await pool.query('ALTER TABLE orders ADD COLUMN completed_at TIMESTAMP NULL DEFAULT NULL');
      console.log('Added `orders.completed_at` column');
    }
  } catch (err) {
    console.warn('Could not ensure orders.completed_at column:', err && err.message);
  }
})();

// Helper: calculate distance between two coordinates (haversine formula) in km
function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // radius of Earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
=======
const express = require('express');
const path = require('path');
const pool = require('./db');
require('dotenv').config();
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '2mb' }));

// Serve static site (your existing HTML files)
app.use(express.static(path.join(__dirname)));

const crypto = require('crypto');

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

function generateToken() {
  return crypto.randomBytes(32).toString('hex');
}

// Helper function to verify company access
async function verifyCompanyAccess(userId, providerId) {
  try {
    const [rows] = await pool.query(
      'SELECT id, provider_id FROM users WHERE id = ? AND role = ? AND provider_id = ?',
      [userId, 'company', providerId]
    );
    return rows && rows.length > 0;
  } catch (err) {
    console.error('Verify company access error:', err.message);
    return false;
  }
}

// Конфигурация nodemailer (для демонстрации используем test account)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'your-email@gmail.com',
    pass: process.env.EMAIL_PASSWORD || 'your-app-password'
  }
});

// Test DB connection
app.get('/db-test', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT 1+1 AS result');
    res.json({ ok: true, result: rows[0].result });
  } catch (err) {
    console.error('DB test error:', err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// РЕГИСТРАЦИЯ ПОЛЬЗОВАТЕЛЯ (простая без email)
app.post('/api/register-user', async (req, res) => {
  try {
    const { username, password, phone } = req.body;
    console.log('Register request:', { username, phone });
    
    if (!username || !password || !phone) {
      return res.status(400).json({ ok: false, error: 'Имя пользователя, пароль и телефон обязательны' });
    }
    
    if (password.length < 3) {
      return res.status(400).json({ ok: false, error: 'Пароль должен быть минимум 3 символа' });
    }
    
    const hashed = hashPassword(password);
    
    // Создать пользователя
    const [result] = await pool.query(
      'INSERT INTO users (username, password, phone) VALUES (?, ?, ?)',
      [username, hashed, phone]
    );
    
    const userId = result.insertId;
    console.log('User registered:', userId);
    
    res.json({ 
      ok: true, 
      userId,
      message: 'Аккаунт создан успешно!'
    });
  } catch (err) {
    console.error('Register error:', err.message, err.code);
    if (err.code === 'ER_DUP_ENTRY') {
      res.status(400).json({ ok: false, error: 'Это имя пользователя уже занято' });
    } else {
      res.status(500).json({ ok: false, error: 'Ошибка регистрации: ' + err.message });
    }
  }
});
// ЛОГИН ПОЛЬЗОВАТЕЛЯ
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log('Login request:', { username });
    
    if (!username || !password) {
      return res.status(400).json({ ok: false, error: 'Имя пользователя и пароль обязательны' });
    }
    
    const hashed = hashPassword(password);
    console.log('Login hashed password:', hashed);
    
    const [rows] = await pool.query(
      'SELECT id, username, role, provider_id FROM users WHERE username = ? AND password = ?',
      [username, hashed]
    );
    
    console.log('Login query result:', rows);
    
    if (rows && rows.length > 0) {
      const user = rows[0];
      console.log('Login successful for user:', user.username, 'role:', user.role);
      res.json({ ok: true, userId: user.id, role: user.role || 'user', providerId: user.provider_id || null });
    } else {
      console.log('Login failed: user not found or wrong password');
      res.status(401).json({ ok: false, error: 'Неправильное имя пользователя или пароль' });
    }
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ ok: false, error: 'Ошибка входа: ' + err.message });
  }
});

// ВХОД В КОМПАНИЮ
app.post('/api/company-login', async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log('Company login request:', { username, password });
    if (!username || !password) {
      return res.status(400).json({ ok: false, error: 'Логин и пароль обязательны' });
    }
    const hashed = hashPassword(password);
    console.log('Hashed password:', hashed);
    const [rows] = await pool.query(
      'SELECT id, username, provider_id FROM users WHERE username = ? AND password = ? AND role = ?',
      [username, hashed, 'company']
    );
    console.log('Company login query result:', rows);
    if (rows && rows.length > 0) {
      const user = rows[0];
      console.log('Company login successful for:', user.username);
      res.json({ ok: true, userId: user.id, providerId: user.provider_id, companyName: user.username });
    } else {
      console.log('Company login failed: company user not found or wrong password');
      res.status(401).json({ ok: false, error: 'Неправильный логин или пароль компании' });
    }
  } catch (err) {
    console.error('Company login error:', err.message);
    res.status(500).json({ ok: false, error: 'Ошибка входа: ' + err.message });
  }
});

// Check username availability (used by client-side validation)
app.get('/api/check-username', async (req, res) => {
  try {
    const username = (req.query.username || '').trim();
    if (!username) return res.json({ ok: false, available: false, error: 'username required' });
    const [rows] = await pool.query('SELECT id FROM users WHERE username = ?', [username]);
    const available = !(rows && rows.length > 0);
    res.json({ ok: true, available });
  } catch (err) {
    console.error('Check username error:', err.message);
    res.status(500).json({ ok: false, available: false, error: err.message });
  }
});
// Insert provider (expects JSON matching form fields)
app.post('/api/provider', async (req, res) => {
  try {
    const p = req.body || {};
    const employees = p.employees ? JSON.stringify(p.employees) : JSON.stringify([]);
    const [result] = await pool.query(
      `INSERT INTO providers (companyName, regNumber, accountNumber, iban, kmkr, ownerName, ownerEmail, ownerPhone, employees, lat, lng) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [p.companyName||null, p.regNumber||null, p.accountNumber||null, p.iban||null, p.kmkr||null, p.ownerName||null, p.ownerEmail||null, p.ownerPhone||null, employees, p.latitude||p.lat||null, p.longitude||p.lng||null]
    );
    res.json({ ok: true, insertId: result.insertId });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Generic registration endpoint
app.post('/api/register', async (req, res) => {
  try {
    const { name, email, phone, payload } = req.body || {};
    const [result] = await pool.query(
      `INSERT INTO registrations (name, email, phone, payload) VALUES (?, ?, ?, ?)`,
      [name||null, email||null, phone||null, JSON.stringify(payload||{})]
    );
    res.json({ ok: true, insertId: result.insertId });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// List providers
app.get('/api/providers', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, companyName, ownerName, ownerEmail, ownerPhone, employees, created_at FROM providers ORDER BY created_at DESC');
    res.json({ ok: true, providers: rows });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Get provider by id (full details + cars)
app.get('/api/provider/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const userId = req.query.userId || req.headers['x-user-id'];
    
    // Verify that user has access to this provider
    if (!userId || !(await verifyCompanyAccess(userId, id))) {
      return res.status(403).json({ ok: false, error: 'Access denied' });
    }
    
    const [rows] = await pool.query('SELECT * FROM providers WHERE id = ?', [id]);
    if (!rows || rows.length === 0) return res.status(404).json({ ok: false, error: 'Provider not found' });
    const provider = rows[0];
    // Try to load company cars (handle different schemas gracefully)
    try {
      // Many schemas store plate/identifier in `name` column for company_cars
      const [cars] = await pool.query('SELECT id, name FROM company_cars WHERE provider_id = ? ORDER BY created_at ASC', [id]);
      provider.cars = (cars || []).map(c => ({ id: c.id, regNumber: c.name || '' }));
    } catch (err) {
      console.warn('Failed to load company_cars by name, falling back to other schemas', err.message);
      try {
        const [carsRaw] = await pool.query('SELECT * FROM company_cars WHERE provider_id = ? ORDER BY created_at ASC', [id]);
        provider.cars = (carsRaw || []).map(r => ({ id: r.id, regNumber: r.name || r.regNumber || r.reg_number || r.plate || ( (r.brand||'') + ' ' + (r.model||'') ).trim() }));
      } catch (err2) {
        console.error('Failed to load company_cars fallback:', err2.message);
        provider.cars = [];
      }
    }

    // Load employees from company_employees table
    try {
      const [employees] = await pool.query(
        'SELECT id, name, phone, languages FROM company_employees WHERE provider_id = ? ORDER BY created_at ASC',
        [id]
      );
      provider.employees = (employees || []).map(e => ({
        id: e.id.toString(),
        name: e.name,
        phone: e.phone,
        languages: e.languages ? JSON.parse(e.languages) : []
      }));
    } catch (err) {
      console.warn('Failed to load employees:', err.message);
      provider.employees = [];
    }
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Get active orders for provider
app.get('/api/provider/:id/orders', async (req, res) => {
  try {
    const id = req.params.id;
    const userId = req.query.userId || req.headers['x-user-id'];
    
    // Verify that user has access to this provider
    if (!userId || !(await verifyCompanyAccess(userId, id))) {
      return res.status(403).json({ ok: false, error: 'Access denied' });
    }
    
    const [rows] = await pool.query('SELECT id, vehicleBrand, vehicleModel, regNumber, services, address, lat, lng, paymentType, created_at FROM orders WHERE provider_id = ? ORDER BY created_at DESC', [id]);
    res.json({ ok: true, orders: rows });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Add company car for provider
app.post('/api/provider/:id/car', async (req, res) => {
  try {
    const id = req.params.id;
    const userId = req.body.userId || req.query.userId || req.headers['x-user-id'];
    
    // Verify that user has access to this provider
    if (!userId || !(await verifyCompanyAccess(userId, id))) {
      return res.status(403).json({ ok: false, error: 'Access denied' });
    }
    const { regNumber, brand, model, name } = req.body || {};
    // Prefer inserting into `name` column which exists in current schema
    const plate = regNumber || name || ((brand || '') + ' ' + (model || '')).trim();
    if (!plate) return res.status(400).json({ ok: false, error: 'regNumber/name/brand required' });
    try {
      const [result] = await pool.query('INSERT INTO company_cars (provider_id, name) VALUES (?, ?)', [id, plate]);
      return res.json({ ok: true, insertId: result.insertId, plate });
    } catch (errInner) {
      // If `name` column doesn't exist, try other known schemas
      console.warn('Insert into name failed, trying fallback schemas:', errInner.message);
      try {
        const [res2] = await pool.query('INSERT INTO company_cars (provider_id, regNumber) VALUES (?, ?)', [id, plate]);
        return res.json({ ok: true, insertId: res2.insertId, regNumber: plate });
      } catch (err2) {
        try {
          const [res3] = await pool.query('INSERT INTO company_cars (provider_id, brand, model) VALUES (?, ?, ?)', [id, brand || '', model || '']);
          return res.json({ ok: true, insertId: res3.insertId, brand: brand || '', model: model || '' });
        } catch (err3) {
          console.error('Add car error fallback:', err3.message);
          return res.status(500).json({ ok: false, error: err3.message });
        }
      }
    }
  } catch (err) {
    console.error('Add car error:', err.message);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Delete company car
app.delete('/api/provider/:id/car/:carId', async (req, res) => {
  try {
    const { id, carId } = req.params;
    const userId = req.query.userId || req.headers['x-user-id'];
    
    // Verify that user has access to this provider
    if (!userId || !(await verifyCompanyAccess(userId, id))) {
      return res.status(403).json({ ok: false, error: 'Access denied' });
    }
    
    await pool.query('DELETE FROM company_cars WHERE id = ? AND provider_id = ?', [carId, id]);
    res.json({ ok: true });
  } catch (err) {
    console.error('Delete car error:', err.message);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Update employees for provider (delete all and insert from array)
app.put('/api/provider/:id/employees', async (req, res) => {
  try {
    const id = req.params.id;
    const userId = req.body.userId || req.query.userId || req.headers['x-user-id'];
    
    // Verify that user has access to this provider
    if (!userId || !(await verifyCompanyAccess(userId, id))) {
      return res.status(403).json({ ok: false, error: 'Access denied' });
    }
    
    const employees = req.body.employees || [];
    // Basic validation
    if (!Array.isArray(employees)) return res.status(400).json({ ok: false, error: 'employees must be array' });
    
    // Delete all existing employees for this provider
    await pool.query('DELETE FROM company_employees WHERE provider_id = ?', [id]);
    
    // Insert new employees
    for (const emp of employees) {
      if (emp.name && emp.phone) {
        await pool.query(
          'INSERT INTO company_employees (provider_id, name, phone, languages) VALUES (?, ?, ?, ?)',
          [id, emp.name, emp.phone, emp.languages ? JSON.stringify(emp.languages) : null]
        );
      }
    }
    
    res.json({ ok: true });
  } catch (err) {
    console.error('Update employees error:', err.message);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Delete single employee
app.delete('/api/provider/:id/employee/:empId', async (req, res) => {
  try {
    const { id, empId } = req.params;
    const userId = req.query.userId || req.headers['x-user-id'];
    
    // Verify that user has access to this provider
    if (!userId || !(await verifyCompanyAccess(userId, id))) {
      return res.status(403).json({ ok: false, error: 'Access denied' });
    }
    
    await pool.query('DELETE FROM company_employees WHERE id = ? AND provider_id = ?', [empId, id]);
    res.json({ ok: true });
  } catch (err) {
    console.error('Delete employee error:', err.message);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Add single employee
app.post('/api/provider/:id/employee', async (req, res) => {
  try {
    const id = req.params.id;
    const userId = req.body.userId || req.query.userId || req.headers['x-user-id'];
    const { name, phone, languages } = req.body;
    
    // Verify that user has access to this provider
    if (!userId || !(await verifyCompanyAccess(userId, id))) {
      return res.status(403).json({ ok: false, error: 'Access denied' });
    }
    
    if (!name || !phone) {
      return res.status(400).json({ ok: false, error: 'name and phone required' });
    }
    
    const [result] = await pool.query(
      'INSERT INTO company_employees (provider_id, name, phone, languages, is_online) VALUES (?, ?, ?, ?, true)',
      [id, name, phone, languages ? JSON.stringify(languages) : null]
    );
    
    res.json({ ok: true, employeeId: result.insertId });
  } catch (err) {
    console.error('Add employee error:', err.message);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Set employee online/offline status
app.patch('/api/employee/:empId/status', async (req, res) => {
  try {
    const empId = req.params.empId;
    const { isOnline } = req.body;
    
    if (typeof isOnline !== 'boolean') {
      return res.status(400).json({ ok: false, error: 'isOnline must be boolean' });
    }
    
    await pool.query(
      'UPDATE company_employees SET is_online = ? WHERE id = ?',
      [isOnline, empId]
    );
    
    res.json({ ok: true });
  } catch (err) {
    console.error('Update employee status error:', err.message);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Validate provider fields for duplicates
app.post('/api/validate-provider', async (req, res) => {
  try {
    console.log('Validation request body:', req.body);
    const { companyName, regNumber, accountNumber } = req.body || {};
    console.log('Extracted fields:', { companyName, regNumber, accountNumber });
    
    if (!companyName && !regNumber && !accountNumber) {
      console.log('All fields are empty');
      return res.status(400).json({ ok: false, error: 'At least one field required' });
    }
    
    // Check if any of these fields already exist
    let query = 'SELECT id, companyName, regNumber, accountNumber FROM providers WHERE ';
    let conditions = [];
    let values = [];
    
    if (companyName) {
      conditions.push('companyName = ?');
      values.push(companyName);
    }
    if (regNumber) {
      conditions.push('regNumber = ?');
      values.push(regNumber);
    }
    if (accountNumber) {
      conditions.push('accountNumber = ?');
      values.push(accountNumber);
    }
    
    query += conditions.join(' OR ');
    console.log('Executing query:', query, 'with values:', values);
    
    const [rows] = await pool.query(query, values);
    console.log('Query results:', rows);
    
    if (rows.length > 0) {
      const duplicate = rows[0];
      let conflictField = '';
      if (companyName && duplicate.companyName === companyName) {
        conflictField = 'Название фирмы';
      } else if (regNumber && duplicate.regNumber === regNumber) {
        conflictField = 'Регистрационный номер';
      } else if (accountNumber && duplicate.accountNumber === accountNumber) {
        conflictField = 'Номер счёта';
      }
      
      console.log('Duplicate found:', conflictField);
      return res.json({ 
        ok: false, 
        error: `${conflictField} уже зарегистрирован(а) в системе`,
        conflictField: conflictField
      });
    }
    
    console.log('No duplicates found, validation passed');
    res.json({ ok: true, message: 'Данные доступны для регистрации' });
  } catch (err) {
    console.error('Validation error:', err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Get user by id (returns username, email, phone)
app.get('/api/user/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const [rows] = await pool.query('SELECT id, username, phone FROM users WHERE id = ?', [id]);
    if (!rows || rows.length === 0) return res.status(404).json({ ok: false, error: 'User not found' });
    res.json({ ok: true, user: rows[0] });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Update user profile (username, phone)
app.put('/api/user/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const { username, phone } = req.body;
    console.log('PUT /api/user/:id request', { id, username, phone });
    
    if (!username && !phone) {
      return res.status(400).json({ ok: false, error: 'At least one field is required' });
    }
    
    let query = 'UPDATE users SET';
    let values = [];
    let updates = [];
    
    if (username) {
      updates.push('username = ?');
      values.push(username);
    }
    if (phone) {
      updates.push('phone = ?');
      values.push(phone);
    }
    
    query += ' ' + updates.join(', ') + ' WHERE id = ?';
    values.push(id);
    
    console.log('Executing query:', query, 'with values:', values);
    const [result] = await pool.query(query, values);
    console.log('Query result:', result);
    
    if (result.affectedRows === 0) {
      console.log('No rows affected, returning 404');
      return res.status(404).json({ ok: false, error: 'User not found' });
    }
    
    console.log('About to send success response');
    res.json({ ok: true, message: 'Profile updated successfully' });
    console.log('Response sent');
  } catch (err) {
    console.error('PUT error:', err.message, err.code);
    if (err.code === 'ER_DUP_ENTRY') {
      res.status(400).json({ ok: false, error: 'Username already taken' });
    } else {
      res.status(500).json({ ok: false, error: err.message });
    }
  }
});

// List registrations
app.get('/api/registrations', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, name, email, phone, payload, created_at FROM registrations ORDER BY created_at DESC');
    res.json({ ok: true, registrations: rows });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// List services
app.get('/api/services', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, name FROM services ORDER BY id');
    res.json({ ok: true, services: rows });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Get providers offering a specific service with online employees and cars
app.get('/api/providers-for-service/:serviceId', async (req, res) => {
  try {
    const serviceId = req.params.serviceId;
    
    // Get all providers that offer this service
    const [providers] = await pool.query(`
      SELECT DISTINCT p.id, p.companyName, p.lat, p.lng, p.ownerPhone, ps.price
      FROM providers p
      JOIN provider_services ps ON p.id = ps.provider_id
      WHERE ps.service_id = ?
      ORDER BY p.id
    `, [serviceId]);
    
    if (!providers || providers.length === 0) {
      return res.json({ ok: true, providers: [] });
    }
    
    // For each provider, load online employees and cars
    const result = await Promise.all(providers.map(async (provider) => {
      const [employees] = await pool.query(`
        SELECT id, name, phone, languages 
        FROM company_employees 
        WHERE provider_id = ? AND is_online = true
      `, [provider.id]);
      
      const [cars] = await pool.query(`
        SELECT id, name 
        FROM company_cars 
        WHERE provider_id = ? AND is_online = true
      `, [provider.id]);
      
      return {
        ...provider,
        onlineEmployees: employees || [],
        onlineCars: cars || []
      };
    }));
    
    // Filter only providers with at least one online employee and car
    const availableProviders = result.filter(p => p.onlineEmployees.length > 0 && p.onlineCars.length > 0);
    
    res.json({ ok: true, providers: availableProviders });
  } catch (err) {
    console.error('Error getting providers for service:', err.message);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Create order
app.post('/api/order', async (req, res) => {
  try {
    const { vehicleBrand, vehicleModel, regNumber, services, address, lat, lng, paymentType, userId } = req.body || {};
    const [result] = await pool.query(
      `INSERT INTO orders (vehicleBrand, vehicleModel, regNumber, services, address, lat, lng, paymentType, user_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [vehicleBrand||null, vehicleModel||null, regNumber||null, JSON.stringify(services||[]), address||null, lat||null, lng||null, paymentType||null, userId||null]
    );
    res.json({ ok: true, orderId: result.insertId });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Get order
app.get('/api/orders/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const [rows] = await pool.query('SELECT * FROM orders WHERE id = ?', [id]);
    if (!rows || rows.length === 0) return res.status(404).json({ ok: false, error: 'Not found' });
    res.json({ ok: true, order: rows[0] });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Get user's active orders (not completed)
app.get('/api/user/:userId/orders/active', async (req, res) => {
  try {
    const userId = req.params.userId;
    const [rows] = await pool.query(
      `SELECT o.*, p.companyName, p.ownerPhone, ce.name as employee_name, cc.name as car_name
       FROM orders o
       LEFT JOIN providers p ON o.provider_id = p.id
       LEFT JOIN company_employees ce ON o.employee_id = ce.id
       LEFT JOIN company_cars cc ON o.car_id = cc.id
       WHERE o.user_id = ? AND o.completed_at IS NULL
       ORDER BY o.created_at DESC`,
      [userId]
    );
    res.json({ ok: true, orders: rows || [] });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Get user's completed orders (history)
app.get('/api/user/:userId/orders/completed', async (req, res) => {
  try {
    const userId = req.params.userId;
    const [rows] = await pool.query(
      `SELECT o.*, p.companyName, p.ownerPhone, ce.name as employee_name, cc.name as car_name
       FROM orders o
       LEFT JOIN providers p ON o.provider_id = p.id
       LEFT JOIN company_employees ce ON o.employee_id = ce.id
       LEFT JOIN company_cars cc ON o.car_id = cc.id
       WHERE o.user_id = ? AND o.completed_at IS NOT NULL
       ORDER BY o.completed_at DESC`,
      [userId]
    );
    res.json({ ok: true, orders: rows || [] });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Compute provider prices for an order
app.get('/api/providers/prices', async (req, res) => {
  try {
    const orderId = req.query.orderId;
    if (!orderId) return res.status(400).json({ ok: false, error: 'orderId required' });
    const [orders] = await pool.query('SELECT * FROM orders WHERE id = ?', [orderId]);
    if (!orders || orders.length === 0) return res.status(404).json({ ok: false, error: 'Order not found' });
    const order = orders[0];
    const services = JSON.parse(order.services || '[]');
    const userLat = order.lat;
    const userLng = order.lng;

    // get all providers with coordinates
    const [providers] = await pool.query('SELECT id, companyName, ownerName, ownerPhone, lat, lng FROM providers');

    // for each provider, sum prices of services and calculate ETA
    const results = [];
    for (const p of providers) {
      if (!services || services.length === 0) {
        results.push({ provider: p, total: 0, breakdown: [], distance: null, eta_minutes: null });
        continue;
      }
      // select prices for this provider for services in order
      const placeholders = services.map(() => '?').join(',');
      const [rows] = await pool.query(
        `SELECT s.id as service_id, s.name, ps.price FROM provider_services ps JOIN services s ON ps.service_id = s.id WHERE ps.provider_id = ? AND s.id IN (${placeholders})`,
        [p.id, ...services]
      );
      let total = 0;
      const breakdown = [];
      for (const r of rows) {
        total += Number(r.price || 0);
        breakdown.push({ service_id: r.service_id, name: r.name, price: Number(r.price) });
      }
      
        // Calculate ETA: distance / average speed in city (40 km/h) * 60 min
        // Ensure eta is in 8..50 minutes and add small random jitter so different
        // providers don't all report near-identical ETAs.
        let distance = null;
        let eta_minutes = null;
        const MIN_ETA = 10;
        const MAX_ETA = 45;
        if (p.lat && p.lng && userLat && userLng) {
          distance = haversineDistance(userLat, userLng, p.lat, p.lng);
          const avgCitySpeed = 40; // km/h
          const baseEta = Math.round((distance / avgCitySpeed) * 60);
          // small jitter between -5 and +5 minutes
          const jitter = Math.floor(Math.random() * 11) - 5;
          eta_minutes = Math.max(MIN_ETA, Math.min(MAX_ETA, baseEta + jitter));
        } else {
          // no coordinates — assign a random ETA in range
          eta_minutes = Math.floor(Math.random() * (MAX_ETA - MIN_ETA + 1)) + MIN_ETA;
        }
      
      results.push({ provider: p, total, breakdown, distance, eta_minutes });
    }
    res.json({ ok: true, providers: results, order });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Register new provider with services pricing (full registration)
app.post('/api/register-provider-full', async (req, res) => {
  try {
    console.log('=== REGISTER PROVIDER FULL REQUEST ===');
    console.log('Full Request body:', JSON.stringify(req.body, null, 2));
    
    const {
      // Provider_Reg_1
      services,
      // Provider_Reg_2
      companyName,
      regNumber,
      legalAddress,
      lat,
      lng,
      carsCount,
      companyCars,
      // Provider_Reg_3
      ownerName,
      ownerEmail,
      ownerPhone,
      // company account fields (from Provider_Reg_3 form)
      companyLogin,
      companyPassword,
      companyPhone,
      bkaartDocument,
      // Provider_Reg_4
      accountNumber,
      iban,
      kmkr,
      // Provider_Reg_6
      employees,
      languages
    } = req.body;

    if (!companyName || !regNumber || !ownerName || !ownerEmail || !ownerPhone || !accountNumber || !iban) {
      console.log('Missing required fields');
      return res.status(400).json({ ok: false, error: 'Missing required fields' });
    }

    // If companyLogin was provided, ensure it's not already taken
    if (companyLogin) {
      try {
        const [existing] = await pool.query('SELECT id FROM users WHERE username = ?', [companyLogin]);
        if (existing && existing.length > 0) {
          console.log('Company login already taken:', companyLogin);
          return res.status(400).json({ ok: false, error: 'Login компании уже занят. Выберите другой логин.' });
        }
      } catch (err) {
        console.error('Error checking existing company login:', err.message);
        return res.status(500).json({ ok: false, error: 'Ошибка проверки логина' });
      }
    }
    
    // Insert provider (only main fields)
    console.log('Inserting provider...');
    const [providerResult] = await pool.query(
      `INSERT INTO providers (companyName, regNumber, accountNumber, iban, kmkr, ownerName, ownerEmail, ownerPhone, lat, lng, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [companyName, regNumber, accountNumber, iban, kmkr || null, ownerName, ownerEmail, ownerPhone, lat || null, lng || null]
    );
    
    const providerId = providerResult.insertId;
    console.log('Provider created with ID:', providerId);
    
    // Insert company cars into company_cars table
    if (companyCars && Array.isArray(companyCars) && companyCars.length > 0) {
      console.log('🚗 Inserting company cars, count:', companyCars.length);
      let insertedCount = 0;
      for (const car of companyCars) {
        if (car && typeof car === 'string' && car.trim()) {
          console.log(`Inserting car: "${car}"`);
          try {
            await pool.query(
              'INSERT INTO company_cars (provider_id, name) VALUES (?, ?)',
              [providerId, car.trim()]
            );
            insertedCount++;
            console.log(`✓ Added car ${insertedCount}: ${car}`);
          } catch (err) {
            console.error(`✗ Error inserting car: ${err.message}`);
          }
        }
      }
      console.log(`✓ Successfully inserted ${insertedCount} cars for provider ${providerId}`);
    }
    
    // Insert employees into company_employees table
    if (employees && Array.isArray(employees) && employees.length > 0) {
      console.log('👷 Inserting employees, count:', employees.length);
      for (const emp of employees) {
        if (emp && emp.name && emp.phone) {
          console.log(`Inserting employee: "${emp.name}"`);
          try {
            await pool.query(
              'INSERT INTO company_employees (provider_id, name, phone, languages) VALUES (?, ?, ?, ?)',
              [providerId, emp.name, emp.phone, emp.languages ? JSON.stringify(emp.languages) : null]
            );
            console.log(`✓ Added employee: ${emp.name}`);
          } catch (err) {
            console.error(`✗ Error inserting employee: ${err.message}`);
          }
        }
      }
    }
    
    // Insert service prices from Provider_Reg_1
    if (services && typeof services === 'object') {
      console.log('Inserting services...');
      for (const [serviceName, serviceData] of Object.entries(services)) {
        try {
          let serviceId = null;
          let price = null;
          
          // Handle both { serviceName: price } and { serviceName: { id, price } } formats
          if (typeof serviceData === 'object' && serviceData !== null) {
            serviceId = serviceData.id;
            price = serviceData.price;
          } else {
            price = serviceData;
            // Try to find service by name
            const [serviceRows] = await pool.query('SELECT id FROM services WHERE name = ?', [serviceName]);
            if (serviceRows && serviceRows.length > 0) {
              serviceId = serviceRows[0].id;
            }
          }
          
          if (serviceId && price && parseFloat(price) > 0) {
            await pool.query(
              'INSERT INTO provider_services (provider_id, service_id, price) VALUES (?, ?, ?)',
              [providerId, serviceId, parseFloat(price)]
            );
            console.log(`✓ Added service "${serviceName}" (ID: ${serviceId}) with price ${price}`);
          }
        } catch (err) {
          console.error(`✗ Error inserting service: ${err.message}`);
        }
      }
    }
    
    // If company credentials were provided, create a company user linked to this provider
    if (companyLogin && companyPassword) {
      try {
        const hashedCompanyPass = hashPassword(companyPassword);
        await pool.query(
          'INSERT INTO users (username, password, phone, role, provider_id) VALUES (?, ?, ?, ?, ?)',
          [companyLogin, hashedCompanyPass, companyPhone || null, 'company', providerId]
        );
        console.log('Company user created for provider', providerId, 'username:', companyLogin);
      } catch (err) {
        console.error('Failed to create company user:', err.message);
        // don't fail the whole registration on duplicate username; just warn
      }
    }

    console.log('Provider registration successful, returning response...');
    res.json({ ok: true, providerId, message: 'Provider registered successfully' });
  } catch (err) {
    console.error('=== REGISTER PROVIDER ERROR ===');
    console.error('Error message:', err.message);
    console.error('Error stack:', err.stack);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Register new provider with services pricing (legacy - simple endpoint)
app.post('/api/register-provider', async (req, res) => {
  try {
    const { companyName, ownerPhone, smartId, lat, lng, services } = req.body;
    
    console.log('Register provider request:', { companyName, ownerPhone, smartId, lat, lng, services });
    
    if (!companyName || !ownerPhone) {
      return res.status(400).json({ ok: false, error: 'Company name and phone required' });
    }
    
    // Insert provider
    const [providerResult] = await pool.query(
      'INSERT INTO providers (companyName, ownerPhone, smartId, lat, lng, employees, regNumber, accountNumber, iban, kmkr, ownerName, ownerEmail) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [companyName, ownerPhone, smartId || null, lat || null, lng || null, JSON.stringify([]), null, null, null, null, null, null]
    );
    
    const providerId = providerResult.insertId;
    console.log('Provider created with ID:', providerId);
    
    // Insert service prices
    if (services && typeof services === 'object') {
      for (const [serviceId, price] of Object.entries(services)) {
        if (price && price !== '---' && price > 0) {
          await pool.query(
            'INSERT INTO provider_services (provider_id, service_id, price) VALUES (?, ?, ?)',
            [providerId, serviceId, parseFloat(price)]
          );
          console.log(`Added service ${serviceId} with price ${price} for provider ${providerId}`);
        }
      }
    }
    
    res.json({ ok: true, providerId, message: 'Provider registered successfully' });
  } catch (err) {
    console.error('Register provider error:', err.message);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Get provider company cars
app.get('/api/provider/:id/cars', async (req, res) => {
  try {
    const providerId = req.params.id;
    const [rows] = await pool.query(
      'SELECT id, brand, model FROM company_cars WHERE provider_id = ? ORDER BY created_at ASC',
      [providerId]
    );
    res.json({ ok: true, cars: rows });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Get employee details
app.get('/api/employee/:id', async (req, res) => {
  try {
    const employeeId = req.params.id;
    const [rows] = await pool.query('SELECT id, name, phone, languages, is_online FROM company_employees WHERE id = ?', [employeeId]);
    if (!rows || rows.length === 0) {
      return res.status(404).json({ ok: false, error: 'Employee not found' });
    }
    res.json({ ok: true, employee: rows[0] });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Get car details
app.get('/api/car/:id', async (req, res) => {
  try {
    const carId = req.params.id;
    const [rows] = await pool.query('SELECT id, name, provider_id, is_online FROM company_cars WHERE id = ?', [carId]);
    if (!rows || rows.length === 0) {
      return res.status(404).json({ ok: false, error: 'Car not found' });
    }
    res.json({ ok: true, car: rows[0] });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Complete order - mark employee back online and close order
app.post('/api/order/:orderId/complete', async (req, res) => {
  try {
    const orderId = req.params.orderId;
    
    // Get order to find associated employee
    const [orders] = await pool.query('SELECT provider_id FROM orders WHERE id = ?', [orderId]);
    if (!orders || orders.length === 0) {
      return res.status(404).json({ ok: false, error: 'Order not found' });
    }
    
    // Update order status (mark as completed)
    await pool.query('UPDATE orders SET completed_at = NOW() WHERE id = ?', [orderId]);
    
    res.json({ ok: true, message: 'Order completed successfully' });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Attach provider (existing endpoint)
app.post('/api/order/attach', async (req, res) => {
  try {
    const { orderId, providerId, employeeId, carId } = req.body || {};
    if (!orderId || !providerId) return res.status(400).json({ ok: false, error: 'orderId and providerId required' });
    await pool.query('UPDATE orders SET provider_id = ?, employee_id = ?, car_id = ? WHERE id = ?', [providerId, employeeId||null, carId||null, orderId]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});
>>>>>>> f6dfbbf69b75ceb173df6b2e55d64e1943954ee2

// Глобальный обработчик ошибок - всегда возвращает JSON
app.use((err, req, res, next) => {
  console.error('Global error handler:', err.message);
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ ok: false, error: 'Некорректный JSON' });
  }
  res.status(500).json({ ok: false, error: err.message || 'Ошибка сервера' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// Ensure `name` column exists on company_cars for legacy schemas
(async function ensureCompanyCarsName() {
  try {
    const [cols] = await pool.query("SHOW COLUMNS FROM company_cars LIKE 'name'");
    if (!cols || cols.length === 0) {
      console.log('`name` column missing on company_cars, adding it...');
      await pool.query('ALTER TABLE company_cars ADD COLUMN name VARCHAR(255) NULL');
      console.log('Added `company_cars.name` column');
    }
  } catch (err) {
    console.warn('Could not ensure company_cars.name column:', err && err.message);
  }
})();

// Ensure `completed_at` column exists on orders for tracking completed orders
(async function ensureOrdersCompletedAt() {
  try {
    const [cols] = await pool.query("SHOW COLUMNS FROM orders LIKE 'completed_at'");
    if (!cols || cols.length === 0) {
      console.log('`completed_at` column missing on orders, adding it...');
      await pool.query('ALTER TABLE orders ADD COLUMN completed_at TIMESTAMP NULL DEFAULT NULL');
      console.log('Added `orders.completed_at` column');
    }
  } catch (err) {
    console.warn('Could not ensure orders.completed_at column:', err && err.message);
  }
})();

// Helper: calculate distance between two coordinates (haversine formula) in km
function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // radius of Earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
<<<<<<< HEAD
}
=======
}
>>>>>>> 749d43b93c75b07192de6f04c21877c6ff7a531e
>>>>>>> f6dfbbf69b75ceb173df6b2e55d64e1943954ee2
>>>>>>> 6f3e1231dbbf21d9e9191af2350e9486e8609650
