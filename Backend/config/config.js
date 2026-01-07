import path from 'path';
import 'dotenv/config.js';

const config = {
  // 🔧 الإعدادات العامة
  app: {
    name: process.env.APP_NAME || 'Project CLI',
    version: process.env.APP_VERSION || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT) || 3000,
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    frontendURL: process.env.FRONTEND_URL || 'http://localhost:3000',
    
    // الإعدادات الأمنية
    security: {
      cors: {
        origin: process.env.CORS_ORIGIN || '*', // السماح للكل في التطوير
        credentials: true
      },
      rateLimit: {
        windowMs: 15 * 60 * 1000, // 15 دقيقة
        max: parseInt(process.env.RATE_LIMIT_MAX) || 100
      }
    },
    
    // إعدادات رفع الملفات
    uploads: {
      maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB
      allowedMimeTypes: [
        'image/jpeg', 'image/png', 'image/gif',
        'application/pdf', 'text/plain', 'application/json'
      ]
    }
  },

  // 🔐 إعدادات المصادقة
  auth: {
    jwt: {
      secret: process.env.JWT_SECRET || 'dev-secret-key-change-in-prod',
      expiresIn: process.env.JWT_EXPIRE || '30d',
    },
    bcrypt: {
      saltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12
    },
    verification: {
      emailVerification: process.env.EMAIL_VERIFICATION_REQUIRED === 'true',
      tokenExpiry: 24 * 60 * 60 * 1000 
    }
  },

  // 🗄️ إعدادات قاعدة البيانات
  database: {
    postgres: {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT) || 5432,
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || 'project_cli',
    },
    redis: {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT) || 6379,
    }
  },

  // 🤖 إعدادات Gemini AI (تم الإصلاح: إعدادات مباشرة بدلاً من Import)
  gemini: {
    api: {
      key: process.env.GEMINI_API_KEY, 
      baseURL: 'https://generativelanguage.googleapis.com/v1beta/models',
      timeout: 30000
    },
    models: {
      flash: { name: 'gemini-1.5-flash', maxTokens: 8000 },
      pro: { name: 'gemini-1.5-pro', maxTokens: 32000 }
    }
  },

  // 🏥 الإعدادات الطبية (مهمة لعمل وظائف التحليل)
  medical: {
    bloodPressure: {
      normal: { sys: 120, dia: 80 },
      elevated: { sys: 129, dia: 80 },
      hypertension1: { sys: 139, dia: 89 },
      hypertension2: { sys: 140, dia: 90 },
      crisis: { sys: 180, dia: 120 }
    },
    bloodSugar: {
      fasting: { normal: { min: 70, max: 99 }, diabetes: { min: 126 } },
      postPrandial: { normal: { max: 140 }, diabetes: { min: 200 } }
    },
    systemPrompt: `أنت مساعد طبي ذكي. حلل البيانات وقدم نصائح عامة، لكن اطلب دائماً مراجعة الطبيب للتشخيص النهائي.`
  },

  // ⚡ إعدادات الأداء (تم التأكد من صحة الهيكلية)
  performance: {
    compression: {
      enabled: process.env.COMPRESSION_ENABLED !== 'false',
      threshold: 1024
    },
    caching: {
      enabled: process.env.CACHING_ENABLED !== 'false',
      ttl: parseInt(process.env.CACHE_TTL) || 300 
    },
    rateLimit: {
      windowMs: 15 * 60 * 1000,
      max: 100
    }
  },

  // 📧 البريد الإلكتروني
  email: {
    smtp: {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT) || 587,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    }
  },

  // 📊 التحليلات
  analytics: {
    enabled: process.env.ANALYTICS_ENABLED !== 'false',
  },

  // 📈 الرسوم البيانية
  charts: {
    enabled: process.env.CHARTS_ENABLED !== 'false',
    theme: 'modern'
  },

  // 📁 التخزين
  storage: {
    local: {
      path: process.env.STORAGE_PATH || path.join(process.cwd(), 'uploads'),
      publicPath: '/uploads'
    }
  },

  // 📝 السجلات
  logging: {
    level: process.env.LOG_LEVEL || 'info',
  }
};

// دوال مساعدة (Utils)
config.utils = {
  isDevelopment: () => config.app.environment === 'development',
  isProduction: () => config.app.environment === 'production',
  getStoragePath: (subpath = '') => path.join(config.storage.local.path, subpath),
};

// التحقق من المتغيرات الحرجة فقط
function validateConfig() {
  if (config.utils.isProduction()) {
    const required = ['JWT_SECRET', 'GEMINI_API_KEY'];
    const missing = required.filter(key => !process.env[key]);
    if (missing.length > 0) {
      throw new Error(`FATAL: Missing environment variables: ${missing.join(', ')}`);
    }
  } else {
      // تحذير خفيف في بيئة التطوير
      if (!process.env.GEMINI_API_KEY) console.warn("⚠️  Warning: GEMINI_API_KEY is missing.");
  }
}

validateConfig();

export default config;