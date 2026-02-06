import { Editor, MarkdownView, MarkdownFileInfo, Plugin } from 'obsidian';
import { AIService } from './src/services/AIService';
import { FileFilter } from './src/utils/FileFilter';
import { NoteUtils } from './src/utils/NoteUtils';
import { NotificationManager } from './src/ui/NotificationManager';
import { SettingsManager, SummairizeSettingTab } from './src/settings/SettingsManager';
import { SummarySettings } from './src/types';

export default class SummairizePlugin extends Plugin {
  settings: SummarySettings;
  settingsManager: SettingsManager;
  aiService: AIService;
  fileFilter: FileFilter;
  private isGenerating = false;

  async onload() {
    // Initialize settings manager
    this.settingsManager = new SettingsManager(this);
    this.settings = await this.settingsManager.loadSettings();

    // Initialize services
    this.aiService = new AIService(this.settings);
    this.fileFilter = new FileFilter(this.settings);

    // Add ribbon icon
    this.addRibbonIcon('brain-circuit', 'Generate Summary', (evt: MouseEvent) => {
      this.generateSummaryForActiveNote();
    });

    // Add command
    this.addCommand({
      id: 'generate-summary',
      name: 'Generate Summary',
      callback: () => {
        this.generateSummaryForActiveNote();
      }
    });

    // Add command palette entry
    this.addCommand({
      id: 'generate-summary-editor',
      name: 'Generate Summary for Current Note',
      editorCallback: (editor: Editor, ctx: MarkdownView | MarkdownFileInfo) => {
        this.generateSummaryForActiveNote();
      }
    });

    // Add settings tab
    this.addSettingTab(new SummairizeSettingTab(this.app, this));
  }

  onunload() {
    // Plugin cleanup
  }

  async generateSummaryForActiveNote(): Promise<void> {
    if (this.isGenerating) {
      NotificationManager.showWarning('Summary generation already in progress');
      return;
    }

    const activeFile = this.app.workspace.getActiveFile();

    if (!activeFile) {
      NotificationManager.showError('No active note found');
      return;
    }

    // Check if file should be excluded — reason comes from FileFilter directly
    const exclusion = this.fileFilter.isExcludedFile(activeFile);
    if (exclusion.excluded) {
      NotificationManager.showFileExcluded(exclusion.reason || 'File is excluded by current settings');
      return;
    }

    // Show loading notification
    const loadingNotice = NotificationManager.showLoading();
    this.isGenerating = true;

    try {
      // Read file content
      const content = await this.app.vault.read(activeFile);

      // Generate summary
      const result = await this.aiService.generateSummary(content);

      // Dismiss loading notification
      NotificationManager.dismissNotice(loadingNotice);

      if (result.success && result.summary) {
        // Insert summary into note
        const updatedContent = NoteUtils.insertSummary(content, result.summary);
        await this.app.vault.modify(activeFile, updatedContent);

        // Show success notification
        const wordCount = result.summary.split(/\s+/).length;
        NotificationManager.showSummarySuccess(wordCount);
      } else {
        NotificationManager.showSummaryError(result.error || 'Unknown error');
      }
    } catch (error: any) {
      NotificationManager.dismissNotice(loadingNotice);
      NotificationManager.showSummaryError(error.message || 'Unexpected error occurred');
    } finally {
      this.isGenerating = false;
    }
  }

  async loadSettings(): Promise<SummarySettings> {
    return await this.settingsManager.loadSettings();
  }

  async saveSettings(settings: SummarySettings): Promise<void> {
    await this.settingsManager.saveSettings(settings);
  }
}
