import { AIProvider } from './AIProvider';
import { OllamaProvider } from './OllamaProvider';
import { SummarySettings, SummaryOptions, SummaryResult } from '../types';
import { NoteUtils } from '../utils/NoteUtils';

export class AIService {
  private providers: Map<string, AIProvider> = new Map();
  private settings: SummarySettings;

  constructor(settings: SummarySettings) {
    this.settings = settings;
    this.initializeProviders();
  }

  private initializeProviders(): void {
    // Initialize Ollama provider
    const ollamaProvider = new OllamaProvider(this.settings.ollamaModel);
    this.providers.set('ollama', ollamaProvider);

    // Future providers can be added here:
    // this.providers.set('openai', new OpenAIProvider());
    // this.providers.set('anthropic', new AnthropicProvider());
  }

  async generateSummary(content: string): Promise<SummaryResult> {
    try {
      // Validate content
      const validation = NoteUtils.validateContent(content);
      if (!validation.isValid) {
        return {
          success: false,
          error: validation.reason
        };
      }

      // Get the current provider
      const provider = this.providers.get(this.settings.aiProvider);
      if (!provider) {
        return {
          success: false,
          error: `AI provider '${this.settings.aiProvider}' not found`
        };
      }

      // Check if provider is available
      const isAvailable = await provider.isAvailable();
      if (!isAvailable) {
        return {
          success: false,
          error: `${provider.getDisplayName()} is not available. Please check your installation and configuration.`
        };
      }

      // Prepare content for AI processing
      const cleanContent = NoteUtils.extractContentForSummary(content);
      const truncatedContent = NoteUtils.truncateForAI(cleanContent);

      // Generate summary
      const options: SummaryOptions = {
        length: this.settings.summaryLength,
        model: this.settings.aiProvider === 'ollama' ? this.settings.ollamaModel : undefined
      };

      const summary = await provider.generateSummary(truncatedContent, options);

      if (!summary || summary.trim().length === 0) {
        return {
          success: false,
          error: 'Generated summary is empty'
        };
      }

      return {
        success: true,
        summary: summary.trim()
      };

    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Unknown error occurred while generating summary'
      };
    }
  }

  async getProviderStatus(): Promise<{ [key: string]: boolean }> {
    const status: { [key: string]: boolean } = {};
    
    for (const [name, provider] of this.providers) {
      try {
        status[name] = await provider.isAvailable();
      } catch {
        status[name] = false;
      }
    }
    
    return status;
  }

  getAvailableProviders(): string[] {
    return Array.from(this.providers.keys());
  }

  updateSettings(settings: SummarySettings): void {
    this.settings = settings;
    
    // Update Ollama provider model if changed
    const ollamaProvider = this.providers.get('ollama') as OllamaProvider;
    if (ollamaProvider) {
      ollamaProvider.setDefaultModel(settings.ollamaModel);
    }
  }

  async getOllamaModels(): Promise<string[]> {
    const ollamaProvider = this.providers.get('ollama') as OllamaProvider;
    if (ollamaProvider) {
      return await ollamaProvider.getAvailableModels();
    }
    return [];
  }

  async pullOllamaModel(model: string): Promise<void> {
    const ollamaProvider = this.providers.get('ollama') as OllamaProvider;
    if (ollamaProvider) {
      await ollamaProvider.pullModel(model);
    } else {
      throw new Error('Ollama provider not available');
    }
  }
}
