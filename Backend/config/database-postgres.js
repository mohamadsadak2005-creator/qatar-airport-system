/**
 * إعدادات قاعدة البيانات - PostgreSQL مع TypeORM
 */

import 'dotenv/config.js';
import { DataSource } from 'typeorm';
import path from 'path';
import { fileURLToPath } from 'url';
import logger from '../utils/logger.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

class Database {
  constructor() {
    this.isConnected = false;
    this.connection = null;
    this.dataSource = new DataSource({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '1234'),
      username: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || '2005',
      database: process.env.DB_NAME || 'projctGL',
      synchronize: process.env.NODE_ENV === 'development' || process.env.DB_SYNC === 'true',
      logging: process.env.DB_LOGGING === 'true',
      logger: 'advanced-console',
      entities: [
        path.join(__dirname, '../models/user.js'),
        path.join(__dirname, '../models/BloodPressure.js'),
        path.join(__dirname, '../models/BloodSugar.js'),
        path.join(__dirname, '../models/HealthRecord.js'),
        path.join(__dirname, '../models/analytics.js'),
      ],
      migrations: [path.join(__dirname, '../migrations/*.js')],
      subscribers: [],
      extra: {
        max: parseInt(process.env.DB_POOL_SIZE || '10'),
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 5000,
      },
    });
  }

  /**
   * الاتصال بقاعدة البيانات
   */
  async connect() {
    try {
      if (this.isConnected) {
        logger.warn('قاعدة البيانات متصلة بالفعل');
        return;
      }

      logger.info('🔌 الاتصال بـ PostgreSQL...', {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 1234,
        database: process.env.DB_NAME || 'project_cli',
      });

      await this.dataSource.initialize();
      this.isConnected = true;
      this.connection = this.dataSource;

      logger.success('✅ تم الاتصال بقاعدة البيانات PostgreSQL بنجاح');

      // إنشء الجداول تلقائياً إذا كانت التجامع مفعّل
      if (this.dataSource.options.synchronize) {
        await this.dataSource.synchronize();
        logger.info('✅ تم تحديث مخطط قاعدة البيانات');
      }

      return this.dataSource;
    } catch (error) {
      logger.error('❌ فشل في الاتصال بـ PostgreSQL:', error);
      this.isConnected = false;
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
        logger.info('✅ تم إغلاق اتصال PostgreSQL');
      }
    } catch (error) {
      logger.error('❌ خطأ في إغلاق اتصال قاعدة البيانات:', error);
    }
  }

  /**
   * الحصول على حالة الاتصال
   */
  getConnectionStatus() {
    if (!this.isConnected || !this.dataSource) {
      return {
        status: 'disconnected',
        host: null,
        port: null,
        database: null,
      };
    }

    return {
      status: 'connected',
      host: this.dataSource.options.host,
      port: this.dataSource.options.port,
      database: this.dataSource.options.database,
      type: 'PostgreSQL',
    };
  }

  /**
   * الحصول على مستودع (Repository)
   */
  getRepository(entity) {
    if (!this.isConnected || !this.dataSource) {
      throw new Error('قاعدة البيانات غير متصلة');
    }
    return this.dataSource.getRepository(entity);
  }

  /**
   * تشغيل استعلام مباشر
   */
  async query(query, parameters) {
    if (!this.isConnected || !this.dataSource) {
      throw new Error('قاعدة البيانات غير متصلة');
    }
    return this.dataSource.query(query, parameters);
  }

  /**
   * بدء معاملة
   */
  async startTransaction() {
    if (!this.isConnected || !this.dataSource) {
      throw new Error('قاعدة البيانات غير متصلة');
    }
    return this.dataSource.transaction(async (transactionEntityManager) => {
      return transactionEntityManager;
    });
  }

  /**
   * تشغيل الهجرات
   */
  async runMigrations() {
    try {
      logger.info('🔄 تشغيل الهجرات...');
      await this.dataSource.runMigrations();
      logger.success('✅ تم تشغيل الهجرات بنجاح');
    } catch (error) {
      logger.error('❌ فشل في تشغيل الهجرات:', error);
      throw error;
    }
  }

  /**
   * استعادة الهجرات
   */
  async revertMigration() {
    try {
      logger.info('🔄 استعادة آخر هجرة...');
      await this.dataSource.undoLastMigration();
      logger.success('✅ تم استعادة الهجرة بنجاح');
    } catch (error) {
      logger.error('❌ فشل في استعادة الهجرة:', error);
      throw error;
    }
  }
}

// إنشاء instance واحد
const database = new Database();

// تصدير
export default database;
