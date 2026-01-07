import BloodPressure from '../models/BloodPressure.js';
import BloodSugar from '../models/BloodSugar.js';
import User from '../models/user.js';

class AlertService {
  
  // التحقق من الإنذارات
  async checkAlerts(userId, medicalRecord) {
    try {
      const alerts = [];

      // التحقق من إنذارات ضغط الدم
      const bpAlerts = await this.checkBloodPressureAlerts(userId, medicalRecord);
      alerts.push(...bpAlerts);

      // التحقق من إنذارات سكر الدم
      const sugarAlerts = await this.checkBloodSugarAlerts(userId, medicalRecord);
      alerts.push(...sugarAlerts);

      // التحقق من إنذارات الاتجاهات
      const trendAlerts = await this.checkTrendAlerts(userId);
      alerts.push(...trendAlerts);

      // إرسال الإنذارات إذا لزم الأمر
      if (alerts.length > 0) {
        await this.sendAlerts(userId, alerts);
      }

      return alerts;

    } catch (error) {
      console.error('Alert check error:', error);
      return [];
    }
  }

  // التحقق من إنذارات ضغط الدم
  async checkBloodPressureAlerts(userId, medicalRecord) {
    const alerts = [];
    const bp = medicalRecord.bloodPressure;

    // أزمة ضغط دم
    if (bp.systolic > 180 || bp.diastolic > 120) {
      alerts.push({
        type: 'critical',
        code: 'BP_CRISIS',
        title: 'أزمة ضغط دم',
        message: 'ضغط الدم في نطاق الخطر! راجع الطبيب فوراً.',
        priority: 'high',
        data: bp
      });
    }

    // ارتفاع خطير في الضغط
    else if (bp.systolic >= 160 || bp.diastolic >= 100) {
      alerts.push({
        type: 'warning',
        code: 'BP_HIGH',
        title: 'ارتفاع شديد في الضغط',
        message: 'ضغط الدم مرتفع بشكل خطير. راجع الطبيب قريباً.',
        priority: 'medium',
        data: bp
      });
    }

    // انخفاض خطير في الضغط
    else if (bp.systolic < 90 || bp.diastolic < 60) {
      alerts.push({
        type: 'warning',
        code: 'BP_LOW',
        title: 'انخفاض شديد في الضغط',
        message: 'ضغط الدم منخفض بشكل خطير.',
        priority: 'medium',
        data: bp
      });
    }

    // تحقق من الاتجاهات الخطيرة
    const trendAlert = await this.checkBPTrendAlert(userId, bp);
    if (trendAlert) {
      alerts.push(trendAlert);
    }

    return alerts;
  }

  // التحقق من إنذارات سكر الدم
  async checkBloodSugarAlerts(userId, medicalRecord) {
    const alerts = [];
    const sugar = medicalRecord.bloodSugar;

    // انخفاض حاد في السكر
    if ((sugar.fasting && sugar.fasting < 70) || (sugar.random && sugar.random < 70)) {
      alerts.push({
        type: 'critical',
        code: 'SUGAR_HYPO',
        title: 'انخفاض حاد في السكر',
        message: 'سكر الدم منخفض بشكل خطر! تناول سكريات فوراً.',
        priority: 'high',
        data: sugar
      });
    }

    // ارتفاع حاد في السكر
    if ((sugar.fasting && sugar.fasting > 300) || (sugar.random && sugar.random > 300)) {
      alerts.push({
        type: 'critical',
        code: 'SUGAR_HYPER',
        title: 'ارتفاع حاد في السكر',
        message: 'سكر الدم مرتفع بشكل خطر! راجع الطبيب فوراً.',
        priority: 'high',
        data: sugar
      });
    }

    // ارتفاع خطير
    else if ((sugar.fasting && sugar.fasting > 250) || (sugar.random && sugar.random > 250)) {
      alerts.push({
        type: 'warning',
        code: 'SUGAR_HIGH',
        title: 'ارتفاع شديد في السكر',
        message: 'سكر الدم مرتفع بشكل خطير.',
        priority: 'medium',
        data: sugar
      });
    }

    return alerts;
  }

  // التحقق من إنذارات الاتجاهات
  async checkTrendAlerts(userId) {
    const alerts = [];
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

    // التحقق من القراءات المتكررة الحرجة
    const criticalBPCount = await BloodPressure.countDocuments({
      userId,
      date: { $gte: twentyFourHoursAgo },
      isCritical: true
    });

    const criticalSugarCount = await BloodSugar.countDocuments({
      userId,
      date: { $gte: twentyFourHoursAgo },
      isCritical: true
    });

    if (criticalBPCount >= 3) {
      alerts.push({
        type: 'warning',
        code: 'BP_TREND_CRITICAL',
        title: 'اتجاه خطير في الضغط',
        message: `تم تسجيل ${criticalBPCount} قراءات حرجة للضغط خلال 24 ساعة.`,
        priority: 'high'
      });
    }

    if (criticalSugarCount >= 3) {
      alerts.push({
        type: 'warning',
        code: 'SUGAR_TREND_CRITICAL',
        title: 'اتجاه خطير في السكر',
        message: `تم تسجيل ${criticalSugarCount} قراءات حرجة للسكر خلال 24 ساعة.`,
        priority: 'high'
      });
    }

    // التحقق من عدم التسجيل
    const noRecordAlert = await this.checkNoRecordAlert(userId);
    if (noRecordAlert) {
      alerts.push(noRecordAlert);
    }

    return alerts;
  }

