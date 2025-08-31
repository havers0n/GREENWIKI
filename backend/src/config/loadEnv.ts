// src/config/loadEnv.ts
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs'; // Импортируем модуль для работы с файлами

const envPath = path.resolve(__dirname, '..', '..', '.env');

console.log(`[DEBUG] Attempting to load .env file from: ${envPath}`);

try {
  // Пытаемся прочитать файл вручную
  const fileContent = fs.readFileSync(envPath, { encoding: 'utf-8' });
  console.log('[DEBUG] File content read successfully. Content length:', fileContent.length);
  // Если файл пустой, dotenv вернет 0
  if (fileContent.trim().length === 0) {
    console.error('[ERROR] .env file is empty!');
  }
} catch (readError) {
  console.error('[FATAL] Failed to read .env file manually!', readError);
}

// Запускаем dotenv
const result = dotenv.config({ path: envPath });

if (result.error) {
  console.error('Error loading .env file with dotenv:', result.error);
} else {
  console.log(`[dotenv] Injected ${Object.keys(result.parsed || {}).length} variables from ${envPath}`);
}
