import express from 'express';
import { body } from 'express-validator';
import {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword
} from '../controllers/authController.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();
const authenticate = authMiddleware.authenticate.bind(authMiddleware);

// ✅ التحقق من صحة البيانات
const registerValidation = [
  body('username')
    .isLength({ min: 3 })
    .withMessage('اسم المستخدم يجب أن يكون 3 أحرف على الأقل')
    .isAlphanumeric()
    .withMessage('اسم المستخدم يجب أن يحتوي على أحرف وأرقام فقط'),
  
  body('email')
    .isEmail()
    .withMessage('البريد الإلكتروني غير صحيح')
    .normalizeEmail(),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('كلمة المرور يجب أن تكون 6 أحرف على الأقل')
];

const loginValidation = [
  body('username')
    .notEmpty()
    .withMessage('اسم المستخدم مطلوب'),
  
  body('password')
    .notEmpty()
    .withMessage('كلمة المرور مطلوبة')
];

// 🔗 الروابط
router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, updateProfile);
router.put('/change-password', authenticate, changePassword);

export default router;