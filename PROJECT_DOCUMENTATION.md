# 📚 شرح المشروع - مشروع إدارة مطار قطر

## 🎯 نبذة عن المشروع

مشروع **نظام إدارة مطار قطر** هو تطبيق ويب متكامل لإدارة أسطول الطائرات، مصمم بأسلوب احترافي مستوحى من **مطار حمد الدولي** في الدوحة، قطر.

### الفكرة الأساسية
تحويل مخطط UML إلى نظام قاعدة بيانات فعلي مع واجهة مستخدم تفاعلية لإدارة:
- الطائرات
- الطيارين
- الركاب
- مكونات الطائرات

---

## 🛠️ التقنيات المستخدمة

### Backend (الخلفية)
| التقنية | الإصدار | الاستخدام |
|---------|---------|-----------|
| **PHP** | 8.5.5 | منطق التطبيق والمعالجة |
| **PostgreSQL** | 12+ | قاعدة البيانات العلائقية |
| **PDO** | - | الاتصال الآمن بالقاعدة |

### Frontend (الواجهة الأمامية)
| التقنية | الاستخدام |
|---------|-----------|
| **HTML5** | هيكل الصفحات |
| **CSS3** | التصميم والأنيميشن |
| **JavaScript (ES6+)** | التفاعل والديناميكية |
| **Font Awesome 6** | الأيقونات |

### الميزات الخاصة
- ✨ CSS Variables للثيمات
- ✨ LocalStorage للتخزين المحلي
- ✨ SVG Graphics للشعار
- ✨ CSS Animations للحركات

---

## 📁 هيكل المشروع

```
TP5/
├── 🏠 index.php              # لوحة التحكم الرئيسية
├── ✈️ airplanes.php          # إدارة الطائرات
├── 👨‍✈️ pilots.php            # إدارة الطيارين
├── 👥 passengers.php         # إدارة الركاب
├── 🔧 components.php        # مكونات الطائرات
├──
├── 📂 config/
│   └── 🔌 database.php      # إعدادات الاتصال
├──
├── 📂 includes/
│   ├── 🧭 header.php        # قالب الهيدر
│   └── 🦶 footer.php        # قالب الفوتر
├──
├── 📂 assets/
│   ├── 🎨 css/style.css     # ملف التنسيقات (2000+ سطر)
│   ├── ⚡ js/app.js         # ملف الجافاسكريبت
│   └── 🖼️ images/
│       ├── 🎭 logo.svg      # شعار الموقع
│       └── 🖼️ backgrounds/   # خلفيات المطار
│
├── 🗄️ database_schema.sql   # مخطط قاعدة البيانات
├── 📊 uml_diagram.md        # مخطط UML
├── 📖 README.md             # هذا الملف
└── 📚 PROJECT_DOCUMENTATION.md  # التوثيق الكامل
```

---

## 🎨 الثيم القطري

### الألوان الرئيسية
```css
/* البورغندي - لون قطر الرسمي */
--primary-color: #722f37;
--primary-dark: #5c1a22;
--primary-light: #8b3a44;

/* الذهبي - لون التميز */
--gold-color: #d4a84b;
--gold-light: #f0d78c;
--gold-dark: #b8941f;
```

### العناصر المرئية
- 🗼 **برج المراقبة** في الشعار
- ✈️ **طائرة ذهبية** في الوسط
- 🌙 **وضع ليلي/نهاري** للتبديل
- 🖼️ **خلفيات المطار** (3 صور)

---

## ⚙️ شرح العمل

### 1️⃣ نظام الثيمات (الوضع الليلي/النهاري)

**كيف يعمل:**
```javascript
// حفظ التفضيل في LocalStorage
localStorage.setItem('theme', 'dark');

// تطبيق الثيم على body
document.body.setAttribute('data-theme', 'dark');
```

**CSS Variables:**
```css
:root {
    /* الوضع الافتراضي (قطري) */
    --bg-gradient-1: #2d0a0f;
    --bg-gradient-2: #722f37;
}

[data-theme="light"] {
    /* الوضع الثاني (أسود وذهبي) */
    --bg-gradient-1: #0d0d0d;
    --bg-gradient-2: #1a1a1a;
}
```

### 2️⃣ عرض الخلفيات (Background Slideshow)

**المكونات:**
- 3 صور من مطار قطر
- تأثير Ken Burns (تكبير تدريجي)
- تبديل تلقائي كل 6 ثوانٍ
- نقاط تنقل يدوية
- زر إيقاف/تشغيل

**JavaScript:**
```javascript
function initBackgroundSlideshow() {
    const slides = document.querySelectorAll('.slide');
    let currentSlide = 0;
    
    // تبديل الصور
    setInterval(() => {
        slides[currentSlide].classList.remove('active');
        currentSlide = (currentSlide + 1) % slides.length;
        slides[currentSlide].classList.add('active');
    }, 6000);
}
```

