/**
 * أدوات مساعدة للتطبيق
 */

import crypto from 'crypto';
import path from 'path';
import fs from 'fs';

class Helpers {
  /**
   * @desc    إنشاء معرف فريد
   * @param   {number} length - الطول المطلوب
   * @returns {string} - المعرف الفريد
   */
  static generateUniqueId(length = 16) {
    return crypto.randomBytes(length).toString('hex');
  }

  /**
   * @desc    تنسيق التاريخ
   * @param   {Date} date - التاريخ
   * @param   {string} format - الصيغة المطلوبة
   * @returns {string} - التاريخ المنسق
   */
  static formatDate(date, format = 'yyyy-mm-dd') {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');

    const formats = {
      'yyyy-mm-dd': `${year}-${month}-${day}`,
      'dd/mm/yyyy': `${day}/${month}/${year}`,
      'yyyy-mm-dd hh:ii:ss': `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`,
      'arabic': `${day}/${month}/${year} - ${hours}:${minutes}`,
      'relative': this.getTimeAgo(date)
    };

    return formats[format] || formats['yyyy-mm-dd'];
  }

  /**
   * @desc    تقليم النص وإضافة نقاط إذا كان طويلاً
   * @param   {string} text - النص
   * @param   {number} maxLength - الطول الأقصى
   * @returns {string} - النص المقتطع
   */
  static truncateText(text, maxLength = 100) {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  }

  /**
   * @desc    التحقق من صحة البريد الإلكتروني
   * @param   {string} email - البريد الإلكتروني
   * @returns {boolean} - النتيجة
   */
  static isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * @desc    التحقق من صحة رقم الهاتف
   * @param   {string} phone - رقم الهاتف
   * @returns {boolean} - النتيجة
   */
  static isValidPhone(phone) {
    const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  }

