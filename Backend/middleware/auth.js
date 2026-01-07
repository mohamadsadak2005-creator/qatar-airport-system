/**
 * middleware للمصادقة والتحقق من المستخدمين
 */

import jwt from 'jsonwebtoken';
import User from '../models/user.js';
import logger from '../utils/logger.js';
import config from '../config/config.js';
import Security from '../utils/security.js';
import database from '../config/database.js';

class AuthMiddleware {
  /**
   * @desc    التحقق من توكن JWT
   * @param   {Object} req - request object
   * @param   {Object} res - response object
   * @param   {Function} next - next middleware
   */
  async authenticate(req, res, next) {
    try {
      // الحصول على التوكن من header
      let token = this.extractToken(req);

      if (!token) {
        return res.status(401).json({
          success: false,
          error: 'التوكن مطلوب للمصادقة'
        });
      }

      // التحقق من صحة التوكن
      const decoded = jwt.verify(token, config.auth.jwt.secret);

      // البحث عن المستخدم باستخدام TypeORM repository
      const userRepo = database.getRepository(User);
      const userEntity = await userRepo.findOne({ where: { id: decoded.id } });

      if (!userEntity) {
        return res.status(401).json({
          success: false,
          error: 'المستخدم غير موجود'
        });
      }

      // إزالة الحقل الحساس
      const user = { ...userEntity };
      if (user.password) delete user.password;

      // التحقق من حالة المستخدم
      if (!user.isActive) {
        return res.status(403).json({
          success: false,
          error: 'الحساب معطل'
        });
      }

      if (user.isBanned) {
        return res.status(403).json({
          success: false,
          error: `الحساب محظور: ${user.banReason}`
        });
      }

      // التحقق من تغيير كلمة المرور بعد إصدار التوكن (fallback)
      if (user.passwordChangedAt) {
        const pwdChangedAtSec = Math.floor(new Date(user.passwordChangedAt).getTime() / 1000);
        if (pwdChangedAtSec > decoded.iat) {
          return res.status(401).json({
            success: false,
            error: 'تم تغيير كلمة المرور مؤخراً، يرجى تسجيل الدخول مرة أخرى'
          });
        }
      }

      // إضافة المستخدم إلى request
      req.user = user;
      req.token = token;

      // تحديث آخر نشاط للمستخدم (باستخدام repository)
      this.updateUserActivity(user.id);

      logger.info('User authenticated', {
        userId: user.id,
        username: user.username,
        ip: req.ip
      });

      next();

    } catch (error) {
      logger.error('Authentication error:', error);

      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({
          success: false,
          error: 'توكن غير صالح'
        });
      }

      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          error: 'انتهت صلاحية التوكن'
        });
      }

      res.status(401).json({
        success: false,
        error: 'فشل في المصادقة'
      });
    }
  }

  /**
   * @desc    التحقق من صلاحية المشرف أو المشرف المساعد
   * @param   {Object} req - request object
   * @param   {Object} res - response object
   * @param   {Function} next - next middleware
   */
  async requireModerator(req, res, next) {
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
          error: 'غير مصرح لك بالوصول إلى هذا المورد'
        });
      }

      next();

    } catch (error) {
      logger.error('Moderator check error:', error);
      res.status(500).json({
        success: false,
        error: 'خطأ في التحقق من الصلاحيات'
      });
    }
  }

  /**
   * @desc    التحقق من صلاحية محددة
   * @param   {string} permission - الصلاحية المطلوبة
   */
  requirePermission(permission) {
    return (req, res, next) => {
      try {
        if (!req.user) {
          return res.status(401).json({
            success: false,
            error: 'المصادقة مطلوبة'
          });
        }

        if (!req.user.hasPermission(permission)) {
          return res.status(403).json({
            success: false,
            error: `غير مصرح لك بهذا الإجراء. تحتاج صلاحية: ${permission}`
          });
        }

        logger.info('Permission granted', {
          userId: req.user._id,
          permission,
          route: req.originalUrl
        });

        next();

      } catch (error) {
        logger.error('Permission check error:', error);
        res.status(500).json({
          success: false,
          error: 'خطأ في التحقق من الصلاحية'
        });
      }
    };
  }

  /**
   * @desc    التحقق من ملكية المورد
   * @param   {string} resourceType - نوع المورد
   * @param   {string} idParam - اسم parameter الذي يحتوي على الـ ID
   */
  checkOwnership(resourceType, idParam = 'id') {
    return async (req, res, next) => {
      try {
        const resourceId = req.params[idParam];
        
        if (!resourceId) {
          return res.status(400).json({
            success: false,
            error: 'معرف المورد مطلوب'
          });
        }

        // للمشرفين، السماح بالوصول إلى جميع الموارد
        if (req.user?.role === 'admin') {
          return next();
        }
        // جلب المورد والتحقق من الملكية (TypeORM fallback for known types)
        let resource;
        switch (resourceType) {
          case 'user':
            resource = await database.getRepository(User).findOne({ where: { id: resourceId } });
            break;
          case 'analytics':
            try {
              const Analytics = (await import('../models/analytics.js')).default;
              resource = await database.getRepository(Analytics).findOne({ where: { id: resourceId } });
            } catch (e) {
              resource = null;
            }
            break;
          default:
            return res.status(400).json({
              success: false,
              error: 'نوع المورد غير معروف'
            });
        }

        if (!resource) {
          return res.status(404).json({
            success: false,
            error: 'المورد غير موجود'
          });
        }

        // التحقق من الملكية
        const resourceOwnerId = resource.createdBy || resource.userId || resource.id;
        const isOwner = resourceOwnerId && resourceOwnerId.toString() === req.user.id.toString();
        const isUserResource = resource.id && resource.id.toString() === req.user.id.toString();

        if (!isOwner && !isUserResource) {
          return res.status(403).json({
            success: false,
            error: 'غير مصرح لك بالوصول إلى هذا المورد'
          });
        }

        // إضافة المورد إلى request للاستخدام لاحقاً
        req.resource = resource;

        next();

      } catch (error) {
        logger.error('Ownership check error:', error);
        res.status(500).json({
          success: false,
          error: 'خطأ في التحقق من الملكية'
        });
      }
    };
  }

  /**
   * @desc    تحديد معدل الطلبات للمستخدم
   * @param   {Object} options - خيارات التحديد
   */
  rateLimit(options = {}) {
    const {
      windowMs = 15 * 60 * 1000, // 15 دقيقة
      max = 100, // 100 طلب
      message = 'تم تجاوز عدد الطلبات المسموح بها',
      skipSuccessfulRequests = false
    } = options;

    const requests = new Map();

    return (req, res, next) => {
      const identifier = req.user ? req.user._id.toString() : req.ip;
      const now = Date.now();
      const windowStart = now - windowMs;

      if (!requests.has(identifier)) {
        requests.set(identifier, []);
      }

      const userRequests = requests.get(identifier);
      
      // إزالة الطلبات القديمة
      const recentRequests = userRequests.filter(time => time > windowStart);
      requests.set(identifier, recentRequests);

      // التحقق من الحد
      if (recentRequests.length >= max) {
        Security.logSecurityEvent('RATE_LIMIT_EXCEEDED', {
          identifier,
          requests: recentRequests.length,
          limit: max,
          route: req.originalUrl
        });

        return res.status(429).json({
          success: false,
          error: message,
          retryAfter: Math.ceil(windowMs / 1000)
        });
      }

      // إضافة الطلب الحالي
      if (!skipSuccessfulRequests || !req.completed) {
        recentRequests.push(now);
      }

      // إضافة headers للاستجابة
      res.set({
        'X-RateLimit-Limit': max,
        'X-RateLimit-Remaining': max - recentRequests.length,
        'X-RateLimit-Reset': new Date(now + windowMs).toISOString()
      });

      next();
    };
  }

  /**
   * @desc    التحقق من CSRF token
   */
  csrfProtection(req, res, next) {
    try {
      // تخطي التحقق لـ GET requests
      if (req.method === 'GET') {
        return next();
      }

      const token = req.headers['x-csrf-token'] || req.body._csrf;
      
      if (!token) {
        return res.status(403).json({
          success: false,
          error: 'CSRF token مطلوب'
        });
      }

      const isValid = Security.verifyCSRFToken(token, config.auth.jwt.secret);
      
      if (!isValid) {
        Security.logSecurityEvent('CSRF_VALIDATION_FAILED', {
          ip: req.ip,
          userAgent: req.get('User-Agent'),
          route: req.originalUrl
        });

        return res.status(403).json({
          success: false,
          error: 'CSRF token غير صالح'
        });
      }

      next();

    } catch (error) {
      logger.error('CSRF protection error:', error);
      res.status(500).json({
        success: false,
        error: 'خطأ في التحقق من الأمان'
      });
    }
  }

  /**
   * @desc    منع هجمات XSS
   */
  xssProtection(req, res, next) {
    try {
      // تنظيف query parameters
      if (req.query) {
        Object.keys(req.query).forEach(key => {
          if (typeof req.query[key] === 'string') {
            req.query[key] = Security.sanitizeInput(req.query[key]);
          }
        });
      }

      // تنظيف body parameters
      if (req.body) {
        req.body = Security.preventXSS(req.body);
      }

      // تنظيف params
      if (req.params) {
        Object.keys(req.params).forEach(key => {
          if (typeof req.params[key] === 'string') {
            req.params[key] = Security.sanitizeInput(req.params[key]);
          }
        });
      }

      next();

    } catch (error) {
      logger.error('XSS protection error:', error);
      // لا نوقف الطلب في حالة خطأ XSS protection
      next();
    }
  }

  /**
   * @desc    التحقق من API key للخدمات الخارجية
   */
  apiKeyAuth(req, res, next) {
    try {
      const apiKey = req.headers['x-api-key'] || req.query.api_key;

      if (!apiKey) {
        return res.status(401).json({
          success: false,
          error: 'API key مطلوب'
        });
      }

      // في تطبيق حقيقي، ستتحقق من API key في قاعدة البيانات
      const validApiKeys = process.env.API_KEYS ? process.env.API_KEYS.split(',') : [];
      
      if (!validApiKeys.includes(apiKey)) {
        Security.logSecurityEvent('INVALID_API_KEY', {
          ip: req.ip,
          apiKey: apiKey.substring(0, 8) + '...'
        });

        return res.status(401).json({
          success: false,
          error: 'API key غير صالح'
        });
      }

      logger.info('API key authentication successful', {
        apiKey: apiKey.substring(0, 8) + '...',
        route: req.originalUrl
      });

      next();

    } catch (error) {
      logger.error('API key auth error:', error);
      res.status(500).json({
        success: false,
        error: 'خطأ في المصادقة'
      });
    }
  }

  /**
   * @desc    استخراج التوكن من request
   */
  extractToken(req) {
    // من header Authorization
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      return req.headers.authorization.substring(7);
    }

    // من query parameter
    if (req.query.token) {
      return req.query.token;
    }

    // من cookies
    if (req.cookies && req.cookies.token) {
      return req.cookies.token;
    }

    return null;
  }

  /**
   * @desc    تحديث نشاط المستخدم
   */
  async updateUserActivity(user) {
    try {
      const userRepo = database.getRepository(User);
      if (typeof user === 'string' || typeof user === 'number') {
        await userRepo.update({ id: user }, { lastActivity: new Date() });
      } else if (user && user.id) {
        await userRepo.update({ id: user.id }, { lastActivity: new Date() });
      }
    } catch (error) {
      logger.error('Error updating user activity:', error);
    }
  }

  /**
   * @desc    إنشاء CSRF token
   */
  generateCSRFToken(req, res, next) {
    try {
      const csrfToken = Security.generateCSRFToken(config.auth.jwt.secret);
      res.locals.csrfToken = csrfToken;
      
      // إضافة إلى header للاستخدام في frontend
      res.set('X-CSRF-Token', csrfToken);
      
      next();
    } catch (error) {
      logger.error('CSRF token generation error:', error);
      next();
    }
  }

  /**
   * @desc    تسجيل طلبات API
   */
  apiLogger(req, res, next) {
    const startTime = Date.now();

    // تسجيل بداية الطلب
    logger.http(req, res);

    // عند اكتمال الاستجابة
    res.on('finish', () => {
      const responseTime = Date.now() - startTime;
      
      logger.http(req, res, responseTime);

      // تسجيل الطلبات البطيئة
      if (responseTime > 10000) { // أكثر من 10 ثواني
        logger.warn('Slow API request', {
          method: req.method,
          url: req.originalUrl,
          responseTime: `${responseTime}ms`,
          userId: req.user?._id,
          ip: req.ip
        });
      }
    });

    next();
  }

  /**
   * @desc    التحقق من حدود استخدام الذكاء الاصطناعي
   */
  async checkAILimits(req, res, next) {
    try {
      if (!req.user) {
        return next();
      }

      const AnalyticsModel = (await import('../models/analytics.js')).default;
      const analyticsRepo = database.getRepository(AnalyticsModel);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // حساب استخدام اليوم (TypeORM - محاولة استعلام آمنة)
      let rawUsage = { totalRequests: 0, totalTokens: 0 };
      try {
        const raw = await analyticsRepo.createQueryBuilder('a')
          .select('COUNT(*)', 'totalRequests')
          .addSelect("COALESCE(SUM((a.properties->>'tokens_used')::bigint),0)", 'totalTokens')
          .where('a.userId = :userId', { userId: req.user.id })
          .andWhere('a.eventType = :eventType', { eventType: 'ai_usage' })
          .andWhere('a.createdAt >= :today', { today: today.toISOString() })
          .getRawOne();

        rawUsage = {
          totalRequests: parseInt(raw.totalRequests || 0, 10),
          totalTokens: parseInt(raw.totalTokens || 0, 10)
        };
      } catch (err) {
        logger.warn('Analytics aggregation failed, falling back to zero usage', { err });
      }

      const usage = rawUsage;
      const limits = config.gemini.limits.perUser.daily;

      // التحقق من الحدود
      if (usage.totalRequests >= limits.requests) {
        return res.status(429).json({
          success: false,
          error: 'تم تجاوز الحد اليومي لطلبات الذكاء الاصطناعي'
        });
      }

      if (usage.totalTokens >= limits.tokens) {
        return res.status(429).json({
          success: false,
          error: 'تم تجاوز الحد اليومي للرموز المستخدمة'
        });
      }

      // إضافة معلومات الاستخدام إلى request
      req.aiUsage = {
        today: usage,
        limits: limits
      };

      next();

    } catch (error) {
      logger.error('AI limits check error:', error);
      // في حالة الخطأ، نسمح بالطلب ولكن نسجل الخطأ
      next();
    }
  }

  /**
   * @desc    التحقق من أن المستخدم مفعل
   */
  requireActiveUser(req, res, next) {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'المصادقة مطلوبة'
      });
    }

    if (!req.user.isActive) {
      return res.status(403).json({
        success: false,
        error: 'الحساب معطل. يرجى التواصل مع الدعم.'
      });
    }

    next();
  }

  /**
   * @desc    التحقق من أن المستخدم موثق بالبريد الإلكتروني
   */
  requireVerifiedEmail(req, res, next) {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'المصادقة مطلوبة'
      });
    }

    if (!req.user.isVerified && config.auth.verification.emailVerification) {
      return res.status(403).json({
        success: false,
        error: 'البريد الإلكتروني غير موثق. يرجى تفعيل حسابك.'
      });
    }

    next();
  }
}

// إنشاء instance من الـ middleware
const authMiddleware = new AuthMiddleware();

export default authMiddleware;