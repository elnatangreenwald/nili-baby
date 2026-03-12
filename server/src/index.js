require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/auth');
const babyRoutes = require('./routes/baby');
const feedingRoutes = require('./routes/feeding');
const reminderRoutes = require('./routes/reminder');
const appointmentRoutes = require('./routes/appointment');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/baby', babyRoutes);
app.use('/api/feeding', feedingRoutes);
app.use('/api/reminder', reminderRoutes);
app.use('/api/appointment', appointmentRoutes);

app.use(express.static(path.join(__dirname, '../public'), {
  dotfiles: 'allow',
  index: false
}));

app.use('/_expo', express.static(path.join(__dirname, '../public/_expo')));
app.use('/assets', express.static(path.join(__dirname, '../public/assets')));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Nili Baby API is running' });
});

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Nili Baby server running on port ${PORT}`);
});
