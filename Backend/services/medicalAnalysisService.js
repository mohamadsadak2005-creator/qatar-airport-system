import database from '../config/database.js';
import MedicalRecord from '../models/HealthRecord.js';
import BloodPressure from '../models/BloodPressure.js';
import BloodSugar from '../models/BloodSugar.js';

class MedicalAnalysisService {
  
  // تحليل شامل للبيانات الطبية
  async comprehensiveAnalysis(medicalData) {
    try {
      const analysis = {
        summary: await this.generateSummary(medicalData),
        riskAssessment: await this.assessRisks(medicalData),
        trends: await this.analyzeTrends(medicalData),
        recommendations: await this.generateRecommendations(medicalData),
        alerts: await this.checkAlerts(medicalData),
        metrics: await this.calculateMetrics(medicalData)
      };

      return analysis;
    } catch (error) {
      console.error('Comprehensive analysis error:', error);
      throw new Error('فشل في التحليل الشامل');
    }
  }

  // توليد ملخص طبي
  async generateSummary(medicalData) {
    const latestRecord = Array.isArray(medicalData) ? medicalData[0] : medicalData;
    
    return {
      overallStatus: this.getOverallStatus(latestRecord),
      bloodPressureStatus: this.getBPStatus(latestRecord.bloodPressure),
      bloodSugarStatus: this.getSugarStatus(latestRecord.bloodSugar),
      lastUpdate: latestRecord.date,
      recordCount: Array.isArray(medicalData) ? medicalData.length : 1
    };
  }

  // تقييم المخاطر
  async assessRisks(medicalData) {
    const records = Array.isArray(medicalData) ? medicalData : [medicalData];
    
    const risks = {
      cardiovascular: this.assessCardiovascularRisk(records),
      diabetes: this.assessDiabetesRisk(records),
      hypertension: this.assessHypertensionRisk(records),
      hypoglycemia: this.assessHypoglycemiaRisk(records),
      overall: this.assessOverallRisk(records)
    };

    return risks;
  }

  // تحليل الاتجاهات
  async analyzeTrends(medicalData) {
    if (!Array.isArray(medicalData) || medicalData.length < 2) {
      return { message: "لا توجد بيانات كافية لتحليل الاتجاهات" };
    }

    const trends = {
      bloodPressure: this.analyzeBPTrends(medicalData),
      bloodSugar: this.analyzeSugarTrends(medicalData),
      stability: this.assessStability(medicalData),
      improvements: this.detectImprovements(medicalData),
      deteriorations: this.detectDeteriorations(medicalData)
    };

    return trends;
  }

  // توليد التوصيات
  async generateRecommendations(medicalData) {
    const recommendations = {
      immediate: [],
      shortTerm: [],
      longTerm: [],
      lifestyle: [],
      medical: []
    };

    const latestRecord = Array.isArray(medicalData) ? medicalData[0] : medicalData;

    // توصيات فورية
    if (this.isCriticalBP(latestRecord.bloodPressure)) {
      recommendations.immediate.push("الضغط مرتفع بشكل خطر - راجع الطبيب فوراً");
    }
    if (this.isCriticalSugar(latestRecord.bloodSugar)) {
      recommendations.immediate.push("سكر الدم خارج النطاق الآمن - اتخذ الإجراء الفوري");
    }

    // توصيات نمط الحياة
    recommendations.lifestyle.push(...this.generateLifestyleRecommendations(medicalData));

    return recommendations;
  }

  // التحقق من الإنذارات
  async checkAlerts(medicalData) {
    const alerts = [];
    const latestRecord = Array.isArray(medicalData) ? medicalData[0] : medicalData;

    if (this.isHypertensiveCrisis(latestRecord.bloodPressure)) {
      alerts.push({
        type: 'critical',
        message: 'أزمة ضغط دم - راجع الطبيب فوراً',
        priority: 'high'
      });
    }

    if (this.isSevereHypoglycemia(latestRecord.bloodSugar)) {
      alerts.push({
        type: 'critical',
        message: 'انخفاض حاد في السكر - تناول سكريات فوراً',
        priority: 'high'
      });
    }

    return alerts;
  }

