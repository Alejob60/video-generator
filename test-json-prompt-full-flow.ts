import axios from 'axios';

// Test JSON prompt that should be processed correctly
const jsonPrompt = {
  "scene_description": "Una hamburguesa jugosa con dos capas de carne, cubierta con queso derretido y rodajas frescas de tomate, presentada sobre un plato rústico.",
  "visual_elements": [
    "dos capas de carne",
    "queso derretido",
    "rodajas de tomate",
    "pan dorado",
    "plato rústico"
  ],
  "style": "fotografía gastronómica",
  "mood": "apetitoso y acogedor",
  "color_palette": [
    "marrón dorado",
    "rojo brillante",
    "amarillo cálido",
    "verde suave"
  ],
  "composition": "plano medio centrado, enfoque selectivo sobre la hamburguesa, desenfoque del fondo",
  "lighting": "luz cálida lateral para resaltar texturas y jugosidad",
  "details": "Queso ligeramente fundido cayendo por los lados, tomate fresco con gotas de humedad, contraste entre el pan crujiente y la carne jugosa"
};

async function testJsonPromptWithFlux() {
  try {
    console.log('Testing JSON prompt with FLUX...');
    
    const response = await axios.post('http://localhost:3000/media/image', {
      prompt: JSON.stringify(jsonPrompt),
      plan: 'CREATOR',
      useFlux: true,
      isJsonPrompt: true
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
async function testRegularPromptWithFlux() {
  try {
    console.log('\nTesting regular prompt with FLUX...');
    
    const response = await axios.post('http://localhost:3000/media/image', {
      prompt: 'A beautiful sunset over the mountains',
      plan: 'CREATOR',
      useFlux: true
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
testJsonPromptWithFlux().then(() => testRegularPromptWithFlux());