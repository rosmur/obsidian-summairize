export interface SummarySettings {
  aiProvider: 'ollama' | 'openai' | 'anthropic';
  ollamaModel: string;
  summaryLength: number;
  excludeTemplates: boolean;
  excludeDailyNotes: boolean;
  dailyNotesPattern: string;
  templateFolders: string[];
}

export interface SummaryOptions {
  length: number;
  model?: string;
}

export interface AIProvider {
  generateSummary(content: string, options: SummaryOptions): Promise<string>;
  isAvailable(): Promise<boolean>;
  getDisplayName(): string;
}

export interface SummaryResult {
  success: boolean;
  summary?: string;
  error?: string;
}

export const DEFAULT_SETTINGS: SummarySettings = {
  aiProvider: 'ollama',
  ollamaModel: 'gemma3:4b',
  summaryLength: 500,
  excludeTemplates: true,
  excludeDailyNotes: true,
  dailyNotesPattern: '\\d{4}-\\d{2}-\\d{2}',
  templateFolders: ['Templates', 'templates']
};
