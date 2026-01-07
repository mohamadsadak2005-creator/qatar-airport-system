import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, '.env');

// المحتوى الصحيح والكامل
const envContent = `
# إعدادات الخادم
NODE_ENV=development
PORT=4000
APP_NAME="Project CLI"

# مفتاح Gemini
GEMINI_API_KEY=AIzaSyCAbD7uTrxLmBr4crkHlZz7i88d6-HcLiQ

# قاعدة البيانات
DB_HOST=localhost
DB_PORT=1234
DB_USER=postgres
DB_PASSWORD=2005
DB_NAME=projctGL

# الأمان
JWT_SECRET=super_secret_key_12345
`.trim();

console.log('🔄 جاري إصلاح ملف .env ...');

try {
    // حذف الملف القديم إذا وجد لضمان النظافة
    if (fs.existsSync(envPath)) {
        fs.unlinkSync(envPath);
        console.log('🗑️ تم حذف الملف القديم المعطوب.');
    }

    // كتابة الملف الجديد
    fs.writeFileSync(envPath, envContent, { encoding: 'utf8' });
    
    console.log('✅ تم إنشاء ملف .env جديد وصحيح بنسبة 100%');
    console.log('📂 المسار:', envPath);
    console.log('📝 المحتوى المكتوب:');
    console.log('-----------------------------------');
    console.log(envContent);
    console.log('-----------------------------------');

} catch (error) {
    console.error('❌ حدث خطأ:', error);
}