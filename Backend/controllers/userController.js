import User from '../models/user.js';
import logger from '../utils/logger.js';
import { validationResult } from 'express-validator';
import database from '../config/database.js';

const userController = {};

/**
 * @desc    احصل على بيانات الملف الشخصي للمستخدم
 * @route   GET /api/users/profile
 * @access  Private
 */
userController.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-password -__v')
      .lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'المستخدم غير موجود'
      });
    }

    logger.info(`User profile retrieved: ${user.email}`);

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    logger.error(`Get profile error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'خطأ في السيرفر',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

/**
 * @desc    تحديث الملف الشخصي للمستخدم
 * @route   PUT /api/users/profile
 * @access  Private
 */
userController.updateProfile = async (req, res) => {
  try {
    // التحقق من صحة البيانات
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'بيانات غير صالحة',
        errors: errors.array()
      });
    }

    const { username, email, phone, avatar } = req.body;
    
    // التحقق من أن البريد الإلكتروني غير مستخدم من قبل مستخدم آخر
    if (email) {
      const existingUser = await User.findOne({ 
        email, 
        _id: { $ne: req.user.id } 
      });
      
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'البريد الإلكتروني مستخدم بالفعل'
        });
      }
    }

    // تحديث البيانات
    const updateData = {};
    if (username) updateData.username = username;
    if (email) updateData.email = email;
    if (phone) updateData.phone = phone;
    if (avatar) updateData.avatar = avatar;

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      { 
        new: true, 
        runValidators: true 
      }
    ).select('-password -__v');

    logger.info(`User profile updated: ${updatedUser.email}`);

    res.status(200).json({
      success: true,
      message: 'تم تحديث الملف الشخصي بنجاح',
      data: updatedUser
    });
  } catch (error) {
    logger.error(`Update profile error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'خطأ في تحديث الملف الشخصي',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

/**
 * @desc    تغيير كلمة المرور
 * @route   PUT /api/users/change-password
 * @access  Private
 */
userController.changePassword = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'بيانات غير صالحة',
        errors: errors.array()
      });
    }

    const { currentPassword, newPassword } = req.body;
    
    const user = await User.findById(req.user.id);
    
    // التحقق من كلمة المرور الحالية
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'كلمة المرور الحالية غير صحيحة'
      });
    }

    // تحديث كلمة المرور
    user.password = newPassword;
    await user.save();

    logger.info(`Password changed for user: ${user.email}`);

    res.status(200).json({
      success: true,
      message: 'تم تغيير كلمة المرور بنجاح'
    });
  } catch (error) {
    logger.error(`Change password error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'خطأ في تغيير كلمة المرور',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

/**
 * @desc    حذف الحساب
 * @route   DELETE /api/users/account
 * @access  Private
 */
userController.deleteAccount = async (req, res) => {
  try {
    const { confirmation } = req.body;
    
    if (confirmation !== 'DELETE') {
      return res.status(400).json({
        success: false,
        message: 'يرجى كتابة DELETE للتأكيد'
      });
    }

    const userRepo = database.getRepository(User);
    const user = await userRepo.findOne({ where: { id: req.user.id } });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'المستخدم غير موجود'
      });
    }

    await userRepo.remove(user);
    
    logger.info(`User account deleted: ${user.email}`);

    res.status(200).json({
      success: true,
      message: 'تم حذف الحساب بنجاح'
    });
  } catch (error) {
    logger.error(`Delete account error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'خطأ في حذف الحساب',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

/**
 * @desc    احصل على إحصائيات المستخدم
 * @route   GET /api/users/analytics
 * @access  Private
 */
userController.getAnalytics = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // إحصائيات المستخدم
    const userAnalytics = await Analytics.find({ userId })
      .sort({ createdAt: -1 })
      .limit(30)
      .lean();

    // إحصائيات عامة
    const totalRequests = await Analytics.countDocuments({ userId });
    const today = new Date();
    const startOfToday = new Date(today.setHours(0, 0, 0, 0));
    const todayRequests = await Analytics.countDocuments({ 
      userId, 
      createdAt: { $gte: startOfToday } 
    });

    const analyticsData = {
      summary: {
        totalRequests,
        todayRequests,
        last30Days: userAnalytics.length
      },
      recentActivity: userAnalytics,
      charts: {
        dailyUsage: await getDailyUsage(userId),
        featureUsage: await getFeatureUsage(userId)
      }
    };

    res.status(200).json({
      success: true,
      data: analyticsData
    });
  } catch (error) {
    logger.error(`Get analytics error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب التحليلات',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

/**
 * @desc    احصل على جميع المستخدمين (للمشرفين فقط)
 * @route   GET /api/users
 * @access  Private/Admin
 */
userController.getAllUsers = async (req, res) => {
  try {
    // التحقق من صلاحية المشرف
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'غير مصرح لك بالوصول إلى هذا المورد'
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const users = await User.find()
      .select('-password')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .lean();

    const totalUsers = await User.countDocuments();

    res.status(200).json({
      success: true,
      data: {
        users,
        pagination: {
          page,
          limit,
          totalUsers,
          totalPages: Math.ceil(totalUsers / limit)
        }
      }
    });
  } catch (error) {
    logger.error(`Get all users error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب المستخدمين',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

/**
 * @desc    تحديث دور المستخدم (للمشرفين فقط)
 * @route   PUT /api/users/:id/role
 * @access  Private/Admin
 */
userController.updateUserRole = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'غير مصرح لك بهذا الإجراء'
      });
    }

    const { role } = req.body;
    const userId = req.params.id;

    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'الدور يجب أن يكون user أو admin'
      });
    }

    // منع المستخدم من تغيير دوره بنفسه
    if (userId === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'لا يمكنك تغيير دورك الخاص'
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'المستخدم غير موجود'
      });
    }

    logger.info(`User role updated: ${updatedUser.email} -> ${role}`);

    res.status(200).json({
      success: true,
      message: 'تم تحديث دور المستخدم بنجاح',
      data: updatedUser
    });
  } catch (error) {
    logger.error(`Update user role error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'خطأ في تحديث دور المستخدم',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// الدوال المساعدة
async function getDailyUsage(userId) {
  const last7Days = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const startOfDay = new Date(date.setHours(0, 0, 0, 0));
    const endOfDay = new Date(date.setHours(23, 59, 59, 999));
    
    const count = await Analytics.countDocuments({
      userId,
      createdAt: { $gte: startOfDay, $lte: endOfDay }
    });
    
    last7Days.push({
      date: startOfDay.toISOString().split('T')[0],
      requests: count
    });
  }
  
  return last7Days;
}

async function getFeatureUsage(userId) {
  const features = await Analytics.aggregate([
    { $match: { userId } },
    { $group: { _id: '$feature', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);
  
  return features;
}

/**
 * @desc    رفع صورة الملف الشخصي
 * @route   POST /api/users/upload-avatar
 * @access  Private
 */
userController.uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'يرجى اختيار صورة'
      });
    }

    const avatarUrl = `/uploads/avatars/${req.file.filename}`;
    
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { avatar: avatarUrl },
      { new: true }
    ).select('-password');

    res.status(200).json({
      success: true,
      message: 'تم رفع الصورة بنجاح',
      data: {
        avatar: avatarUrl,
        user: updatedUser
      }
    });
  } catch (error) {
    logger.error(`Upload avatar error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'خطأ في رفع الصورة',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

/**
 * @desc    البحث عن المستخدمين
 * @route   GET /api/users/search
 * @access  Private/Admin
 */
userController.searchUsers = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'غير مصرح لك بالوصول إلى هذا المورد'
      });
    }

    const { query } = req.query;
    
    if (!query || query.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'يرجى إدخال至少 حرفين للبحث'
      });
    }

    const users = await User.find({
      $or: [
        { username: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } }
      ]
    }).select('-password').limit(10);

    res.status(200).json({
      success: true,
      data: users
    });
  } catch (error) {
    logger.error(`Search users error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'خطأ في البحث',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// دالة مساعدة للحصول على إحصائيات المستخدم
userController.getUserStats = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      data: { stats: 'User stats here' }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب الإحصائيات'
    });
  }
};

export default userController;