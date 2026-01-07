import database from '../config/database.js';
import MedicalRecord from '../models/HealthRecord.js';
import BloodPressure from '../models/BloodPressure.js';
import BloodSugar from '../models/BloodSugar.js';
import geminiService from '../services/geminiService.js';
import medicalAnalysisService from '../services/medicalAnalysisService.js';
import alertService from '../services/alertService.js';

class MedicalController {
  
  // إضافة سجل طبي جديد (TypeORM)
  async addMedicalRecord(req, res) {
    try {
      const { bloodPressure, bloodSugar, symptoms, notes } = req.body;
      const userId = req.user.id;

      // التحقق من البيانات
      if (!bloodPressure || !bloodPressure.systolic || !bloodPressure.diastolic) {
        return res.status(400).json({ error: 'بيانات ضغط الدم مطلوبة' });
      }

      // إنشاء السجل الطبي باستخدام TypeORM
      const medicalRepo = database.getRepository(MedicalRecord);
      const medicalRecord = medicalRepo.create({
        userId,
        bloodPressure,
        bloodSugar: bloodSugar || {},
        symptoms: symptoms || [],
        notes
      });

      // تحليل البيانات باستخدام Gemini AI
      const aiAnalysis = await geminiService.analyzeMedicalData({
        bloodPressure,
        bloodSugar,
        symptoms
      });

      medicalRecord.aiAnalysis = aiAnalysis;
      await medicalRepo.save(medicalRecord);

      // التحقق من الإنذارات
      await alertService.checkAlerts(userId, medicalRecord);

      res.status(201).json({
        success: true,
        message: 'تم إضافة السجل الطبي بنجاح',
        data: medicalRecord,
        aiAnalysis
      });

    } catch (error) {
      console.error('Error adding medical record:', error);
      res.status(500).json({ error: 'فشل في إضافة السجل الطبي' });
    }
  }

  // الحصول على السجلات الطبية (TypeORM)
  async getMedicalRecords(req, res) {
    try {
      const userId = req.user.id;
      const { startDate, endDate, limit = 50 } = req.query;

      const medicalRepo = database.getRepository(MedicalRecord);
      let where = { userId };
      
      // فلترة حسب التاريخ
      if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) where.createdAt.$gte = new Date(startDate);
        if (endDate) where.createdAt.$lte = new Date(endDate);
      }

      const records = await medicalRepo.find({
        where,
        order: { createdAt: 'DESC' },
        take: parseInt(limit)
      });

