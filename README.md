# Project GL - Medical AI Assistant

تطبيق ويب متكامل مع مساعد طبي ذكي يعتمد على Google Gemini AI للتحليل الطبي والاستشارات الصحية.

## 🚀 المميزات

- 🤖 **مساعد AI طبي** متكامل مع Google Gemini AI
- 🏥 **تحليل العلامات الحيوية** والبيانات الطبية
- 💬 **محادثات ذكية** مع دعم اللغة العربية
- 📊 **واجهة مستخدم حديثة** باستخدام React و TailwindCSS
- 🔐 **نظام مصادقة آمن** مع JWT
- 🗄️ **قاعدة بيانات PostgreSQL** قوية

## 🛠️ التقنيات المستخدمة

### Backend
- **Node.js** + **Express.js**
- **TypeORM** مع PostgreSQL
- **Google Generative AI** (Gemini 2.5 Flash)
- **JWT** للمصادقة
- **CORS** للتواصل مع Frontend

### Frontend
- **React 18** مع Hooks
- **Vite** كـ Development Server
- **TailwindCSS** للتصميم
- **Axios** للطلبات HTTP

## 📋 المتطلبات

- Node.js 18+
- PostgreSQL 18
- Git

## 🚀 التثبيت والتشغيل

### 1. تثبيت PostgreSQL
```bash
# تأكد من تشغيل خدمة PostgreSQL
# الاسم: postgresql-x64-18
# المنفذ: 1234
```

### 2. تثبيت الاعتماديات
```bash
# Backend
cd Backend
npm install

# Frontend
cd ../frontend
npm install
```

### 3. إعداد المتغيرات البيئية

#### Backend/.env
```env
NODE_ENV=development
PORT=4000
APP_NAME="Project CLI"

# Gemini API
GEMINI_API_KEY=AIzaSyCAbD7uTrxLmBr4crkHlZz7i88d6-HcLiQ

# Database
DB_HOST=localhost
DB_PORT=1234
DB_USER=postgres
DB_PASSWORD=2005
DB_NAME=projctGL

# Security
JWT_SECRET=super_secret_key_12345
```

#### Frontend/.env
```env
VITE_API_URL=http://localhost:4000/api
```

### 4. تشغيل التطبيق

#### تشغيل PostgreSQL
```bash
# كـ Administrator
Start-Service postgresql-x64-18
```

#### تشغيل Backend
```bash
cd Backend
npm run dev
# يعمل على http://localhost:4000
```

#### تشغيل Frontend
```bash
cd frontend
npm run dev
# يعمل على http://localhost:5000
```

## 🧪 الاختبار

### اختبار Gemini API
```bash
cd Backend
node test-gemini-simple.js
```

### اختبار API Endpoints
```bash
# اختبار AI Chat
curl -X POST http://localhost:4000/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"مرحباً"}'
```

## 📁 هيكل المشروع

```
Projct GL/
├── Backend/
│   ├── config/
│   │   ├── database.js
│   │   └── gemini.js
│   ├── controllers/
│   │   └── aiController.js
│   ├── routes/
│   │   ├── ai.js
│   │   └── ...
│   ├── services/
│   │   └── geminiService.js
│   ├── middleware/
│   │   └── auth.js
│   ├── .env
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── AIAssistant.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   └── ...
│   ├── .env
│   └── vite.config.js
└── README.md
```

## 🔧 API Endpoints

### AI Assistant
- `POST /api/ai/chat` - محادثة مع AI
- `POST /api/ai/analyze` - تحليل نص طبي
- `POST /api/ai/conversation` - محادثة متقدمة
- `POST /api/ai/generate-image` - توليد صور (قريباً)

### Authentication
- `POST /api/auth/login` - تسجيل الدخول
- `POST /api/auth/register` - إنشاء حساب

### Health
- `GET /api/status` - حالة الخادم

## 🤖 Gemini AI Integration

- **Model**: `gemini-2.5-flash`
- **Language Support**: العربية والإنجليزية
- **Features**: تحليل طبي، استشارات، محادثات ذكية

## 📝 ملاحظات هامة

- تأكد من تشغيل PostgreSQL قبل تشغيل Backend
- Backend يعمل على port 4000
- Frontend يعمل على port 5000
- تستطيع تعديل المنافذ في ملفات .env

## 🚀 النشر

يمكن نشر المشروع على:
- **Vercel** للـ Frontend
- **Railway** أو **Heroku** للـ Backend
- **Supabase** أو **Railway** لقاعدة البيانات

## 📄 الترخيص

MIT License

## 👥 المساهمون

- مطور رئيسي

---

**ملاحظة**: هذا المشروع للتجربة والتعليم فقط. لا يستخدم كاستشارة طبية حقيقية.
