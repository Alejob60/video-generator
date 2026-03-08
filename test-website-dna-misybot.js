// 📁 test-website-dna-misybot.js
const axios = require('axios');

async function testWebsiteDnaExtraction() {
  console.log('🧪 INICIANDO PRUEBA DE EXTRACCIÓN DE ADN VISUAL');
  console.log('🎯 Sitio objetivo: https://misybot.com');
  console.log('=' .repeat(60));

  const payload = {
    url: "https://misybot.com",
    extraction_mode: "full",
    plan: "PRO"
  };

  console.log('📤 Payload enviado:');
  console.log(JSON.stringify(payload, null, 2));
  console.log('-'.repeat(40));

  try {
    // Asumiendo que el microservicio corre en localhost:8080
    const response = await axios.post('http://localhost:8080/media/website-dna', payload, {
      timeout: 30000, // 30 segundos timeout
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ RESPUESTA RECIBIDA:');
    console.log('Código HTTP:', response.status);
    console.log('Tiempo de respuesta:', response.headers['request-duration'] || 'No disponible');
    console.log('-'.repeat(40));
    
    const result = response.data;
    console.log('📥 DATOS DEVUELTOS:');
    console.log(JSON.stringify(result, null, 2));
    
    // Análisis detallado de la respuesta
    analyzeDnaResponse(result);

  } catch (error) {
    console.log('❌ ERROR EN LA PRUEBA:');
    if (error.response) {
      console.log('Código de error:', error.response.status);
      console.log('Mensaje de error:', error.response.data);
    } else {
      console.log('Error de red:', error.message);
    }
  }
}

function analyzeDnaResponse(data) {
  console.log('\n📊 ANÁLISIS DETALLADO DE LA RESPUESTA:');
  console.log('=' .repeat(60));

  if (data.success) {
    console.log('✅ Extracción exitosa');
    console.log('🆔 Request ID:', data.requestId);
    console.log('🌐 URL analizada:', data.result?.url);
    console.log('🎯 Modo de extracción:', data.result?.extraction_mode);
    console.log('👤 Usuario:', data.result?.userId);
    
    const dna = data.result;
    if (dna) {
      // Análisis de ADN visual
      if (dna.brand_dna) {
        console.log('\n🎨 IDENTIDAD VISUAL (Brand DNA):');
        if (dna.brand_dna.colors) {
          console.log('  🎨 Paleta de colores:');
          Object.entries(dna.brand_dna.colors).forEach(([key, value]) => {
            console.log(`    ${key}: ${value}`);
          });
        }
        if (dna.brand_dna.typography) {
          console.log('  🔤 Tipografía:');
          Object.entries(dna.brand_dna.typography).forEach(([key, value]) => {
            console.log(`    ${key}: ${value}`);
          });
        }
        if (dna.brand_dna.styling) {
          console.log('  🎨 Estilos:');
          Object.entries(dna.brand_dna.styling).forEach(([key, value]) => {
            console.log(`    ${key}: ${value}`);
          });
        }
      }

      // Análisis de órdenes lógicas
      if (dna.logical_orders && Array.isArray(dna.logical_orders)) {
        console.log('\n📋 ÓRDENES LÓGICAS:');
        dna.logical_orders.forEach((order, index) => {
          console.log(`  ${index + 1}. ${order}`);
        });
      }

      // Análisis de tokens CSS
      if (dna.css_tokens) {
        console.log('\n💻 TOKENS CSS/TAILWIND:');
        console.log('  Longitud del bloque CSS:', dna.css_tokens.length, 'caracteres');
        // Mostrar primeras líneas como muestra
        const cssPreview = dna.css_tokens.split('\n').slice(0, 5).join('\n');
        console.log('  Vista previa:');
        console.log(cssPreview);
        if (dna.css_tokens.split('\n').length > 5) {
          console.log('  ... (continúa)');
        }
      }

      // Estrategia de contenido
      if (dna.content_strategy) {
        console.log('\n📝 ESTRATEGIA DE CONTENIDO:');
        Object.entries(dna.content_strategy).forEach(([key, value]) => {
          console.log(`  ${key}: ${value}`);
        });
      }

      // Patrones de UI
      if (dna.ui_patterns) {
        console.log('\n📱 PATRONES DE UI:');
        Object.entries(dna.ui_patterns).forEach(([key, value]) => {
          console.log(`  ${key}: ${Array.isArray(value) ? value.join(', ') : value}`);
        });
      }
    }
  } else {
    console.log('❌ La extracción no fue exitosa');
    console.log('Mensaje:', data.message);
  }

  console.log('\n🏁 FIN DEL ANÁLISIS');
  console.log('=' .repeat(60));
}

// Ejecutar la prueba
testWebsiteDnaExtraction();