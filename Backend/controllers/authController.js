import User from '../models/user.js';
import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';
import database from '../config/database.js';
import bcrypt from 'bcryptjs';

// 🔐 إنشاء token
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET || 'fallback-secret',
    { expiresIn: '30d' }
  );
};

// 📝 تسجيل مستخدم جديد
export const register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'بيانات غير صحيحة',
        errors: errors.array()
      });
    }

    const { username, email, password, profile } = req.body;

    // التحقق من وجود المستخدم (TypeORM)
    const userRepo = database.getRepository(User);
    const existingUser = await userRepo.findOne({ where: [ { email }, { username } ] });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'المستخدم موجود مسبقاً'
      });
    }

    // تشفير كلمة المرور
    const hashedPassword = await bcrypt.hash(password, 12);

    // إنشاء المستخدم (TypeORM)
    const userEntity = userRepo.create({
      username,
      email,
      password: hashedPassword,
      profile,
      lastLogin: new Date(),
      loginCount: 1
    });

    const user = await userRepo.save(userEntity);

    // إنشاء token
    const token = generateToken(user.id);

    res.status(201).json({
      success: true,
      message: 'تم إنشاء الحساب بنجاح!',
      data: {
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          profile: user.profile,
          preferences: user.preferences
        }
      }
    });

  } catch (error) {
    console.error('خطأ في التسجيل:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في الخادم',
      error: error.message
    });
  }
};

// 🔑 تسجيل الدخول
export const login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'بيانات غير صحيحة',
        errors: errors.array()
      });
    }

    const { username, password } = req.body;

    // البحث عن المستخدم (TypeORM)
    const userRepo = database.getRepository(User);
    const user = await userRepo.findOne({ where: [ { email: username }, { username } ] });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'اسم المستخدم أو كلمة المرور غير صحيحة'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'الحساب معطل. يرجى التواصل مع الدعم'
      });
    }

    // التحقق من كلمة المرور (TypeORM + bcrypt)
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'اسم المستخدم أو كلمة المرور غير صحيحة'
      });
    }

    // تحديث إحصائيات الدخول (TypeORM)
    await userRepo.update({ id: user.id }, { 
      lastLogin: new Date(),
      loginCount: (user.loginCount || 0) + 1
    });

    // إنشاء token
    const token = generateToken(user.id);

    res.json({
      success: true,
      message: 'تم تسجيل الدخول بنجاح!',
      data: {
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          profile: user.profile,
          preferences: user.preferences,
          subscription: user.subscription
        }
      }
    });

  } catch (error) {
    console.error('خطأ في تسجيل الدخول:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في الخادم',
      error: error.message
    });
  }
};

// 👤 الحصول على بيانات المستخدم
export const getProfile = async (req, res) => {
  try {
    const userRepo = database.getRepository(User);
    const user = await userRepo.findOne({ where: { id: req.user.id } });

    res.json({
      success: true,
      data: { user }
    });

  } catch (error) {
    console.error('خطأ في جلب الملف:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في الخادم'
    });
  }
};

// ✏️ تحديث الملف الشخصي
export const updateProfile = async (req, res) => {
  try {
    const { profile, preferences } = req.body;
    
    const userRepo = database.getRepository(User);
    await userRepo.update(
      { id: req.user.id },
      { 
        ...(profile && { profile }),
        ...(preferences && { preferences })
      }
    );

    const user = await userRepo.findOne({ where: { id: req.user.id } });

    res.json({
      success: true,
      message: 'تم تحديث الملف الشخصي بنجاح',
      data: { user }
    });

  } catch (error) {
    console.error('خطأ في تحديث الملف:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في الخادم',
      error: error.message
    });
  }
};

// 🔄 تغيير كلمة المرور
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const userRepo = database.getRepository(User);
    const user = await userRepo.findOne({ where: { id: req.user.id } });
    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'كلمة المرور الحالية غير صحيحة'
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await userRepo.update({ id: req.user.id }, { password: hashedPassword });

    res.json({
      success: true,
      message: 'تم تغيير كلمة المرور بنجاح'
    });

  } catch (error) {
    console.error('خطأ في تغيير كلمة المرور:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في الخادم',
      error: error.message
    });
  }
};