import MedicalRecord from '../models/HealthRecord.js';
import BloodPressure from '../models/BloodPressure.js';
import BloodSugar from '../models/BloodSugar.js';

class AnalyticsService {

  // توليد تقرير شامل
  async generateComprehensiveReport(userId, period = '30d', type = 'all') {
    try {
      const startDate = this.calculateStartDate(period);
      
      const [bpData, sugarData, medicalRecords] = await Promise.all([
        BloodPressure.find({ userId, date: { $gte: startDate } }),
        BloodSugar.find({ userId, date: { $gte: startDate } }),
        MedicalRecord.find({ userId, date: { $gte: startDate } })
      ]);

      const report = {
        period: period,
        generatedAt: new Date(),
        summary: await this.generateSummary(bpData, sugarData, medicalRecords),
        trends: await this.analyzeTrends(bpData, sugarData),
        insights: await this.generateInsights(bpData, sugarData, medicalRecords),
        recommendations: await this.generateAnalyticsRecommendations(bpData, sugarData),
        charts: await this.prepareChartData(bpData, sugarData),
        statistics: this.calculateStatistics(bpData, sugarData)
      };

      // حفظ التقرير في قاعدة البيانات
      await this.saveAnalyticsReport(userId, report);

      return report;

    } catch (error) {
      console.error('Comprehensive report error:', error);
      throw new Error('فشل في توليد التقرير الشامل');
    }
  }

  // تحليل الاتجاهات
  async analyzeTrends(userId, metric, period = '90d') {
    const startDate = this.calculateStartDate(period);
    
    let data;
    if (metric === 'systolic' || metric === 'diastolic') {
      data = await BloodPressure.find({ 
        userId, 
        date: { $gte: startDate } 
      }).sort({ date: 1 });
    } else {
      data = await BloodSugar.find({ 
        userId, 
        measurementType: metric === 'fasting' ? 'fasting' : 'post_prandial',
        date: { $gte: startDate } 
      }).sort({ date: 1 });
    }

    return {
      metric: metric,
      period: period,
      dataPoints: data.length,
      trend: this.calculateTrend(data, metric),
      slope: this.calculateSlope(data, metric),
      volatility: this.calculateVolatility(data, metric),
      prediction: this.predictNextValue(data, metric)
    };
  }

  // مقارنة الفترات
  async comparePeriods(userId, period1, period2) {
    const [report1, report2] = await Promise.all([
      this.generateComprehensiveReport(userId, period1),
      this.generateComprehensiveReport(userId, period2)
    ]);

    return {
      comparison: {
        period1: period1,
        period2: period2,
        bloodPressure: this.compareMetrics(report1.statistics.bloodPressure, report2.statistics.bloodPressure),
        bloodSugar: this.compareMetrics(report1.statistics.bloodSugar, report2.statistics.bloodSugar),
        overall: this.compareOverall(report1.summary, report2.summary)
      },
      improvements: this.detectImprovements(report1, report2),
      deteriorations: this.detectDeteriorations(report1, report2)
    };
  }

  // توليد إحصائيات الاستخدام
  async generateUsageStats(userId) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const stats = await Analytics.aggregate([
      {
        $match: {
          userId: userId,
          createdAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: null,
          totalRecords: { $sum: '$recordCount' },
          averageDailyRecords: { $avg: '$recordCount' },
          mostActiveDay: { $max: '$recordCount' },
          lastUpdate: { $max: '$createdAt' }
        }
      }
    ]);

    const usageStats = stats[0] || {
      totalRecords: 0,
      averageDailyRecords: 0,
      mostActiveDay: 0,
      lastUpdate: new Date()
    };

    // حفظ إحصائيات الاستخدام
    await Analytics.findOneAndUpdate(
      { userId },
      {
        userId,
        recordCount: usageStats.totalRecords,
        averageDaily: usageStats.averageDailyRecords,
        complianceRate: this.calculateComplianceRate(usageStats),
        lastActivity: new Date()
      },
      { upsert: true, new: true }
    );

