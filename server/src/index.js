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

app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html dir="rtl" lang="he">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Nili Baby API</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background: linear-gradient(135deg, #FFB6C1 0%, #FFC0CB 50%, #FFE4E1 100%);
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .container {
          background: white;
          padding: 3rem;
          border-radius: 20px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.1);
          text-align: center;
          max-width: 500px;
        }
        h1 { color: #FF69B4; font-size: 2.5rem; margin-bottom: 1rem; }
        .emoji { font-size: 4rem; margin-bottom: 1rem; }
        p { color: #666; font-size: 1.1rem; line-height: 1.6; }
        .status { 
          background: #E8F5E9; 
          color: #2E7D32; 
          padding: 0.5rem 1rem; 
          border-radius: 20px; 
          display: inline-block;
          margin-top: 1.5rem;
          font-weight: bold;
        }
        .endpoints {
          margin-top: 2rem;
          text-align: right;
          background: #f5f5f5;
          padding: 1rem;
          border-radius: 10px;
        }
        .endpoints h3 { color: #FF69B4; margin-bottom: 0.5rem; }
        .endpoints code { 
          display: block; 
          padding: 0.3rem 0; 
          color: #333;
          font-size: 0.9rem;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="emoji">👶🍼</div>
        <h1>Nili Baby</h1>
        <p>מערכת ניהול תינוקות</p>
        <div class="status">✓ השרת פעיל</div>
        <div class="endpoints">
          <h3>API Endpoints:</h3>
          <code>POST /api/auth/register - הרשמה</code>
          <code>POST /api/auth/login - התחברות</code>
          <code>GET /api/baby - תינוקות</code>
          <code>GET /api/feeding - האכלות</code>
          <code>GET /api/reminder - תזכורות</code>
          <code>GET /api/appointment - תורים</code>
        </div>
      </div>
    </body>
    </html>
  `);
});

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
