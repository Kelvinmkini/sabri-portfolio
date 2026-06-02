const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const cors = require('cors');
const { body, validationResult } = require('express-validator');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'sabri fujo';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'sabri2026';
const messages = [];
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map((origin) => origin.trim()).filter(Boolean)
  : ['http://localhost:3000', 'http://localhost:5173'];

app.use(helmet());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json({ limit: '10kb' }));
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }
    callback(new Error('Not allowed by CORS'));
  }
}));

function requireAdmin(req, res, next) {
  const username = req.get('x-admin-username');
  const password = req.get('x-admin-password');

  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    next();
    return;
  }

  res.status(401).json({ success: false, message: 'Invalid admin username or password.' });
}

app.get('/', (req, res) => {
  res.json({
    success: true,
    service: 'sabri-portfolio-backend',
    endpoints: ['/health', '/api/contact', '/api/messages'],
    timestamp: new Date().toISOString()
  });
});

app.get('/health', (req, res) => {
  res.json({ success: true, service: 'sabri-portfolio-backend', timestamp: new Date().toISOString() });
});

app.post('/api/admin/login', requireAdmin, (req, res) => {
  res.json({ success: true, message: 'Login successful.' });
});

app.get('/api/messages', requireAdmin, (req, res) => {
  res.json({ success: true, count: messages.length, messages });
});

app.delete('/api/messages/:id', requireAdmin, (req, res) => {
  const index = messages.findIndex((item) => item.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Message not found.' });
  }

  const [deleted] = messages.splice(index, 1);
  res.json({ success: true, message: 'Message deleted.', data: deleted });
});

app.post(
  '/api/contact',
  body('name').trim().isLength({ min: 2 }).withMessage('Name is required.'),
  body('email').trim().isEmail().withMessage('Valid email is required.').normalizeEmail(),
  body('message').trim().isLength({ min: 3 }).withMessage('Message is required.'),
  body('subject').optional({ checkFalsy: true }).trim().isLength({ max: 120 }),
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const messageRecord = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      name: req.body.name,
      email: req.body.email,
      subject: req.body.subject || 'Portfolio contact',
      message: req.body.message,
      createdAt: new Date().toISOString()
    };

    messages.unshift(messageRecord);
    console.log('New portfolio message:', messageRecord);

    return res.status(201).json({
      success: true,
      message: 'Message received. Sabri will respond soon.',
      data: messageRecord
    });
  }
);

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found.' });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ success: false, message: err.message || 'Internal server error.' });
});

app.listen(PORT, () => {
  console.log(`Sabri portfolio backend running on port ${PORT}`);
});