    return usageStats;
  }

  // توليد التنبؤات
  async generatePredictions(userId, horizon = 30) {
    const historicalData = await this.getHistoricalData(userId, '180d');
    
    return {
      horizon: `${horizon} يوم`,
      bloodPressure: this.predictBloodPressure(historicalData.bpData, horizon),
      bloodSugar: this.predictBloodSugar(historicalData.sugarData, horizon),
      risks: this.predictRisks(historicalData, horizon),
      confidence: this.calculateConfidence(historicalData)
    };
  }

  // تصدير البيانات
  async exportUserData(userId, options = {}) {
    const { format = 'json', startDate, endDate } = options;
    
    const query = { userId };
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const [bpData, sugarData, medicalRecords] = await Promise.all([
      BloodPressure.find(query),
      BloodSugar.find(query),
      MedicalRecord.find(query)
    ]);

    const exportData = {
      metadata: {
        exportedAt: new Date(),
        format: format,
        period: `${startDate} to ${endDate}`,
        recordCount: {
          bloodPressure: bpData.length,
          bloodSugar: sugarData.length,
          medical: medicalRecords.length
        }
      },
      bloodPressure: bpData,
      bloodSugar: sugarData,
      medicalRecords: medicalRecords
    };

    if (format === 'csv') {
      return this.convertToCSV(exportData);
    } else if (format === 'excel') {
      return this.convertToExcel(exportData);
    }

    return exportData;
  }

  // بيانات لوحة التحكم
  async getDashboardData(userId) {
    const [recentRecords, stats, alerts, trends] = await Promise.all([
      this.getRecentRecords(userId),
      this.getQuickStats(userId),
      this.getActiveAlerts(userId),
      this.getDashboardTrends(userId)
    ]);

    return {
      recentActivity: recentRecords,
      quickStats: stats,
      activeAlerts: alerts,
      trends: trends,
      lastUpdated: new Date()
    };
  }

  // الطرق المساعدة
  calculateStartDate(period) {
    const days = parseInt(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    return startDate;
  }

  async generateSummary(bpData, sugarData, medicalRecords) {
    return {
      totalReadings: bpData.length + sugarData.length,
      averageBP: this.calculateAverageBP(bpData),
      averageSugar: this.calculateAverageSugar(sugarData),
      controlRate: this.calculateControlRate(bpData, sugarData),
      riskLevel: this.assessOverallRisk(bpData, sugarData)
    };
  }

  calculateAverageBP(bpData) {
    if (bpData.length === 0) return { systolic: 0, diastolic: 0 };
    
    const avgSystolic = bpData.reduce((sum, record) => sum + record.systolic, 0) / bpData.length;
    const avgDiastolic = bpData.reduce((sum, record) => sum + record.diastolic, 0) / bpData.length;
    
    return {
      systolic: Math.round(avgSystolic * 10) / 10,
      diastolic: Math.round(avgDiastolic * 10) / 10
    };
  }

  calculateAverageSugar(sugarData) {
    if (sugarData.length === 0) return { fasting: 0, postPrandial: 0 };
    
    const fasting = sugarData.filter(r => r.measurementType === 'fasting');
    const postPrandial = sugarData.filter(r => r.measurementType === 'post_prandial');
    
    const avgFasting = fasting.length > 0 ? 
      fasting.reduce((sum, r) => sum + r.value, 0) / fasting.length : 0;
    
    const avgPostPrandial = postPrandial.length > 0 ? 
      postPrandial.reduce((sum, r) => sum + r.value, 0) / postPrandial.length : 0;

    return {
      fasting: Math.round(avgFasting * 10) / 10,
      postPrandial: Math.round(avgPostPrandial * 10) / 10
    };
  }

  calculateControlRate(bpData, sugarData) {
    // حساب نسبة السيطرة
    const controlledBP = bpData.filter(r => 
      r.systolic < 140 && r.diastolic < 90
    ).length;
    
    const controlledSugar = sugarData.filter(r => {
      if (r.measurementType === 'fasting') return r.value < 100;
      if (r.measurementType === 'post_prandial') return r.value < 140;
      return true;
    }).length;

    const totalControlled = controlledBP + controlledSugar;
    const totalReadings = bpData.length + sugarData.length;

    return totalReadings > 0 ? Math.round((totalControlled / totalReadings) * 100) : 0;
  }

  assessOverallRisk(bpData, sugarData) {
    // تقييم المخاطر الشاملة
    return 'medium';
  }

  async saveAnalyticsReport(userId, report) {
    await Analytics.findOneAndUpdate(
      { userId },
      {
        userId,
        reportType: 'comprehensive',
        data: report,
        period: report.period,
        recordCount: report.summary.totalReadings
      },
      { upsert: true, new: true }
    );
  }

  // تحويل إلى CSV
  convertToCSV(data) {
    // تنفيذ تحويل البيانات إلى CSV
    return "CSV data would be here";
  }

  // تحويل إلى Excel
  convertToExcel(data) {
    // تنفيذ تحويل البيانات إلى Excel
    return "Excel data would be here";
  }

  async getRecentRecords(userId) {
    const [recentBP, recentSugar] = await Promise.all([
      BloodPressure.find({ userId }).sort({ date: -1 }).limit(5),
      BloodSugar.find({ userId }).sort({ date: -1 }).limit(5)
    ]);

    return {
      bloodPressure: recentBP,
      bloodSugar: recentSugar
    };
  }

  async getQuickStats(userId) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [bpCount, sugarCount, criticalCount] = await Promise.all([
      BloodPressure.countDocuments({ userId, date: { $gte: thirtyDaysAgo } }),
      BloodSugar.countDocuments({ userId, date: { $gte: thirtyDaysAgo } }),
      BloodPressure.countDocuments({ 
        userId, 
        date: { $gte: thirtyDaysAgo },
        isCritical: true 
      }) + BloodSugar.countDocuments({ 
        userId, 
        date: { $gte: thirtyDaysAgo },
        isCritical: true 
      })
    ]);

    return {
      totalReadings: bpCount + sugarCount,
      criticalReadings: criticalCount,
      dailyAverage: Math.round((bpCount + sugarCount) / 30),
      complianceRate: Math.round((bpCount + sugarCount) / (30 * 2) * 100) // افتراض 2 قراءة يومياً
    };
  }

  async getActiveAlerts(userId) {
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

    const [criticalBP, criticalSugar] = await Promise.all([
      BloodPressure.find({ 
        userId, 
        date: { $gte: twentyFourHoursAgo },
        isCritical: true 
      }),
      BloodSugar.find({ 
        userId, 
        date: { $gte: twentyFourHoursAgo },
        isCritical: true 
      })
    ]);

    return [...criticalBP, ...criticalSugar];
  }

  async getDashboardTrends(userId) {
    const trends = await this.analyzeTrends(userId, 'systolic', '30d');
    return trends;
  }
}

export default new AnalyticsService();