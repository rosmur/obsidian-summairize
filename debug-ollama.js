// Debug script to test Ollama connectivity
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

async function testOllama() {
  console.log('Testing Ollama connectivity...\n');
  
  // Set up environment with common paths
  const env = {
    ...process.env,
    PATH: [
      process.env.PATH,
      '/usr/local/bin',
      '/opt/homebrew/bin',
      '/usr/bin',
      '/bin',
      '/usr/sbin',
      '/sbin',
      process.env.HOME + '/.local/bin'
    ].filter(Boolean).join(':')
  };

  const tests = [
    { name: 'Check PATH', command: 'echo $PATH' },
    { name: 'Which ollama', command: 'which ollama' },
    { name: 'Command -v ollama', command: 'command -v ollama' },
    { name: 'Ollama version', command: 'ollama --version' },
    { name: 'Ollama list', command: 'ollama list' },
    { name: 'Ollama ps', command: 'ollama ps' }
  ];

  for (const test of tests) {
    try {
      console.log(`🔍 ${test.name}:`);
      const { stdout, stderr } = await execAsync(test.command, { env, timeout: 10000 });
      console.log(`✅ Success: ${stdout.trim()}`);
      if (stderr && stderr.trim()) {
        console.log(`⚠️  Stderr: ${stderr.trim()}`);
      }
    } catch (error) {
      console.log(`❌ Failed: ${error.message}`);
    }
    console.log('');
  }

  // Test HTTP API method (more reliable for programmatic access)
  try {
    console.log('🔍 Testing Ollama HTTP API:');
    const response = await fetch('http://localhost:11434/api/tags');
    if (response.ok) {
      const data = await response.json();
      console.log(`✅ HTTP API test: Found ${data.models?.length || 0} models`);
    } else {
      console.log(`❌ HTTP API test failed: ${response.status} ${response.statusText}`);
    }
  } catch (error) {
    console.log(`❌ HTTP API test failed: ${error.message}`);
  }
  console.log('');

  // Test a simple ollama run command (this might fail due to TTY issues)
  try {
    console.log('🔍 Testing simple ollama run (may timeout due to TTY):');
    const { stdout } = await execAsync('echo "Hello, respond with just OK" | ollama run gemma3:4b', { 
      env, 
      timeout: 30000 
    });
    console.log(`✅ Ollama run test: ${stdout.trim()}`);
  } catch (error) {
    console.log(`❌ Ollama run test failed: ${error.message}`);
    console.log('ℹ️  This is expected - ollama run needs TTY. The plugin will use HTTP API instead.');
  }
}

testOllama().catch(console.error);
