# Smart Health System - Medical AI Assistant

A comprehensive web application integrated with an intelligent medical assistant powered by Google Gemini AI for medical analysis and health consultations.

## 🚀 Features

- 🤖 **AI Medical Assistant** integrated with Google Gemini AI
- 🏥 **Vital Signs Analysis** and medical data processing
- 💬 **Intelligent Conversations** with Arabic language support
- 📊 **Modern UI** built with React and TailwindCSS
- 🔐 **Secure Authentication** system with JWT
- 🗄️ **Powerful PostgreSQL** database

## 🛠️ Technologies Used

### Backend
- **Node.js** + **Express.js**
- **TypeORM** with PostgreSQL
- **Google Generative AI** (Gemini 2.5 Flash)
- **JWT** for authentication
- **CORS** for frontend communication

### Frontend
- **React 18** with Hooks
- **Vite** as Development Server
- **TailwindCSS** for styling
- **Axios** for HTTP requests

## 📋 Requirements

- Node.js 18+
- PostgreSQL 18
- Git

## 🚀 Installation & Setup

### 1. Install PostgreSQL
```bash
# Make sure PostgreSQL service is running
# Service name: postgresql-x64-18
# Port: 1234
```

### 2. Install Dependencies
```bash
# Backend
cd Backend
npm install

# Frontend
cd ../frontend
npm install
```

### 3. Environment Variables Setup

#### Backend/.env
```env
NODE_ENV=development
PORT=4000
APP_NAME="Smart Health System"

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

### 4. Run the Application

#### Start PostgreSQL
```bash
# As Administrator
Start-Service postgresql-x64-18
```

#### Start Backend
```bash
cd Backend
npm run dev
# Runs on http://localhost:4000
```

#### Start Frontend
```bash
cd frontend
npm run dev
# Runs on http://localhost:5000
```

## 🧪 Testing

### Test Gemini API
```bash
cd Backend
node test-gemini-simple.js
```

### Test API Endpoints
```bash
# Test AI Chat
curl -X POST http://localhost:4000/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Hello"}'
```

## 📁 Project Structure

```
Smart Health System/
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
- `POST /api/ai/chat` - Chat with AI
- `POST /api/ai/analyze` - Analyze medical text
- `POST /api/ai/conversation` - Advanced conversation
- `POST /api/ai/generate-image` - Generate images (coming soon)

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - Create account

### Health
- `GET /api/status` - Server status

## 🤖 Gemini AI Integration

- **Model**: `gemini-2.5-flash`
- **Language Support**: Arabic and English
- **Features**: Medical analysis, consultations, intelligent conversations

## 📝 Important Notes

- Make sure PostgreSQL is running before starting Backend
- Backend runs on port 4000
- Frontend runs on port 5000
- You can modify ports in .env files

## 🚀 Deployment

The project can be deployed on:
- **Vercel** for Frontend
- **Railway** or **Heroku** for Backend
- **Supabase** or **Railway** for Database

## 👨‍💻 Developer

**MADOUI MOHAMAD SADAK**
- Full Stack Developer
- AI & Healthcare Technology Enthusiast
- [GitHub Profile](https://github.com/mohamadsadak2005-creator)

## 📄 License

MIT License

---

**Disclaimer**: This project is for educational and demonstration purposes only. Not to be used as real medical consultation.
