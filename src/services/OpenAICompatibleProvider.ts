import { AIProviderBase } from './AIProvider';
import { SummaryOptions } from '../types';

const DEFAULT_TIMEOUT_MS = 30_000;
const HEALTH_CHECK_TIMEOUT_MS = 5_000;

export class OpenAICompatibleProvider extends AIProviderBase {
  private apiEndpoint: string;
  private apiKey: string;
  private defaultModel: string;
  private activeController: AbortController | null = null;

  constructor(apiEndpoint: string, apiKey: string, defaultModel: string) {
    super();
    this.apiEndpoint = apiEndpoint;
    this.apiKey = apiKey;
    this.defaultModel = defaultModel;
  }

  /** Cancel any in-flight API request. */
  abort(): void {
    this.activeController?.abort();
    this.activeController = null;
  }

  async generateSummary(content: string, options: SummaryOptions): Promise<string> {
    const model = options.model || this.defaultModel;
    const prompt = this.formatPrompt(content, options.length);

    try {
      const result = await this.callAPI(model, prompt);
      return this.validateSummary(result);
    } catch (error: any) {
      if (error.name === 'AbortError') {
        throw new Error('Request was cancelled');
      }
      throw new Error(`API error: ${error.message}`);
    }
  }

  private async callAPI(model: string, prompt: string): Promise<string> {
    // Cancel any previous in-flight request
    this.abort();

    const controller = new AbortController();
    this.activeController = controller;
    const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

    try {
      const url = `${this.apiEndpoint}/v1/chat/completions`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model,
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7
        }),
        signal: controller.signal
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
    } finally {
      clearTimeout(timeoutId);
      this.activeController = null;
    }
  }

  async isAvailable(): Promise<boolean> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), HEALTH_CHECK_TIMEOUT_MS);

    try {
      const url = `${this.apiEndpoint}/v1/models`;
      const response = await fetch(url, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${this.apiKey}` },
        signal: controller.signal
      });
      return response.ok;
    } catch {
      return false;
    } finally {
      clearTimeout(timeoutId);
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
