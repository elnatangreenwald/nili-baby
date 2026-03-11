# מודול האכלות - Feeding Module

## סקירה כללית

מודול האכלות הוא הפיצ'ר המרכזי באפליקציית Nili Baby. הוא מאפשר מעקב אחר האכלות התינוק, כולל סוג ההאכלה (הנקה/תמ"ל), כמות, וזמנים.

## פיצ'רים

### 1. סימון האכלה מהיר
- כפתור "סמן האכלה" בולט במסך הבית
- בחירת סוג: הנקה או תמ"ל
- סליידר לכמות (רק עבור תמ"ל)

### 2. טיימר להאכלה הבאה
- חישוב אוטומטי של זמן ההאכלה הבאה
- תזכורת צליל 10 דקות לפני
- תצוגה ויזואלית של הזמן שנותר

### 3. היסטוריית האכלות
- רשימה של כל ההאכלות
- סטטיסטיקות: ממוצע, סה"כ, התפלגות סוגים
- אפשרות למחיקה

### 4. הגדרות
- מרווח בין האכלות (30-480 דקות)
- כמות יעד (10-500 מ"ל)

## API Endpoints

### POST /api/feeding
יצירת רשומת האכלה חדשה.

```json
{
  "babyId": "uuid",
  "type": "BREASTFEEDING" | "FORMULA",
  "amountMl": 120,
  "notes": "optional",
  "time": "2024-03-15T10:00:00Z"
}
```

### GET /api/feeding?babyId=uuid
קבלת רשימת האכלות.

### GET /api/feeding/last?babyId=uuid
קבלת ההאכלה האחרונה וזמן ההאכלה הבאה.

### GET /api/feeding/stats?babyId=uuid&days=7
קבלת סטטיסטיקות.

### DELETE /api/feeding/:id
מחיקת האכלה.

## קומפוננטות React Native

### FeedingSlider
סליידר לבחירת כמות ההאכלה עם תצוגת אחוז מהיעד.

### FeedingTypeSelector
בחירה בין הנקה לתמ"ל עם אייקונים.

### NextFeedingTimer
טיימר שמציג את הזמן להאכלה הבאה ומפעיל צליל.

### FeedingHistoryItem
פריט ברשימת היסטוריית האכלות.

## מודל נתונים

```prisma
model Feeding {
  id          String      @id @default(uuid())
  babyId      String
  recordedBy  String
  time        DateTime    @default(now())
  amountMl    Int?
  type        FeedingType
  notes       String?
  createdAt   DateTime    @default(now())
}

enum FeedingType {
  BREASTFEEDING
  FORMULA
}
```