### 3️⃣ الشعار الاحترافي (SVG Logo)

**المكونات:**
- 🔴 خلفية دائرية عنابية
- 🗼 برج المراقبة الذهبي
- ✈️ طائرة في الوسط
- ⭐ نجوم متألقة
- 🦪 لؤلؤ (تراث قطر)

**التأثيرات:**
- توهج ذهبي
- دوران الحلقة الخارجية
- نبض مستمر

### 4️⃣ نظام الإشعارات (Toast Notifications)

**أنواع الإشعارات:**
```javascript
Toast.success('نجاح! ✅');
Toast.error('خطأ! ❌');
Toast.warning('تحذير! ⚠️');
Toast.info('معلومة ℹ️');
```

**المميزات:**
- تصميم احترافي
- أيقونات Font Awesome
- زر إغلاق
- انزلاق تلقائي
- دعم HTML

### 5️⃣ الساعة الرقمية (Digital Clock)

```javascript
function initDigitalClock() {
    const options = {
        timeZone: 'Asia/Qatar',
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    };
    
    setInterval(() => {
        const time = new Date().toLocaleTimeString('en-US', options);
        document.getElementById('clock').textContent = time;
    }, 1000);
}
```

---

## 🗄️ قاعدة البيانات

### العلاقات (UML Relationships)

| العلاقة | النوع | التطبيق |
|---------|-------|---------|
| **Inheritance** | Vehicle → Airplane | مفتاح أجنبي |
| **Composition** | Airplane → Components | حذف متتالي |
| **Aggregation** | Airplane ↔ Passengers | جدول وسيط |
| **Association** | Pilot ↔ Airplane | جدول operations |

### الجداول الرئيسية

```sql
-- الجدول الرئيسي
CREATE TABLE airplanes (
    id SERIAL PRIMARY KEY,
    vehicle_id INTEGER REFERENCES vehicles(id),
    model VARCHAR(100),
    capacity INTEGER
);

-- المكونات (Composition)
CREATE TABLE wings (
    id SERIAL PRIMARY KEY,
    airplane_id INTEGER REFERENCES airplanes(id) ON DELETE CASCADE,
    material VARCHAR(50),
    span DECIMAL
);
```

---

## 🚀 طريقة التشغيل

### الخطوة 1: إعداد قاعدة البيانات
```bash
# إنشاء قاعدة البيانات
psql -U postgres -c "CREATE DATABASE airplane_management;"

# تشغيل المخطط
psql -U postgres -d airplane_management -f database_schema.sql
```

### الخطوة 2: تعديل الإعدادات
ملف: `config/database.php`
```php
define('DB_PASSWORD', 'your_password_here');
```

### الخطوة 3: تشغيل الخادم
```bash
cd TP5
php -S localhost:8000
```

### الخطوة 4: فتح المتصفح
```
http://localhost:8000
```

---

## 📸 لقطات الشاشة

### 🏠 لوحة التحكم (Dashboard)
- إحصائيات حية
- بطاقات ملونة
- شعار متحرك

### ✈️ صفحة الطائرات
- جدول بيانات
- نموذج إضافة
- نافذة Modal

### 👨‍✈️ صفحة الطيارين
- معلومات الطيارين
- العمليات المخصصة

### 👥 صفحة الركاب
- حجز الرحلات
- تاريخ السفر

---

## 🔐 الأمان

- ✅ **SQL Injection Protection**: Prepared Statements
- ✅ **XSS Protection**: htmlspecialchars()
- ✅ **Password Hashing**: password_hash()
- ⚠️ **CSRF Tokens**: يمكن إضافتها للإنتاج

---

## 🎯 الميزات المستقبلية

- [ ] نظام تسجيل دخول
- [ ] جدولة الرحلات
- [ ] تتبع الصيانة
- [ ] تقارير وإحصائيات
- [ ] API للجوال

---

## 📝 معلومات المطور

**المشروع:** عمل تطبيقي - نمذجة الكائنات وتصميم قواعد البيانات  
**الموضوع:** نظام إدارة مطار قطر  
**الثيم:** Hamad International Airport Design  
**التقنيات:** PHP + PostgreSQL + JavaScript

---

## 📧 التواصل

للاستفسارات أو المقترحات، يرجى التواصل عبر:  
mohamadsadak2005@gmail.com

---

**تم إنشاء هذا المشروع بواسطة مساعد AI (Cascade) مع المطور** 🤖👨‍💻

**تاريخ الإنشاء:** أبريل 2026  
**الإصدار:** 1.0.0
