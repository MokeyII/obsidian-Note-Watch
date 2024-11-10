const { Plugin, Notice, PluginSettingTab, Setting, TFile, FuzzySuggestModal, TFolder, normalizePath } = require('obsidian');

module.exports = class NoteWatchPlugin extends Plugin {
    async onload() {
        console.log('Loading Note Watch Plugin');

        // Load settings
        await this.loadSettings();

        // Bind event handlers
        this.onFileCreate = this.onFileCreate.bind(this);
        this.onFileDelete = this.onFileDelete.bind(this);
        this.onFileRename = this.onFileRename.bind(this);
        this.onFileModify = this.onFileModify.bind(this);

        // Register event listeners once the workspace is ready
        this.app.workspace.onLayoutReady(() => {
            this.registerEvents();
        });

        // Add settings tab
        this.addSettingTab(new NoteWatchSettingTab(this.app, this));
    }

    // Register event listeners based on current settings
    registerEvents() {
        // Unregister all events first
        this.unregisterEvents();

        // Register events based on settings
        if (this.settings.notifyOnCreate) {
            this.registerEvent(this.app.vault.on('create', this.onFileCreate));
        }

        if (this.settings.notifyOnDelete) {
            this.registerEvent(this.app.vault.on('delete', this.onFileDelete));
        }

        if (this.settings.notifyOnMove) {
            this.registerEvent(this.app.vault.on('rename', this.onFileRename));
        }
        if (this.settings.notifyOnModify) {
            this.registerEvent(this.app.vault.on('modify', this.onFileModify));
        }
    }

    // Unregister all event listeners
    unregisterEvents() {
        this.app.vault.off('create', this.onFileCreate);
        this.app.vault.off('delete', this.onFileDelete);
        this.app.vault.off('rename', this.onFileRename);
        this.app.vault.off('modify', this.onFileModify);
    }

    // Handle file creation event
    async onFileCreate(file) {
        if (file.path === normalizePath(`${this.settings.logDir}/note-watch.md`)) {
            return;
        }

        const timestamp = new Date().toLocaleString();
        const message = `${timestamp} - New file added: ${file.path.endsWith('Untitled.md') ? 'Untitled.md' : `[[${file.path}]]`}`;
        console.log(message);
        new Notice(`New file added: ${file.path}`);
        if (this.settings.logEvents) await this.logEvent(message);
    }

    // Handle file deletion event
    async onFileDelete(file) {
        if (file.path === normalizePath(`${this.settings.logDir}/note-watch.md`)) {
            return;
        }

        const timestamp = new Date().toLocaleString();
        const message = `${timestamp} - File deleted: ${file.path}`;
        console.log(message);
        new Notice(message);
        if (this.settings.logEvents) await this.logEvent(message);
    }

        // Handle file modification event
        async onFileModify(file) {
            if (file.path === normalizePath(`${this.settings.logDir}/note-watch.md`)) {
                return;
            }

            const timestamp = new Date().toLocaleString();
            const message = `${timestamp} - Contents of [[${file.path}]] were modified`;
            console.log(message);
            new Notice(`Contents of [[${file.path}]] were modified`);
            if (this.settings.logEvents) await this.logEvent(message);
        }

    // Handle file rename (move) event
    async onFileRename(file, oldPath) {
        if (file.path === normalizePath(`${this.settings.logDir}/note-watch.md`) || oldPath === normalizePath(`${this.settings.logDir}/note-watch.md`)) {
            return;
        }

        const timestamp = new Date().toLocaleString();
        const message = `${timestamp} - File moved from: ${oldPath} to: ${file.path.endsWith('Untitled.md') ? 'Untitled.md' : `[[${file.path}]]`}`;
        console.log(message);
        new Notice(`File moved from: ${oldPath} to: ${file.path}`);
        if (this.settings.logEvents) await this.logEvent(message);
    }

        // Log event message to the specified log file with error handling
        async logEvent(message) {
            try {
                const logFilePath = normalizePath(`${this.settings.logDir}/note-watch.md`);
                let logFile = this.app.vault.getAbstractFileByPath(logFilePath);

                if (!logFile) {
                    try {
                        // If the file does not exist, create it with the initial message
                        logFile = await this.app.vault.create(logFilePath, `${message}\n`);
                    } catch (error) {
                        if (error.message === 'File already exists.') {
                            // Handle the case where the file already exists
                            console.log('Log file already exists, proceeding with logging.');
                        } else {
                            console.error('Failed to create log file:', error);
                            new Notice('Failed to create log file. Check console for details.');
                        }
                    }
                } else if (logFile instanceof TFile) {
                    try {
                        // If the file exists, prepend the message with a newline
                        await this.app.vault.process(logFile, content => {
                            const lines = content.split('\n');
                            let yamlEndIndex = 0;
                            if (lines[0] === '---') {
                                yamlEndIndex = lines.indexOf('---', 1);
                                if (yamlEndIndex === -1) {
                                    yamlEndIndex = 0; // No ending '---' found
                                }
                            }
                            const newContent = [
                                ...lines.slice(0, yamlEndIndex + 1),
                                `${message}\n`,
                                ...lines.slice(yamlEndIndex + 1)
                            ].join('\n');
                            return newContent;
                        });
                    } catch (error) {
                        console.error('Failed to process log file:', error);
                        new Notice('Failed to log event. Check console for details.');
                    }
                }
            } catch (error) {
                console.error('Failed to log event:', error);
                new Notice('Failed to log event. Check console for details.');
            }
        }


    // Load settings from storage
    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }

    // Save settings to storage
    async saveSettings() {
        await this.saveData(this.settings);
        this.registerEvents(); // Re-register events after saving settings
    }

    // Unregister events when the plugin is unloaded
    onunload() {
        console.log('Unloading Note Watch Plugin');
        this.unregisterEvents(); // Ensure all events are unregistered when the plugin is unloaded
        new Notice('Note Watch Plugin unloaded.');
    }
};