  /**
   * @desc    تحويل سلسلة نصية إلى slug
   * @param   {string} text - النص
   * @returns {string} - الـ slug
   */
  static slugify(text) {
    return text
      .toString()
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+$/, '');
  }

  /**
   * @desc    تحويل بايت إلى صيغة مقروءة
   * @param   {number} bytes - البايت
   * @param   {number} decimals - المنازل العشرية
   * @returns {string} - الحجم المنسق
   */
  static formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  /**
   * @desc    إنشاء كود عشوائي
   * @param   {number} length - الطول
   * @param   {string} type - النوع (numbers, letters, mixed)
   * @returns {string} - الكود
   */
  static generateRandomCode(length = 6, type = 'numbers') {
    const numbers = '0123456789';
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    const mixed = numbers + letters;

    let characters = numbers;
    if (type === 'letters') characters = letters;
    if (type === 'mixed') characters = mixed;

    let result = '';
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  }

  /**
   * @desc    حساب عمر المستخدم من تاريخ الميلاد
   * @param   {Date} birthDate - تاريخ الميلاد
   * @returns {number} - العمر
   */
  static calculateAge(birthDate) {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  }

  /**
   * @desc    تأخير التنفيذ
   * @param   {number} ms - الوقت بالميلي ثانية
   * @returns {Promise} - Promise
   */
  static sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * @desc    تحويل الأرقام إلى نص عربي
   * @param   {number} num - الرقم
   * @returns {string} - الرقم بالعربية
   */
  static toArabicNumbers(num) {
    const arabicNumbers = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    return num.toString().replace(/\d/g, digit => arabicNumbers[digit]);
  }

  /**
   * @desc    فصل الأرقام بفواصل
   * @param   {number} number - الرقم
   * @returns {string} - الرقم المفصول
   */
  static formatNumberWithCommas(number) {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  /**
   * @desc    الحصول على الوقت المنقضي
   * @param   {Date} date - التاريخ
   * @returns {string} - الوقت المنقضي
   */
  static getTimeAgo(date) {
    const now = new Date();
    const diffInSeconds = Math.floor((now - new Date(date)) / 1000);

    const intervals = {
      سنة: 31536000,
      شهر: 2592000,
      أسبوع: 604800,
      يوم: 86400,
      ساعة: 3600,
      دقيقة: 60,
      ثانية: 1
    };

    for (const [unit, seconds] of Object.entries(intervals)) {
      const interval = Math.floor(diffInSeconds / seconds);
      if (interval >= 1) {
        if (unit === 'شهر') {
          return interval === 1 ? 'منذ شهر' : `منذ ${interval} أشهر`;
        } else if (unit === 'يوم') {
          return interval === 1 ? 'منذ يوم' : `منذ ${interval} أيام`;
        } else {
          return interval === 1 ? `منذ ${unit}` : `منذ ${interval} ${unit}`;
        }
      }
    }

    return 'الآن';
  }

  /**
   * @desc    تحويل كائن إلى query string
   * @param   {Object} obj - الكائن
   * @returns {string} - query string
   */
  static objectToQueryString(obj) {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(obj)) {
      if (value !== null && value !== undefined) {
        params.append(key, value);
      }
    }
    return params.toString();
  }

  /**
   * @desc    تحويل query string إلى كائن
   * @param   {string} queryString - query string
   * @returns {Object} - الكائن
   */
  static queryStringToObject(queryString) {
    const params = new URLSearchParams(queryString);
    const obj = {};
    for (const [key, value] of params) {
      obj[key] = value;
    }
    return obj;
  }

  /**
   * @desc    إزالة القيم الفارغة من الكائن
   * @param   {Object} obj - الكائن
   * @returns {Object} - الكائن بعد التنظيف
   */
  static removeEmptyValues(obj) {
    const cleaned = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value !== null && value !== undefined && value !== '') {
        cleaned[key] = value;
      }
    }
    return cleaned;
  }

  /**
   * @desc    دمج كائنين مع التعامل مع التعارضات
   * @param   {Object} target - الكائن الهدف
   * @param   {Object} source - الكائن المصدر
   * @returns {Object} - الكائن المدمج
   */
  static deepMerge(target, source) {
    const output = { ...target };
    
    if (this.isObject(target) && this.isObject(source)) {
      for (const key in source) {
        if (this.isObject(source[key])) {
          if (!(key in target)) {
            output[key] = source[key];
          } else {
            output[key] = this.deepMerge(target[key], source[key]);
          }
        } else {
          output[key] = source[key];
        }
      }
    }
    
    return output;
  }

  /**
   * @desc    التحقق إذا كان المتغير كائن
   * @param   {any} item - المتغير
   * @returns {boolean} - النتيجة
   */
  static isObject(item) {
    return item && typeof item === 'object' && !Array.isArray(item);
  }

  /**
   * @desc    نسخ كائن بعمق
   * @param   {Object} obj - الكائن
   * @returns {Object} - النسخة
   */
  static deepClone(obj) {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj);
    if (obj instanceof Array) return obj.map(item => this.deepClone(item));
    
    const cloned = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        cloned[key] = this.deepClone(obj[key]);
      }
    }
    return cloned;
  }

  /**
   * @desc    إنشاء هاش من نص
   * @param   {string} text - النص
   * @param   {string} algorithm - الخوارزمية
   * @returns {string} - الهاش
   */
  static createHash(text, algorithm = 'md5') {
    return crypto.createHash(algorithm).update(text).digest('hex');
  }

  /**
   * @desc    التحقق من قوة كلمة المرور
   * @param   {string} password - كلمة المرور
   * @returns {Object} - نتيجة التحقق
   */
  static validatePasswordStrength(password) {
    const checks = {
      length: password.length >= 8,
      hasUpperCase: /[A-Z]/.test(password),
      hasLowerCase: /[a-z]/.test(password),
      hasNumbers: /\d/.test(password),
      hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };

    const score = Object.values(checks).filter(Boolean).length;
    let strength = 'ضعيف';
    
    if (score >= 4) strength = 'جيد';
    if (score >= 5) strength = 'قوي';

    return {
      isValid: score >= 3,
      score,
      strength,
      checks
    };
  }

  /**
   * @desc    إنشاء تقدم (progress) من قيمة
   * @param   {number} value - القيمة
   * @param   {number} max - القيمة العظمى
   * @param   {number} length - طول شريط التقدم
   * @returns {string} - شريط التقدم
   */
  static createProgressBar(value, max, length = 20) {
    const percentage = value / max;
    const progress = Math.round(percentage * length);
    const empty = length - progress;
    
    return '█'.repeat(progress) + '░'.repeat(empty) + ` ${Math.round(percentage * 100)}%`;
  }

  /**
   * @desc    تحويل البيانات إلى هيكل مناسب للرسم البياني
   * @param   {Array|Object} data - البيانات
   * @param   {string} chartType - نوع الرسم البياني
   * @returns {Object} - هيكل البيانات المناسب
   */
  static prepareDataForChart(data, chartType = 'bar') {
    if (Array.isArray(data)) {
      return {
        labels: data.map((_, index) => `عنصر ${index + 1}`),
        datasets: [{
          label: 'البيانات',
          data: data
        }]
      };
    } else if (typeof data === 'object') {
      return {
        labels: Object.keys(data),
        datasets: [{
          label: 'البيانات',
          data: Object.values(data)
        }]
      };
    }
    
    return { labels: [], datasets: [] };
  }

  /**
   * @desc    توليد ألوان عشوائية للرسم البياني
   * @param   {number} count - عدد الألوان المطلوبة
   * @param   {number} opacity - الشفافية
   * @returns {Array} - مصفوفة الألوان
   */
  static generateChartColors(count, opacity = 1) {
    const colors = [
      `rgba(59, 130, 246, ${opacity})`,  // blue
      `rgba(239, 68, 68, ${opacity})`,   // red
      `rgba(16, 185, 129, ${opacity})`,  // green
      `rgba(245, 158, 11, ${opacity})`,  // yellow
      `rgba(139, 92, 246, ${opacity})`,  // purple
      `rgba(236, 72, 153, ${opacity})`,  // pink
      `rgba(6, 182, 212, ${opacity})`,   // cyan
      `rgba(132, 204, 22, ${opacity})`,  // lime
      `rgba(249, 115, 22, ${opacity})`,  // orange
      `rgba(99, 102, 241, ${opacity})`   // indigo
    ];
    
    // إذا احتجنا ألوان أكثر، نولدها عشوائياً
    if (count > colors.length) {
      const additionalColors = [];
      for (let i = colors.length; i < count; i++) {
        const r = Math.floor(Math.random() * 255);
        const g = Math.floor(Math.random() * 255);
        const b = Math.floor(Math.random() * 255);
        additionalColors.push(`rgba(${r}, ${g}, ${b}, ${opacity})`);
      }
      return [...colors, ...additionalColors].slice(0, count);
    }

    return colors.slice(0, count);
  }

  /**
   * @desc    تحليل النص إلى بيانات
   * @param   {string} text - النص المدخل
   * @returns {Object} - البيانات المحللة
   */
  static parseTextToData(text) {
    const lines = text.split('\n').filter(line => line.trim());
    const data = {};

    lines.forEach(line => {
      const parts = line.split(/[:,\t=]/).map(part => part.trim());
      if (parts.length >= 2) {
        const key = parts[0];
        let value = parts[1];
        
        // محاولة تحويل إلى رقم إذا أمكن
        value = isNaN(value) ? value : Number(value);
        data[key] = value;
      }
    });

    return data;
  }

  /**
   * @desc    حساب الإحصائيات الأساسية للبيانات
   * @param   {Array} data - البيانات الرقمية
   * @returns {Object} - الإحصائيات
   */
  static calculateBasicStats(data) {
    if (!Array.isArray(data) || data.length === 0) {
      return {};
    }

    const numericData = data.filter(item => typeof item === 'number');
    const sum = numericData.reduce((a, b) => a + b, 0);
    const mean = sum / numericData.length;
    const sorted = [...numericData].sort((a, b) => a - b);
    const median = sorted[Math.floor(sorted.length / 2)];
    const min = Math.min(...numericData);
    const max = Math.max(...numericData);

    return {
      count: numericData.length,
      sum,
      mean: parseFloat(mean.toFixed(2)),
      median,
      min,
      max,
      range: max - min
    };
  }

  /**
   * @desc    تحويل البيانات إلى تنسيق CSV
   * @param   {Array|Object} data - البيانات
   * @param   {Array} headers - العناوين
   * @returns {string} - البيانات بصيغة CSV
   */
  static convertToCSV(data, headers = null) {
    if (Array.isArray(data)) {
      if (data.length === 0) return '';
      
      const actualHeaders = headers || Object.keys(data[0] || {});
      const csvHeaders = actualHeaders.join(',');
      const csvRows = data.map(row => 
        actualHeaders.map(header => 
          `"${String(row[header] || '').replace(/"/g, '""')}"`
        ).join(',')
      );
      
      return [csvHeaders, ...csvRows].join('\n');
    } else if (typeof data === 'object') {
      const actualHeaders = headers || Object.keys(data);
      const csvHeaders = actualHeaders.join(',');
      const csvRow = actualHeaders.map(header => 
        `"${String(data[header] || '').replace(/"/g, '""')}"`
      ).join(',');
      
      return [csvHeaders, csvRow].join('\n');
    }
    
    return '';
  }

  /**
   * @desc    تحميل صورة إلى base64
   * @param   {string} filePath - مسار الصورة
   * @returns {Promise<string>} - الصورة بصيغة base64
   */
  static async imageToBase64(filePath) {
    return new Promise((resolve, reject) => {
      fs.readFile(filePath, (err, data) => {
        if (err) {
          reject(err);
        } else {
          const base64 = data.toString('base64');
          const mimeType = path.extname(filePath).toLowerCase();
          const mimeTypes = {
            '.png': 'image/png',
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.gif': 'image/gif',
            '.webp': 'image/webp'
          };
          
          resolve(`data:${mimeTypes[mimeType] || 'image/png'};base64,${base64}`);
        }
      });
    });
  }

  /**
   * @desc    التحقق من دعم نوع الملف
   * @param   {string} filename - اسم الملف
   * @param   {Array} allowedExtensions - الامتدادات المسموحة
   * @returns {boolean} - النتيجة
   */
  static isFileTypeAllowed(filename, allowedExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.pdf']) {
    const extension = path.extname(filename).toLowerCase();
    return allowedExtensions.includes(extension);
  }

  /**
   * @desc    إنشاء رمز QR من نص
   * @param   {string} text - النص
   * @returns {Promise<string>} - رمز QR بصيغة base64
   */
  static async generateQRCode(text) {
    // في تطبيق حقيقي، ستستخدم مكتبة مثل qrcode
    // هذا مثال مبسط للتوثيق
    try {
      const qrCode = `QR Code for: ${text}`;
      return Promise.resolve(`data:image/svg+xml;base64,${Buffer.from(qrCode).toString('base64')}`);
    } catch (error) {
      throw new Error('فشل في إنشاء رمز QR');
    }
  }
}

export default Helpers;