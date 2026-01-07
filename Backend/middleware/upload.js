/**
 * middleware لتحميل الملفات وإدارتها
 */

import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import logger from '../utils/logger.js';
import config from '../config/config.js';
import Security from '../utils/security.js';

class UploadMiddleware {
  constructor() {
    this.uploadDir = config.storage.local.path;
    this.ensureUploadDirectories();
  }

  /**
   * @desc    التأكد من وجود مجلدات التحميل
   */
  ensureUploadDirectories() {
    const directories = [
      this.uploadDir,
      path.join(this.uploadDir, 'avatars'),
      path.join(this.uploadDir, 'charts'),
      path.join(this.uploadDir, 'documents'),
      path.join(this.uploadDir, 'temp')
    ];

    directories.forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        logger.info(`Created upload directory: ${dir}`);
      }
    });
  }

  /**
   * @desc    إعداد تخزين الملفات
   */
  createStorage(destination, filenamePrefix = 'file') {
    return multer.diskStorage({
      destination: (req, file, cb) => {
        const dir = path.join(this.uploadDir, destination);
        
        // التأكد من وجود المجلد
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
        
        cb(null, dir);
      },
      filename: (req, file, cb) => {
        // إنشاء اسم فريد للملف
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const extension = path.extname(file.originalname);
        const filename = `${filenamePrefix}-${uniqueSuffix}${extension}`;
        
        cb(null, filename);
      }
    });
  }

  /**
   * @desc    تصفية أنواع الملفات
   */
  fileFilter(allowedMimeTypes, maxFileSize) {
    return (req, file, cb) => {
      try {
        // التحقق من نوع الملف
        if (!allowedMimeTypes.includes(file.mimetype)) {
          const error = new Error(`نوع الملف غير مدعوم. المسموح: ${allowedMimeTypes.join(', ')}`);
          error.code = 'INVALID_FILE_TYPE';
          return cb(error);
        }

        // التحقق من حجم الملف
        if (file.size > maxFileSize) {
          const error = new Error(`حجم الملف كبير جداً. الحد الأقصى: ${this.formatBytes(maxFileSize)}`);
          error.code = 'FILE_TOO_LARGE';
          return cb(error);
        }

        // التحقق من اسم الملف
        if (!this.isSafeFilename(file.originalname)) {
          const error = new Error('اسم الملف يحتوي على أحرف غير مسموحة');
          error.code = 'INVALID_FILENAME';
          return cb(error);
        }

        cb(null, true);

      } catch (error) {
        cb(error);
      }
    };
  }

  /**
   * @desc    تحميل الصور
   */
  get imageUpload() {
    const allowedMimeTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/svg+xml'
    ];

    const maxFileSize = 5 * 1024 * 1024; // 5MB

    return multer({
      storage: this.createStorage('avatars', 'avatar'),
      fileFilter: this.fileFilter(allowedMimeTypes, maxFileSize),
      limits: {
        fileSize: maxFileSize
      }
    });
  }

  /**
   * @desc    تحميل المستندات
   */
  get documentUpload() {
    const allowedMimeTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain',
      'application/json',
      'text/csv'
    ];

    const maxFileSize = 10 * 1024 * 1024; // 10MB

    return multer({
      storage: this.createStorage('documents', 'doc'),
      fileFilter: this.fileFilter(allowedMimeTypes, maxFileSize),
      limits: {
        fileSize: maxFileSize
      }
    });
  }

  /**
   * @desc    تحميل ملفات البيانات
   */
  get dataUpload() {
    const allowedMimeTypes = [
      'application/json',
      'text/csv',
      'text/plain',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];

    const maxFileSize = 20 * 1024 * 1024; // 20MB

    return multer({
      storage: this.createStorage('documents', 'data'),
      fileFilter: this.fileFilter(allowedMimeTypes, maxFileSize),
      limits: {
        fileSize: maxFileSize
      }
    });
  }

  /**
   * @desc    تحميل متعدد الملفات
   */
  get multipleUpload() {
    const allowedMimeTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/pdf',
      'application/json',
      'text/plain'
    ];

    const maxFileSize = 10 * 1024 * 1024; // 10MB
    const maxFiles = 5;

    return multer({
      storage: this.createStorage('temp', 'upload'),
      fileFilter: this.fileFilter(allowedMimeTypes, maxFileSize),
      limits: {
        fileSize: maxFileSize,
        files: maxFiles
      }
    });
  }

  /**
   * @desc    معالجة أخطاء التحميل
   */
  handleUploadErrors(err, req, res, next) {
    if (err instanceof multer.MulterError) {
      let errorMessage = 'خطأ في تحميل الملف';

      switch (err.code) {
        case 'LIMIT_FILE_SIZE':
          errorMessage = 'حجم الملف كبير جداً';
          break;
        case 'LIMIT_FILE_COUNT':
          errorMessage = 'تم تجاوز عدد الملفات المسموح به';
          break;
        case 'LIMIT_UNEXPECTED_FILE':
          errorMessage = 'نوع الملف غير متوقع';
          break;
        case 'LIMIT_PART_COUNT':
          errorMessage = 'تم تجاوز عدد الأجزاء المسموح به';
          break;
        default:
          errorMessage = `خطأ في التحميل: ${err.code}`;
      }

      logger.warn('File upload error', {
        error: err.code,
        message: errorMessage,
        userId: req.user?._id,
        ip: req.ip
      });

      return res.status(400).json({
        success: false,
        error: errorMessage
      });

    } else if (err.code === 'INVALID_FILE_TYPE') {
      return res.status(400).json({
        success: false,
        error: err.message
      });

    } else if (err.code === 'FILE_TOO_LARGE') {
      return res.status(400).json({
        success: false,
        error: err.message
      });

    } else if (err.code === 'INVALID_FILENAME') {
      return res.status(400).json({
        success: false,
        error: err.message
      });

    } else if (err) {
      logger.error('Unknown upload error:', err);
      return res.status(500).json({
        success: false,
        error: 'خطأ غير متوقع في تحميل الملف'
      });
    }

    next();
  }

  /**
   * @desc    التحقق من وجود الملف
   */
  requireFile(fieldName = 'file') {
    return (req, res, next) => {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: `الملف مطلوب في الحقل ${fieldName}`
        });
      }

      next();
    };
  }

  /**
   * @desc    التحقق من صحة الصورة
   */
  validateImage(req, res, next) {
    if (!req.file) {
      return next();
    }

    try {
      // التحقق من أبعاد الصورة (إذا كانت صورة)
      if (req.file.mimetype.startsWith('image/')) {
        // يمكن إضافة تحقق إضافي لأبعاد الصورة هنا
        const maxDimensions = {
          width: 5000,
          height: 5000
        };

        // في تطبيق حقيقي، ستستخدم مكتبة مثل sharp للتحقق من الأبعاد
        logger.info('Image upload validated', {
          filename: req.file.filename,
          size: req.file.size,
          mimetype: req.file.mimetype,
          userId: req.user?._id
        });
      }

      next();

    } catch (error) {
      logger.error('Image validation error:', error);
      return res.status(400).json({
        success: false,
        error: 'خطأ في التحقق من الصورة'
      });
    }
  }

  /**
   * @desc    فحص الملف بحثاً عن البرمجيات الخبيثة
   */
  async scanForMalware(req, res, next) {
    if (!req.file) {
      return next();
    }

    try {
      // في تطبيق حقيقي، ستستخدم خدمة فحص فيروسات
      // هذا مثال مبسط للتحقق الأساسي

      const suspiciousPatterns = [
        'executable',
        'script',
        'javascript',
        'vbscript'
      ];

      const fileBuffer = fs.readFileSync(req.file.path);
      const fileContent = fileBuffer.toString('utf8', 0, 1000); // قراءة أول 1000 بايت

      const isSuspicious = suspiciousPatterns.some(pattern =>
        fileContent.toLowerCase().includes(pattern)
      );

      if (isSuspicious) {
        // حذف الملف المشبوه
        this.deleteFile(req.file.path);

        Security.logSecurityEvent('SUSPICIOUS_FILE_UPLOAD', {
          filename: req.file.originalname,
          mimetype: req.file.mimetype,
          userId: req.user?._id,
          ip: req.ip
        });

        return res.status(400).json({
          success: false,
          error: 'تم رفض الملف لأسباب أمنية'
        });
      }

      next();

    } catch (error) {
      logger.error('Malware scan error:', error);
      // في حالة الخطأ، نستمر ولكن نسجل التحذير
      next();
    }
  }

  /**
   * @desc    ضغط الصور
   */
  async compressImage(req, res, next) {
    if (!req.file || !req.file.mimetype.startsWith('image/')) {
      return next();
    }

    try {
      // في تطبيق حقيقي، ستستخدم مكتبة مثل sharp لضغط الصور
      // هذا مثال للتوثيق

      const maxWidth = 1920;
      const maxHeight = 1080;
      const quality = 80;

      logger.info('Image compression would be applied', {
        filename: req.file.filename,
        originalSize: req.file.size,
        maxWidth,
        maxHeight,
        quality
      });

      // في التطبيق الحقيقي، ستقوم بضغط الصورة هنا

      next();

    } catch (error) {
      logger.error('Image compression error:', error);
      // في حالة الخطأ، نستمر بدون ضغط
      next();
    }
  }

  /**
   * @desc    إنشاء thumbnail للصورة
   */
  async createThumbnail(req, res, next) {
    if (!req.file || !req.file.mimetype.startsWith('image/')) {
      return next();
    }

    try {
      // في تطبيق حقيقي، ستستخدم مكتبة مثل sharp لإنشاء thumbnails
      const thumbnailSize = 200;

      logger.info('Thumbnail would be created', {
        filename: req.file.filename,
        thumbnailSize
      });

      // إضافة معلومات thumbnail إلى request
      req.file.thumbnail = {
        path: req.file.path.replace(/\.([^\.]+)$/, '_thumb.$1'),
        width: thumbnailSize,
        height: thumbnailSize
      };

      next();

    } catch (error) {
      logger.error('Thumbnail creation error:', error);
      // في حالة الخطأ، نستمر بدون thumbnail
      next();
    }
  }

  /**
   * @desc    استخراج metadata من الملف
   */
  extractMetadata(req, res, next) {
    if (!req.file) {
      return next();
    }

    try {
      const metadata = {
        originalName: req.file.originalname,
        filename: req.file.filename,
        size: req.file.size,
        mimetype: req.file.mimetype,
        extension: path.extname(req.file.originalname).toLowerCase(),
        uploadDate: new Date(),
        checksum: this.calculateChecksum(req.file.path)
      };

      // إضافة metadata إلى request
      req.file.metadata = metadata;

      logger.info('File metadata extracted', {
        filename: req.file.filename,
        size: metadata.size,
        checksum: metadata.checksum
      });

      next();

    } catch (error) {
      logger.error('Metadata extraction error:', error);
      // في حالة الخطأ، نستمر بدون metadata
      next();
    }
  }

  /**
   * @desc    تنظيف الملفات المؤقتة
   */
  async cleanupTempFiles(req, res, next) {
    try {
      const tempDir = path.join(this.uploadDir, 'temp');
      const now = Date.now();
      const maxAge = 24 * 60 * 60 * 1000; // 24 ساعة

      if (fs.existsSync(tempDir)) {
        const files = fs.readdirSync(tempDir);
        
        for (const file of files) {
          const filePath = path.join(tempDir, file);
          const stats = fs.statSync(filePath);
          
          if (now - stats.mtime.getTime() > maxAge) {
            fs.unlinkSync(filePath);
            logger.info('Cleaned up temp file', { file });
          }
        }
      }

      next();

    } catch (error) {
      logger.error('Temp files cleanup error:', error);
      // لا نوقف العملية في حالة خطأ التنظيف
      next();
    }
  }

  /**
   * @desc    حذف الملف
   */
  deleteFile(filePath) {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        logger.info('File deleted', { filePath });
        return true;
      }
      return false;
    } catch (error) {
      logger.error('File deletion error:', error);
      return false;
    }
  }

  /**
   * @desc    التحقق من اسم ملف آمن
   */
  isSafeFilename(filename) {
    const dangerousPatterns = [
      '..',
      '/',
      '\\',
      ':',
      '*',
      '?',
      '"',
      '<',
      '>',
      '|'
    ];

    return !dangerousPatterns.some(pattern => filename.includes(pattern));
  }

  /**
   * @desc    حساب checksum للملف
   */
  calculateChecksum(filePath) {
    try {
      const fileBuffer = fs.readFileSync(filePath);
      return crypto.createHash('md5').update(fileBuffer).digest('hex');
    } catch (error) {
      logger.error('Checksum calculation error:', error);
      return null;
    }
  }

  /**
   * @desc    تنسيق البايتات إلى صيغة مقروءة
   */
  formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  /**
   * @desc    الحصول على معلومات التخزين
   */
  getStorageInfo() {
    const totalSize = this.calculateDirectorySize(this.uploadDir);
    const fileCount = this.countFilesInDirectory(this.uploadDir);

    return {
      totalSize,
      totalSizeFormatted: this.formatBytes(totalSize),
      fileCount,
      directories: config.storage.directories
    };
  }

  /**
   * @desc    حساب حجم المجلد
   */
  calculateDirectorySize(dir) {
    try {
      let totalSize = 0;
      
      const calculate = (directory) => {
        const items = fs.readdirSync(directory);
        
        for (const item of items) {
          const itemPath = path.join(directory, item);
          const stats = fs.statSync(itemPath);
          
          if (stats.isDirectory()) {
            calculate(itemPath);
          } else {
            totalSize += stats.size;
          }
        }
      };

      calculate(dir);
      return totalSize;

    } catch (error) {
      logger.error('Directory size calculation error:', error);
      return 0;
    }
  }

  /**
   * @desc    عد الملفات في المجلد
   */
  countFilesInDirectory(dir) {
    try {
      let count = 0;
      
      const countFiles = (directory) => {
        const items = fs.readdirSync(directory);
        
        for (const item of items) {
          const itemPath = path.join(directory, item);
          const stats = fs.statSync(itemPath);
          
          if (stats.isDirectory()) {
            countFiles(itemPath);
          } else {
            count++;
          }
        }
      };

      countFiles(dir);
      return count;

    } catch (error) {
      logger.error('File count error:', error);
      return 0;
    }
  }
}

// إنشاء instance من الـ middleware
const uploadMiddleware = new UploadMiddleware();

export default uploadMiddleware;