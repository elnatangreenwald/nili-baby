# מודול תזכורות - Reminders Module

## סקירה כללית

מודול התזכורות מאפשר הגדרת תזכורות יומיות קבועות לפעולות שגרתיות כמו מדידת חום, מתן ויטמינים ועוד.

## פיצ'רים

### 1. תזכורות מוגדרות מראש
- מדידת חום
- ויטמין D
- ויטמין ברזל

### 2. תזכורות מותאמות אישית
- הוספת תזכורת עם שם ושעה
- הפעלה/כיבוי של תזכורות
- מחיקת תזכורות

### 3. התראות צליל
- צליל התראה בזמן התזכורת
- עובד גם ברקע

## API Endpoints

### POST /api/reminder
יצירת תזכורת חדשה.

```json
{
  "babyId": "uuid",
  "title": "ויטמין D",
  "dailyTime": "09:00"
}
```

### GET /api/reminder?babyId=uuid
קבלת רשימת תזכורות.

### PUT /api/reminder/:id
עדכון תזכורת (שם, שעה, פעיל/לא פעיל).

### DELETE /api/reminder/:id
מחיקת תזכורת.

## קומפוננטות React Native

### ReminderItem
פריט תזכורת עם מתג הפעלה/כיבוי וכפתור מחיקה.

## מודל נתונים

```prisma
model Reminder {
  id        String   @id @default(uuid())
  babyId    String
  title     String
  dailyTime String
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

## שימוש

1. במסך התזכורות, לחץ על "+ הוסף"
2. הזן שם לתזכורת ושעה בפורמט HH:MM
3. התזכורת תופעל אוטומטית
4. ניתן לכבות/להדליק עם המתג
5. ניתן למחוק עם כפתור פח האשפה
