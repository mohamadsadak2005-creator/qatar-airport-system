/**
 * أدوات الأمان والحماية
 */

import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import validator from 'validator';

class Security {
  /**
   * @desc    تشفير نص
   * @param   {string} text - النص
   * @param   {string} key - المفتاح
   * @returns {string} - النص المشفر
   */
  static encrypt(text, key = process.env.ENCRYPTION_KEY) {
    try {
      const algorithm = 'aes-256-gcm';
      const iv = crypto.randomBytes(16);
      const cipher = crypto.createCipher(algorithm, key);
      
      let encrypted = cipher.update(text, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      const authTag = cipher.getAuthTag();
      
      return iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted;
    } catch (error) {
      throw new Error('فشل في تشفير النص');
    }
  }

  /**
   * @desc    فك تشفير نص
   * @param   {string} encryptedText - النص المشفر
   * @param   {string} key - المفتاح
   * @returns {string} - النص الأصلي
   */
  static decrypt(encryptedText, key = process.env.ENCRYPTION_KEY) {
    try {
      const algorithm = 'aes-256-gcm';
      const parts = encryptedText.split(':');
      const iv = Buffer.from(parts[0], 'hex');
      const authTag = Buffer.from(parts[1], 'hex');
      const encrypted = parts[2];
      
      const decipher = crypto.createDecipher(algorithm, key);
      decipher.setAuthTag(authTag);
      
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return decrypted;
    } catch (error) {
      throw new Error('فشل في فك تشفير النص');
    }
  }

  /**
   * @desc    إنشاء هاش آمن
   * @param   {string} data - البيانات
   * @param   {string} algorithm - الخوارزمية
   * @returns {string} - الهاش
   */
  static createHash(data, algorithm = 'sha256') {
    return crypto.createHash(algorithm).update(data).digest('hex');
  }

  /**
   * @desc    إنشاء HMAC
   * @param   {string} data - البيانات
   * @param   {string} secret - السر
   * @param   {string} algorithm - الخوارزمية
   * @returns {string} - HMAC
   */
  static createHmac(data, secret, algorithm = 'sha256') {
    return crypto.createHmac(algorithm, secret).update(data).digest('hex');
  }

  /**
   * @desc    التحقق من HMAC
   * @param   {string} data - البيانات
   * @param   {string} secret - السر
   * @param   {string} hmac - HMAC المقدم
   * @returns {boolean} - النتيجة
   */
  static verifyHmac(data, secret, hmac) {
    try {
      const expectedHmac = this.createHmac(data, secret);
      return crypto.timingSafeEqual(Buffer.from(expectedHmac), Buffer.from(hmac));
    } catch (error) {
      return false;
    }
  }

  /**
   * @desc    تنظيف المدخلات من الهجمات
   * @param   {string} input - المدخل
   * @returns {string} - المدخل النظيف
   */
  static sanitizeInput(input) {
    if (typeof input !== 'string') return input;
    
    // إزالة tags و scripts
    let sanitized = validator.escape(input);
    
    // إزالة الأحرف الخطرة
    sanitized = sanitized.replace(/[<>]/g, '');
    
    // تقليم المسافات
    sanitized = sanitized.trim();
    
    return sanitized;
  }

  /**
   * @desc    التحقق من صحة URL
   * @param   {string} url - الرابط
   * @param   {Object} options - الخيارات
   * @returns {boolean} - النتيجة
   */
  static isValidUrl(url, options = {}) {
    const defaultOptions = {
      require_protocol: true,
      require_valid_protocol: true,
      protocols: ['http', 'https']
    };
    
    return validator.isURL(url, { ...defaultOptions, ...options });
  }

  /**
   * @desc    منع هجمات XSS
   * @param   {Object} data - البيانات
   * @returns {Object} - البيانات الآمنة
   */
  static preventXSS(data) {
    if (typeof data === 'string') {
      return this.sanitizeInput(data);
    }
    
    if (Array.isArray(data)) {
      return data.map(item => this.preventXSS(item));
    }
    
    if (typeof data === 'object' && data !== null) {
      const sanitized = {};
      for (const [key, value] of Object.entries(data)) {
        sanitized[key] = this.preventXSS(value);
      }
      return sanitized;
    }
    
    return data;
  }

  /**
   * @desc    التحقق من قوة كلمة المرور
   * @param   {string} password - كلمة المرور
   * @returns {Object} - نتيجة التحقق
   */
  static validatePassword(password) {
    const minLength = 8;
    const requirements = {
      length: password.length >= minLength,
      hasUpperCase: /[A-Z]/.test(password),
      hasLowerCase: /[a-z]/.test(password),
      hasNumbers: /\d/.test(password),
      hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
      noSpaces: !/\s/.test(password),
      noCommon: !this.isCommonPassword(password)
    };

    const passed = Object.values(requirements).filter(Boolean).length;
    const total = Object.keys(requirements).length;
    const score = Math.round((passed / total) * 100);

    let strength = 'ضعيف';
    if (score >= 60) strength = 'متوسط';
    if (score >= 80) strength = 'قوي';

    return {
      isValid: requirements.length && requirements.noSpaces && requirements.noCommon,
      score,
      strength,
      requirements
    };
  }

  /**
   * @desc    التحقق إذا كانت كلمة المرور شائعة
   * @param   {string} password - كلمة المرور
   * @returns {boolean} - النتيجة
   */
  static isCommonPassword(password) {
    const commonPasswords = [
      'password', '123456', '12345678', '1234', 'qwerty', 
      'admin', 'welcome', 'password1', '123456789',
      '12345', '1234567', '1234567890', 'abc123',
      'password123', 'admin123', 'letmein', 'monkey'
    ];
    return commonPasswords.includes(password.toLowerCase());
  }

  /**
   * @desc    إنشاء كلمة مرور قوية
   * @param   {number} length - الطول
   * @param   {Object} options - الخيارات
   * @returns {string} - كلمة المرور
   */
  static generateStrongPassword(length = 12, options = {}) {
    const defaultOptions = {
      numbers: true,
      symbols: true,
      uppercase: true,
      lowercase: true,
      excludeSimilar: true
    };

    const opts = { ...defaultOptions, ...options };
    
    let charset = '';
    if (opts.lowercase) charset += 'abcdefghijklmnopqrstuvwxyz';
    if (opts.uppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (opts.numbers) charset += '0123456789';
    if (opts.symbols) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';

    if (opts.excludeSimilar) {
      charset = charset.replace(/[il1Lo0O]/g, '');
    }

    let password = '';
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }

    // التأكد من تلبية المتطلبات
    if (opts.uppercase && !/[A-Z]/.test(password)) {
      password = this.replaceRandomChar(password, 'ABCDEFGHJKLMNPQRSTUVWXYZ');
    }
    if (opts.lowercase && !/[a-z]/.test(password)) {
      password = this.replaceRandomChar(password, 'abcdefghijkmnpqrstuvwxyz');
    }
    if (opts.numbers && !/\d/.test(password)) {
      password = this.replaceRandomChar(password, '23456789');
    }
    if (opts.symbols && !/[!@#$%^&*()_+\-=[\]{}|;:,.<>?]/.test(password)) {
      password = this.replaceRandomChar(password, '!@#$%^&*()_+-=[]{}|;:,.<>?');
    }

    return password;
  }

  /**
   * @desc    استبدال حرف عشوائي
   */
  static replaceRandomChar(str, charset) {
    const index = Math.floor(Math.random() * str.length);
    const char = charset.charAt(Math.floor(Math.random() * charset.length));
    return str.substring(0, index) + char + str.substring(index + 1);
  }

  /**
   * @desc    التحقق من توكن CSRF
   * @param   {string} token - التوكن
   * @param   {string} secret - السر
   * @returns {boolean} - النتيجة
   */
  static verifyCSRFToken(token, secret) {
    try {
      const [timestamp, hmac] = token.split('.');
      if (!timestamp || !hmac) return false;

      // التحقق من انتهاء الصلاحية (10 دقائق)
      if (Date.now() - parseInt(timestamp) > 10 * 60 * 1000) {
        return false;
      }

      return this.verifyHmac(timestamp, secret, hmac);
    } catch (error) {
      return false;
    }
  }

  /**
   * @desc    إنشاء توكن CSRF
   * @param   {string} secret - السر
   * @returns {string} - التوكن
   */
  static generateCSRFToken(secret) {
    const timestamp = Date.now().toString();
    const hmac = this.createHmac(timestamp, secret);
    return `${timestamp}.${hmac}`;
  }

  /**
   * @desc    التحقق من صحة JWT
   * @param   {string} token - التوكن
   * @returns {boolean} - النتيجة
   */
  static isValidJWT(token) {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return false;

      const [header, payload, signature] = parts;
      
      // التحقق من Base64 encoding
      try {
        JSON.parse(Buffer.from(header, 'base64').toString());
        JSON.parse(Buffer.from(payload, 'base64').toString());
      } catch {
        return false;
      }

      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * @desc    فحص عنوان IP
   * @param   {string} ip - عنوان IP
   * @returns {Object} - معلومات العنوان
   */
  static inspectIP(ip) {
    const isLocal = ip === '127.0.0.1' || ip === '::1';
    const isPrivate = /^(10\.|172\.(1[6-9]|2[0-9]|3[0-1])\.|192\.168\.)/.test(ip);
    
    return {
      ip,
      isLocal,
      isPrivate,
      type: isLocal ? 'local' : isPrivate ? 'private' : 'public'
    };
  }

  /**
   * @desc    تسجيل حدث أمني
   * @param   {string} event - نوع الحدث
   * @param   {Object} details - التفاصيل
   */
  static logSecurityEvent(event, details = {}) {
    const logger = require('./logger');
    
    logger.warn(`Security Event: ${event}`, {
      timestamp: new Date().toISOString(),
      ...details,
      ip: details.ip || 'unknown'
    });
  }

  /**
   * @desc    منع هجمات Brute Force
   * @param   {string} identifier - المعرف (بريد أو IP)
   * @param   {number} maxAttempts - الحد الأقصى للمحاولات
   * @param   {number} windowMs - النافذة الزمنية
   * @returns {boolean} - إذا كان مسموحاً بالمحاولة
   */
  static checkRateLimit(identifier, maxAttempts = 5, windowMs = 15 * 60 * 1000) {
    const cache = new Map();
    const now = Date.now();
    
    if (!cache.has(identifier)) {
      cache.set(identifier, []);
    }
    
    const attempts = cache.get(identifier);
    const recentAttempts = attempts.filter(time => now - time < windowMs);
    
    if (recentAttempts.length >= maxAttempts) {
      this.logSecurityEvent('RATE_LIMIT_EXCEEDED', { identifier });
      return false;
    }
    
    recentAttempts.push(now);
    cache.set(identifier, recentAttempts);
    
    // تنظيف المحاولات القديمة
    setTimeout(() => {
      const currentAttempts = cache.get(identifier) || [];
      cache.set(identifier, currentAttempts.filter(time => now - time < windowMs));
    }, windowMs);
    
    return true;
  }

  /**
   * @desc    تشفير بيانات حساسة في قاعدة البيانات
   * @param   {Object} data - البيانات
   * @param   {Array} sensitiveFields - الحقول الحساسة
   * @returns {Object} - البيانات المشفرة
   */
  static encryptSensitiveData(data, sensitiveFields = ['password', 'token', 'secret']) {
    const encrypted = { ...data };
    
    sensitiveFields.forEach(field => {
      if (encrypted[field]) {
        encrypted[field] = this.encrypt(encrypted[field]);
      }
    });
    
    return encrypted;
  }

  /**
   * @desc    فك تشفير بيانات حساسة من قاعدة البيانات
   * @param   {Object} data - البيانات المشفرة
   * @param   {Array} sensitiveFields - الحقول الحساسة
   * @returns {Object} - البيانات الأصلية
   */
  static decryptSensitiveData(data, sensitiveFields = ['password', 'token', 'secret']) {
    const decrypted = { ...data };
    
    sensitiveFields.forEach(field => {
      if (decrypted[field]) {
        try {
          decrypted[field] = this.decrypt(decrypted[field]);
        } catch (error) {
          // إذا فشل فك التشفير، نترك القيمة كما هي
          console.warn(`Failed to decrypt field: ${field}`);
        }
      }
    });
    
    return decrypted;
  }

  /**
   * @desc    التحقق من قوة API key
   * @param   {string} apiKey - مفتاح API
   * @returns {Object} - نتيجة التحقق
   */
  static validateAPIKey(apiKey) {
    const requirements = {
      length: apiKey.length >= 32,
      hasUpperCase: /[A-Z]/.test(apiKey),
      hasLowerCase: /[a-z]/.test(apiKey),
      hasNumbers: /\d/.test(apiKey),
      hasSpecialChar: /[!@#$%^&*()_+\-=[\]{}|;:,.<>?]/.test(apiKey)
    };

    const passed = Object.values(requirements).filter(Boolean).length;
    const score = Math.round((passed / Object.keys(requirements).length) * 100);

    return {
      isValid: passed >= 3,
      score,
      requirements
    };
  }

  /**
   * @desc    إنشاء API key آمن
   * @param   {number} length - الطول
   * @returns {string} - API key
   */
  static generateAPIKey(length = 64) {
    return crypto.randomBytes(length).toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '')
      .substring(0, length);
  }

  /**
   * @desc    التحقق من توقيع البيانات
   * @param   {Object} data - البيانات
   * @param   {string} signature - التوقيع
   * @param   {string} secret - السر
   * @returns {boolean} - النتيجة
   */
  static verifyDataSignature(data, signature, secret) {
    const dataString = typeof data === 'string' ? data : JSON.stringify(data);
    const expectedSignature = this.createHmac(dataString, secret);
    return this.verifyHmac(dataString, secret, signature);
  }

  /**
   * @desc    إنشاء توقيع للبيانات
   * @param   {Object} data - البيانات
   * @param   {string} secret - السر
   * @returns {string} - التوقيع
   */
  static createDataSignature(data, secret) {
    const dataString = typeof data === 'string' ? data : JSON.stringify(data);
    return this.createHmac(dataString, secret);
  }
}

export default Security;