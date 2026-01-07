/**
 * خدمة Google Gemini AI
 * تحليل البيانات الطبية باستخدام Gemini المجاني
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import geminiConfig from '../config/gemini.js';
import logger from '../utils/logger.js';
import database from '../config/database.js';
import MedicalRecord from '../models/HealthRecord.js';

class GeminiService {
  constructor() {
    this.apiKey = geminiConfig.api.key;
    this.timeout = geminiConfig.api.timeout;
    this.model = 'gemini-2.5-flash'; // نموذج سريع ومجاني
    this.systemPrompt = geminiConfig.systemPrompt;
    
    // تهيئة Gemini AI
    if (this.apiKey) {
      try {
        this.genAI = new GoogleGenerativeAI(this.apiKey);
        this.modelInstance = this.genAI.getGenerativeModel({ model: this.model });
        logger.info('✅ تم تهيئة Gemini AI بنجاح');
      } catch (error) {
        logger.error('❌ فشل في تهيئة Gemini AI:', error.message);
        this.genAI = null;
        this.modelInstance = null;
      }
    } else {
      logger.warn('⚠️ GEMINI_API_KEY غير موجود - سيتم استخدام التحليل المحلي فقط');
      this.genAI = null;
      this.modelInstance = null;
    }
  }

  /**
   * إرسال رسالة إلى Gemini والحصول على رد
   */
  async generateResponse(message, options = {}) {
    if (!this.modelInstance) {
      return {
        success: false,
        error: 'Gemini API غير متاح - تأكد من وجود GEMINI_API_KEY في ملف .env'
      };
    }

    try {
      const {
        model = this.model,
        temperature = 0.7,
        max_tokens = 2000,
        userId = null
      } = options;

      const modelToUse = this.genAI.getGenerativeModel({ model });
      
      const fullPrompt = `${this.systemPrompt}\n\n${message}`;
      
      const result = await modelToUse.generateContent(fullPrompt, {
        generationConfig: {
          temperature,
          maxOutputTokens: max_tokens,
          topP: 0.8,
          topK: 40
        }
      });

      const response = await result.response;
      const text = response.text();

      return {
        success: true,
        response: text,
        model: model,
        usage: {
          promptTokens: response.usageMetadata?.promptTokenCount || 0,
          completionTokens: response.usageMetadata?.candidatesTokenCount || 0,
          totalTokens: response.usageMetadata?.totalTokenCount || 0
        }
      };

    } catch (error) {
      logger.error('Gemini API Error:', error.message);
      return {
        success: false,
        error: error.message || 'خطأ في الاتصال بـ Gemini API'
      };
    }
  }

  /**
   * تحليل النص
   */
  async analyzeText(text, analysisType = 'sentiment', userId = null) {
    if (!this.modelInstance) {
      return {
        success: false,
        error: 'Gemini API غير متاح'
      };
    }

    try {
      const analysisPrompts = {
        sentiment: 'حلل المشاعر في النص التالي:',
        medical: 'حلل النص التالي من ناحية طبية:',
        general: 'حلل النص التالي:'
      };

      const prompt = `${analysisPrompts[analysisType] || analysisPrompts.general}\n\n${text}`;
      
      const result = await this.generateResponse(prompt, { userId });
      
      if (!result.success) {
        return result;
      }

      return {
        success: true,
        response: result.response,
        type: analysisType
      };

    } catch (error) {
      logger.error('Text Analysis Error:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * توليد صورة (Gemini لا يدعم توليد الصور حالياً، لكن يمكن إضافة دعم لخدمات أخرى)
   */
  async generateImage(prompt, options = {}) {
    return {
      success: false,
      error: 'Gemini لا يدعم توليد الصور حالياً. يمكن استخدام خدمات أخرى مثل DALL-E أو Stable Diffusion.'
    };
  }

  /**
   * تحليل البيانات الطبية الأساسية
   */
  async analyzeMedicalData(medicalData) {
    try {
      const prompt = this.createMedicalPrompt(medicalData);
      
      if (!this.modelInstance) {
        return this.getFallbackAnalysis(medicalData);
      }

      const fullPrompt = `${this.systemPrompt}\n\n${prompt}`;
      
      const result = await this.modelInstance.generateContent(fullPrompt, {
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 1500,
          topP: 0.8,
          topK: 40
        }
      });

      const response = await result.response;
      const aiResponse = response.text();
      
      return this.parseAIResponse(aiResponse, medicalData);

    } catch (error) {
      logger.error('Gemini API Error:', error.message);
      return this.getFallbackAnalysis(medicalData);
    }
  }

  /**
   * إنشاء prompt للبيانات الطبية
   */
  createMedicalPrompt(medicalData) {
    const { bloodPressure, bloodSugar, symptoms, medicalHistory } = medicalData;

    return `
**بيانات المريض:**

ضغط الدم:
- الضغط الانقباضي: ${bloodPressure?.systolic || 'غير متوفر'} mmHg
- الضغط الانبساطي: ${bloodPressure?.diastolic || 'غير متوفر'} mmHg

السكر:
- مستوى السكر: ${bloodSugar?.value || 'غير متوفر'} mg/dL
- الوقت: ${bloodSugar?.time || 'غير محدد'}

الأعراض:
${symptoms?.length > 0 ? symptoms.map(s => `- ${s}`).join('\n') : '- بدون أعراض'}

السجل الطبي:
${medicalHistory ? Object.entries(medicalHistory).map(([k, v]) => `- ${k}: ${v}`).join('\n') : '- لا يوجد سجل'}

يرجى تحليل هذه البيانات وتقديم:
1. تقييم شامل للحالة
2. المؤشرات المثيرة للقلق
3. التحذيرات إن وجدت
4. توصيات عملية
5. متى يجب استشارة الطبيب
`;
  }

  /**
   * معالجة رد Gemini
   */
  parseAIResponse(response, medicalData) {
    return {
      timestamp: new Date(),
      model: this.model,
      analysis: response,
      medicalData: medicalData,
      riskLevel: this.assessRiskLevel(medicalData),
      requiresMedicalAttention: this.requiresMedicalAttention(medicalData),
      recommendations: this.generateRecommendations(medicalData)
    };
  }

  /**
   * تقييم مستوى الخطر
   */
  assessRiskLevel(medicalData) {
    const { bloodPressure, bloodSugar } = medicalData;
    let risk = 'منخفض';

    if (bloodPressure) {
      if (bloodPressure.systolic >= 180 || bloodPressure.diastolic >= 120) {
        risk = 'حرج';
      } else if (bloodPressure.systolic >= 140 || bloodPressure.diastolic >= 90) {
        risk = 'مرتفع';
      }
    }

    if (bloodSugar) {
      if (bloodSugar.value >= 400 || bloodSugar.value <= 50) {
        risk = 'حرج';
      } else if (bloodSugar.value >= 300 || bloodSugar.value <= 70) {
        risk = 'مرتفع';
      }
    }

    return risk;
  }

  /**
   * هل يحتاج إلى رعاية طبية فوراً؟
   */
  requiresMedicalAttention(medicalData) {
    const { bloodPressure, bloodSugar } = medicalData;

    if (bloodPressure) {
      if (bloodPressure.systolic >= 180 || bloodPressure.diastolic >= 120) {
        return {
          required: true,
          reason: 'أزمة ارتفاع ضغط الدم - اطلب الإسعاف فوراً'
        };
      }
    }

    if (bloodSugar) {
      if (bloodSugar.value >= 400) {
        return {
          required: true,
          reason: 'ارتفاع شديد في السكر - اطلب الرعاية الطبية'
        };
      }
      if (bloodSugar.value <= 50) {
        return {
          required: true,
          reason: 'انخفاض حاد في السكر - خطر - تناول السكر فوراً'
        };
      }
    }

    return { required: false };
  }

  /**
   * توليد التوصيات
   */
  generateRecommendations(medicalData) {
    const recommendations = [];
    const { bloodPressure, bloodSugar } = medicalData;
    const config = geminiConfig.medical;

    if (bloodPressure) {
      if (bloodPressure.systolic > 140 || bloodPressure.diastolic > 90) {
        recommendations.push(...config.recommendations.highBP);
      }
    }

    if (bloodSugar) {
      if (bloodSugar.value > 200) {
        recommendations.push(...config.recommendations.highBS);
      }
    }

    if (recommendations.length === 0) {
      recommendations.push('استمر في المتابعة المنتظمة');
      recommendations.push('حافظ على نمط حياة صحي');
    }

    return recommendations;
  }

  /**
   * تحليل متقدم مع التاريخ الطبي (TypeORM)
   */
  async analyzeWithHistory(userId) {
    try {
      const medicalRepo = database.getRepository(MedicalRecord);
      // جلب آخر 10 سجلات
      const records = await medicalRepo.find({
        where: { userId },
        order: { createdAt: 'DESC' },
        take: 10
      }).catch(() => []);

      if (records.length === 0) {
        return { success: false, message: 'لا توجد سجلات طبية' };
      }

      // حساب المتوسطات
      const avgBP = this.calculateAverageRP(records);
      const avgBS = this.calculateAverageBS(records);
      const trend = this.calculateTrend(records);

      const medicalData = {
        bloodPressure: avgBP,
        bloodSugar: avgBS,
        recordCount: records.length,
        trend: trend
      };

      return await this.analyzeMedicalData(medicalData);

    } catch (error) {
      logger.error('Error analyzing with history:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * حساب متوسط ضغط الدم
   */
  calculateAverageRP(records) {
    const bpRecords = records
      .filter(r => r.bloodPressure)
      .map(r => r.bloodPressure);

    if (bpRecords.length === 0) return null;

    const avgSystolic = Math.round(
      bpRecords.reduce((sum, bp) => sum + bp.systolic, 0) / bpRecords.length
    );
    const avgDiastolic = Math.round(
      bpRecords.reduce((sum, bp) => sum + bp.diastolic, 0) / bpRecords.length
    );

    return { systolic: avgSystolic, diastolic: avgDiastolic };
  }

  /**
   * حساب متوسط السكر
   */
  calculateAverageBS(records) {
    const bsRecords = records
      .filter(r => r.bloodSugar)
      .map(r => r.bloodSugar);

    if (bsRecords.length === 0) return null;

    const avgValue = Math.round(
      bsRecords.reduce((sum, bs) => sum + bs.value, 0) / bsRecords.length
    );

    return { value: avgValue };
  }

  /**
   * حساب الاتجاه
   */
  calculateTrend(records) {
    if (records.length < 2) return 'محدود';

    const first = records[records.length - 1];
    const last = records[0];

    if (first.bloodPressure && last.bloodPressure) {
      const diff = last.bloodPressure.systolic - first.bloodPressure.systolic;
      if (diff > 5) return 'صاعد';
      if (diff < -5) return 'هابط';
      return 'مستقر';
    }

    return 'غير محدد';
  }

  /**
   * تحليل بديل عند فشل API
   */
  getFallbackAnalysis(medicalData) {
    const { bloodPressure, bloodSugar } = medicalData;
    let analysis = 'تحليل محلي (بدون Gemini):\n\n';

    if (bloodPressure) {
      if (bloodPressure.systolic >= 180 || bloodPressure.diastolic >= 120) {
        analysis += `⚠️ **تحذير: ضغط دم حرج!**\n`;
        analysis += `الضغط: ${bloodPressure.systolic}/${bloodPressure.diastolic} mmHg\n`;
        analysis += `اطلب الإسعاف فوراً!\n\n`;
      } else if (bloodPressure.systolic >= 140 || bloodPressure.diastolic >= 90) {
        analysis += `⚠️ **ضغط دم مرتفع**\n`;
        analysis += `الضغط: ${bloodPressure.systolic}/${bloodPressure.diastolic} mmHg\n`;
        analysis += `استشر طبيبك قريباً\n\n`;
      } else {
        analysis += `✅ ضغط دم طبيعي\n`;
        analysis += `الضغط: ${bloodPressure.systolic}/${bloodPressure.diastolic} mmHg\n\n`;
      }
    }

    if (bloodSugar) {
      if (bloodSugar.value >= 400) {
        analysis += `⚠️ **تحذير: السكر مرتفع جداً!**\n`;
        analysis += `السكر: ${bloodSugar.value} mg/dL\n`;
        analysis += `اطلب الرعاية الطبية فوراً\n\n`;
      } else if (bloodSugar.value >= 200) {
        analysis += `⚠️ **السكر مرتفع**\n`;
        analysis += `السكر: ${bloodSugar.value} mg/dL\n`;
        analysis += `استشر طبيبك\n\n`;
      } else if (bloodSugar.value <= 50) {
        analysis += `⚠️ **السكر منخفض جداً!**\n`;
        analysis += `السكر: ${bloodSugar.value} mg/dL\n`;
        analysis += `تناول السكر فوراً\n\n`;
      } else {
        analysis += `✅ السكر طبيعي\n`;
        analysis += `السكر: ${bloodSugar.value} mg/dL\n\n`;
      }
    }

    return {
      timestamp: new Date(),
      model: 'fallback-local',
      analysis: analysis,
      medicalData: medicalData,
      riskLevel: this.assessRiskLevel(medicalData),
      requiresMedicalAttention: this.requiresMedicalAttention(medicalData),
      recommendations: this.generateRecommendations(medicalData)
    };
  }
}

export default new GeminiService();
