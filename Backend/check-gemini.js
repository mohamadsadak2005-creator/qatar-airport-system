/**
 * سكريبت بسيط للتحقق من اتصال Gemini
 */

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';
import { GoogleGenerativeAI } from '@google/generative-ai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// تحميل ملف .env
dotenv.config({ path: path.join(__dirname, '.env') });

// الألوان للمخرجات
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

const log = {
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  warn: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  test: (msg) => console.log(`${colors.cyan}🧪 ${msg}${colors.reset}`),
};

async function checkGeminiConnection() {
  console.log('\n' + '='.repeat(60));
  log.info('🔍 التحقق من اتصال Gemini AI');
  console.log('='.repeat(60) + '\n');

  // 1. التحقق من وجود API Key
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    log.error('GEMINI_API_KEY غير موجود في ملف .env');
    log.info('الخطوات:');
    log.info('1. احصل على API Key من: https://makersuite.google.com/app/apikey');
    log.info('2. أضف السطر التالي في ملف Backend/.env:');
    log.info('   GEMINI_API_KEY=your_api_key_here');
    console.log('');
    process.exit(1);
  }

  log.success(`تم العثور على GEMINI_API_KEY (${apiKey.substring(0, 10)}...)`);

  // 2. محاولة تهيئة Gemini
  log.test('جاري تهيئة Gemini AI...');
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    log.success('تم تهيئة Gemini AI بنجاح');

    // 3. اختبار الاتصال بإرسال رسالة بسيطة
    log.test('جاري اختبار الاتصال بإرسال رسالة تجريبية...');
    
    const prompt = 'مرحبا، اكتب جملة واحدة فقط بالعربية لتأكيد الاتصال.';
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    log.success('✅ Gemini متصل ويعمل بشكل صحيح!');
    console.log('');
    log.info('الرد من Gemini:');
    console.log(`   "${text}"`);
    console.log('');

    // معلومات إضافية
    if (response.usageMetadata) {
      log.info('معلومات الاستخدام:');
      console.log(`   - Prompt Tokens: ${response.usageMetadata.promptTokenCount || 0}`);
      console.log(`   - Completion Tokens: ${response.usageMetadata.candidatesTokenCount || 0}`);
      console.log(`   - Total Tokens: ${response.usageMetadata.totalTokenCount || 0}`);
      console.log('');
    }

    log.success('🎉 كل شيء يعمل بشكل صحيح!');
    console.log('='.repeat(60) + '\n');
    process.exit(0);

  } catch (error) {
    log.error('فشل في الاتصال بـ Gemini');
    console.log('');
    log.error(`الخطأ: ${error.message}`);
    console.log('');

    if (error.message.includes('API_KEY_INVALID')) {
      log.warn('المفتاح غير صحيح. تأكد من صحة GEMINI_API_KEY');
    } else if (error.message.includes('PERMISSION_DENIED')) {
      log.warn('لا توجد صلاحيات. تأكد من تفعيل Gemini API في حسابك');
    } else if (error.message.includes('QUOTA_EXCEEDED')) {
      log.warn('تم تجاوز الحد المسموح. تحقق من حدود الاستخدام');
    } else {
      log.warn('تحقق من:');
      log.warn('1. اتصال الإنترنت');
      log.warn('2. صحة API Key');
      log.warn('3. تفعيل Gemini API في حساب Google Cloud');
    }

    console.log('');
    process.exit(1);
  }
}

// تشغيل الاختبار
checkGeminiConnection();
