import { TFile } from 'obsidian';
import { SummarySettings } from '../types';

export class FileFilter {
  private settings: SummarySettings;

  constructor(settings: SummarySettings) {
    this.settings = settings;
  }

  isExcludedFile(file: TFile): boolean {
    if (this.settings.excludeTemplates && this.isTemplateFile(file)) {
      return true;
    }

    if (this.settings.excludeDailyNotes && this.isDailyNote(file)) {
      return true;
    }

    return false;
  }

  private isTemplateFile(file: TFile): boolean {
    const filePath = file.path;
    
    // Check if file is in any template folder
    for (const templateFolder of this.settings.templateFolders) {
      if (filePath.toLowerCase().includes(templateFolder.toLowerCase())) {
        return true;
      }
    }

    // Check if filename contains "template"
    if (file.name.toLowerCase().includes('template')) {
      return true;
    }

    return false;
  }

  private isDailyNote(file: TFile): boolean {
    const fileName = file.basename; // filename without extension
    const pattern = new RegExp(this.settings.dailyNotesPattern);
    
    // Check if filename matches daily note pattern
    if (pattern.test(fileName)) {
      return true;
    }

    // Check if file is in a "Daily Notes" folder
    const filePath = file.path.toLowerCase();
    if (filePath.includes('daily notes') || filePath.includes('dailynotes')) {
      return true;
    }

    return false;
  }

  updateSettings(settings: SummarySettings): void {
    this.settings = settings;
  }
}
