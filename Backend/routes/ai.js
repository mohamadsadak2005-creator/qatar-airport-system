import express from 'express';
import { body } from 'express-validator';
import auth from '../middleware/auth.js';
import aiController from '../controllers/aiController.js';

const router = express.Router();
const authenticate = auth.authenticate.bind(auth);
const requireAuth = process.env.NODE_ENV === 'production';
const devBypassAuth = (req, res, next) => next();
const maybeAuthenticate = requireAuth ? authenticate : devBypassAuth;

// التحقق من صحة البيانات
const chatValidation = [
  body('message')
    .notEmpty()
    .withMessage('الرسالة مطلوبة')
    .isLength({ min: 1, max: 4000 })
    .withMessage('الرسالة يجب أن تكون بين 1 و 4000 حرف')
];

const conversationValidation = [
  body('messages')
    .isArray({ min: 1 })
    .withMessage('يجب إرسال مصفوفة من الرسائل'),
  body('messages.*.role')
    .isIn(['user', 'assistant'])
    .withMessage('دور الرسالة يجب أن يكون user أو assistant'),
  body('messages.*.content')
    .notEmpty()
    .withMessage('محتوى الرسالة مطلوب')
];

// Routes
router.post('/chat', maybeAuthenticate, chatValidation, aiController.chat);
router.post('/conversation', maybeAuthenticate, conversationValidation, aiController.conversation);
router.post('/generate-image', maybeAuthenticate, aiController.generateImage);
router.post('/analyze', maybeAuthenticate, aiController.analyzeText);

export default router;