import { TFile } from 'obsidian';
import { SummarySettings } from '../types';

export interface ExclusionResult {
  excluded: boolean;
  reason?: string;
}

export class FileFilter {
  private settings: SummarySettings;

  constructor(settings: SummarySettings) {
    this.settings = settings;
  }

  isExcludedFile(file: TFile): ExclusionResult {
    if (this.settings.excludeTemplates) {
      const templateReason = this.getTemplateExclusionReason(file);
      if (templateReason) {
        return { excluded: true, reason: templateReason };
      }
    }

    if (this.settings.excludeDailyNotes) {
      const dailyNoteReason = this.getDailyNoteExclusionReason(file);
      if (dailyNoteReason) {
        return { excluded: true, reason: dailyNoteReason };
      }
    }

    return { excluded: false };
  }

  private getTemplateExclusionReason(file: TFile): string | null {
    const filePath = file.path.toLowerCase();

    for (const templateFolder of this.settings.templateFolders) {
      if (filePath.includes(templateFolder.toLowerCase())) {
        return `File is in template folder: ${templateFolder}`;
      }
    }

    if (file.name.toLowerCase().includes('template')) {
      return 'Filename contains "template"';
    }

    return null;
  }

  private getDailyNoteExclusionReason(file: TFile): string | null {
    const fileName = file.basename;

    try {
      const pattern = new RegExp(this.settings.dailyNotesPattern);
      if (pattern.test(fileName)) {
        return 'File matches daily note pattern';
      }
    } catch {
      // Invalid regex — skip pattern matching rather than crashing
    }

    const filePath = file.path.toLowerCase();
    if (filePath.includes('daily notes') || filePath.includes('dailynotes')) {
      return 'File is in daily notes folder';
    }

    return null;
  }

  updateSettings(settings: SummarySettings): void {
    this.settings = settings;
  }
}
