/**
 * نظام السجلات والتسجيل
 */

import fs from 'fs';
import path from 'path';
import util from 'util';

class Logger {
  constructor() {
    this.logLevels = {
      error: 0,
      warn: 1,
      info: 2,
      http: 3,
      debug: 4
    };

    this.currentLevel = process.env.LOG_LEVEL || 'info';
    this.logToFile = process.env.LOG_TO_FILE === 'true';
    this.logDir = process.env.LOG_DIR || 'logs';

    // إنشاء مجلد السجلات إذا لم يكن موجوداً
    if (this.logToFile && !fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }

    // ألوان console
    this.colors = {
      reset: '\x1b[0m',
      red: '\x1b[31m',
      yellow: '\x1b[33m',
      green: '\x1b[32m',
      blue: '\x1b[34m',
      magenta: '\x1b[35m',
      cyan: '\x1b[36m',
      white: '\x1b[37m'
    };
  }

  /**
   * @desc    الحصول على الطابع الزمني
   * @returns {string} - الطابع الزمني
   */
  getTimestamp() {
    return new Date().toISOString();
  }

  /**
   * @desc    الحصول على اسم الملف للسجل
   * @param   {string} level - مستوى السجل
   * @returns {string} - اسم الملف
   */
  getLogFileName(level) {
    const date = new Date().toISOString().split('T')[0];
    return path.join(this.logDir, `${level}-${date}.log`);
  }

  /**
   * @desc    كتابة السجل إلى الملف
   * @param   {string} level - مستوى السجل
   * @param   {string} message - الرسالة
   * @param   {Object} meta - البيانات الوصفية
   */
  writeToFile(level, message, meta = {}) {
    try {
      const logEntry = {
        timestamp: this.getTimestamp(),
        level: level.toUpperCase(),
        message,
        ...meta
      };

      const logLine = JSON.stringify(logEntry) + '\n';
      const fileName = this.getLogFileName(level);

      fs.appendFileSync(fileName, logLine, 'utf8');
    } catch (error) {
      console.error('Failed to write log to file:', error);
    }
  }

  /**
   * @desc    تنسيق الرسالة
   * @param   {string} level - المستوى
   * @param   {string} message - الرسالة
   * @param   {Object} meta - البيانات الوصفية
   * @returns {string} - الرسالة المنسقة
   */
  formatMessage(level, message, meta = {}) {
    const timestamp = this.getTimestamp();
    const levelColor = this.getLevelColor(level);
    const metaStr = Object.keys(meta).length ? ` | ${util.inspect(meta, { depth: 2 })}` : '';

    return `${timestamp} ${levelColor}[${level.toUpperCase()}]${this.colors.reset} ${message}${metaStr}`;
  }

  /**
   * @desc    الحصول على لون المستوى
   * @param   {string} level - المستوى
   * @returns {string} - اللون
   */
  getLevelColor(level) {
    const colorMap = {
      error: this.colors.red,
      warn: this.colors.yellow,
      info: this.colors.green,
      http: this.colors.blue,
      debug: this.colors.magenta
    };

    return colorMap[level] || this.colors.white;
  }

  /**
   * @desc    التحقق إذا كان المستوى مسموحاً به
   * @param   {string} level - المستوى
   * @returns {boolean} - النتيجة
   */
  shouldLog(level) {
    return this.logLevels[level] <= this.logLevels[this.currentLevel];
  }

  /**
   * @desc    سجل معلومات
   * @param   {string} message - الرسالة
   * @param   {Object} meta - البيانات الوصفية
   */
  info(message, meta = {}) {
    if (!this.shouldLog('info')) return;

    const formattedMessage = this.formatMessage('info', message, meta);
    console.log(formattedMessage);

    if (this.logToFile) {
      this.writeToFile('info', message, meta);
    }
  }

  /**
   * @desc    سجل خطأ
   * @param   {string} message - الرسالة
   * @param   {Object} meta - البيانات الوصفية
   */
  error(message, meta = {}) {
    if (!this.shouldLog('error')) return;

    const formattedMessage = this.formatMessage('error', message, meta);
    console.error(formattedMessage);

    if (this.logToFile) {
      this.writeToFile('error', message, meta);
    }
  }

  /**
   * @desc    سجل تحذير
   * @param   {string} message - الرسالة
   * @param   {Object} meta - البيانات الوصفية
   */
  warn(message, meta = {}) {
    if (!this.shouldLog('warn')) return;

    const formattedMessage = this.formatMessage('warn', message, meta);
    console.warn(formattedMessage);

    if (this.logToFile) {
      this.writeToFile('warn', message, meta);
    }
  }

  /**
   * @desc    سجل تصحيح
   * @param   {string} message - الرسالة
   * @param   {Object} meta - البيانات الوصفية
   */
  debug(message, meta = {}) {
    if (!this.shouldLog('debug')) return;

    const formattedMessage = this.formatMessage('debug', message, meta);
    console.debug(formattedMessage);

    if (this.logToFile) {
      this.writeToFile('debug', message, meta);
    }
  }

  /**
   * @desc    سجل طلبات HTTP
   * @param   {Object} req - الطلب
   * @param   {Object} res - الاستجابة
   * @param   {number} responseTime - وقت الاستجابة
   */
  http(req, res, responseTime = null) {
    if (!this.shouldLog('http')) return;

    const meta = {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent')
    };

    if (responseTime) {
      meta.responseTime = `${responseTime}ms`;
    }

    const message = `${req.method} ${req.url} ${res.statusCode}`;
    const formattedMessage = this.formatMessage('http', message, meta);

    console.log(formattedMessage);

    if (this.logToFile) {
      this.writeToFile('http', message, meta);
    }
  }

