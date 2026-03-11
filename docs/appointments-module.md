# מודול תורים - Appointments Module

## סקירה כללית

מודול התורים מאפשר ניהול תורים לטיפת חלב, רופא ילדים, וטיפולים רפואיים אחרים.

## פיצ'רים

### 1. הוספת תור
- כותרת (חובה)
- תאריך ושעה (חובה)
- מיקום (אופציונלי)
- הערות (אופציונלי)

### 2. תורים מהירים
- כפתורי הוספה מהירה: "טיפת חלב", "רופא ילדים"

### 3. תצוגת תורים
- רשימה ממוינת לפי תאריך
- תצוגת זמן שנותר
- סימון מיוחד לתורי טיפת חלב

### 4. ניהול
- עריכת תור
- מחיקת תור

## API Endpoints

### POST /api/appointment
יצירת תור חדש.

```json
{
  "babyId": "uuid",
  "title": "טיפת חלב",
  "datetime": "2024-03-20T10:00:00Z",
  "location": "קופת חולים מאוחדת",
  "notes": "לקחת פנקס חיסונים"
}
```

### GET /api/appointment?babyId=uuid&upcoming=true
קבלת רשימת תורים (upcoming=true רק תורים עתידיים).

### GET /api/appointment/:id
קבלת פרטי תור.

### PUT /api/appointment/:id
עדכון תור.

### DELETE /api/appointment/:id
מחיקת תור.

## קומפוננטות React Native

### AppointmentItem
פריט תור עם כל הפרטים, תצוגת זמן שנותר, וכפתור מחיקה.

## מודל נתונים

```prisma
model Appointment {
  id        String   @id @default(uuid())
  babyId    String
  title     String
  datetime  DateTime
  location  String?
  notes     String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

## סוגי תורים נפוצים

1. **טיפת חלב** - ביקורי שגרה, חיסונים
2. **רופא ילדים** - בדיקות, מחלות
3. **אולטרסאונד ירכיים** - בדיקה בגיל חודשיים
4. **בדיקת שמיעה** - סקר שמיעה
5. **רופא עיניים** - בדיקת ראייה
