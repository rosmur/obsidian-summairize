import { App, PluginSettingTab, Setting } from 'obsidian';
import SummairizePlugin from '../../main';
import { SummarySettings, DEFAULT_SETTINGS } from '../types';

function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delayMs: number
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delayMs);
  };
}

export class SettingsManager {
  private plugin: SummairizePlugin;
  private settings: SummarySettings;

  constructor(plugin: SummairizePlugin) {
    this.plugin = plugin;
    this.settings = { ...DEFAULT_SETTINGS };
  }

  async loadSettings(): Promise<SummarySettings> {
    const data = await this.plugin.loadData();
    this.settings = Object.assign({}, DEFAULT_SETTINGS, data);
    return this.settings;
  }

  async saveSettings(settings: SummarySettings): Promise<void> {
    this.settings = settings;
    await this.plugin.saveData(settings);
  }

  getSettings(): SummarySettings {
    return { ...this.settings };
  }

  async updateSetting<K extends keyof SummarySettings>(
    key: K,
    value: SummarySettings[K]
  ): Promise<void> {
    this.settings[key] = value;
    await this.saveSettings(this.settings);
  }
}

export class SummairizeSettingTab extends PluginSettingTab {
  plugin: SummairizePlugin;
  private debouncedSaveAndSync: (key: keyof SummarySettings, value: any, target: 'ai' | 'filter') => void;

  constructor(app: App, plugin: SummairizePlugin) {
    super(app, plugin);
    this.plugin = plugin;

    this.debouncedSaveAndSync = debounce(async (key: keyof SummarySettings, value: any, target: 'ai' | 'filter') => {
      await this.plugin.settingsManager.updateSetting(key, value);
      if (target === 'ai') {
        this.plugin.aiService.updateSettings(this.plugin.settings);
      } else {
        this.plugin.fileFilter.updateSettings(this.plugin.settings);
      }
    }, 500);
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    containerEl.createEl('h2', { text: 'Summairize Settings' });

    // API Configuration Section
    containerEl.createEl('h3', { text: 'API Configuration' });

    // API Endpoint
    new Setting(containerEl)
      .setName('API Endpoint')
      .setDesc('OpenAI-compatible API endpoint URL')
      .addText(text => text
        .setPlaceholder('http://127.0.0.1:9292')
        .setValue(this.plugin.settings.apiEndpoint)
        .onChange((value) => {
          this.debouncedSaveAndSync('apiEndpoint', value, 'ai');
        }));

    // API Key
    new Setting(containerEl)
      .setName('API Key')
      .setDesc('API key for authentication (leave empty if not required)')
      .addText(text => {
        text
          .setPlaceholder('sk-...')
          .setValue(this.plugin.settings.apiKey)
          .onChange((value) => {
            this.debouncedSaveAndSync('apiKey', value, 'ai');
          });
        text.inputEl.type = 'password';
      });

    // Model Name
    new Setting(containerEl)
      .setName('Model Name')
      .setDesc('Name of the model to use for summarization')
      .addText(text => text
        .setPlaceholder('gpt-3.5-turbo')
        .setValue(this.plugin.settings.modelName)
        .onChange((value) => {
          this.debouncedSaveAndSync('modelName', value, 'ai');
        }));

    // Summary Options Section
    containerEl.createEl('h3', { text: 'Summary Options' });

    // Summary Length (slider — no debounce needed, fires on release)
    new Setting(containerEl)
      .setName('Summary Length')
      .setDesc('Target word count for generated summaries')
      .addSlider(slider => slider
        .setLimits(100, 1000, 50)
        .setValue(this.plugin.settings.summaryLength)
        .setDynamicTooltip()
        .onChange(async (value) => {
          await this.plugin.settingsManager.updateSetting('summaryLength', value);
          this.plugin.aiService.updateSettings(this.plugin.settings);
        }));

    // File Exclusion Section
    containerEl.createEl('h3', { text: 'File Exclusions' });

    // Exclude Templates (toggle — no debounce needed)
    new Setting(containerEl)
      .setName('Exclude Template Files')
      .setDesc('Skip summarization for template files')
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.excludeTemplates)
        .onChange(async (value) => {
          await this.plugin.settingsManager.updateSetting('excludeTemplates', value);
          this.plugin.fileFilter.updateSettings(this.plugin.settings);
        }));

    // Template Folders
    new Setting(containerEl)
      .setName('Template Folders')
      .setDesc('Comma-separated list of folder names to exclude (e.g., Templates, templates)')
      .addText(text => text
        .setPlaceholder('Templates, templates')
        .setValue(this.plugin.settings.templateFolders.join(', '))
        .onChange((value) => {
          const folders = value.split(',').map(f => f.trim()).filter(f => f);
          this.debouncedSaveAndSync('templateFolders', folders, 'filter');
        }));

    // Exclude Daily Notes (toggle — no debounce needed)
    new Setting(containerEl)
      .setName('Exclude Daily Notes')
      .setDesc('Skip summarization for daily notes')
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.excludeDailyNotes)
        .onChange(async (value) => {
          await this.plugin.settingsManager.updateSetting('excludeDailyNotes', value);
          this.plugin.fileFilter.updateSettings(this.plugin.settings);
        }));

    // Daily Notes Pattern
    new Setting(containerEl)
      .setName('Daily Notes Pattern')
      .setDesc('Regular expression pattern to match daily note filenames')
      .addText(text => text
        .setPlaceholder('\\d{4}-\\d{2}-\\d{2}')
        .setValue(this.plugin.settings.dailyNotesPattern)
        .onChange((value) => {
          this.debouncedSaveAndSync('dailyNotesPattern', value, 'filter');
        }));

    // Status Section
    containerEl.createEl('h3', { text: 'API Status' });

    const statusContainer = containerEl.createDiv();
    this.updateProviderStatus(statusContainer);

    // Refresh button
    new Setting(containerEl)
      .setName('Refresh Status')
      .setDesc('Check the current status of the API connection')
      .addButton(button => button
        .setButtonText('Refresh')
        .onClick(() => this.updateProviderStatus(statusContainer)));
  }

  private async updateProviderStatus(container: HTMLElement): Promise<void> {
    container.empty();

    try {
      const isAvailable = await this.plugin.aiService.getProviderStatus();

      const statusEl = container.createDiv({ cls: 'summairize-status-item' });
      statusEl.createSpan({ cls: 'summairize-provider-name', text: 'OpenAI Compatible API: ' });
      statusEl.createSpan({
        cls: isAvailable ? 'summairize-status-available' : 'summairize-status-unavailable',
        text: isAvailable ? 'Available' : 'Unavailable',
      });
    } catch {
      const errorEl = container.createDiv({ cls: 'summairize-status-unavailable' });
      errorEl.setText('Error checking API status');
    }
  }
}