      res.json({
        success: true,
        data: records,
        total: records.length
      });

    } catch (error) {
      console.error('Error fetching medical records:', error);
      res.status(500).json({ error: 'فشل في جلب السجلات الطبية' });
    }
  }

  // الحصول على تحليل الذكاء الاصطناعي (TypeORM)
  async getAIAnalysis(req, res) {
    try {
      const userId = req.user.id;
      const { recordId } = req.query;

      const medicalRepo = database.getRepository(MedicalRecord);
      let medicalData;
      
      if (recordId) {
        // تحليل سجل محدد
        medicalData = await medicalRepo.findOne({ where: { id: recordId, userId } });
      } else {
        // تحليل آخر 30 يوم
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        medicalData = await medicalRepo.find({
          where: { userId, createdAt: { $gte: thirtyDaysAgo } },
          order: { createdAt: 'DESC' }
        });
      }

      if (!medicalData) {
        return res.status(404).json({ error: 'لم يتم العثور على البيانات' });
      }

      const analysis = await medicalAnalysisService.comprehensiveAnalysis(medicalData);

      res.json({
        success: true,
        data: analysis
      });

    } catch (error) {
      console.error('Error in AI analysis:', error);
      res.status(500).json({ error: 'فشل في التحليل' });
    }
  }

  // الحصول على الإحصائيات
  async getMedicalStats(req, res) {
    try {
      const userId = req.user.id;
      const { period = '30d' } = req.query; // 7d, 30d, 90d, 1y

      const stats = await medicalAnalysisService.getStatistics(userId, period);

      res.json({
        success: true,
        data: stats
      });

    } catch (error) {
      console.error('Error fetching stats:', error);
      res.status(500).json({ error: 'فشل في جلب الإحصائيات' });
    }
  }

  // تحديث سجل طبي (TypeORM)
  async updateMedicalRecord(req, res) {
    try {
      const { recordId } = req.params;
      const updateData = req.body;
      const userId = req.user.id;

      const medicalRepo = database.getRepository(MedicalRecord);
      
      // تحديث السجل
      await medicalRepo.update(
        { id: recordId, userId },
        updateData
      );

      // جلب السجل المحدث
      const record = await medicalRepo.findOne({ where: { id: recordId, userId } });

      if (!record) {
        return res.status(404).json({ error: 'السجل غير موجود' });
      }

      res.json({
        success: true,
        message: 'تم تحديث السجل بنجاح',
        data: record
      });

    } catch (error) {
      console.error('Error updating record:', error);
      res.status(500).json({ error: 'فشل في تحديث السجل' });
    }
  }

  // حذف سجل طبي (TypeORM)
  async deleteMedicalRecord(req, res) {
    try {
      const { recordId } = req.params;
      const userId = req.user.id;

      const medicalRepo = database.getRepository(MedicalRecord);
      const result = await medicalRepo.delete({ id: recordId, userId });

      if (result.affected === 0) {
        return res.status(404).json({ error: 'السجل غير موجود' });
      }

      res.json({
        success: true,
        message: 'تم حذف السجل بنجاح'
      });

    } catch (error) {
      console.error('Error deleting record:', error);
      res.status(500).json({ error: 'فشل في حذف السجل' });
    }
  }

  // إضافة قراءة ضغط الدم (TypeORM)
  async addBloodPressure(req, res) {
    try {
      const { systolic, diastolic, notes } = req.body;
      const userId = req.user.id;

      const bpRepo = database.getRepository(BloodPressure);
      const reading = bpRepo.create({
        userId,
        systolic,
        diastolic,
        notes
      });

      await bpRepo.save(reading);

      // التحقق من الإنذارات
      await alertService.checkAlerts(userId, { bloodPressure: { systolic, diastolic } });

      res.status(201).json({
        success: true,
        message: 'تم تسجيل قراءة ضغط الدم بنجاح',
        data: reading
      });
    } catch (error) {
      console.error('Error adding blood pressure:', error);
      res.status(500).json({ error: 'فشل في تسجيل القراءة' });
    }
  }

  // إضافة قراءة السكر (TypeORM)
  async addBloodSugar(req, res) {
    try {
      const { value, time, notes } = req.body;
      const userId = req.user.id;

      const sugarRepo = database.getRepository(BloodSugar);
      const reading = sugarRepo.create({
        userId,
        value,
        time,
        notes
      });

      await sugarRepo.save(reading);

      // التحقق من الإنذارات
      await alertService.checkAlerts(userId, { bloodSugar: { value } });

      res.status(201).json({
        success: true,
        message: 'تم تسجيل قراءة السكر بنجاح',
        data: reading
      });
    } catch (error) {
      console.error('Error adding blood sugar:', error);
      res.status(500).json({ error: 'فشل في تسجيل القراءة' });
    }
  }

  // الحصول على سجل ضغط الدم
  async getBloodPressureHistory(req, res) {
    try {
      const userId = req.user.id;
      const { limit = 30, days = 30 } = req.query;

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const history = await BloodPressure.find({
        userId,
        createdAt: { $gte: startDate }
      })
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

      res.json({
        success: true,
        data: history,
        count: history.length
      });
    } catch (error) {
      console.error('Error fetching blood pressure history:', error);
      res.status(500).json({ error: 'فشل في جلب السجل' });
    }
  }

  // الحصول على سجل السكر
  async getBloodSugarHistory(req, res) {
    try {
      const userId = req.user.id;
      const { limit = 30, days = 30 } = req.query;

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const history = await BloodSugar.find({
        userId,
        createdAt: { $gte: startDate }
      })
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

      res.json({
        success: true,
        data: history,
        count: history.length
      });
    } catch (error) {
      console.error('Error fetching blood sugar history:', error);
      res.status(500).json({ error: 'فشل في جلب السجل' });
    }
  }

  // الحصول على أحدث القراءات
  async getLatestReadings(req, res) {
    try {
      const userId = req.user.id;

      const latestBP = await BloodPressure.findOne({ userId })
        .sort({ createdAt: -1 });

      const latestBS = await BloodSugar.findOne({ userId })
        .sort({ createdAt: -1 });

      res.json({
        success: true,
        data: {
          bloodPressure: latestBP,
          bloodSugar: latestBS
        }
      });
    } catch (error) {
      console.error('Error fetching latest readings:', error);
      res.status(500).json({ error: 'فشل في جلب البيانات' });
    }
  }

  // البحث في السجلات
  async searchRecords(req, res) {
    try {
      const userId = req.user.id;
      const { query, type } = req.query;

      let searchQuery = { userId };

      if (type === 'medical') {
        searchQuery = MedicalRecord.find({
          ...searchQuery,
          $or: [
            { symptoms: { $regex: query, $options: 'i' } },
            { notes: { $regex: query, $options: 'i' } }
          ]
        });
      }

      const results = await searchQuery.limit(50).sort({ createdAt: -1 });

      res.json({
        success: true,
        data: results,
        count: results.length
      });
    } catch (error) {
      console.error('Error searching records:', error);
      res.status(500).json({ error: 'فشل في البحث' });
    }
  }
}

export default new MedicalController();