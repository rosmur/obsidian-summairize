export interface SummarySettings {
  apiEndpoint: string;
  apiKey: string;
  modelName: string;
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

export interface SummaryResult {
  success: boolean;
  summary?: string;
  error?: string;
}

export const DEFAULT_SETTINGS: SummarySettings = {
  apiEndpoint: 'http://127.0.0.1:9292',
  apiKey: '',
  modelName: 'gpt-3.5-turbo',
  summaryLength: 500,
  excludeTemplates: true,
  excludeDailyNotes: true,
  dailyNotesPattern: '\\d{4}-\\d{2}-\\d{2}',
  templateFolders: ['Templates', 'templates']
};
