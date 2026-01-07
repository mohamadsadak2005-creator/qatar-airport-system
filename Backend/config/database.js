/**
 * إعدادات وتكوين قاعدة البيانات - PostgreSQL مع TypeORM
 */

import 'dotenv/config.js';
import { DataSource } from 'typeorm';
import path from 'path';
import { fileURLToPath } from 'url';

// احصل على __dirname أولاً
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// الآن قم باستيراد النماذج
import User from '../models/user.js';
import BloodPressure from '../models/BloodPressure.js';
import BloodSugar from '../models/BloodSugar.js';
import HealthRecord from '../models/HealthRecord.js';
import Analytics from '../models/analytics.js';

// استيراد الـ logger بعد تحديد المسار
import logger from '../utils/logger.js';

class Database {
  constructor() {
    this.isConnected = true;
    this.dataSource = null;
    
    this.initializeDataSource();
  }

  /**
   * تهيئة DataSource
   */
  initializeDataSource() {
    const dbConfig = {
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '1234'),
      username: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || '2005',
      database: process.env.DB_NAME || 'projctGL',
      synchronize: process.env.NODE_ENV === 'development' || process.env.DB_SYNC === 'true',
      logging: process.env.DB_LOGGING === 'true',
      logger: 'advanced-console',
      entities: [User, BloodPressure, BloodSugar, HealthRecord, Analytics],
      migrations: [path.join(__dirname, '../migrations/*.js')],
      subscribers: [],
      extra: {
        max: parseInt(process.env.DB_POOL_SIZE || '10'),
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 5000,
      },
    };

    this.dataSource = new DataSource(dbConfig);
  }

  /**
   * الاتصال بقاعدة البيانات
   */
  async connect() {
    try {
      if (this.isConnected && this.dataSource?.isInitialized) {
        console.log('⚠️ قاعدة البيانات متصلة بالفعل');
          this.isConnected = true;
        return this.dataSource;
      }

      console.log('🔌 الاتصال بـ PostgreSQL...', {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 1234,
        database: process.env.DB_NAME || 'projctGL',
      });

      await this.dataSource.initialize();
      this.isConnected = true;

      console.log('✅ تم الاتصال بقاعدة البيانات PostgreSQL بنجاح');

      // إنشاء الجداول تلقائياً إذا كانت المزامنة مفعّلة
      if (this.dataSource.options.synchronize) {
        await this.dataSource.synchronize();
        console.log('✅ تم تحديث مخطط قاعدة البيانات');
        this.isConnected = true;
      }

      return this.dataSource;
    } catch (error) {
      console.error('❌ فشل في الاتصال بـ PostgreSQL:', error.message);
      this.isConnected = false;
      
      // إظهار تفاصيل الخطأ للمساعدة في التصحيح
      console.log('تفاصيل الاتصال:', {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        database: process.env.DB_NAME,
        error: error.code || error.name
      });

      // إذا كان الخطأ هو "password authentication failed"
      if (error.code === '28P01') {
        console.error('❌ خطأ في كلمة مرور PostgreSQL');
        console.log('💡 تأكد من:');
        console.log('1. كلمة المرور في ملف .env صحيحة');
        console.log('2. يمكنك الاتصال بـ pgAdmin أو psql بنفس البيانات');
        console.log('3. حاول الاتصال باستخدام:');
        console.log(`   psql -h ${process.env.DB_HOST} -p ${process.env.DB_PORT} -U ${process.env.DB_USER} -d ${process.env.DB_NAME}`);
      }

      // إذا كان الخطأ هو "database does not exist"
      if (error.code === '3D000') {
        console.error('❌ قاعدة البيانات غير موجودة');
        console.log('💡 قم بإنشاء قاعدة البيانات أولاً:');
        console.log(`   CREATE DATABASE ${process.env.DB_NAME};`);
      }

      // إعادة المحاولة في production
      if (process.env.NODE_ENV === 'production') {
        console.log('🔄 إعادة المحاولة بعد 5 ثوان...');
        setTimeout(() => this.connect(), 5000);
      }
      
      throw error;
    }
  }

  /**
   * قطع الاتصال بقاعدة البيانات
   */
  async closeConnection() {
    try {
      if (this.dataSource && this.dataSource.isInitialized) {
        await this.dataSource.destroy();
        this.isConnected = false;
        console.log('✅ تم إغلاق اتصال PostgreSQL');
      }
    } catch (error) {
      console.error('❌ خطأ في إغلاق اتصال قاعدة البيانات:', error);
    }
  }

  /**
   * الحصول على حالة الاتصال
   */
  getConnectionStatus() {
    if (!this.isConnected || !this.dataSource) {
      return {
        status: 'disconnected',
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 1234,
        database: process.env.DB_NAME || 'projctGL',
      };
    }

    return {
      status: 'connected',
      host: this.dataSource.options.host,
      port: this.dataSource.options.port,
      database: this.dataSource.options.database,
      type: 'PostgreSQL',
      isInitialized: this.dataSource.isInitialized,
    };
  }

  /**
   * الحصول على Repository
   */
  getRepository(entity) {
    if (!this.isConnected || !this.dataSource?.isInitialized) {
      throw new Error('قاعدة البيانات غير متصلة');
    }
    return this.dataSource.getRepository(entity);
  }

  /**
   * تشغيل استعلام مباشر
   */
  async query(queryStr, parameters) {
    if (!this.isConnected || !this.dataSource?.isInitialized) {
      throw new Error('قاعدة البيانات غير متصلة');
    }
    return this.dataSource.query(queryStr, parameters);
  }

  /**
   * تشغيل الهجرات
   */
  async runMigrations() {
    try {
      console.log('🔄 تشغيل الهجرات...');
      await this.dataSource.runMigrations();
      console.log('✅ تم تشغيل الهجرات بنجاح');
    } catch (error) {
      console.error('❌ فشل في تشغيل الهجرات:', error);
      throw error;
    }
  }

  /**
   * استعادة آخر هجرة
   */
  async revertMigration() {
    try {
      console.log('🔄 استعادة آخر هجرة...');
      await this.dataSource.undoLastMigration();
      console.log('✅ تم استعادة الهجرة بنجاح');
    } catch (error) {
      console.error('❌ فشل في استعادة الهجرة:', error);
      throw error;
    }
  }

  /**
   * فحص صحة الاتصال
   */
  async healthCheck() {
    try {
      if (!this.isConnected || !this.dataSource?.isInitialized) {
        return { healthy: false, message: 'Database not connected' };
      }

      // تشغيل استعلام بسيط للتحقق
      const result = await this.query('SELECT NOW() as current_time');
      return {
        healthy: true,
        message: 'Database is connected',
        timestamp: result[0].current_time,
        details: this.getConnectionStatus()
      };
    } catch (error) {
      return {
        healthy: false,
        message: 'Database connection failed',
        error: error.message
      };
    }
  }
}

// إنشاء instance واحد
const database = new Database();

// اتصال تلقائي عند التحميل (اختياري)
database.connect().catch(console.error);

// تصدير
export default database;