import { App, PluginSettingTab, Setting } from 'obsidian';
import SummaraizePlugin from '../../main';
import { SummarySettings, DEFAULT_SETTINGS } from '../types';

export class SettingsManager {
  private plugin: SummaraizePlugin;
  private settings: SummarySettings;

  constructor(plugin: SummaraizePlugin) {
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

export class SummaraizeSettingTab extends PluginSettingTab {
  plugin: SummaraizePlugin;

  constructor(app: App, plugin: SummaraizePlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    containerEl.createEl('h2', { text: 'Summaraize Settings' });

    // AI Provider Selection
    new Setting(containerEl)
      .setName('AI Provider')
      .setDesc('Choose the AI provider for generating summaries')
      .addDropdown(dropdown => dropdown
        .addOption('ollama', 'Ollama')
        .addOption('openai', 'OpenAI (Coming Soon)')
        .addOption('anthropic', 'Anthropic (Coming Soon)')
        .setValue(this.plugin.settings.aiProvider)
        .onChange(async (value: any) => {
          await this.plugin.settingsManager.updateSetting('aiProvider', value);
          this.plugin.aiService.updateSettings(this.plugin.settings);
        }));

    // Ollama Model
    new Setting(containerEl)
      .setName('Ollama Model')
      .setDesc('Specify the Ollama model to use for summarization')
      .addText(text => text
        .setPlaceholder('gemma3:4b')
        .setValue(this.plugin.settings.ollamaModel)
        .onChange(async (value) => {
          await this.plugin.settingsManager.updateSetting('ollamaModel', value);
          this.plugin.aiService.updateSettings(this.plugin.settings);
        }));

    // Summary Length
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

    // Exclude Templates
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
        .onChange(async (value) => {
          const folders = value.split(',').map(f => f.trim()).filter(f => f);
          await this.plugin.settingsManager.updateSetting('templateFolders', folders);
          this.plugin.fileFilter.updateSettings(this.plugin.settings);
        }));

    // Exclude Daily Notes
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
        .onChange(async (value) => {
          await this.plugin.settingsManager.updateSetting('dailyNotesPattern', value);
          this.plugin.fileFilter.updateSettings(this.plugin.settings);
        }));

    // Status Section
    containerEl.createEl('h3', { text: 'Provider Status' });
    
    const statusContainer = containerEl.createDiv();
    this.updateProviderStatus(statusContainer);

    // Refresh button
    new Setting(containerEl)
      .setName('Refresh Status')
      .setDesc('Check the current status of AI providers')
      .addButton(button => button
        .setButtonText('Refresh')
        .onClick(() => this.updateProviderStatus(statusContainer)));
  }

  private async updateProviderStatus(container: HTMLElement): Promise<void> {
    container.empty();
    
    try {
      const status = await this.plugin.aiService.getProviderStatus();
      
      for (const [provider, isAvailable] of Object.entries(status)) {
        const statusEl = container.createDiv();
        statusEl.innerHTML = `
          <div style="display: flex; align-items: center; margin: 8px 0;">
            <span style="margin-right: 8px;">${provider}:</span>
            <span style="color: ${isAvailable ? 'green' : 'red'};">
              ${isAvailable ? '✅ Available' : '❌ Unavailable'}
            </span>
          </div>
        `;
      }
    } catch (error) {
      container.innerHTML = '<div style="color: red;">Error checking provider status</div>';
    }
  }
}
