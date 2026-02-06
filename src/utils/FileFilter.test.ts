import { describe, it, expect } from 'vitest';
import { FileFilter } from './FileFilter';
import { DEFAULT_SETTINGS, SummarySettings } from '../types';

// Minimal TFile mock
function mockFile(path: string): any {
  const parts = path.split('/');
  const nameWithExt = parts[parts.length - 1];
  const basename = nameWithExt.replace(/\.[^.]+$/, '');
  return { path, name: nameWithExt, basename };
}

function createFilter(overrides: Partial<SummarySettings> = {}): FileFilter {
  return new FileFilter({ ...DEFAULT_SETTINGS, ...overrides });
}

describe('FileFilter.isExcludedFile', () => {
  describe('template exclusion', () => {
    it('excludes files in template folders', () => {
      const filter = createFilter();
      expect(filter.isExcludedFile(mockFile('Templates/my-template.md'))).toEqual({
        excluded: true,
        reason: 'File is in template folder: Templates',
      });
    });

    it('excludes files with "template" in the name', () => {
      const filter = createFilter();
      const result = filter.isExcludedFile(mockFile('notes/my-template.md'));
      expect(result.excluded).toBe(true);
      expect(result.reason).toContain('template');
    });

    it('does not exclude template files when setting is off', () => {
      const filter = createFilter({ excludeTemplates: false });
      expect(filter.isExcludedFile(mockFile('Templates/my-template.md'))).toEqual({
        excluded: false,
      });
    });

    it('does not exclude normal files', () => {
      const filter = createFilter();
      expect(filter.isExcludedFile(mockFile('notes/meeting-notes.md')).excluded).toBe(false);
    });
  });

  describe('daily note exclusion', () => {
    it('excludes files matching the daily note pattern', () => {
      const filter = createFilter();
      const result = filter.isExcludedFile(mockFile('daily/2024-01-15.md'));
      expect(result.excluded).toBe(true);
      expect(result.reason).toContain('daily note pattern');
    });

    it('excludes files in daily notes folders', () => {
      const filter = createFilter();
      expect(filter.isExcludedFile(mockFile('Daily Notes/some-note.md')).excluded).toBe(true);
      expect(filter.isExcludedFile(mockFile('dailynotes/some-note.md')).excluded).toBe(true);
    });

    it('does not exclude daily notes when setting is off', () => {
      const filter = createFilter({ excludeDailyNotes: false });
      expect(filter.isExcludedFile(mockFile('daily/2024-01-15.md')).excluded).toBe(false);
    });
  });

  describe('invalid regex handling', () => {
    it('handles invalid daily note regex gracefully', () => {
      const filter = createFilter({ dailyNotesPattern: '(invalid[' });
      // Should not throw — just not match
      expect(() => filter.isExcludedFile(mockFile('notes/test.md'))).not.toThrow();
      expect(filter.isExcludedFile(mockFile('notes/test.md')).excluded).toBe(false);
    });
  });

  describe('exclusion reasons', () => {
    it('returns a reason when file is excluded', () => {
      const filter = createFilter();
      const result = filter.isExcludedFile(mockFile('Templates/note.md'));
      expect(result.excluded).toBe(true);
      expect(result.reason).toBeDefined();
    });

    it('returns no reason when file is not excluded', () => {
      const filter = createFilter();
      const result = filter.isExcludedFile(mockFile('notes/normal.md'));
      expect(result.excluded).toBe(false);
      expect(result.reason).toBeUndefined();
    });
  });
});
