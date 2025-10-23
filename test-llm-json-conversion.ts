import axios from 'axios';

// Test JSON prompt similar to what was causing issues
const jsonPrompt = JSON.stringify({
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
});

async function testJsonPromptConversion() {
  try {
    console.log('Testing JSON prompt conversion with LLM...');
    
    const response = await axios.post('http://localhost:3000/media/flux-image', {
      prompt: jsonPrompt,
      plan: 'CREATOR',
      isJsonPrompt: true,
      size: '1024x1024'
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Success! Response:', response.data);
  } catch (error: any) {
    console.error('❌ Error:', error.response ? error.response.data : error.message);
  }
}

// Also test with a regular prompt to make sure we didn't break anything
async function testRegularPrompt() {
  try {
    console.log('\nTesting regular prompt...');
    
    const response = await axios.post('http://localhost:3000/media/flux-image', {
      prompt: 'A beautiful sunset over the mountains',
      plan: 'CREATOR',
      size: '1024x1024'
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Success! Response:', response.data);
  } catch (error: any) {
    console.error('❌ Error:', error.response ? error.response.data : error.message);
  }
}

// Run both tests
testJsonPromptConversion().then(() => testRegularPrompt());