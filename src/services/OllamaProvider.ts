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
    
    // Escape the prompt for shell execution
    const escapedPrompt = ShellExecutor.escapeShellArg(prompt);
    
    // Construct the ollama command
    const command = `ollama run ${model} ${escapedPrompt}`;
    
    try {
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

  async isAvailable(): Promise<boolean> {
    try {
      // Check if ollama command exists
      const hasOllama = await ShellExecutor.checkCommand('ollama');
      if (!hasOllama) {
        return false;
      }

      // Check if ollama service is running by listing models
      await ShellExecutor.execute('ollama list');
      return true;
    } catch {
      return false;
    }
  }

  getDisplayName(): string {
    return 'Ollama';
  }

  async getAvailableModels(): Promise<string[]> {
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
