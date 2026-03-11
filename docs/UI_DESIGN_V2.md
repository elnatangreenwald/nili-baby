# Nili Baby - עיצוב UI/UX גרסה 2.0

## סקירה כללית

עדכון מקיף של העיצוב וחוויית המשתמש באפליקציית Nili Baby, כולל:
- הוספת פונט Heebo מ-Google Fonts
- מערכת צבעים סמנטית חדשה
- קומפוננטים משופרים עם אנימציות
- תמיכה מלאה ב-RTL

## פונטים

### Heebo Font Family
```typescript
fonts = {
  regular: 'Heebo_400Regular',
  medium: 'Heebo_500Medium',
  semiBold: 'Heebo_600SemiBold',
  bold: 'Heebo_700Bold',
}
```

### טיפוגרפיה
- **h1**: 28px, Bold - כותרות ראשיות
- **h2**: 24px, SemiBold - כותרות משניות
- **h3**: 20px, SemiBold - כותרות סעיפים
- **body**: 16px, Regular - טקסט רגיל
- **bodyMedium**: 16px, Medium - טקסט מודגש
- **bodySmall**: 14px, Regular - טקסט קטן
- **caption**: 12px, Regular - תוויות
- **timer**: 48px, Bold - טיימר האכלות
- **button**: 16px, SemiBold - כפתורים

## צבעים

### צבעים ראשיים
```typescript
primary: '#E91E8C'      // ורוד ראשי
primaryLight: '#F8BBD9'  // ורוד בהיר
primaryDark: '#AD1457'   // ורוד כהה
```

### צבעים סמנטיים - האכלות
```typescript
feedingBreastfeeding: '#FFB74D'  // כתום - הנקה
feedingFormula: '#4FC3F7'        // תכלת - תמ"ל
```

### צבעים סמנטיים - תורים
```typescript
appointmentMilkDrop: '#FF69B4'   // ורוד - טיפת חלב
appointmentVaccine: '#FF7043'    // כתום - חיסון
appointmentDoctor: '#4FC3F7'     // תכלת - רופא
appointmentDefault: '#81C784'    // ירוק - ברירת מחדל
```

### צבעים למצב דחוף
```typescript
urgentBackground: '#FFF0F5'
urgentText: '#E91E63'
```

## גדלים

### מרווחים (Spacing)
```typescript
xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48
```

### עיגול פינות (Border Radius)
```typescript
sm: 8, md: 12, lg: 16, xl: 24, full: 9999
```

### גדלי אייקונים
```typescript
iconSizes: { xs: 16, sm: 20, md: 24, lg: 32, xl: 48 }
iconContainerSizes: { sm: 40, md: 52, lg: 56 }
```

## קומפוננטים

### Button
- אנימציית scale בלחיצה (0.97)
- צל ורוד לכפתור primary
- תמיכה באייקון
- גדלים: small, medium, large

### Input
- אנימציית border color בפוקוס
- תמיכה באייקון
- כפתור הצגת סיסמה
- תמיכה ב-multiline
- hint text

### Card
- variants: default, elevated, outlined
- padding options: none, sm, md, lg

### FeedingHistoryItem
- אייקון לפי סוג האכלה
- badge צבעוני
- אנימציית scale בלחיצה

### ReminderItem
- אייקון דינמי לפי שם התזכורת
- Switch לפעיל/לא פעיל
- מצב inactive מעומעם

### AppointmentItem
- קו צבעוני בצד ימין
- badge "קרוב" לתורים קרובים
- זמן שנותר עד התור

### NextFeedingTimer
- אנימציית pulse במצב דחוף
- badge "בקרוב!"
- התראה ויזואלית

## מסכים

### SplashScreen
- משך: 2.5 שניות
- אפשרות לדילוג (tap)
- אנימציות: fade, scale, slide, rotate

### LoginScreen
- tabs: התחברות/הרשמה
- עיגולים דקורטיביים
- validation בזמן אמת

### HomeScreen
- header עם ברכה ואווטר
- סטטיסטיקות יומיות
- טיימר האכלה הבאה
- כפתורי פעולות מהירות
- האכלות אחרונות

### FeedingHistoryScreen
- סטטיסטיקות בראש
- פילטר לפי סוג
- אנימציית כניסה לפריטים

### RemindersScreen
- הוספה מהירה עם אייקונים
- FAB להוספה
- מודל עם KeyboardAvoidingView

### AppointmentsScreen
- הוספה מהירה עם צבעים
- FAB להוספה
- מודל מפורט

### SettingsScreen
- סקציות מאורגנות
- פרטי משתמש
- שיתוף גישה
- כפתור התנתקות מעוצב

### AddBabyScreen
- אנימציית bounce עדינה
- עיגולים דקורטיביים
- רשימת תכונות

## אנימציות

### Spring Animation
```typescript
Animated.spring(value, {
  toValue: 1,
  friction: 5,
  tension: 40,
  useNativeDriver: true,
})
```

### Timing Animation
```typescript
Animated.timing(value, {
  toValue: 1,
  duration: 300,
  useNativeDriver: true,
})
```

### Loop Animation (pulse)
```typescript
Animated.loop(
  Animated.sequence([
    Animated.timing(value, { toValue: 1.03, duration: 600 }),
    Animated.timing(value, { toValue: 1, duration: 600 }),
  ])
)
```

## RTL Support

כל הקומפוננטים תומכים ב-RTL:
- `flexDirection: 'row-reverse'`
- `textAlign: 'right'`
- `borderRightWidth` במקום `borderLeftWidth`
- אייקונים בצד ימין

## שיפורים עתידיים

1. Date/Time Picker מובנה
2. Haptic Feedback
3. Dark Mode
4. אנימציות Lottie
5. Pull to Refresh משופר