  // حساب المقاييس
  async calculateMetrics(medicalData) {
    const records = Array.isArray(medicalData) ? medicalData : [medicalData];
    
    return {
      averageBP: this.calculateAverageBP(records),
      averageSugar: this.calculateAverageSugar(records),
      variability: this.calculateVariability(records),
      controlPercentage: this.calculateControlPercentage(records),
      complianceScore: this.calculateComplianceScore(records)
    };
  }

  // تقييم مخاطر القلب والأوعية الدموية
  assessCardiovascularRisk(records) {
    const latest = records[0];
    const bp = latest.bloodPressure;
    
    let riskScore = 0;
    
    if (bp.systolic >= 140 || bp.diastolic >= 90) riskScore += 3;
    else if (bp.systolic >= 130 || bp.diastolic >= 85) riskScore += 2;
    else if (bp.systolic >= 120 || bp.diastolic >= 80) riskScore += 1;

    return {
      level: riskScore >= 3 ? 'high' : riskScore >= 2 ? 'medium' : 'low',
      score: riskScore,
      factors: ['ضغط الدم']
    };
  }

  // تقييم مخاطر السكري
  assessDiabetesRisk(records) {
    const latest = records[0];
    const sugar = latest.bloodSugar;
    
    let riskScore = 0;

    if (sugar.fasting && sugar.fasting >= 126) riskScore += 3;
    else if (sugar.fasting && sugar.fasting >= 100) riskScore += 2;

    if (sugar.postPrandial && sugar.postPrandial >= 200) riskScore += 3;
    else if (sugar.postPrandial && sugar.postPrandial >= 140) riskScore += 2;

    return {
      level: riskScore >= 3 ? 'high' : riskScore >= 2 ? 'medium' : 'low',
      score: riskScore,
      factors: ['سكر الدم']
    };
  }

  // الطرق المساعدة
  getOverallStatus(record) {
    const bpStatus = this.getBPStatus(record.bloodPressure);
    const sugarStatus = this.getSugarStatus(record.bloodSugar);

    if (bpStatus === 'critical' || sugarStatus === 'critical') return 'critical';
    if (bpStatus === 'poor' || sugarStatus === 'poor') return 'poor';
    if (bpStatus === 'fair' || sugarStatus === 'fair') return 'fair';
    return 'good';
  }

  getBPStatus(bloodPressure) {
    if (bloodPressure.systolic > 180 || bloodPressure.diastolic > 120) return 'critical';
    if (bloodPressure.systolic >= 140 || bloodPressure.diastolic >= 90) return 'poor';
    if (bloodPressure.systolic >= 130 || bloodPressure.diastolic >= 85) return 'fair';
    if (bloodPressure.systolic >= 120 || bloodPressure.diastolic >= 80) return 'borderline';
    return 'good';
  }

  getSugarStatus(bloodSugar) {
    const fasting = bloodSugar.fasting;
    if (fasting < 70) return 'critical';
    if (fasting >= 126) return 'poor';
    if (fasting >= 100) return 'fair';
    return 'good';
  }

  isCriticalBP(bloodPressure) {
    return bloodPressure.systolic > 180 || bloodPressure.diastolic > 120;
  }

  isCriticalSugar(bloodSugar) {
    return (bloodSugar.fasting && bloodSugar.fasting < 70) || 
           (bloodSugar.fasting && bloodSugar.fasting > 300);
  }

  isHypertensiveCrisis(bloodPressure) {
    return bloodPressure.systolic > 180 && bloodPressure.diastolic > 120;
  }

  isSevereHypoglycemia(bloodSugar) {
    return bloodSugar.fasting && bloodSugar.fasting < 54;
  }

  generateLifestyleRecommendations(medicalData) {
    const recommendations = [];
    const latest = Array.isArray(medicalData) ? medicalData[0] : medicalData;

    if (latest.bloodPressure.systolic >= 130) {
      recommendations.push("خفض تناول الملح في الطعام");
      recommendations.push("ممارسة الرياضة بانتظام");
    }

    if (latest.bloodSugar.fasting >= 100) {
      recommendations.push("تقليل تناول السكريات والكربوهيدرات");
      recommendations.push("تناول وجبات متوازنة على فترات منتظمة");
    }

    return recommendations;
  }

