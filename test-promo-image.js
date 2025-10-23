const axios = require('axios');

async function testPromoImage() {
  try {
    console.log('Prueba 1: Generar imagen con prompt');
    const response1 = await axios.post('http://localhost:4000/media/image', {
      prompt: 'Un hermoso paisaje montañoso al atardecer con ríos y bosques',
      plan: 'FREE'
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Respuesta 1:', response1.data);
    console.log('----------------------------------------');
    
    console.log('Prueba 2: Generar imagen con FLUX');
    const response2 = await axios.post('http://localhost:4000/media/image', {
      prompt: 'Un robot futurista en un entorno cyberpunk',
      plan: 'FREE',
      useFlux: true
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Respuesta 2:', response2.data);
    console.log('----------------------------------------');
    
    console.log('Prueba 3: Generar imagen con texto superpuesto');
    const response3 = await axios.post('http://localhost:4000/media/image', {
      prompt: 'Una hamburguesa gourmet con ingredientes frescos',
      textOverlay: '¡Oferta Especial!',
      plan: 'CREATOR'
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Respuesta 3:', response3.data);
    console.log('----------------------------------------');
    
    console.log('Todas las pruebas completadas');
  } catch (error) {
    console.error('Error:', error.response ? error.response.data : error.message);
  }
}

testPromoImage();