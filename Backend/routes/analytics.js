import express from 'express';
import analyticsController from '../controllers/analyticsController.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();
const authenticate = authMiddleware.authenticate.bind(authMiddleware);

// جميع routes تتطلب مصادقة
router.use(authenticate);

// التحليلات الشاملة
router.get('/comprehensive', analyticsController.getComprehensiveAnalytics);

// تحليل الاتجاهات
router.get('/trends', analyticsController.getTrendAnalysis);

// تقارير المخاطر
router.get('/risk-report', analyticsController.getRiskReport);

// مقارنة الفترات
router.get('/comparison', analyticsController.getPeriodComparison);

// إحصائيات الاستخدام
router.get('/usage', analyticsController.getUsageStats);

// التنبؤات المستقبلية
router.get('/predictions', analyticsController.getPredictions);

// لوحة التحكم
router.get('/dashboard', analyticsController.getDashboard);

export default router;
