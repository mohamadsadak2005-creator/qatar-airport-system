/*
  Mock API server to run Gemini API tests without MongoDB or external Gemini
  Provides: /api/health, /api/auth/register, /api/auth/login, /api/ai/* endpoints
*/
import express from 'express';
import bodyParser from 'body-parser';

const app = express();
app.use(bodyParser.json());

// Simple auth mock
app.post('/api/auth/register', (req, res) => {
  const token = 'mock-token-' + Date.now();
  res.json({ token });
});
app.post('/api/auth/login', (req, res) => {
  res.json({ token: 'mock-token' });
});

// Health
app.get('/api/health', (req, res) => {
  res.json({ gemini: { enabled: true, status: 'ok' }, db: false });
});

// Auth middleware mimic
function requireAuth(req, res, next) {
  const auth = req.headers.authorization || '';
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  const token = auth.split(' ')[1];
  if (!token || token === 'invalid-token') return res.status(401).json({ message: 'Invalid token' });
  req.user = { id: 'mock-user', email: 'test@example.com' };
  next();
}

// AI endpoints
app.post('/api/ai/chat', requireAuth, (req, res) => {
  const { message } = req.body || {};
  if (typeof message !== 'string' || message.length === 0) {
    return res.status(400).json({ message: 'الرسالة مطلوبة' });
  }
  if (message.length > 4000) {
    return res.status(400).json({ message: 'الرسالة طويلة جداً' });
  }
  res.json({ response: `رد تجريبي على: ${message}` });
});

app.post('/api/ai/conversation', requireAuth, (req, res) => {
  const { messages } = req.body || {};
  if (!Array.isArray(messages) || messages.length === 0) return res.status(400).json({ message: 'messages required' });
  res.json({ response: 'رد تجريبي للمحادثة المتعددة' });
});

app.post('/api/ai/analyze', requireAuth, (req, res) => {
  res.json({ sentiment: 'neutral', topics: ['mock'] });
});

app.post('/api/ai/generate-image', requireAuth, (req, res) => {
  res.json({ imageUrl: 'http://localhost:4000/mock-image.png' });
});

const PORT = process.env.MOCK_PORT || 4000;
app.listen(PORT, () => {
  console.log(`Mock API server running on http://localhost:${PORT}`);
});
