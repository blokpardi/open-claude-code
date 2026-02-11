const { Plugin, TFolder, Notice, PluginSettingTab, Setting } = require('obsidian');
const { exec } = require('child_process');
const path = require('path');
const os = require('os');

const DEFAULT_SETTINGS = {
	shell: 'powershell',
	claudePath: ''
};

class OpenClaudeCodeSettingTab extends PluginSettingTab {
	constructor(app, plugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display() {
		const { containerEl } = this;
		containerEl.empty();

		new Setting(containerEl)
			.setName('Shell')
			.setDesc('Which shell to use when opening Claude Code.')
			.addDropdown(dropdown => dropdown
				.addOption('powershell', 'PowerShell')
				.addOption('cmd', 'Command Prompt (cmd)')
				.setValue(this.plugin.settings.shell)
				.onChange(async (value) => {
					this.plugin.settings.shell = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Claude Code path')
			.setDesc(
				'Full path to the Claude Code CLI executable. Leave blank to auto-detect. ' +
				'If you have Claude Desktop installed, the wrong "claude" may be found on your PATH — ' +
				'set this to the CLI path (e.g. C:\\Users\\you\\.local\\bin\\claude.exe).'
			)
			.addText(text => text
				.setPlaceholder('Auto-detect')
				.setValue(this.plugin.settings.claudePath)
				.onChange(async (value) => {
					this.plugin.settings.claudePath = value.trim();
					await this.plugin.saveSettings();
				}));
	}
}

module.exports = class OpenClaudeCodePlugin extends Plugin {
	async onload() {
		await this.loadSettings();
		this.addSettingTab(new OpenClaudeCodeSettingTab(this.app, this));

		this.registerEvent(
			this.app.workspace.on('file-menu', (menu, file) => {
				if (file instanceof TFolder) {
					menu.addItem((item) => {
						item
							.setTitle('Open Claude Code')
							.setIcon('terminal')
							.onClick(() => {
								this.openClaudeCode(file.path);
							});
					});
				}
			})
		);
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	getClaudeExecutable() {
		if (this.settings.claudePath) {
			return `"${this.settings.claudePath}"`;
		}
		// Default to the standard CLI install path to avoid
		// picking up the Claude Desktop app alias in WindowsApps
		const defaultPath = path.join(os.homedir(), '.local', 'bin', 'claude.exe');
		try {
			require('fs').accessSync(defaultPath);
			return `"${defaultPath}"`;
		} catch {
			return 'claude';
		}
	}

	openClaudeCode(folderPath) {
		const vaultPath = this.app.vault.adapter.basePath;
		const fullPath = folderPath === '/'
			? vaultPath
			: path.join(vaultPath, folderPath);

		const claudeExe = this.getClaudeExecutable();
		const claudeCmd = `${claudeExe} --dangerously-skip-permissions`;

		let wtCommand;
		let fallbackCommand;

		if (this.settings.shell === 'cmd') {
			wtCommand = `wt.exe -w new -d "${fullPath}" cmd /k ${claudeCmd}`;
			fallbackCommand = `cmd.exe /c start "" cmd /k "cd /d "${fullPath}" && ${claudeCmd}"`;
		} else {
			wtCommand = `wt.exe -w new -d "${fullPath}" powershell -NoExit -Command "& ${claudeCmd}"`;
			fallbackCommand = `cmd.exe /c start "" powershell -NoExit -Command "cd '${fullPath}'; & ${claudeCmd}"`;
		}

		exec(wtCommand, (error) => {
			if (error) {
				exec(fallbackCommand, (fallbackError) => {
					if (fallbackError) {
						new Notice(`Failed to open Claude Code: ${fallbackError.message}`);
					}
				});
			}
		});
	}
};
