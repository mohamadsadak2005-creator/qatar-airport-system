/**
 * middleware للتحقق من صلاحيات المشرفين
 */

const User = require('../models/User');
const logger = require('../utils/logger');
const Security = require('../utils/security');

class AdminMiddleware {
  /**
   * @desc    التحقق من صلاحية المشرف
   * @param   {Object} req - request object
   * @param   {Object} res - response object
   * @param   {Function} next - next middleware
   */
  async requireAdmin(req, res, next) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'المصادقة مطلوبة'
        });
      }

      if (req.user.role !== 'admin') {
        Security.logSecurityEvent('UNAUTHORIZED_ADMIN_ACCESS', {
          userId: req.user._id,
          username: req.user.username,
          role: req.user.role,
          route: req.originalUrl,
          ip: req.ip
        });

        return res.status(403).json({
          success: false,
          error: 'غير مصرح لك بالوصول إلى هذا المورد. تحتاج صلاحية مشرف.'
        });
      }

      logger.info('Admin access granted', {
        userId: req.user._id,
        username: req.user.username,
        route: req.originalUrl
      });

      next();

    } catch (error) {
      logger.error('Admin check error:', error);
      res.status(500).json({
        success: false,
        error: 'خطأ في التحقق من الصلاحيات'
      });
    }
  }

  /**
   * @desc    التحقق من صلاحية إدارة المستخدمين
   */
  async requireUserManagement(req, res, next) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'المصادقة مطلوبة'
        });
      }

      if (!['admin', 'moderator'].includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          error: 'غير مصرح لك بإدارة المستخدمين'
        });
      }

      next();

    } catch (error) {
      logger.error('User management check error:', error);
      res.status(500).json({
        success: false,
        error: 'خطأ في التحقق من الصلاحيات'
      });
    }
  }

  /**
   * @desc    التحقق من صلاحية إدارة النظام
   */
  async requireSystemManagement(req, res, next) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'المصادقة مطلوبة'
        });
      }

      if (req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          error: 'غير مصرح لك بإدارة إعدادات النظام'
        });
      }

      next();

    } catch (error) {
      logger.error('System management check error:', error);
      res.status(500).json({
        success: false,
        error: 'خطأ في التحقق من الصلاحيات'
      });
    }
  }

  /**
   * @desc    التحقق من عدم تعديل المستخدم لنفسه
   */
  preventSelfAction(actionType) {
    return (req, res, next) => {
      try {
        const targetUserId = req.params.id || req.body.userId;
        
        if (!targetUserId) {
          return res.status(400).json({
            success: false,
            error: 'معرف المستخدم مطلوب'
          });
        }

        if (targetUserId === req.user._id.toString()) {
          return res.status(400).json({
            success: false,
            error: `لا يمكنك ${actionType} نفسك`
          });
        }

        next();

      } catch (error) {
        logger.error('Self action prevention error:', error);
        res.status(500).json({
          success: false,
          error: 'خطأ في التحقق'
        });
      }
    };
  }

  /**
   * @desc    التحقق من صلاحية تعديل دور المستخدم
   */
  async checkRoleUpdatePermission(req, res, next) {
    try {
      const targetUserId = req.params.id;
      const newRole = req.body.role;

      if (!targetUserId || !newRole) {
        return res.status(400).json({
          success: false,
          error: 'معرف المستخدم والدور مطلوبان'
        });
      }

      // جلب المستخدم الهدف
      const targetUser = await User.findById(targetUserId);
      
      if (!targetUser) {
        return res.status(404).json({
          success: false,
          error: 'المستخدم غير موجود'
        });
      }

      // التحقق من أن المستخدم الحالي لديه صلاحية تعديل دور المستخدم الهدف
      if (targetUser.role === 'admin' && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          error: 'لا يمكنك تعديل دور مشرف آخر'
        });
      }

      // إضافة المستخدم الهدف إلى request للاستخدام لاحقاً
      req.targetUser = targetUser;

      next();

    } catch (error) {
      logger.error('Role update permission check error:', error);
      res.status(500).json({
        success: false,
        error: 'خطأ في التحقق من الصلاحيات'
      });
    }
  }

  /**
   * @desc    تسجيل إجراءات المشرف
   */
  logAdminAction(actionType) {
    return (req, res, next) => {
      const adminInfo = {
        adminId: req.user._id,
        adminUsername: req.user.username,
        action: actionType,
        target: req.params.id || req.body.userId,
        timestamp: new Date(),
        ip: req.ip,
        userAgent: req.get('User-Agent')
      };

      // تسجيل إجراء المشرف
      logger.info('Admin action performed', adminInfo);

      // إضافة معلومات التسجيل إلى request
      req.adminActionLog = adminInfo;

      next();
    };
  }

  /**
   * @desc    التحقق من حدود النظام
   */
  async checkSystemLimits(req, res, next) {
    try {
      // التحقق من عدد المستخدمين
      const userCount = await User.countDocuments();
      const maxUsers = process.env.MAX_USERS || 1000;

      if (userCount >= maxUsers) {
        return res.status(429).json({
          success: false,
          error: 'تم الوصول إلى الحد الأقصى لعدد المستخدمين في النظام'
        });
      }

      // التحقق من استخدام التخزين
      const storageUsage = await this.calculateStorageUsage();
      const maxStorage = process.env.MAX_STORAGE || 1073741824; // 1GB

      if (storageUsage >= maxStorage) {
        return res.status(429).json({
          success: false,
          error: 'تم الوصول إلى الحد الأقصى لسعة التخزين'
        });
      }

      next();

    } catch (error) {
      logger.error('System limits check error:', error);
      // في حالة الخطأ، نسمح بالطلب ولكن نسجل التحذير
      next();
    }
  }

  /**
   * @desc    حساب استخدام التخزين
   */
  async calculateStorageUsage() {
    // هذا مثال مبسط - في تطبيق حقيقي، ستقوم بحساب حجم الملفات في التخزين
    const Analytics = require('../models/Analytics');
    const Chart = require('../models/Chart');
    
    const analyticsCount = await Analytics.countDocuments();
    const chartsCount = await Chart.countDocuments();
    
    // تقدير حجم التخزين (يمكن جعله أكثر دقة)
    const estimatedSize = (analyticsCount * 1024) + (chartsCount * 5120); // 1KB لكل analytics, 5KB لكل chart
    
    return estimatedSize;
  }

  /**
   * @desc    التحقق من صحة إعدادات النظام
   */
  validateSystemSettings(req, res, next) {
    const settings = req.body.settings;

    if (!settings || typeof settings !== 'object') {
      return res.status(400).json({
        success: false,
        error: 'إعدادات النظام مطلوبة'
      });
    }

    // التحقق من الإعدادات المسموح بها
    const allowedSettings = [
      'appName',
      'maxFileSize',
      'allowRegistration',
      'requireEmailVerification',
      'aiDailyLimit',
      'maintenanceMode'
    ];

    const invalidSettings = Object.keys(settings).filter(key => !allowedSettings.includes(key));
    
    if (invalidSettings.length > 0) {
      return res.status(400).json({
        success: false,
        error: `إعدادات غير مسموحة: ${invalidSettings.join(', ')}`
      });
    }

    // التحقق من قيم الإعدادات
    if (settings.maxFileSize && (settings.maxFileSize < 1024 || settings.maxFileSize > 104857600)) {
      return res.status(400).json({
        success: false,
        error: 'حجم الملف يجب أن يكون بين 1KB و 100MB'
      });
    }

    if (settings.aiDailyLimit && (settings.aiDailyLimit < 1 || settings.aiDailyLimit > 10000)) {
      return res.status(400).json({
        success: false,
        error: 'حد الذكاء الاصطناعي اليومي يجب أن يكون بين 1 و 10000'
      });
    }

    next();
  }

  /**
   * @desc    التحقق من وضع الصيانة
   */
  checkMaintenanceMode(req, res, next) {
    const maintenanceMode = process.env.MAINTENANCE_MODE === 'true';

    if (maintenanceMode && req.user.role !== 'admin') {
      return res.status(503).json({
        success: false,
        error: 'النظام في وضع الصيانة. يرجى المحاولة لاحقاً.',
        maintenance: true,
        estimatedRestoration: process.env.MAINTENANCE_ESTIMATED_TIME
      });
    }

    next();
  }

  /**
   * @desc    التحقق من إحصائيات النظام
   */
  async getSystemStats(req, res, next) {
    try {
      const stats = {
        users: await this.getUserStats(),
        ai: await this.getAIStats(),
        storage: await this.getStorageStats(),
        performance: await this.getPerformanceStats()
      };

      req.systemStats = stats;
      next();

    } catch (error) {
      logger.error('System stats calculation error:', error);
      res.status(500).json({
        success: false,
        error: 'خطأ في حساب إحصائيات النظام'
      });
    }
  }

  /**
   * @desc    الحصول على إحصائيات المستخدمين
   */
  async getUserStats() {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const verifiedUsers = await User.countDocuments({ isVerified: true });
    const todayUsers = await User.countDocuments({
      createdAt: { $gte: new Date().setHours(0, 0, 0, 0) }
    });

    return {
      total: totalUsers,
      active: activeUsers,
      verified: verifiedUsers,
      newToday: todayUsers,
      byRole: {
        admin: await User.countDocuments({ role: 'admin' }),
        moderator: await User.countDocuments({ role: 'moderator' }),
        user: await User.countDocuments({ role: 'user' })
      }
    };
  }

  /**
   * @desc    الحصول على إحصائيات الذكاء الاصطناعي
   */
  async getAIStats() {
    const Analytics = require('../models/Analytics');
    const today = new Date().setHours(0, 0, 0, 0);

    const aiStats = await Analytics.aggregate([
      {
        $match: {
          eventType: 'ai_usage',
          createdAt: { $gte: new Date(today) }
        }
      },
      {
        $group: {
          _id: null,
          totalRequests: { $sum: 1 },
          totalTokens: { $sum: '$properties.tokens_used' },
          totalCost: { $sum: '$cost' }
        }
      }
    ]);

    return aiStats[0] || { totalRequests: 0, totalTokens: 0, totalCost: 0 };
  }

  /**
   * @desc    الحصول على إحصائيات التخزين
   */
  async getStorageStats() {
    const Chart = require('../models/Chart');
    const totalCharts = await Chart.countDocuments();
    const storageUsage = await this.calculateStorageUsage();

    return {
      totalCharts,
      estimatedUsage: storageUsage,
      estimatedUsageMB: (storageUsage / 1024 / 1024).toFixed(2)
    };
  }

  /**
   * @desc    الحصول على إحصائيات الأداء
   */
  async getPerformanceStats() {
    // في تطبيق حقيقي، ستجمع إحصائيات الأداء من نظام المراقبة
    return {
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      activeConnections: 0 // يمكن إضافة نظام تتبع الاتصالات
    };
  }
}

// إنشاء instance من الـ middleware
const adminMiddleware = new AdminMiddleware();

module.exports = adminMiddleware;