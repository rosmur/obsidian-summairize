import { AIProvider } from './AIProvider';
import { SummaryOptions } from '../types';

export class OpenAICompatibleProvider extends AIProvider {
  private apiEndpoint: string;
  private apiKey: string;
  private defaultModel: string;

  constructor(apiEndpoint: string, apiKey: string, defaultModel: string) {
    super();
    this.apiEndpoint = apiEndpoint;
    this.apiKey = apiKey;
    this.defaultModel = defaultModel;
  }

  async generateSummary(content: string, options: SummaryOptions): Promise<string> {
    const model = options.model || this.defaultModel;
    const prompt = this.formatPrompt(content, options.length);

    try {
      const result = await this.callAPI(model, prompt);
      return this.validateSummary(result);
    } catch (error: any) {
      throw new Error(`API error: ${error.message}`);
    }
  }

  private async callAPI(model: string, prompt: string): Promise<string> {
    const url = `${this.apiEndpoint}/v1/chat/completions`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error.message || JSON.stringify(data.error));
    }

    return data.choices?.[0]?.message?.content || '';
  }

  async isAvailable(): Promise<boolean> {
    try {
      const url = `${this.apiEndpoint}/v1/models`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });
      return response.ok;
    } catch (error: any) {
      console.log('API availability check failed:', error.message);
      return false;
    }
  }

  getDisplayName(): string {
    return 'OpenAI Compatible API';
  }

  updateSettings(apiEndpoint: string, apiKey: string, defaultModel: string): void {
    this.apiEndpoint = apiEndpoint;
    this.apiKey = apiKey;
    this.defaultModel = defaultModel;
  }
}
