/**
 * Script para verificar todas las variables de entorno importantes
 */

require('dotenv').config();

console.log('🔍 Verificando todas las variables de entorno...\n');

// Variables de entorno críticas
const criticalEnvVars = [
  'AZURE_OPENAI_KEY',
  'AZURE_OPENAI_GPT_URL',
  'AZURE_OPENAI_API_ENDPOINT',
  'AZURE_OPENAI_API_VERSION',
  'AZURE_OPENAI_GPT_DEPLOYMENT',
  'AZURE_TTS_KEY',
  'AZURE_TTS_ENDPOINT',
  'AZURE_TTS_VOICE',
  'AZURE_TTS_API_VERSION',
  'AZURE_TTS_DEPLOYMENT',
  'AZURE_SORA_URL',
  'AZURE_SORA_DEPLOYMENT',
  'AZURE_SORA_API_KEY',
  'AZURE_SORA_API_VERSION',
  'AZURE_SERVICE_BUS_CONNECTION',
  'AZURE_SERVICE_BUS_QUEUE',
  'AZURE_SERVICE_BUS_QUEUE_IMAGE',
  'AZURE_OPENAI_IMAGE_ENDPOINT',
  'AZURE_OPENAI_IMAGE_DEPLOYMENT',
  'AZURE_OPENAI_IMAGE_API_VERSION',
  'AZURE_OPENAI_IMAGE_API_KEY',
  'FLUX_API_KEY',
  'ENDPOINT_FLUX_KONTENT_PRO',
  'ENDPOINT_FLUX_KONTENT_PRO_API_KEY',
  'AZURE_STORAGE_CONNECTION_STRING',
  'AZURE_STORAGE_ACCOUNT_NAME',
  'AZURE_STORAGE_KEY',
  'AZURE_STORAGE_CONTAINER_NAME',
  'AZURE_STORAGE_CONTAINER_IMAGES',
  'AZURE_STORAGE_CONTAINER_VIDEO',
  'SORA_VIDEO_URL',
  'PUBLIC_BASE_URL',
  'MAIN_BACKEND_URL',
  'DB_HOST',
  'DB_PORT',
  'DB_USERNAME',
  'DB_PASSWORD',
  'DB_NAME',
  'DB_SSL',
  'DATABASE_URL',
  'GEMINI_API_KEY'
];

console.log('🧪 Verificando variables de entorno críticas:\n');

let missingVars = [];
let configuredVars = 0;

criticalEnvVars.forEach(varName => {
  if (process.env[varName]) {
    console.log(`✅ ${varName}: CONFIGURADO`);
    configuredVars++;
  } else {
    console.log(`❌ ${varName}: NO CONFIGURADO`);
    missingVars.push(varName);
  }
});

console.log(`\n📊 Resumen:`);
console.log(`   Variables configuradas: ${configuredVars}/${criticalEnvVars.length}`);

if (missingVars.length > 0) {
  console.log(`\n⚠️  Variables faltantes (${missingVars.length}):`);
  missingVars.forEach(varName => {
    console.log(`   - ${varName}`);
  });
  
  console.log('\n💡 Recomendación:');
  console.log('   Verifica tu archivo .env y asegúrate de que contiene todas las variables requeridas.');
  console.log('   Puedes usar .env.example como referencia.');
} else {
  console.log('\n🎉 ¡Todas las variables de entorno críticas están configuradas!');
  console.log('   La aplicación debería funcionar correctamente.');
}

console.log('\n📄 Nota:');
console.log('   Este script verifica las variables más importantes.');
console.log('   Algunas variables pueden ser opcionales dependiendo de la funcionalidad que uses.');