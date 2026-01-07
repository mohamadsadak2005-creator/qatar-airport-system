import 'dotenv/config.js';
import pkg from 'pg';
const { Client } = pkg;

const config = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '1234'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '2005',
  database: 'postgres', // connect to default db to create target
};

async function main() {
  const client = new Client(config);
  try {
    console.log('🔌 Connecting to PostgreSQL...', { host: config.host, port: config.port });
    await client.connect();

    const targetDb = process.env.DB_NAME || 'projctGL';
    const res = await client.query('SELECT 1 FROM pg_database WHERE datname = $1', [targetDb]);
    if (res.rowCount > 0) {
      console.log(`✅ قاعدة البيانات "${targetDb}" موجودة بالفعل.`);
    } else {
      console.log(`⚙️ إنشاء قاعدة البيانات "${targetDb}" ...`);
      await client.query(`CREATE DATABASE \"${targetDb}\"`);
      console.log(`✅ تم إنشاء قاعدة البيانات "${targetDb}" بنجاح.`);
    }
  } catch (err) {
    console.error('❌ فشل في إنشاء/التحقق من قاعدة البيانات:', err.message || err);
    process.exitCode = 2;
  } finally {
    await client.end().catch(() => {});
  }
}

main();
