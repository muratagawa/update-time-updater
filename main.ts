import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';

interface UpdateTimeUpdaterSettings {
	frontmatter_key: string;
	datetime_format: string;
}

const DEFAULT_SETTINGS: UpdateTimeUpdaterSettings = {
	frontmatter_key: 'updated',
	datetime_format: 'YYYY-MM-DD HH:mm:ss'
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

		containerEl.createEl('h2', {text: 'Update Time Updater Settings'});

		new Setting(containerEl)
			.setName('Target key')
			.setDesc('Frontmatter key for modification date')
			.addText(text => text
				.setPlaceholder('updated')
				.setValue(this.plugin.settings.frontmatter_key)
				.onChange(async (value) => {
					this.plugin.settings.frontmatter_key = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Datetime format')
			.setDesc('Moments.js date format to use')
			.addText(text => text
				.setPlaceholder('YYYY-MM-DD HH:mm:ss')
				.setValue(this.plugin.settings.datetime_format)
				.onChange(async (value) => {
					this.plugin.settings.datetime_format = value;
					await this.plugin.saveSettings();
				}));
	}
}


export default class UpdateTimeUpdaterPlugin extends Plugin {
	settings: UpdateTimeUpdaterSettings;

	async onload() {
		await this.loadSettings();

		// This creates an icon in the left ribbon.
		const ribbonIconEl = this.addRibbonIcon('dice', 'Sample Plugin', (evt: MouseEvent) => {
			// Called when the user clicks the icon.
			new Notice('You clicked!');
		});
		// Perform additional things with the ribbon
		ribbonIconEl.addClass('my-plugin-ribbon-class');

		// This adds a simple command that can be triggered anywhere
		this.addCommand({
			id: 'open-sample-modal-simple',
			name: 'Open sample modal (simple)',
			callback: () => {
				new UpdateTimeUpdaterModal(this.app).open();
			}
		});
		// This adds an editor command that can perform some operation on the current editor instance
		this.addCommand({
			id: 'sample-editor-command',
			name: 'Sample editor command',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				console.log(editor.getSelection());
				editor.replaceSelection('Sample Editor Command');
			}
		});
		// This adds a complex command that can check whether the current state of the app allows execution of the command
		this.addCommand({
			id: 'open-sample-modal-complex',
			name: 'Open sample modal (complex)',
			checkCallback: (checking: boolean) => {
				// Conditions to check
				const markdownView = this.app.workspace.getActiveViewOfType(MarkdownView);
				if (markdownView) {
					// If checking is true, we're simply "checking" if the command can be run.
					// If checking is false, then we want to actually perform the operation.
					if (!checking) {
						new UpdateTimeUpdaterModal(this.app).open();
					}

					// This command will only show up in Command Palette when the check function returns true
					return true;
				}
			}
		});

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new UpdateTimeUpdaterSettingTab(this.app, this));

		// If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
		// Using this function will automatically remove the event listener when this plugin is disabled.
		this.registerDomEvent(document, 'click', (evt: MouseEvent) => {
			console.log('click', evt);
		});

		// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		this.registerInterval(window.setInterval(() => console.log('setInterval'), 5 * 60 * 1000));
	}

	onunload() {

	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class UpdateTimeUpdaterModal extends Modal {
	constructor(app: App) {
		super(app);
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.setText('mojamoja!');
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}
