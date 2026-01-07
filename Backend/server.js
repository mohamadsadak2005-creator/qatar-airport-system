/**
 * ملف الخادم الرئيسي - Project CLI
 * النسخة النهائية مع التشخيص الذاتي (Self-Diagnostic)
 */

import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import fs from 'fs';

// =================================================================
// 1️⃣ مرحلة تحميل البيئة (الأكثر أهمية)
// =================================================================
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.join(__dirname, '.env');

console.log('\n🔄 جاري تهيئة النظام...');
console.log(`📂 المسار الحالي: ${__dirname}`);
console.log(`📄 البحث عن ملف .env في: ${envPath}`);

if (fs.existsSync(envPath)) {
    const result = dotenv.config({ path: envPath });
    if (result.error) {
        console.error('❌ وجد الملف ولكن حدث خطأ أثناء القراءة:', result.error);
    } else {
        console.log('✅ تم تحميل ملف .env بنجاح!');
        // فحص سريع للمتغيرات
        console.log(`   - PORT: ${process.env.PORT || 'غير محدد (سيستخدم 3000)'}`);
        console.log(`   - GEMINI_KEY: ${process.env.GEMINI_API_KEY ? '✅ موجود' : '❌ مفقود'}`);
    }
} else {
    console.error('❌ خطأ قاتل: ملف .env غير موجود في المجلد!');
    console.error('⚠️ نصيحة: تأكد أن اسم الملف ليس .env.txt');
}
console.log('=================================================================\n');

// =================================================================
// 2️⃣ استيراد باقي المكتبات (بعد تحميل البيئة)
// =================================================================
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import net from 'net';

// استيراد الإعدادات
import config from './config/config.js';
import database from './config/database.js';
import logger from './utils/logger.js';

// استيراد المسارات
import authRoutes from './routes/auth.js';
import aiRoutes from './routes/ai.js';
import medicalRoutes from './routes/medical.js';
import analyticsRoutes from './routes/analytics.js';
import userRoutes from './routes/user.js';

class Server {
    constructor() {
        this.app = express();
        // الأولوية للمنفذ في .env ثم config ثم الافتراضي
        this.port = process.env.PORT || config.app?.port || 3000;
        
        this.initializeDatabase();
        this.initializeMiddlewares();
        this.initializeRoutes();
        this.initializeErrorHandling();
    }

    async initializeDatabase() {
        try {
            if (database && typeof database.connect === 'function') {
                await database.connect();
                logger.info('✅ قاعدة البيانات جاهزة');
            }
        } catch (error) {
            logger.error('❌ فشل في الاتصال بقاعدة البيانات (سيستمر الخادم بالعمل)', error.message);
        }
    }

