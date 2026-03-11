# Nili Baby 👶

אפליקציית מובייל לניהול גידול תינוק - מעקב אחר האכלות, תזכורות, ותורים.

## תכונות עיקריות

### 🍼 ניהול האכלות
- סימון מהיר של האכלה
- בחירה בין הנקה לתמ"ל
- סליידר לכמות שנאכלה
- טיימר להאכלה הבאה עם תזכורת צליל
- היסטוריית האכלות וסטטיסטיקות

### ⏰ תזכורות קבועות
- מדידת חום
- ויטמינים
- תזכורות מותאמות אישית

### 📅 ניהול תורים
- טיפת חלב
- רופא ילדים
- טיפולים רפואיים

### 👨‍👩‍👧 שיתוף בין הורים
- שני הורים יכולים לנהל את אותו תינוק
- סנכרון בזמן אמת

## טכנולוגיות

### Mobile (React Native + Expo)
- React Navigation
- Expo AV (צלילים)
- AsyncStorage

### Server (Node.js)
- Express
- Prisma ORM
- PostgreSQL
- JWT Authentication

## התקנה

### דרישות מקדימות
- Node.js 18+
- PostgreSQL
- Expo CLI

### Server

```bash
cd server
npm install
cp .env.example .env
# עדכן את DATABASE_URL ב-.env
npx prisma migrate dev
npm run dev
```

### Mobile

```bash
cd mobile
npm install
npx expo start
```

## מבנה הפרויקט

```
nili-baby/
├── mobile/                 # React Native App
│   ├── src/
│   │   ├── components/     # UI Components
│   │   ├── screens/        # App Screens
│   │   ├── services/       # API & Sound
│   │   ├── hooks/          # Custom Hooks
│   │   └── utils/          # Helpers & Theme
│   └── assets/             # Images & Sounds
├── server/                 # Node.js Backend
│   ├── src/
│   │   ├── routes/         # API Routes
│   │   ├── middleware/     # Auth
│   │   └── services/       # Prisma
│   └── prisma/             # Database Schema
└── docs/                   # Documentation
```

## API Endpoints

| Method | Endpoint | תיאור |
|--------|----------|-------|
| POST | /api/auth/register | הרשמה |
| POST | /api/auth/login | התחברות |
| GET | /api/auth/me | פרטי משתמש |
| POST | /api/baby | הוספת תינוק |
| GET | /api/baby | רשימת תינוקות |
| POST | /api/baby/:id/share | שיתוף תינוק |
| POST | /api/feeding | רישום האכלה |
| GET | /api/feeding | היסטוריית האכלות |
| GET | /api/feeding/last | האכלה אחרונה |
| GET | /api/feeding/stats | סטטיסטיקות |
| POST | /api/reminder | הוספת תזכורת |
| GET | /api/reminder | רשימת תזכורות |
| POST | /api/appointment | הוספת תור |
| GET | /api/appointment | רשימת תורים |

## עיצוב

האפליקציה מעוצבת בסגנון ורוד קלאסי עם תמיכה מלאה ב-RTL (עברית).

### פלטת צבעים
- Primary: #E91E8C (ורוד)
- Secondary: #FFC0CB (ורוד בהיר)
- Background: #FFF5F7

## רישיון

MIT