  // التحقق من إنذار عدم التسجيل
  async checkNoRecordAlert(userId) {
    const fortyEightHoursAgo = new Date();
    fortyEightHoursAgo.setHours(fortyEightHoursAgo.getHours() - 48);

    const lastRecord = await BloodPressure.findOne({ userId })
      .sort({ date: -1 })
      .select('date');

    if (lastRecord && lastRecord.date < fortyEightHoursAgo) {
      return {
        type: 'info',
        code: 'NO_RECORD',
        title: 'انقطاع في التسجيل',
        message: 'لم يتم تسجيل أي قياسات خلال 48 ساعة الماضية.',
        priority: 'low'
      };
    }

    return null;
  }

  // التحقق من إنذار اتجاه الضغط
  async checkBPTrendAlert(userId, currentBP) {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentReadings = await BloodPressure.find({
      userId,
      date: { $gte: sevenDaysAgo }
    }).sort({ date: -1 }).limit(10);

    if (recentReadings.length < 5) return null;

    // حساب الاتجاه
    const systolicTrend = this.calculateTrend(recentReadings.map(r => r.systolic));
    const diastolicTrend = this.calculateTrend(recentReadings.map(r => r.diastolic));

    // إذا كان هناك ارتفاع مستمر
    if (systolicTrend > 10 || diastolicTrend > 5) {
      return {
        type: 'warning',
        code: 'BP_TREND_UP',
        title: 'اتجاه تصاعدي في الضغط',
        message: 'يظهر الضغط اتجاهاً تصاعدياً مستمراً.',
        priority: 'medium',
        data: { systolicTrend, diastolicTrend }
      };
    }

    return null;
  }

  // إرسال الإنذارات
  async sendAlerts(userId, alerts) {
    try {
      const user = await User.findById(userId);
      if (!user) return;

      // فصل الإنذارات حسب الأولوية
      const criticalAlerts = alerts.filter(alert => alert.priority === 'high');
      const warningAlerts = alerts.filter(alert => alert.priority === 'medium');
      const infoAlerts = alerts.filter(alert => alert.priority === 'low');

      // إرسال الإنذارات الحرجة فوراً
      if (criticalAlerts.length > 0) {
        await this.sendImmediateAlerts(user, criticalAlerts);
      }

      // إرسال إنذارات التحذير
      if (warningAlerts.length > 0) {
        await this.sendWarningAlerts(user, warningAlerts);
      }

      // حفظ الإنذارات في قاعدة البيانات
      await this.saveAlertsToDatabase(userId, alerts);

    } catch (error) {
      console.error('Error sending alerts:', error);
    }
  }

  // إرسال إنذارات فورية
  async sendImmediateAlerts(user, alerts) {
    // هنا يمكنك دمج مع خدمات الإشعارات:
    // - إشعارات البريد الإلكتروني
    // - رسائل SMS
    // - إشعارات التطبيق
    // - إلخ...

    console.log('إرسال إنذارات فورية:', {
      to: user.email,
      alerts: alerts.map(a => a.title)
    });

    // مثال لإرسال بريد إلكتروني
    // await this.sendEmailAlert(user, alerts);
  }

  // إرسال إنذارات تحذير
  async sendWarningAlerts(user, alerts) {
    console.log('إرسال إنذارات تحذير:', {
      to: user.email,
      alerts: alerts.map(a => a.title)
    });
  }

  // حفظ الإنذارات في قاعدة البيانات
  async saveAlertsToDatabase(userId, alerts) {
    try {
      const Alert = require('../models/Alert'); // افترض وجود نموذج Alert
      
      for (const alert of alerts) {
        await Alert.findOneAndUpdate(
          { userId, code: alert.code, resolved: false },
          {
            userId,
            ...alert,
            resolved: false,
            createdAt: new Date()
          },
          { upsert: true }
        );
      }
    } catch (error) {
      console.error('Error saving alerts to database:', error);
    }
  }

  // حساب الاتجاه
  calculateTrend(values) {
    if (values.length < 2) return 0;
    
    const first = values[values.length - 1];
    const last = values[0];
    
    return last - first;
  }

  // الحصول على الإنذارات النشطة
  async getActiveAlerts(userId) {
    try {
      const Alert = require('../models/Alert');
      return await Alert.find({
        userId,
        resolved: false
      }).sort({ createdAt: -1 });
    } catch (error) {
      console.error('Error getting active alerts:', error);
      return [];
    }
  }

  // حل الإنذار
  async resolveAlert(userId, alertId) {
    try {
      const Alert = require('../models/Alert');
      await Alert.findByIdAndUpdate(alertId, {
        resolved: true,
        resolvedAt: new Date()
      });
    } catch (error) {
      console.error('Error resolving alert:', error);
      throw new Error('فشل في حل الإنذار');
    }
  }

  // إرسال تذكير بالمتابعة
  async sendFollowupReminder(userId) {
    const user = await User.findById(userId);
    if (!user) return;

    const lastRecord = await BloodPressure.findOne({ userId })
      .sort({ date: -1 });

    if (!lastRecord) return;

    const daysSinceLastRecord = Math.floor(
      (new Date() - lastRecord.date) / (1000 * 60 * 60 * 24)
    );

    if (daysSinceLastRecord >= 2) {
      await this.sendAlerts(userId, [{
        type: 'info',
        code: 'FOLLOWUP_REMINDER',
        title: 'تذكير بالمتابعة',
        message: `مر ${daysSinceLastRecord} أيام منذ آخر قياس. يوصى بتسجيل قياسات جديدة.`,
        priority: 'low'
      }]);
    }
  }
}

export default new AlertService();