require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const babyRoutes = require('./routes/baby');
const feedingRoutes = require('./routes/feeding');
const reminderRoutes = require('./routes/reminder');
const appointmentRoutes = require('./routes/appointment');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/baby', babyRoutes);
app.use('/api/feeding', feedingRoutes);
app.use('/api/reminder', reminderRoutes);
app.use('/api/appointment', appointmentRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Nili Baby API is running' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Nili Baby server running on port ${PORT}`);
});
