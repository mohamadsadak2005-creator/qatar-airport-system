import express from 'express';
import userController from '../controllers/userController.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();
const authenticate = authMiddleware.authenticate.bind(authMiddleware);

// جميع routes المستخدمين تتطلب مصادقة
router.use(authenticate);

// الحصول على بيانات الملف الشخصي
router.get('/profile', userController.getProfile);

// تحديث الملف الشخصي
router.put('/profile', userController.updateProfile);

// تغيير كلمة المرور
router.put('/change-password', userController.changePassword);

// الحصول على قائمة المستخدمين
router.get('/', userController.getAllUsers);

// البحث عن مستخدمين
router.get('/search', userController.searchUsers);

// الحصول على إحصائيات المستخدم
router.get('/stats/:userId', userController.getUserStats);

// تحديث صورة المستخدم
router.post('/upload-avatar', userController.uploadAvatar);

export default router;
