/**
 * Script para verificar que las variables de entorno están configuradas correctamente
 */

// Cargar las variables de entorno
require('dotenv').config();

console.log('🔍 Verificando variables de entorno para FLUX.1-Kontext-pro...\n');

// Verificar variables de FLUX.1-Kontext-pro
const endpoint = process.env.ENDPOINT_FLUX_KONTENT_PRO;
const apiKey = process.env.ENDPOINT_FLUX_KONTENT_PRO_API_KEY;

console.log('🧪 Variables de entorno FLUX.1-Kontext-pro:');
console.log('   ENDPOINT_FLUX_KONTENT_PRO:', endpoint || '❌ NO CONFIGURADO');
console.log('   ENDPOINT_FLUX_KONTENT_PRO_API_KEY:', apiKey ? '✅ CONFIGURADO' : '❌ NO CONFIGURADO');

// Verificar otras variables importantes
const mainBackendUrl = process.env.MAIN_BACKEND_URL;
console.log('\n🔗 Otras variables importantes:');
console.log('   MAIN_BACKEND_URL:', mainBackendUrl || '❌ NO CONFIGURADO');

// Verificación básica
if (endpoint && apiKey && mainBackendUrl) {
  console.log('\n✅ ¡Todas las variables de entorno están configuradas correctamente!');
  console.log('   Puedes proceder a ejecutar la aplicación.');
} else {
  console.log('\n⚠️  Algunas variables de entorno no están configuradas.');
  console.log('   Por favor, verifica el archivo .env y asegúrate de que contiene todas las variables requeridas.');
  
  if (!endpoint) {
    console.log('   - Falta ENDPOINT_FLUX_KONTENT_PRO');
  }
  
  if (!apiKey) {
    console.log('   - Falta ENDPOINT_FLUX_KONTENT_PRO_API_KEY');
  }
  
  if (!mainBackendUrl) {
    console.log('   - Falta MAIN_BACKEND_URL');
  }
}

console.log('\n📄 Recuerda que puedes encontrar un ejemplo de configuración en el archivo .env.example');