import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { MoreThan } from 'typeorm';
import User from '../models/user.js';
import database from '../config/database.js';

class AuthService {
  
  // تسجيل مستخدم جديد
  async register(userData) {
    try {
      // التحقق من وجود المستخدم (TypeORM)
      const userRepo = database.getRepository(User);
      const existingUser = await userRepo.findOne({ where: [ { email: userData.email }, { username: userData.username } ] });

      if (existingUser) {
        throw new Error('البريد الإلكتروني أو اسم المستخدم موجود مسبقاً');
      }

      // تشفير كلمة المرور
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(userData.password, saltRounds);

      // إنشاء المستخدم
      const userEntity = userRepo.create({
        ...userData,
        password: hashedPassword
      });

      const user = await userRepo.save(userEntity);

      // إنشاء token
      const token = this.generateToken(user);

      return {
        user: this.sanitizeUser(user),
        token
      };

    } catch (error) {
      console.error('Registration error:', error);
      throw new Error(error.message || 'فشل في تسجيل المستخدم');
    }
  }

  // تسجيل الدخول
  async login(credentials) {
    try {
      const { email, password } = credentials;

      // البحث عن المستخدم
      const userRepo = database.getRepository(User);
      const user = await userRepo.findOne({ where: [ { email }, { username: email } ] });
      if (!user) {
        throw new Error('البريد الإلكتروني أو كلمة المرور غير صحيحة');
      }

      // التحقق من كلمة المرور
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw new Error('البريد الإلكتروني أو كلمة المرور غير صحيحة');
      }

      // تحديث آخر دخول
      await userRepo.update({ id: user.id }, { lastLogin: new Date(), loginCount: (user.loginCount || 0) + 1 });

      // إنشاء token
      const token = this.generateToken(user);

      return {
        user: this.sanitizeUser(user),
        token
      };

    } catch (error) {
      console.error('Login error:', error);
      throw new Error(error.message || 'فشل في تسجيل الدخول');
    }
  }

  // إنشاء token
  generateToken(user) {
    const payload = {
      id: user.id,
      email: user.email,
      role: user.role
    };

    return jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '30d'
    });
  }

  // التحقق من token
  verifyToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      throw new Error('Token غير صالح');
    }
  }

  // إزالة البيانات الحساسة من المستخدم
  sanitizeUser(user) {
    // TypeORM: استخدم spread operator مباشرة، لا toObject()
    const userObj = user ? { ...user } : {};
    if (userObj && userObj.password) delete userObj.password;
    if (userObj && userObj.__v) delete userObj.__v;
    return userObj;
  }

  // تحديث الملف الشخصي
  async updateProfile(userId, updateData) {
    try {
      // منع تحديث بعض الحقول
      const allowedUpdates = ['name', 'phone', 'dateOfBirth', 'gender', 'address', 'preferences'];
      const updates = {};

      Object.keys(updateData).forEach(key => {
        if (allowedUpdates.includes(key)) {
          updates[key] = updateData[key];
        }
      });

      const userRepo = database.getRepository(User);
      await userRepo.update({ id: userId }, updates);
      const user = await userRepo.findOne({ where: { id: userId } });
      if (!user) throw new Error('المستخدم غير موجود');
      return this.sanitizeUser(user);

    } catch (error) {
      console.error('Profile update error:', error);
      throw new Error(error.message || 'فشل في تحديث الملف الشخصي');
    }
  }

  // تغيير كلمة المرور
  async changePassword(userId, currentPassword, newPassword) {
    try {
      const userRepo = database.getRepository(User);
      const user = await userRepo.findOne({ where: { id: userId } });
      if (!user) {
        throw new Error('المستخدم غير موجود');
      }

      // التحقق من كلمة المرور الحالية
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isCurrentPasswordValid) {
        throw new Error('كلمة المرور الحالية غير صحيحة');
      }

      // تشفير كلمة المرور الجديدة
      const saltRounds = 12;
      const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

      // تحديث كلمة المرور
      await userRepo.update({ id: userId }, { password: hashedNewPassword });

      return { message: 'تم تغيير كلمة المرور بنجاح' };

    } catch (error) {
      console.error('Password change error:', error);
      throw new Error(error.message || 'فشل في تغيير كلمة المرور');
    }
  }

  // طلب إعادة تعيين كلمة المرور
  async requestPasswordReset(email) {
    try {
      const userRepo = database.getRepository(User);
      const user = await userRepo.findOne({ where: { email } });
      if (!user) {
        // لا نكشف إذا كان البريد موجوداً أم لا
        return { message: 'إذا كان البريد مسجلاً، سيصلك رابط إعادة التعيين' };
      }

      // إنشاء token لإعادة التعيين
      const resetToken = jwt.sign(
        { id: user._id, type: 'password_reset' },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      // هنا يمكنك إرسال البريد الإلكتروني
      // await this.sendResetEmail(user.email, resetToken);

      return { 
        message: 'إذا كان البريد مسجلاً، سيصلك رابط إعادة التعيين',
        resetToken // في البيئة الحقيقية، لا ترسل الـ token في الاستجابة
      };

    } catch (error) {
      console.error('Password reset request error:', error);
      throw new Error('فشل في طلب إعادة تعيين كلمة المرور');
    }
  }

  // إعادة تعيين كلمة المرور
  async resetPassword(token, newPassword) {
    try {
      // التحقق من الـ token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      if (decoded.type !== 'password_reset') {
        throw new Error('Token غير صالح');
      }

      const userRepo = database.getRepository(User);
      const user = await userRepo.findOne({ where: { id: decoded.id } });
      if (!user) {
        throw new Error('المستخدم غير موجود');
      }

      // تشفير كلمة المرور الجديدة
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

      // تحديث كلمة المرور
      await userRepo.update({ id: decoded.id }, { password: hashedPassword });

      return { message: 'تم إعادة تعيين كلمة المرور بنجاح' };

    } catch (error) {
      console.error('Password reset error:', error);
      throw new Error('فشل في إعادة تعيين كلمة المرور');
    }
  }

  // تحديث تفضيلات الإشعارات
  async updateNotificationPreferences(userId, preferences) {
    try {
      const userRepo = database.getRepository(User);
      await userRepo.update({ id: userId }, { preferences: { notifications: preferences } });
      const user = await userRepo.findOne({ where: { id: userId } });
      return this.sanitizeUser(user);

    } catch (error) {
      console.error('Notification preferences update error:', error);
      throw new Error('فشل في تحديث تفضيلات الإشعارات');
    }
  }

  // الحصول على الإحصائيات الشخصية
  async getUserStats(userId) {
    try {
      const userRepo = database.getRepository(User);
      const user = await userRepo.findOne({ where: { id: userId } });
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const bpRepo = database.getRepository((await import('../models/BloodPressure.js')).default);
      const sugarRepo = database.getRepository((await import('../models/BloodSugar.js')).default);

      const [bpCount, sugarCount] = await Promise.all([
        bpRepo.count({ where: { userId, date: MoreThan(thirtyDaysAgo) } }),
        sugarRepo.count({ where: { userId, date: MoreThan(thirtyDaysAgo) } })
      ]);

      return {
        joinDate: user?.createdAt,
        totalRecords: bpCount + sugarCount,
        monthlyAverage: Math.round((bpCount + sugarCount) / 30),
        complianceRate: this.calculateComplianceRate(bpCount + sugarCount)
      };

    } catch (error) {
      console.error('User stats error:', error);
      throw new Error('فشل في جلب الإحصائيات');
    }
  }

  // حساب نسبة الالتزام
  calculateComplianceRate(totalRecords) {
    const expectedRecords = 30 * 2; // افتراض 2 قراءة يومياً
    return Math.min(100, Math.round((totalRecords / expectedRecords) * 100));
  }
}

export default new AuthService();