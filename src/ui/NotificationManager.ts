import { Notice } from 'obsidian';

export class NotificationManager {
  static showSuccess(message: string, duration: number = 4000): void {
    new Notice(`✅ ${message}`, duration);
  }

  static showError(message: string, duration: number = 8000): void {
    new Notice(`❌ ${message}`, duration);
  }

  static showWarning(message: string, duration: number = 6000): void {
    new Notice(`⚠️ ${message}`, duration);
  }

  static showInfo(message: string, duration: number = 4000): void {
    new Notice(`ℹ️ ${message}`, duration);
  }

  static showLoading(message: string = 'Generating summary...', duration: number = 0): Notice {
    return new Notice(`🔄 ${message}`, duration);
  }

  static dismissNotice(notice: Notice): void {
    notice.hide();
  }

  static showSummarySuccess(wordCount?: number): void {
    const message = wordCount 
      ? `Summary generated successfully (${wordCount} words)`
      : 'Summary generated successfully';
    this.showSuccess(message);
  }

  static showSummaryError(error: string): void {
    this.showError(`Failed to generate summary: ${error}`);
  }

  static showFileExcluded(reason: string): void {
    this.showWarning(`File excluded from summarization: ${reason}`);
  }

  static showProviderUnavailable(provider: string): void {
    this.showError(`${provider} is not available. Please check your configuration.`);
  }
}
