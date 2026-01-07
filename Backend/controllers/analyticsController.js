import MedicalRecord from '../models/HealthRecord.js';
import analyticsService from '../services/medicalAnalysisService.js';

class AnalyticsController {

  // الحصول على التحليلات الشاملة
  async getComprehensiveAnalytics(req, res) {
    try {
      const userId = req.user.id;
      const { period = '30d', type = 'all' } = req.query;

      const analytics = await analyticsService.generateComprehensiveReport(userId, period, type);

      res.json({
        success: true,
        data: analytics
      });

    } catch (error) {
      console.error('Error generating analytics:', error);
      res.status(500).json({ error: 'فشل في توليد التحليلات' });
    }
  }

  // تحليل الاتجاهات
  async getTrendAnalysis(req, res) {
    try {
      const userId = req.user.id;
      const { metric, period = '90d' } = req.query;

      const validMetrics = ['systolic', 'diastolic', 'fasting', 'postPrandial'];
      if (!validMetrics.includes(metric)) {
        return res.status(400).json({ error: 'المقياس غير صحيح' });
      }

      const trends = await analyticsService.analyzeTrends(userId, metric, period);

      res.json({
        success: true,
        data: trends
      });

    } catch (error) {
      console.error('Error in trend analysis:', error);
      res.status(500).json({ error: 'فشل في تحليل الاتجاهات' });
    }
  }

  // تقارير المخاطر
  async getRiskReport(req, res) {
    try {
      const userId = req.user.id;

      const riskReport = await medicalAnalysisService.generateRiskReport(userId);

      res.json({
        success: true,
        data: riskReport
      });

    } catch (error) {
      console.error('Error generating risk report:', error);
      res.status(500).json({ error: 'فشل في توليد تقرير المخاطر' });
    }
  }

  // مقارنة الفترات
  async getPeriodComparison(req, res) {
    try {
      const userId = req.user.id;
      const { period1, period2 } = req.query;

      if (!period1 || !period2) {
        return res.status(400).json({ error: 'الفترات مطلوبة للمقارنة' });
      }

      const comparison = await analyticsService.comparePeriods(userId, period1, period2);

      res.json({
        success: true,
        data: comparison
      });

    } catch (error) {
      console.error('Error in period comparison:', error);
      res.status(500).json({ error: 'فشل في المقارنة' });
    }
  }

  // إحصائيات الاستخدام
  async getUsageStats(req, res) {
    try {
      const userId = req.user.id;

      const usageStats = await Analytics.findOne({ userId })
        .sort({ createdAt: -1 });

      // إذا لم توجد إحصائيات، إنشاء جديدة
      const stats = usageStats || await analyticsService.generateUsageStats(userId);

      res.json({
        success: true,
        data: stats
      });

    } catch (error) {
      console.error('Error fetching usage stats:', error);
      res.status(500).json({ error: 'فشل في جلب إحصائيات الاستخدام' });
    }
  }

  // التنبؤات المستقبلية
  async getPredictions(req, res) {
    try {
      const userId = req.user.id;
      const { horizon = 30 } = req.query; // عدد الأيام للتنبؤ

      const predictions = await analyticsService.generatePredictions(userId, parseInt(horizon));

      res.json({
        success: true,
        data: predictions
      });

    } catch (error) {
      console.error('Error generating predictions:', error);
      res.status(500).json({ error: 'فشل في توليد التنبؤات' });
    }
  }

  // تصدير البيانات
  async exportData(req, res) {
    try {
      const userId = req.user.id;
      const { format = 'json', startDate, endDate } = req.query;

      const exportData = await analyticsService.exportUserData(userId, {
        format,
        startDate,
        endDate
      });

      // تعيين رأس الاستجابة حسب الصيغة
      if (format === 'csv') {
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=medical_data.csv');
        return res.send(exportData);
      } else if (format === 'excel') {
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=medical_data.xlsx');
        return res.send(exportData);
      } else {
        res.json({
          success: true,
          data: exportData
        });
      }

    } catch (error) {
      console.error('Error exporting data:', error);
      res.status(500).json({ error: 'فشل في تصدير البيانات' });
    }
  }

  // لوحة التحكم
  async getDashboard(req, res) {
    try {
      const userId = req.user.id;

      const dashboardData = await analyticsService.getDashboardData(userId);

      res.json({
        success: true,
        data: dashboardData
      });

    } catch (error) {
      console.error('Error fetching dashboard:', error);
      res.status(500).json({ error: 'فشل في جلب بيانات لوحة التحكم' });
    }
  }
}

export default new AnalyticsController();