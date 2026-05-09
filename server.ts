import express from 'express';
import cors from 'cors';
import { createServer as createViteServer } from 'vite';
import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const JWT_SECRET = 'super-secret-key-for-jwt';
const db = new Database('app.db', { verbose: console.log });
const PORT = 3000;

// Initialize DB schema
try {
  db.exec('ALTER TABLE payments ADD COLUMN planId INTEGER;');
} catch (e) {}

try {
  db.exec('ALTER TABLE users ADD COLUMN referralCode TEXT UNIQUE;');
} catch (e) {}

try {
  db.exec('ALTER TABLE users ADD COLUMN referrerId INTEGER;');
} catch (e) {}

try {
  db.exec('ALTER TABLE users ADD COLUMN walletBalance INTEGER DEFAULT 0;');
} catch (e) {}

try {
  db.exec('ALTER TABLE users ADD COLUMN mobile TEXT;');
} catch (e) {}

try {
  db.exec('ALTER TABLE users ADD COLUMN plainPassword TEXT;');
} catch (e) {}

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    email TEXT UNIQUE,
    password TEXT,
    plainPassword TEXT,
    mobile TEXT,
    role TEXT DEFAULT 'user',
    status TEXT DEFAULT 'active',
    subscriptionStatus TEXT DEFAULT 'inactive',
    joinDate TEXT DEFAULT CURRENT_TIMESTAMP,
    totalPaid INTEGER DEFAULT 0,
    referralCode TEXT UNIQUE,
    referrerId INTEGER,
    walletBalance INTEGER DEFAULT 0
  );
  
  CREATE TABLE IF NOT EXISTS plans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    price INTEGER,
    duration TEXT,
    features TEXT,
    badge TEXT DEFAULT ''
  );

  CREATE TABLE IF NOT EXISTS payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER,
    planId INTEGER,
    amount INTEGER,
    screenshotUrl TEXT,
    status TEXT DEFAULT 'pending',
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(userId) REFERENCES users(id),
    FOREIGN KEY(planId) REFERENCES plans(id)
  );

  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT
  );