const DEFAULT_SETTINGS = {
    notifyOnCreate: true,
    notifyOnDelete: true,
    notifyOnMove: true,
    notifyOnModify: true,
    logEvents: false,
    logDir: 'NoteWatchPlugin'
};

// Settings tab for the plugin
class NoteWatchSettingTab extends PluginSettingTab {
    constructor(app, plugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display() {
        const { containerEl } = this;
        containerEl.empty();

        containerEl.createEl('h2', { text: 'Note Watch Plugin Settings' });

        // Toggle for notifying on file creation
        new Setting(containerEl)
            .setName('Notify on File Create')
            .setDesc('Enable notifications when a new file is created.')
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.notifyOnCreate)
                .onChange(async (value) => {
                    this.plugin.settings.notifyOnCreate = value;
                    await this.plugin.saveSettings();
                }));

        // Toggle for notifying on file deletion
        new Setting(containerEl)
            .setName('Notify on File Delete')
            .setDesc('Enable notifications when a file is deleted.')
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.notifyOnDelete)
                .onChange(async (value) => {
                    this.plugin.settings.notifyOnDelete = value;
                    await this.plugin.saveSettings();
                }));

        // Toggle for notifying on file move
        new Setting(containerEl)
            .setName('Notify on File Move')
            .setDesc('Enable notifications when a file is moved.')
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.notifyOnMove)
                .onChange(async (value) => {
                    this.plugin.settings.notifyOnMove = value;
                    await this.plugin.saveSettings();
                }));

        // Toggle for logging events
        new Setting(containerEl)
            .setName('Log Events')
            .setDesc('Enable logging of events to a markdown file.')
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.logEvents)
                .onChange(async (value) => {
                    this.plugin.settings.logEvents = value;
                    await this.plugin.saveSettings();
                }));

        // Button for selecting the log directory
        new Setting(containerEl)
            .setName('Log Directory')
            .setDesc('Select the directory for the log file in Obsidian.')
            .addButton(button => {
                button.setButtonText('Select Directory')
                    .onClick(async () => {
                        new LogDirModal(this.app, this.plugin).open();
                    });
            });
    }
}

// Modal for selecting the log directory using a fuzzy finder
class LogDirModal extends FuzzySuggestModal {
    constructor(app, plugin) {
        super(app);
        this.plugin = plugin;
    }

    getItems() {
        return this.app.vault.getAllLoadedFiles().filter(file => file instanceof TFolder);
    }

    getItemText(item) {
        return item.path;
    }

    onChooseItem(item) {
        const normalizedPath = normalizePath(item.path);
        this.plugin.settings.logDir = normalizedPath;
        this.plugin.saveSettings();
        new Notice(`Log directory set to: ${normalizedPath}`);
    }
}
