/**
 * إعدادات وتكوين Google Gemini AI
 * خدمة المساعد الطبي الذكي
 */

// التأكد من وجود مفتاح API قبل البدء
if (!process.env.GEMINI_API_KEY) {
  console.warn("⚠️ تحذير: لم يتم العثور على GEMINI_API_KEY في متغيرات البيئة.");
}

const config = {
  // 🔑 إعدادات API الآمنة
  api: {
    key: process.env.GEMINI_API_KEY, 
    baseURL: 'https://generativelanguage.googleapis.com/v1beta/models',
    timeout: parseInt(process.env.GEMINI_TIMEOUT) || 30000,
    maxRetries: parseInt(process.env.GEMINI_MAX_RETRIES) || 3
  },

  // 🤖 النماذج
  models: {
    flash: {
      name: 'gemini-2.5-flash',
      description: 'نموذج سريع وفعال للتحليل الفوري',
      maxTokens: 8000,
      temperature: 0.2, // منخفض لضمان الدقة الطبية
    },
    pro: {
      name: 'gemini-2.5-pro',
      description: 'للحالات المعقدة التي تتطلب استنتاجاً عميقاً',
    }
  },

  // 🏥 المعايير الطبية (تم التحديث حسب المعايير العامة)
  medical: {
    bloodPressure: {
      normal: { sys: 120, dia: 80 },
      elevated: { sys: 129, dia: 80 }, // المعدل المرتفع قليلاً
      hypertension1: { sys: 139, dia: 89 },
      hypertension2: { sys: 140, dia: 90 }, // المرحلة الثانية (خطر)
      crisis: { sys: 180, dia: 120 } // أزمة طارئة
    },

    bloodSugar: {
      fasting: {
        normal: { min: 70, max: 99 },
        preDiabetes: { min: 100, max: 125 },
        diabetes: { min: 126, max: 999 } // ⚠️ تم التصحيح: السكري يبدأ من 126 للصائم
      },
      postPrandial: { // بعد الأكل بساعتين
        normal: { max: 140 },
        preDiabetes: { min: 140, max: 199 },
        diabetes: { min: 200, max: 999 }
      }
    },

    recommendations: {
      general: [
        'هذه النتائج استرشادية فقط وليست تشخيصاً نهائياً.',
        'يرجى مراجعة الطبيب لتأكيد القراءات.'
      ],
      highBP: [
        'تقليل الصوديوم (الملح) في الطعام.',
        'ممارسة المشي السريع لمدة 30 دقيقة.',
        'الإقلاع عن التدخين فوراً.',
        'مراقبة الضغط يومياً في نفس الموعد.'
      ]
    }
  },

  // 📊 سياق النظام (System Prompt) - ممتاز جداً
  systemPrompt: `أنت مساعد طبي ذكي متخصص في تحليل العلامات الحيوية.

الدور والمسؤولية:
1. تحليل مدخلات المستخدم (ضغط، سكر، أعراض).
2. مقارنة القيم بالمعايير الطبية المعتمدة.
3. تحديد مستوى الخطورة (طبيعي، متابعة، طوارئ).

القواعد الصارمة:
- ⛔ لا تصف أدوية بالاسم التجاري أو الجرعات.
- ⛔ لا تعطِ تشخيصاً نهائياً (مثلاً: "أنت مصاب بالسكري") بل قل "القراءات تشير لاحتمالية...".
- ✅ دائماً اختم النصيحة بضرورة زيارة الطبيب.
- ✅ استخدم نبرة هادئة ومطمئنة ولكن حازمة في حالات الطوارئ.

صيغة الرد المطلوبة:
- **تحليل الحالة:** [شرح مبسط]
- **مستوى الخطورة:** [منخفض/متوسط/عالي]
- **الخطوات التالية:** [نصائح عملية]`,

  // ⚙️ إعدادات أخرى
  monitoring: {
    enabled: true,
    logLevel: process.env.NODE_ENV === 'production' ? 'error' : 'debug',
  }
};

export default config;