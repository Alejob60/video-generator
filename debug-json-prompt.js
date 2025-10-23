const axios = require('axios');

// Test JSON prompt
const jsonPrompt = {
  "scene_description": "Una hamburguesa jugosa con doble queso derretido y rodajas frescas de tomate, presentada de manera apetitosa sobre un plato rústico.",
  "visual_elements": [
    "Pan tostado",
    "Dos capas de queso derretido",
    "Rodajas de tomate rojo brillante",
    "Carne jugosa",
    "Plato rústico",
    "Fondo de cocina desenfocado"
  ],
  "style": "Fotografía gastronómica de alta resolución",
  "mood": "Apetitoso y acogedor",
  "color_palette": [
    "Marrón dorado",
    "Amarillo cálido",
    "Rojo vibrante",
    "Verde suave",
    "Blanco crema"
  ],
  "composition": "Plano medio, encuadre centrado, enfoque en la hamburguesa con fondo ligeramente difuminado",
  "lighting": "Luz natural suave proveniente de un lateral",
  "details": "El queso se muestra fundido con ligera textura, el tomate fresco con gotas de humedad, pan con semillas ligeramente tostado"
};

// Test the endpoint
async function testEndpoint() {
  try {
    const response = await axios.post('http://localhost:3000/media/flux-image', {
      prompt: JSON.stringify(jsonPrompt),
      plan: 'CREATOR',
      isJsonPrompt: true, // This is the key flag
      size: '1024x1024'
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Response:', response.data);
  } catch (error) {
    console.error('Error:', error.response ? error.response.data : error.message);
  }
}

testEndpoint();