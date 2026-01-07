import express from 'express';
import medicalController from '../controllers/medicalController.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();
const authenticate = authMiddleware.authenticate.bind(authMiddleware);

// جميع routes تتطلب مصادقة
router.use(authenticate);

// إضافة سجل طبي جديد
router.post('/record', 
  medicalController.addMedicalRecord
);

// الحصول على السجلات الطبية
router.get('/records', medicalController.getMedicalRecords);

// الحصول على تحليل الذكاء الاصطناعي
router.get('/analysis', medicalController.getAIAnalysis);

// الحصول على الإحصائيات الطبية
router.get('/stats', medicalController.getMedicalStats);

// تحديث سجل طبي
router.put('/record/:recordId', 
  medicalController.updateMedicalRecord
);

// حذف سجل طبي
router.delete('/record/:recordId', medicalController.deleteMedicalRecord);

// routes إضافية للتتبع اليومي
router.post('/blood-pressure', 
  medicalController.addBloodPressure
);

router.post('/blood-sugar', 
  medicalController.addBloodSugar
);

router.get('/blood-pressure/history', medicalController.getBloodPressureHistory);
router.get('/blood-sugar/history', medicalController.getBloodSugarHistory);

// الحصول على آخر قراءة
router.get('/latest', medicalController.getLatestReadings);

// البحث في السجلات
router.get('/search', medicalController.searchRecords);

export default router;