  /**
   * @desc    سجل قاعدة البيانات
   * @param   {string} operation - العملية
   * @param   {string} collection - المجموعة
   * @param   {Object} details - التفاصيل
   */
  database(operation, collection, details = {}) {
    if (!this.shouldLog('debug')) return;

    const message = `DB ${operation} on ${collection}`;
    const meta = {
      operation,
      collection,
      ...details
    };

    const formattedMessage = this.formatMessage('debug', message, meta);
    console.debug(formattedMessage);

    if (this.logToFile) {
      this.writeToFile('debug', message, meta);
    }
  }

  /**
   * @desc    سجل الأمان
   * @param   {string} event - الحدث
   * @param   {Object} details - التفاصيل
   */
  security(event, details = {}) {
    const message = `Security: ${event}`;
    const meta = {
      event,
      ...details
    };

    const formattedMessage = this.formatMessage('warn', message, meta);
    console.warn(formattedMessage);

    if (this.logToFile) {
      this.writeToFile('security', message, meta);
    }
  }

  /**
   * @desc    سجل الأعمال
   * @param   {string} action - العملية
   * @param   {string} entity - الكيان
   * @param   {Object} details - التفاصيل
   */
  business(action, entity, details = {}) {
    const message = `Business: ${action} on ${entity}`;
    const meta = {
      action,
      entity,
      ...details
    };

    const formattedMessage = this.formatMessage('info', message, meta);
    console.log(formattedMessage);

    if (this.logToFile) {
      this.writeToFile('business', message, meta);
    }
  }

  /**
   * @desc    سجل الأداء
   * @param   {string} operation - العملية
   * @param   {number} duration - المدة
   * @param   {Object} details - التفاصيل
   */
  performance(operation, duration, details = {}) {
    const message = `Performance: ${operation} took ${duration}ms`;
    const meta = {
      operation,
      duration: `${duration}ms`,
      ...details
    };

    const formattedMessage = this.formatMessage('info', message, meta);
    console.log(formattedMessage);

    if (this.logToFile) {
      this.writeToFile('performance', message, meta);
    }
  }

  /**
   * @desc    سجل الذكاء الاصطناعي
   * @param   {string} operation - العملية
   * @param   {Object} usage - الاستخدام
   * @param   {Object} details - التفاصيل
   */
  ai(operation, usage = {}, details = {}) {
    const message = `AI: ${operation}`;
    const meta = {
      operation,
      ...usage,
      ...details
    };

    const formattedMessage = this.formatMessage('info', message, meta);
    console.log(formattedMessage);

    if (this.logToFile) {
      this.writeToFile('ai', message, meta);
    }
  }

  /**
   * @desc    سجل الرسوم البيانية
   * @param   {string} action - العملية
   * @param   {string} chartType - نوع الرسم
   * @param   {Object} details - التفاصيل
   */
  chart(action, chartType, details = {}) {
    const message = `Chart: ${action} - ${chartType}`;
    const meta = {
      action,
      chartType,
      ...details
    };

    const formattedMessage = this.formatMessage('info', message, meta);
    console.log(formattedMessage);

    if (this.logToFile) {
      this.writeToFile('chart', message, meta);
    }
  }

  /**
   * @desc    سجل الاستثناءات
   * @param   {Error} error - الخطأ
   * @param   {Object} context - السياق
   */
  exception(error, context = {}) {
    const message = `Exception: ${error.message}`;
    const meta = {
      name: error.name,
      stack: error.stack,
      ...context
    };

    const formattedMessage = this.formatMessage('error', message, meta);
    console.error(formattedMessage);

    if (this.logToFile) {
      this.writeToFile('error', message, meta);
    }
  }

  /**
   * @desc    الحصول على إحصائيات السجلات
   * @returns {Object} - الإحصائيات
   */
  getLogStats() {
    try {
      if (!fs.existsSync(this.logDir)) {
        return { totalFiles: 0, totalSize: 0, files: [] };
      }

      const files = fs.readdirSync(this.logDir);
      const stats = {
        totalFiles: files.length,
        totalSize: 0,
        files: []
      };

      files.forEach(file => {
        const filePath = path.join(this.logDir, file);
        const fileStats = fs.statSync(filePath);
        
        stats.totalSize += fileStats.size;
        stats.files.push({
          name: file,
          size: fileStats.size,
          modified: fileStats.mtime
        });
      });

      stats.totalSize = this.formatBytes(stats.totalSize);

      return stats;
    } catch (error) {
      this.error('Failed to get log stats', { error: error.message });
      return { totalFiles: 0, totalSize: 0, files: [] };
    }
  }

  /**
   * @desc    تنسيق البايتات
   */
  formatBytes(bytes) {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  }

  /**
   * @desc    تنظيف السجلات القديمة
   * @param   {number} days - عدد الأيام
   */
  cleanupOldLogs(days = 30) {
    try {
      if (!fs.existsSync(this.logDir)) return;

      const cutoffTime = Date.now() - (days * 24 * 60 * 60 * 1000);
      const files = fs.readdirSync(this.logDir);

      files.forEach(file => {
        const filePath = path.join(this.logDir, file);
        const fileStats = fs.statSync(filePath);

        if (fileStats.mtime.getTime() < cutoffTime) {
          fs.unlinkSync(filePath);
          this.info('Deleted old log file', { file, age: days });
        }
      });
    } catch (error) {
      this.error('Failed to cleanup old logs', { error: error.message });
    }
  }
}

// إنشاء instance من ال logger
const logger = new Logger();

export default logger;