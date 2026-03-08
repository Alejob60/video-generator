// 📁 test-azure-deployments.js
const { AzureOpenAI } = require('openai');

async function testDeployments() {
  console.log('🔍 VERIFICANDO DEPLOYMENTS DISPONIBLES EN AZURE OPENAI');
  console.log('=' .repeat(60));

  // Configuración de Azure OpenAI
  const config = {
    apiKey: process.env.AZURE_OPENAI_KEY,
    endpoint: process.env.AZURE_OPENAI_GPT_URL?.replace('/chat/completions', '').replace('/openai/deployments/gpt-4.1', ''),
    apiVersion: process.env.AZURE_OPENAI_API_VERSION,
    deployment: process.env.AZURE_OPENAI_GPT_DEPLOYMENT
  };

  console.log('🔧 Configuración actual:');
  console.log(`Endpoint: ${config.endpoint}`);
  console.log(`API Version: ${config.apiVersion}`);
  console.log(`Deployment: ${config.deployment}`);
  console.log('-'.repeat(40));

  // Lista de deployments comunes para probar
  const deploymentsToTest = [
    'gpt-4.1',
    'gpt-4',
    'gpt-4o', 
    'gpt-4o-mini',
    'gpt-35-turbo',
    'gpt-3.5-turbo'
  ];

  for (const deployment of deploymentsToTest) {
    try {
      console.log(`🧪 Probando deployment: ${deployment}`);
      
      const openai = new AzureOpenAI({
        apiKey: config.apiKey,
        endpoint: config.endpoint,
        apiVersion: config.apiVersion,
        deployment: deployment
      });

      const response = await openai.chat.completions.create({
        model: deployment,
        messages: [
          { role: 'user', content: 'Say hello' }
        ],
        max_tokens: 10
      });

      console.log(`✅ SUCCESS - ${deployment} está disponible`);
      console.log(`   Respuesta: ${response.choices[0]?.message?.content}`);
      console.log('');

    } catch (error) {
      console.log(`❌ FAILED - ${deployment} no disponible`);
      console.log(`   Error: ${error.message}`);
      console.log('');
    }
  }
}

testDeployments();