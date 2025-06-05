import { AIProvider } from './AIProvider';
import { SummaryOptions } from '../types';
import { ShellExecutor } from '../utils/ShellExecutor';

export class OllamaProvider extends AIProvider {
  private defaultModel: string;

  constructor(defaultModel: string = 'gemma3:4b') {
    super();
    this.defaultModel = defaultModel;
  }

  async generateSummary(content: string, options: SummaryOptions): Promise<string> {
    const model = options.model || this.defaultModel;
    const prompt = this.formatPrompt(content, options.length);
    
    try {
      // Try HTTP API first (more reliable)
      const result = await this.generateSummaryViaAPI(model, prompt);
      return this.validateSummary(result);
    } catch (apiError: any) {
      console.log('HTTP API failed, trying shell command:', apiError.message);
      
      // Fallback to shell command with pipe to avoid TTY issues
      try {
        const escapedPrompt = ShellExecutor.escapeShellArg(prompt);
        const command = `echo ${escapedPrompt} | ollama run ${model}`;
        const result = await ShellExecutor.execute(command);
        return this.validateSummary(result);
      } catch (error: any) {
        // Provide more specific error messages
        if (error.message.includes('model') && error.message.includes('not found')) {
          throw new Error(`Ollama model '${model}' not found. Please run: ollama pull ${model}`);
        } else if (error.message.includes('connection refused') || error.message.includes('connect')) {
          throw new Error('Ollama service is not running. Please start Ollama first.');
        } else if (error.message.includes('Command not found')) {
          throw new Error('Ollama is not installed. Please install Ollama from https://ollama.ai');
        } else {
          throw new Error(`Ollama error: ${error.message}`);
        }
      }
    }
  }

  private async generateSummaryViaAPI(model: string, prompt: string): Promise<string> {
    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model,
        prompt: prompt,
        stream: false
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error);
    }

    return data.response || '';
  }

  async isAvailable(): Promise<boolean> {
    try {
      // Method 1: Try HTTP API first (more reliable)
      try {
        const response = await fetch('http://localhost:11434/api/tags', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });
        if (response.ok) {
          console.log('Ollama API is available via HTTP');
          return true;
        }
      } catch (error: any) {
        console.log('Ollama HTTP API check failed:', error.message);
      }

      // Method 2: Fall back to command line checks
      const hasOllama = await ShellExecutor.checkCommand('ollama');
      if (!hasOllama) {
        console.log('Ollama command not found in PATH');
        return false;
      }

      // Try a simple ollama command to check if service is running
      try {
        await ShellExecutor.execute('ollama --version');
      } catch (error: any) {
        console.log('Ollama version check failed:', error.message);
        return false;
      }

      // Check if ollama service is running by listing models
      try {
        await ShellExecutor.execute('ollama list');
        return true;
      } catch (error: any) {
        console.log('Ollama list command failed:', error.message);
        // If list fails, try a simple ping to see if service is running
        try {
          await ShellExecutor.execute('ollama ps');
          return true;
        } catch {
          return false;
        }
      }
    } catch (error: any) {
      console.log('Ollama availability check failed:', error.message);
      return false;
    }
  }

  getDisplayName(): string {
    return 'Ollama';
  }

  async getAvailableModels(): Promise<string[]> {
    try {
      // Try HTTP API first
      const response = await fetch('http://localhost:11434/api/tags');
      if (response.ok) {
        const data = await response.json();
        return data.models?.map((model: any) => model.name) || [];
      }
    } catch (error: any) {
      console.log('HTTP API model list failed, trying shell command:', error.message);
    }

    // Fallback to shell command
    try {
      const output = await ShellExecutor.execute('ollama list');
      const lines = output.split('\n').slice(1); // Skip header
      const models = lines
        .filter(line => line.trim())
        .map(line => line.split(/\s+/)[0])
        .filter(model => model && !model.includes('NAME'));
      
      return models;
    } catch {
      return [];
    }
  }

  async pullModel(model: string): Promise<void> {
    const command = `ollama pull ${model}`;
    await ShellExecutor.execute(command);
  }

  setDefaultModel(model: string): void {
    this.defaultModel = model;
  }
}
