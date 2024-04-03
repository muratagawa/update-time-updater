import { App, Notice, Plugin, PluginSettingTab, Setting, moment } from 'obsidian';

interface UpdateTimeUpdaterSettings {
	updateKey: string;
	datetimeFormat: string;
}

const DEFAULT_SETTINGS: UpdateTimeUpdaterSettings = {
	updateKey: 'updated',
	datetimeFormat: 'YYYY-MM-DD HH:mm:ss'
}

class UpdateTimeUpdaterSettingTab extends PluginSettingTab {
	plugin: UpdateTimeUpdaterPlugin;

	constructor(app: App, plugin: UpdateTimeUpdaterPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		containerEl.createEl('h2', { text: 'Update Time Updater Settings' });

		new Setting(containerEl)
			.setName('Target key')
			.setDesc('Frontmatter key for modification date')
			.addText(text => text
				.setPlaceholder('updated')
				.setValue(this.plugin.settings.updateKey)
				.onChange(async (value) => {
					this.plugin.settings.updateKey = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Datetime format')
			.setDesc('Moments.js date format to use')
			.addText(text => text
				.setPlaceholder('YYYY-MM-DD HH:mm:ss')
				.setValue(this.plugin.settings.datetimeFormat)
				.onChange(async (value) => {
					this.plugin.settings.datetimeFormat = value;
					await this.plugin.saveSettings();
				}));
	}
}


export default class UpdateTimeUpdaterPlugin extends Plugin {
	settings: UpdateTimeUpdaterSettings;

	async onload() {
		await this.loadSettings();

		// Called when the user clicks the icon.
		this.addRibbonIcon('timer', 'Update modified date', (evt: MouseEvent) => {
			this.updateFrontmatter();
		});

		// This adds a simple command that can be triggered anywhere
		this.addCommand({
			id: 'update-modified-datetime-manually',
			name: 'Update modified datetime manually',
			callback: () => {
				this.updateFrontmatter();
			}
		});

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new UpdateTimeUpdaterSettingTab(this.app, this));
	}

	onunload() {

	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	async updateFrontmatter() {
		const now = moment();
		const f = this.app.workspace.getActiveFile();
		if (f) {
			const fm = this.app.metadataCache.getFileCache(f)?.frontmatter;
			if (fm) {
				this.app.fileManager.processFrontMatter(f, frontmatter => {
					frontmatter[this.settings.updateKey] = now.format(this.settings.datetimeFormat);
				});
			}
		}
		new Notice(`Value of '${this.settings.updateKey}' has been updated.`);
	}

}