    initializeMiddlewares() {
        // الأمان
        this.app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
        
        // CORS - تكوين محسّن للسماح بطلبات الـ Frontend
        const corsOptions = {
            origin: [
                'http://localhost:5173',  // Vite default port
                'http://127.0.0.1:5173',
                'http://localhost:5000',  // Frontend port
                'http://127.0.0.1:5000',
                'http://localhost:3000',  // Alternative port
                'http://127.0.0.1:3000',
                /^http:\/\/localhost:\d+$/  // أي منفذ local
            ],
            credentials: true,
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization'],
            optionsSuccessStatus: 200
        };
        
        // استخدام CORS المحسّن
        this.app.use(cors(corsOptions));
        
        // معالج OPTIONS لـ Preflight requests
        this.app.options('*', cors(corsOptions));

        // Rate Limit
        if (config.performance?.rateLimit) {
            this.app.use(rateLimit(config.performance.rateLimit));
        }

        // Compression
        if (config.performance?.compression?.enabled) {
            this.app.use(compression());
        }

        // Body Parser
        this.app.use(express.json({ limit: '10mb' }));
        this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));
        
        // Static Files
        this.app.use(express.static(path.join(__dirname, 'public')));
        
        logger.info('✅ تم تهيئة الـ Middlewares');
    }

    initializeRoutes() {
        // مسار تجريبي للتأكد من Gemini
        const router = express.Router();

        router.get('/status', (req, res) => {
            res.json({
                status: 'running',
                gemini: process.env.GEMINI_API_KEY ? 'Active' : 'Inactive',
                port: this.port
            });
        });

        // Endpoint للتحقق من اتصال Gemini
        router.get('/gemini/check', async (req, res) => {
            try {
                const geminiService = (await import('./services/geminiService.js')).default;
                
                if (!geminiService.modelInstance) {
                    return res.status(503).json({
                        success: false,
                        connected: false,
                        error: 'Gemini API غير متاح - تأكد من وجود GEMINI_API_KEY في ملف .env',
                        apiKeyExists: !!process.env.GEMINI_API_KEY
                    });
                }

                // اختبار بسيط للاتصال
                const testResult = await geminiService.generateResponse('مرحبا', {
                    max_tokens: 50
                });

                if (testResult.success) {
                    res.json({
                        success: true,
                        connected: true,
                        message: 'Gemini متصل ويعمل بشكل صحيح',
                        model: geminiService.model,
                        testResponse: testResult.response.substring(0, 100) + '...'
                    });
                } else {
                    res.status(503).json({
                        success: false,
                        connected: false,
                        error: testResult.error || 'فشل في الاتصال بـ Gemini',
                        apiKeyExists: !!process.env.GEMINI_API_KEY
                    });
                }
            } catch (error) {
                res.status(500).json({
                    success: false,
                    connected: false,
                    error: error.message,
                    apiKeyExists: !!process.env.GEMINI_API_KEY
                });
            }
        });

        this.app.use('/api', router);
        
        // تفعيل المسارات الرئيسية
        this.app.use('/api/auth', authRoutes);
        this.app.use('/api/ai', aiRoutes);
        this.app.use('/api/medical', medicalRoutes);
        this.app.use('/api/analytics', analyticsRoutes);
        this.app.use('/api/user', userRoutes);

        // 404 Handler
        this.app.use('*', (req, res) => {
            res.status(404).json({ error: 'Endpoint not found', path: req.originalUrl });
        });

        logger.info('✅ تم تهيئة الـ Routes');
    }

    initializeErrorHandling() {
        this.app.use((err, req, res, next) => {
            logger.error(`Error: ${err.message}`);
            res.status(500).json({ error: 'Internal Server Error' });
        });
    }

    // دالة مساعدة للبحث عن منفذ متاح
    async getAvailablePort(startPort) {
        const isPortAvailable = (port) => {
            return new Promise((resolve) => {
                const server = net.createServer();
                server.once('error', () => resolve(false));
                server.once('listening', () => {
                    server.close();
                    resolve(true);
                });
                server.listen(port);
            });
        };

        let port = parseInt(startPort);
        while (!(await isPortAvailable(port))) {
            console.log(`⚠️ المنفذ ${port} مشغول، جاري تجربة ${port + 1}...`);
            port++;
        }
        return port;
    }

    async start() {
        try {
            // التأكد من المنفذ المتاح
            const finalPort = await this.getAvailablePort(this.port);
            
            this.server = this.app.listen(finalPort, () => {
                const geminiStatus = process.env.GEMINI_API_KEY ? '✅ مفعل (Active)' : '❌ مفقود (Missing)';
                
                console.log('\n' + '='.repeat(50));
                console.log(`🚀 Project CLI Server Started`);
                console.log('='.repeat(50));
                console.log(`📡 Port:     ${finalPort}`);
                console.log(`🤖 Gemini:   ${geminiStatus}`);
                console.log(`🔗 Local:    http://localhost:${finalPort}`);
                console.log('='.repeat(50) + '\n');
            });

            this.setupGracefulShutdown();

        } catch (error) {
            logger.error('❌ فشل تشغيل الخادم:', error);
            process.exit(1);
        }
    }

    setupGracefulShutdown() {
        process.on('SIGINT', () => {
            console.log('\n👋 إغلاق الخادم...');
            this.server.close(() => process.exit(0));
        });
    }
}

// بدء التشغيل
const server = new Server();
server.start();

export default server;