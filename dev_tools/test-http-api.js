// Test script to verify Ollama HTTP API works
async function testOllamaAPI() {
  console.log('Testing Ollama HTTP API...\n');

  try {
    // Test 1: Check if API is available
    console.log('🔍 Testing API availability:');
    const tagsResponse = await fetch('http://localhost:11434/api/tags');
    if (tagsResponse.ok) {
      const tagsData = await tagsResponse.json();
      console.log(`✅ API available. Found ${tagsData.models?.length || 0} models`);
      
      if (tagsData.models && tagsData.models.length > 0) {
        console.log('Available models:', tagsData.models.map(m => m.name).join(', '));
      }
    } else {
      console.log(`❌ API not available: ${tagsResponse.status} ${tagsResponse.statusText}`);
      return;
    }

    console.log('');

    // Test 2: Try generating a summary
    console.log('🔍 Testing summary generation:');
    const generateResponse = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gemma3:4b',
        prompt: 'Please provide a brief summary of the following text in approximately 50 words: This is a test document about artificial intelligence and machine learning. It discusses various algorithms and their applications in modern technology.',
        stream: false
      })
    });

    if (generateResponse.ok) {
      const generateData = await generateResponse.json();
      if (generateData.error) {
        console.log(`❌ Generation failed: ${generateData.error}`);
      } else {
        console.log(`✅ Summary generated successfully:`);
        console.log(`Response: ${generateData.response}`);
      }
    } else {
      console.log(`❌ Generation request failed: ${generateResponse.status} ${generateResponse.statusText}`);
    }

  } catch (error) {
    console.log(`❌ Test failed: ${error.message}`);
  }
}

testOllamaAPI().catch(console.error);
