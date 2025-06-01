import { SummaryOptions } from '../types';

export abstract class AIProvider {
  abstract generateSummary(content: string, options: SummaryOptions): Promise<string>;
  abstract isAvailable(): Promise<boolean>;
  abstract getDisplayName(): string;
  
  protected formatPrompt(content: string, length: number): string {
    return `Please provide a comprehensive summary of the following text in approximately ${length} words. Focus on the main ideas, key points, and important details:\n\n${content}`;
  }
  
  protected validateSummary(summary: string): string {
    // Clean up the summary
    let cleaned = summary.trim();
    
    // Remove any prompt echoing
    const promptIndicators = [
      'Here is a summary',
      'Here\'s a summary',
      'Summary:',
      'The summary is:',
      'Based on the text',
      'The text discusses'
    ];
    
    for (const indicator of promptIndicators) {
      if (cleaned.toLowerCase().startsWith(indicator.toLowerCase())) {
        cleaned = cleaned.substring(indicator.length).trim();
        if (cleaned.startsWith(':')) {
          cleaned = cleaned.substring(1).trim();
        }
        break;
      }
    }
    
    return cleaned;
  }
}