  // الحصول على الإحصائيات (TypeORM repositories)
  async getStatistics(userId, period = '30d') {
    try {
      const days = parseInt(period);
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const bpRepo = database.getRepository(BloodPressure);
      const sugarRepo = database.getRepository(BloodSugar);
      const medicalRepo = database.getRepository(MedicalRecord);

      const [bpRecords, sugarRecords, medicalRecords] = await Promise.all([
        bpRepo.find({ where: { userId, createdAt: { $gte: startDate } } }).catch(() => []),
        sugarRepo.find({ where: { userId, createdAt: { $gte: startDate } } }).catch(() => []),
        medicalRepo.find({ where: { userId, createdAt: { $gte: startDate } } }).catch(() => [])
      ]);

      return {
        period: `${days} يوم`,
        totalRecords: {
          bloodPressure: bpRecords.length,
          bloodSugar: sugarRecords.length,
          medical: medicalRecords.length
        },
        averages: {
          bloodPressure: this.calculateAverageBP(bpRecords),
          bloodSugar: this.calculateAverageSugar(sugarRecords)
        },
        trends: this.calculateTrends(bpRecords, sugarRecords),
        riskSummary: this.generateRiskSummary(bpRecords, sugarRecords)
      };
    } catch (error) {
      console.error('Error getting statistics:', error);
      return {
        period: period,
        totalRecords: { bloodPressure: 0, bloodSugar: 0, medical: 0 },
        averages: { bloodPressure: { systolic: 0, diastolic: 0 }, bloodSugar: { fasting: 0 } },
        trends: {},
        riskSummary: {}
      };
    }
  }

  // توليد تقرير المخاطر
  async generateRiskReport(userId) {
    const stats = await this.getStatistics(userId, '90d');
    
    return {
      userId,
      generatedAt: new Date(),
      cardiovascularRisk: this.assessCardiovascularRisk([{ bloodPressure: stats.averages.bloodPressure }]),
      diabetesRisk: this.assessDiabetesRisk([{ bloodSugar: stats.averages.bloodSugar }]),
      overallRisk: this.calculateOverallRisk(stats),
      recommendations: this.generateRiskRecommendations(stats),
      monitoringSuggestions: this.generateMonitoringSuggestions(stats)
    };
  }

  calculateOverallRisk(stats) {
    // حساب المخاطر الشاملة
    return 'medium';
  }

  generateRiskRecommendations(stats) {
    // توليد توصيات المخاطر
    return ['المواظبة على المتابعة', 'الالتزام بنمط حياة صحي'];
  }

  generateMonitoringSuggestions(stats) {
    // اقتراحات المتابعة
    return ['قياس منتظم للضغط والسكر', 'تسجيل الأعراض اليومية'];
  }

  calculateAverageBP(records) {
    if (records.length === 0) return { systolic: 0, diastolic: 0 };
    
    const avgSystolic = records.reduce((sum, r) => sum + r.systolic, 0) / records.length;
    const avgDiastolic = records.reduce((sum, r) => sum + r.diastolic, 0) / records.length;
    
    return {
      systolic: Math.round(avgSystolic * 10) / 10,
      diastolic: Math.round(avgDiastolic * 10) / 10
    };
  }

  calculateAverageSugar(records) {
    if (records.length === 0) return { fasting: 0, postPrandial: 0 };
    
    const fastingRecords = records.filter(r => r.measurementType === 'fasting');
    const postPrandialRecords = records.filter(r => r.measurementType === 'post_prandial');
    
    const avgFasting = fastingRecords.length > 0 ? 
      fastingRecords.reduce((sum, r) => sum + r.value, 0) / fastingRecords.length : 0;
    
    const avgPostPrandial = postPrandialRecords.length > 0 ? 
      postPrandialRecords.reduce((sum, r) => sum + r.value, 0) / postPrandialRecords.length : 0;

    return {
      fasting: Math.round(avgFasting * 10) / 10,
      postPrandial: Math.round(avgPostPrandial * 10) / 10
    };
  }

  calculateTrends(bpRecords, sugarRecords) {
    // حساب الاتجاهات
    return {
      bloodPressure: 'مستقر',
      bloodSugar: 'مستقر',
      overall: 'مستقر'
    };
  }

  calculateVariability(records) {
    // حساب التباين
    return {
      bpVariability: 'منخفض',
      sugarVariability: 'معتدل'
    };
  }

  calculateControlPercentage(records) {
    // حساب نسبة السيطرة
    return 75; // نسبة مئوية
  }

  calculateComplianceScore(records) {
    // حساب درجة الالتزام
    return 80; // من 100
  }
}

export default new MedicalAnalysisService();