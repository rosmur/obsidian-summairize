import { OpenAICompatibleProvider } from './OpenAICompatibleProvider';
import { SummarySettings, SummaryOptions, SummaryResult } from '../types';
import { NoteUtils } from '../utils/NoteUtils';

export class AIService {
  private provider: OpenAICompatibleProvider;
  private settings: SummarySettings;

  constructor(settings: SummarySettings) {
    this.settings = settings;
    this.provider = new OpenAICompatibleProvider(
      settings.apiEndpoint,
      settings.apiKey,
      settings.modelName
    );
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

      // Check if provider is available
      const isAvailable = await this.provider.isAvailable();
      if (!isAvailable) {
        return {
          success: false,
          error: `${this.provider.getDisplayName()} is not available. Please check your API endpoint and key.`
        };
      }

      // Prepare content for AI processing
      const cleanContent = NoteUtils.extractContentForSummary(content);
      const truncatedContent = NoteUtils.truncateForAI(cleanContent);

      // Generate summary
      const options: SummaryOptions = {
        length: this.settings.summaryLength,
        model: this.settings.modelName
      };

      const summary = await this.provider.generateSummary(truncatedContent, options);

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

  async getProviderStatus(): Promise<boolean> {
    try {
      return await this.provider.isAvailable();
    } catch {
      return false;
    }
  }

  updateSettings(settings: SummarySettings): void {
    this.settings = settings;
    this.provider.updateSettings(
      settings.apiEndpoint,
      settings.apiKey,
      settings.modelName
    );
  }
}
