// Test script to verify OpenAI-compatible API works
const API_ENDPOINT = process.env.API_ENDPOINT || 'http://127.0.0.1:9292';
const API_KEY = process.env.API_KEY || '';
const MODEL_NAME = process.env.MODEL_NAME || 'gpt-3.5-turbo';

async function testOpenAICompatibleAPI() {
  console.log('Testing OpenAI-compatible API...\n');
  console.log(`Endpoint: ${API_ENDPOINT}`);
  console.log(`Model: ${MODEL_NAME}\n`);

  try {
    // Test 1: Check if API is available
    console.log('🔍 Testing API availability:');
    const modelsResponse = await fetch(`${API_ENDPOINT}/v1/models`, {
      headers: {
        'Authorization': `Bearer ${API_KEY}`
      }
    });

    if (modelsResponse.ok) {
      const modelsData = await modelsResponse.json();
      console.log(`✅ API available.`);

      if (modelsData.data && modelsData.data.length > 0) {
        console.log(`Found ${modelsData.data.length} models`);
        console.log('Available models:', modelsData.data.map(m => m.id).slice(0, 5).join(', '));
      }
    } else {
      const errorText = await modelsResponse.text();
      console.log(`❌ API not available: ${modelsResponse.status} ${modelsResponse.statusText}`);
      console.log(`Error: ${errorText}`);
      return;
    }

    console.log('');

    // Test 2: Try generating a summary
    console.log('🔍 Testing summary generation:');
    const generateResponse = await fetch(`${API_ENDPOINT}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: MODEL_NAME,
        messages: [
          {
            role: 'user',
            content: 'Please provide a brief summary of the following text in approximately 50 words: This is a test document about artificial intelligence and machine learning. It discusses various algorithms and their applications in modern technology.'
          }
        ],
        temperature: 0.7
      })
    });

    if (generateResponse.ok) {
      const generateData = await generateResponse.json();
      if (generateData.error) {
        console.log(`❌ Generation failed: ${generateData.error.message || JSON.stringify(generateData.error)}`);
      } else {
        console.log(`✅ Summary generated successfully:`);
        console.log(`Response: ${generateData.choices?.[0]?.message?.content || 'No content'}`);
      }
    } else {
      const errorText = await generateResponse.text();
      console.log(`❌ Generation request failed: ${generateResponse.status} ${generateResponse.statusText}`);
      console.log(`Error: ${errorText}`);
    }

  } catch (error) {
    console.log(`❌ Test failed: ${error.message}`);
  }
}

testOpenAICompatibleAPI().catch(console.error);
