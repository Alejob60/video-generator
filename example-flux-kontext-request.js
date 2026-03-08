/**
 * Ejemplo de solicitud al endpoint FLUX.1-Kontext-pro
 * Este script demuestra cómo hacer solicitudes al nuevo endpoint
 */

const axios = require('axios');

// URL base de la aplicación (ajustar según corresponda)
const BASE_URL = 'http://localhost:8080';

/**
 * Ejemplo 1: Generar una imagen sin imagen de referencia
 */
async function generateImageWithoutReference() {
  try {
    console.log('📝 Generando imagen sin imagen de referencia...');
    
    const response = await axios.post(`${BASE_URL}/media/flux-kontext-image`, {
      prompt: 'A beautiful sunset over the ocean with dolphins jumping',
      plan: 'PRO',
      size: '1024x1024'
    });
    
    console.log('✅ Imagen generada exitosamente:');
    console.log('   URL:', response.data.data.imageUrl);
    console.log('   Filename:', response.data.data.filename);
    console.log('   Prompt:', response.data.data.prompt);
    
    return response.data;
  } catch (error) {
    console.error('❌ Error al generar imagen:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Ejemplo 2: Generar una imagen con prompt JSON
 */
async function generateImageWithJsonPrompt() {
  try {
    console.log('\n📝 Generando imagen con prompt JSON...');
    
    const jsonPrompt = {
      subject: "futuristic cityscape",
      style: "cyberpunk",
      mood: "neon lit",
      details: "flying cars, holographic advertisements, rain-slicked streets"
    };
    
    const response = await axios.post(`${BASE_URL}/media/flux-kontext-image`, {
      prompt: JSON.stringify(jsonPrompt),
      plan: 'PRO',
      size: '1024x1024',
      isJsonPrompt: true
    });
    
    console.log('✅ Imagen generada exitosamente con prompt JSON:');
    console.log('   URL:', response.data.data.imageUrl);
    console.log('   Filename:', response.data.data.filename);
    console.log('   Prompt procesado:', response.data.data.prompt);
    
    return response.data;
  } catch (error) {
    console.error('❌ Error al generar imagen con prompt JSON:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Función principal para ejecutar los ejemplos
 */
async function main() {
  console.log('🚀 Ejemplos de uso del endpoint FLUX.1-Kontext-pro\n');
  
  try {
    // Ejecutar ejemplo 1
    await generateImageWithoutReference();
    
    // Ejecutar ejemplo 2
    await generateImageWithJsonPrompt();
    
    console.log('\n🎉 Todos los ejemplos se ejecutaron correctamente!');
  } catch (error) {
    console.error('\n💥 Error en la ejecución de ejemplos:', error.message);
  }
}

// Ejecutar si este archivo se llama directamente
if (require.main === module) {
  main();
}

module.exports = {
  generateImageWithoutReference,
  generateImageWithJsonPrompt
};