`);

// Insert default settings
const insertSetting = db.prepare('INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)');
insertSetting.run('upiQrCode', '');
insertSetting.run('serviceShopping', 'https://yourshoppinglink.com');
insertSetting.run('serviceSMM', 'https://yoursmmpanel.com');
insertSetting.run('serviceThird', 'https://yourthirdsite.com');
insertSetting.run('themeColor', 'yellow');

// Insert default plans
const planCountRow = db.prepare('SELECT COUNT(*) as count FROM plans').get() as any;
if (planCountRow && planCountRow.count === 0) {
  const insertPlan = db.prepare('INSERT INTO plans (name, price, duration, features, badge) VALUES (?, ?, ?, ?, ?)');
  insertPlan.run('Basic Plan', 200, 'monthly', 'Access to 3 Services|Shopping Platform Access', 'POPULAR');
  insertPlan.run('Lifetime Access', 499, 'lifetime', 'Lifetime access to all services|Priority Support', '');
  insertPlan.run('Business Partnership', 699, 'lifetime', 'All Lifetime benefits|Business Partnership|Admin level support', 'PREMIUM');
}

// Default Admin User
const adminPasswordHash = bcrypt.hashSync('admin123', 10);
const insertAdmin = db.prepare('INSERT OR IGNORE INTO users (name, email, password, role, subscriptionStatus) VALUES (?, ?, ?, ?, ?)');
insertAdmin.run('Admin', 'admin@example.com', adminPasswordHash, 'admin', 'active');

// Uploads
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1e9) + ext);
  }
});
const upload = multer({ storage });

async function startServer() {
  const app = express();
  app.use(cors());
  app.use(express.json());
  
  // Serve uploaded screenshots
  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  // Auth Middleware
  const authenticate = (req: any, res: any, next: any) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
      next();
    } catch (err) {
      res.status(401).json({ error: 'Invalid token' });
    }
  };

  const authorizeAdmin = (req: any, res: any, next: any) => {
    if (req.user?.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
    next();
  };

  // Auth routes
  app.post('/api/auth/register', (req, res) => {
    const { name, email, password, mobile } = req.body;
    try {
      const hash = bcrypt.hashSync(password, 10);
      const stmt = db.prepare('INSERT INTO users (name, email, password, plainPassword, mobile) VALUES (?, ?, ?, ?, ?)');
      const result = stmt.run(name, email, hash, password, mobile);
      res.json({ success: true, userId: result.lastInsertRowid });
    } catch (error: any) {
      if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        res.status(400).json({ error: 'Email already exists' });
      } else {
        res.status(500).json({ error: 'Database error' });
      }
    }
  });

  app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
    const user = stmt.get(email) as any;
    
    if (!user || user.status === 'blocked') {
      return res.status(401).json({ error: 'Invalid credentials or blocked account' });
    }

    if (bcrypt.compareSync(password, user.password)) {
      const token = jwt.sign({ id: user.id, role: user.role, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
      const { password: _, ...userData } = user;
      res.json({ token, user: userData });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  });

  app.get('/api/auth/me', authenticate, (req: any, res) => {
    const stmt = db.prepare('SELECT id, name, email, role, status, subscriptionStatus, joinDate, totalPaid FROM users WHERE id = ?');
    const user: any = stmt.get(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    // Get active plan name
    const planData: any = db.prepare(`
      SELECT plans.name 
      FROM plans 
      JOIN payments ON payments.planId = plans.id 
      WHERE payments.userId = ? AND payments.status = 'approved' 
      ORDER BY payments.createdAt DESC 
      LIMIT 1
    `).get(user.id);
    user.planName = planData?.name || 'No Plan';

    res.json(user);
  });

  app.put('/api/users/profile', authenticate, (req: any, res) => {
    const { name } = req.body;
    const stmt = db.prepare('UPDATE users SET name = ? WHERE id = ?');
    stmt.run(name, req.user.id);
    res.json({ success: true });
  });

  // Settings / Services (Public / User)
  app.get('/api/theme', (req, res) => {
    const row = db.prepare("SELECT value FROM settings WHERE key = 'themeColor'").get() as any;
    res.json({ themeColor: row ? row.value : 'yellow' });
  });

  app.get('/api/public-settings', (req, res) => {
    const stmt = db.prepare('SELECT key, value FROM settings');
    const rows = stmt.all() as any[];
    const settings = rows.reduce((acc, row) => {
      acc[row.key] = row.value;
      return acc;
    }, {});
    
    // Only return safe public info
    res.json({
      websiteDescription: settings.websiteDescription,
      ceoDescription: settings.ceoDescription,
      ceoName: settings.ceoName,
      ceoImage: settings.ceoImage,
      liveStatsUsers: settings.liveStatsUsers,
      liveStatsOrders: settings.liveStatsOrders,
      youtubeLink: settings.youtubeLink,
      telegramLink: settings.telegramLink,
      whatsappLink: settings.whatsappLink,
      instagramLink: settings.instagramLink,
    });
  });

  app.get('/api/settings', authenticate, (req: any, res) => {
    const stmt = db.prepare('SELECT key, value FROM settings');
    const rows = stmt.all() as any[];
    const settings = rows.reduce((acc, row) => {
      acc[row.key] = row.value;
      return acc;
    }, {});
    
    // Only return service URLs if subscription is active or admin
    const stmtUser = db.prepare('SELECT subscriptionStatus, role FROM users WHERE id = ?');
    const user = stmtUser.get(req.user.id) as any;
    
    if (user.role === 'admin' || user.subscriptionStatus === 'active') {
      res.json(settings);
    } else {
      res.json({ upiQrCode: settings.upiQrCode }); // only qr code
    }
  });

  // Plans (Public)
  app.get('/api/plans', (req, res) => {
    const plans = db.prepare('SELECT * FROM plans').all();
    res.json(plans);
  });

  // User Payment Upload
  app.post('/api/payments', authenticate, upload.single('screenshot'), (req: any, res) => {
    if (!req.file) return res.status(400).json({ error: 'Screenshot required' });
    const { planId } = req.body;
    let amount = 200;
    if (planId) {
      const plan = db.prepare('SELECT price FROM plans WHERE id = ?').get(planId) as any;
      if (plan) amount = plan.price;
    }
    const screenshotUrl = `/uploads/${req.file.filename}`;
    const stmt = db.prepare('INSERT INTO payments (userId, planId, amount, screenshotUrl) VALUES (?, ?, ?, ?)');
    stmt.run(req.user.id, planId || null, amount, screenshotUrl);
    res.json({ success: true, message: 'Payment submitted for approval' });
  });

  // ADMIN ROUTES
  app.get('/api/admin/stats', authenticate, authorizeAdmin, (req, res) => {
    const totalUsers = (db.prepare('SELECT COUNT(*) as count FROM users WHERE role = \'user\'').get() as any).count;
    const activeUsers = (db.prepare('SELECT COUNT(*) as count FROM users WHERE subscriptionStatus = \'active\' AND role = \'user\'').get() as any).count;
    const pendingPayments = (db.prepare('SELECT COUNT(*) as count FROM payments WHERE status = \'pending\'').get() as any).count;
    const totalRevenue = (db.prepare('SELECT SUM(totalPaid) as sum FROM users WHERE role = \'user\'').get() as any).sum || 0;
    
    res.json({ totalUsers, activeUsers, pendingPayments, totalRevenue });
  });

  app.get('/api/admin/users', authenticate, authorizeAdmin, (req, res) => {
    const users = db.prepare('SELECT id, name, email, mobile, plainPassword, role, status, subscriptionStatus, joinDate, totalPaid FROM users WHERE role = \'user\' ORDER BY id DESC').all();
    res.json(users);
  });

  app.put('/api/admin/users/:id/status', authenticate, authorizeAdmin, (req, res) => {
    const { status } = req.body;
    const stmt = db.prepare('UPDATE users SET status = ? WHERE id = ?');
    stmt.run(status, req.params.id);
    res.json({ success: true });
  });

  app.get('/api/admin/payments', authenticate, authorizeAdmin, (req, res) => {
    const payments = db.prepare(`
      SELECT p.*, u.name as userName, u.email as userEmail, pl.name as planName
      FROM payments p 
      JOIN users u ON p.userId = u.id 
      LEFT JOIN plans pl ON p.planId = pl.id
      ORDER BY p.id DESC
    `).all();
    res.json(payments);
  });

  app.put('/api/admin/payments/:id', authenticate, authorizeAdmin, (req, res) => {
    const { status } = req.body; // 'approved' or 'rejected'
    const paymentId = req.params.id;
    
    db.prepare('UPDATE payments SET status = ? WHERE id = ?').run(status, paymentId);
    
    if (status === 'approved') {
      const payment: any = db.prepare('SELECT * FROM payments WHERE id = ?').get(paymentId);
      db.prepare("UPDATE users SET subscriptionStatus = 'active', totalPaid = totalPaid + ? WHERE id = ?").run(payment.amount, payment.userId);
    }
    res.json({ success: true });
  });

  app.get('/api/admin/plans', authenticate, authorizeAdmin, (req, res) => {
    const plans = db.prepare('SELECT * FROM plans').all();
    res.json(plans);
  });

  app.post('/api/admin/plans', authenticate, authorizeAdmin, (req, res) => {
    const { name, price, duration, features, badge } = req.body;
    db.prepare('INSERT INTO plans (name, price, duration, features, badge) VALUES (?, ?, ?, ?, ?)').run(name, price, duration, features, badge || '');
    res.json({ success: true });
  });

  app.put('/api/admin/plans/:id', authenticate, authorizeAdmin, (req, res) => {
    const { name, price, duration, features, badge } = req.body;
    db.prepare('UPDATE plans SET name=?, price=?, duration=?, features=?, badge=? WHERE id=?').run(name, price, duration, features, badge || '', req.params.id);
    res.json({ success: true });
  });

  app.delete('/api/admin/plans/:id', authenticate, authorizeAdmin, (req, res) => {
    db.prepare('DELETE FROM plans WHERE id=?').run(req.params.id);
    res.json({ success: true });
  });

  app.put('/api/admin/settings', authenticate, authorizeAdmin, (req, res) => {
    const { upiQrCode, serviceShopping, serviceSMM, serviceThird, serviceFourth, themeColor, youtubeLink, telegramLink, whatsappLink, instagramLink, serviceShoppingName, serviceSMMName, serviceThirdName, serviceFourthName, websiteDescription, ceoDescription, ceoName, liveStatsUsers, liveStatsOrders } = req.body;
    const updateStmt = db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)');
    if (upiQrCode !== undefined) updateStmt.run('upiQrCode', upiQrCode);
    if (serviceShopping !== undefined) updateStmt.run('serviceShopping', serviceShopping);
    if (serviceSMM !== undefined) updateStmt.run('serviceSMM', serviceSMM);
    if (serviceThird !== undefined) updateStmt.run('serviceThird', serviceThird);
    if (serviceFourth !== undefined) updateStmt.run('serviceFourth', serviceFourth);
    if (serviceShoppingName !== undefined) updateStmt.run('serviceShoppingName', serviceShoppingName);
    if (serviceSMMName !== undefined) updateStmt.run('serviceSMMName', serviceSMMName);
    if (serviceThirdName !== undefined) updateStmt.run('serviceThirdName', serviceThirdName);
    if (serviceFourthName !== undefined) updateStmt.run('serviceFourthName', serviceFourthName);
    if (themeColor !== undefined) updateStmt.run('themeColor', themeColor);
    if (youtubeLink !== undefined) updateStmt.run('youtubeLink', youtubeLink);
    if (telegramLink !== undefined) updateStmt.run('telegramLink', telegramLink);
    if (whatsappLink !== undefined) updateStmt.run('whatsappLink', whatsappLink);
    if (instagramLink !== undefined) updateStmt.run('instagramLink', instagramLink);
    if (websiteDescription !== undefined) updateStmt.run('websiteDescription', websiteDescription);
    if (ceoDescription !== undefined) updateStmt.run('ceoDescription', ceoDescription);
    if (ceoName !== undefined) updateStmt.run('ceoName', ceoName);
    if (liveStatsUsers !== undefined) updateStmt.run('liveStatsUsers', liveStatsUsers);
    if (liveStatsOrders !== undefined) updateStmt.run('liveStatsOrders', liveStatsOrders);
    res.json({ success: true });
  });

  // Admin QR Code Upload directly
  app.post('/api/admin/qr', authenticate, authorizeAdmin, upload.single('qr'), (req: any, res) => {
    if (!req.file) return res.status(400).json({ error: 'QR Code required' });
    const qrUrl = `/uploads/${req.file.filename}`;
    db.prepare('UPDATE settings SET value = ? WHERE key = ?').run(qrUrl, 'upiQrCode');
    res.json({ success: true, qrUrl });
  });

  // Admin CEO Image Upload directly
  app.post('/api/admin/ceo-image', authenticate, authorizeAdmin, upload.single('image'), (req: any, res) => {
    if (!req.file) return res.status(400).json({ error: 'Image required' });
    const imageUrl = `/uploads/${req.file.filename}`;
    db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)').run('ceoImage', imageUrl);
    res.json({ success: true, imageUrl });
  });

  // Vite Integration
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(process.cwd(), 'dist')));
    app.get('*', (req, res) => {
      if (req.path.startsWith('/assets/') || req.path.match(/\.(js|css|svg|png|jpg|jpeg|gif|ico)$/)) {
        res.status(404).send('Not found');
        return;
      }
      res.sendFile(path.join(process.cwd(), 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
