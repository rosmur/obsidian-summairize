import { App, Editor, MarkdownView, MarkdownFileInfo, Modal, Notice, Plugin, PluginSettingTab, Setting, TFile } from 'obsidian';
import { AIService } from './src/services/AIService';
import { FileFilter } from './src/utils/FileFilter';
import { NoteUtils } from './src/utils/NoteUtils';
import { NotificationManager } from './src/ui/NotificationManager';
import { SettingsManager, SummairizeSettingTab } from './src/settings/SettingsManager';
import { SummarySettings, DEFAULT_SETTINGS } from './src/types';

export default class SummairizePlugin extends Plugin {
  settings: SummarySettings;
  settingsManager: SettingsManager;
  aiService: AIService;
  fileFilter: FileFilter;

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

    console.log('Summairize plugin loaded');
  }

  onunload() {
    console.log('Summairize plugin unloaded');
  }

  async generateSummaryForActiveNote(): Promise<void> {
    const activeFile = this.app.workspace.getActiveFile();
    
    if (!activeFile) {
      NotificationManager.showError('No active note found');
      return;
    }

    // Check if file should be excluded
    if (this.fileFilter.isExcludedFile(activeFile)) {
      const reason = this.getExclusionReason(activeFile);
      NotificationManager.showFileExcluded(reason);
      return;
    }

    // Show loading notification
    const loadingNotice = NotificationManager.showLoading();

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
    }
  }

  private getExclusionReason(file: TFile): string {
    if (this.settings.excludeTemplates) {
      const filePath = file.path.toLowerCase();
      for (const templateFolder of this.settings.templateFolders) {
        if (filePath.includes(templateFolder.toLowerCase())) {
          return `File is in template folder: ${templateFolder}`;
        }
      }
      if (file.name.toLowerCase().includes('template')) {
        return 'Filename contains "template"';
      }
    }

    if (this.settings.excludeDailyNotes) {
      const fileName = file.basename;
      const pattern = new RegExp(this.settings.dailyNotesPattern);
      if (pattern.test(fileName)) {
        return 'File matches daily note pattern';
      }
      const filePath = file.path.toLowerCase();
      if (filePath.includes('daily notes') || filePath.includes('dailynotes')) {
        return 'File is in daily notes folder';
      }
    }

    return 'File is excluded by current settings';
  }

  async loadSettings(): Promise<SummarySettings> {
    return await this.settingsManager.loadSettings();
  }

  async saveSettings(settings: SummarySettings): Promise<void> {
    await this.settingsManager.saveSettings(settings);
  }
}
