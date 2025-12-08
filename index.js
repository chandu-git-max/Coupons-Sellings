// server/index.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const Database = require('better-sqlite3');


const db = new Database('./db.sqlite');
const app = express();
app.use(cors());
app.use(bodyParser.json());


// init tables
db.exec(`
CREATE TABLE IF NOT EXISTS coupons (
id INTEGER PRIMARY KEY AUTOINCREMENT,
code TEXT UNIQUE,
face_value INTEGER,
sold INTEGER DEFAULT 0
);
CREATE TABLE IF NOT EXISTS orders (
id INTEGER PRIMARY KEY AUTOINCREMENT,
buyer_name TEXT,
amount_paid INTEGER,
coupon_id INTEGER,
upi_txn_id TEXT,
status TEXT DEFAULT 'pending',
created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
`);


// endpoint: list available coupons/packs
app.get('/api/coupons', (req, res) => {
const rows = db.prepare('SELECT id, code, face_value, sold FROM coupons WHERE sold = 0 LIMIT 50').all();
res.json(rows);
});


// create an order (buyer requests to buy a coupon)
app.post('/api/create-order', (req, res) => {
const { buyer_name, coupon_id, amount_expected } = req.body;
// create order with status 'pending'
const stmt = db.prepare('INSERT INTO orders (buyer_name, amount_paid, coupon_id, status) VALUES (?, ?, ?, ?)');
const info = stmt.run(buyer_name || 'guest', amount_expected || 0, coupon_id, 'pending');
res.json({ orderId: info.lastInsertRowid });
});


// mark order paid (this should be called after you verify a UPI payment or after payment gateway webhook)
app.post('/api/mark-paid', (req, res) => {
const { orderId, upi_txn_id } = req.body;
// mark paid and set status
db.prepare('UPDATE orders SET status = ?, upi_txn_id = ? WHERE id = ?').run('paid', upi_txn_id || '', orderId);
// mark coupon as sold and return coupon code
const order = db.prepare('SELECT coupon_id FROM orders WHERE id = ?').get(orderId);
if (!order) return res.status(404).json({ error: 'order not found' });
const coupon = db.prepare('SELECT code FROM coupons WHERE id = ?').get(order.coupon_id);
db.prepare('UPDATE coupons SET sold = 1 WHERE id = ?').run(order.coupon_id);
res.json({ success: true, coupon: coupon.code });
});


app.listen(process.env.PORT || 3000, () => console.log('Server started'));