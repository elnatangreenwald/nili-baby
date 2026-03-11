# מודול אותנטיקציה - Authentication Module

## סקירה כללית

מודול האותנטיקציה מנהל את הרשמת המשתמשים, התחברות, ושיתוף תינוק בין הורים.

## פיצ'רים

### 1. הרשמה
- שם
- אימייל
- סיסמה (מינימום 6 תווים)

### 2. התחברות
- אימייל
- סיסמה
- טוקן JWT תקף ל-30 יום

### 3. שיתוף תינוק
- שיתוף עם בן/בת זוג לפי אימייל
- שני ההורים רואים את אותו מידע
- סנכרון בזמן אמת

## API Endpoints

### POST /api/auth/register
הרשמת משתמש חדש.

```json
{
  "email": "user@example.com",
  "password": "123456",
  "name": "ישראל ישראלי"
}
```

Response:
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "ישראל ישראלי"
  },
  "token": "jwt-token"
}
```

### POST /api/auth/login
התחברות.

```json
{
  "email": "user@example.com",
  "password": "123456"
}
```

### GET /api/auth/me
קבלת פרטי המשתמש המחובר.

### POST /api/baby/:id/share
שיתוף תינוק עם משתמש אחר.

```json
{
  "email": "partner@example.com"
}
```

## אבטחה

### JWT Token
- כל הבקשות (חוץ מ-login/register) דורשות טוקן
- הטוקן נשלח ב-header: `Authorization: Bearer <token>`
- תוקף: 30 יום

### הצפנת סיסמאות
- סיסמאות מוצפנות עם bcrypt
- 10 סיבובי הצפנה

## קומפוננטות React Native

### LoginScreen
מסך התחברות/הרשמה משולב עם מעבר בין המצבים.

## מודל נתונים

```prisma
model User {
  id           String   @id @default(uuid())
  email        String   @unique
  passwordHash String
  name         String
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}

model BabyUser {
  id       String   @id @default(uuid())
  userId   String
  babyId   String
  role     String   @default("parent")
  joinedAt DateTime @default(now())
}
```

## זרימת שימוש

1. משתמש נרשם לאפליקציה
2. משתמש מוסיף תינוק
3. משתמש משתף את התינוק עם בן/בת הזוג
4. שני ההורים יכולים לראות ולעדכן את אותו מידע
