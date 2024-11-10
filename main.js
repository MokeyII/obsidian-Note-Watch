const { Plugin, Notice, PluginSettingTab, Setting, TFile, FuzzySuggestModal, TFolder } = require('obsidian');

module.exports = class NoteWatchPlugin extends Plugin {
    async onload() {
        console.log('Loading Note Watch Plugin');

        // Load settings
        await this.loadSettings();

        // Bind event handlers
        this.onFileCreate = this.onFileCreate.bind(this);
        this.onFileDelete = this.onFileDelete.bind(this);
        this.onFileRename = this.onFileRename.bind(this);

        // Register event listeners based on settings
        this.registerEvents();

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
    }

        // Unregister all event listeners
        unregisterEvents() {
            this.app.vault.off('create', this.onFileCreate);
            this.app.vault.off('delete', this.onFileDelete);
            this.app.vault.off('rename', this.onFileRename);
        }
    
        // Handle file creation event
        async onFileCreate(file) {
            const timestamp = new Date().toLocaleString();
            const message = `${timestamp} - New file added: ${file.path.endsWith('Untitled.md') ? 'Untitled.md' : `[[${file.path}]]`}`;
            console.log(message);
            new Notice(`New file added: ${file.path}`);
            if (this.settings.logEvents) await this.logEvent(message);
        }
    
        // Handle file deletion event
        async onFileDelete(file) {
            const timestamp = new Date().toLocaleString();
            const message = `${timestamp} - File deleted: ${file.path}`;
            console.log(message);
            new Notice(message);
            if (this.settings.logEvents) await this.logEvent(message);
        }
    
        // Handle file rename (move) event
        async onFileRename(file, oldPath) {
            const timestamp = new Date().toLocaleString();
            const message = `${timestamp} - File moved from: ${oldPath} to: ${file.path.endsWith('Untitled.md') ? 'Untitled.md' : `[[${file.path}]]`}`;
            console.log(message);
            new Notice(`File moved from: ${oldPath} to: ${file.path}`);
            if (this.settings.logEvents) await this.logEvent(message);
        }
    
        // Log event message to the specified log file with error handling
        async logEvent(message) {
            try {
                const logFilePath = `${this.settings.logDir}/note-watch.md`;
                const logFile = this.app.vault.getAbstractFileByPath(logFilePath);
                if (logFile && logFile instanceof TFile) {
                    const content = await this.app.vault.read(logFile);
                    await this.app.vault.modify(logFile, message + '\n' + content);
                } else {
                    await this.app.vault.create(logFilePath, message);
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
        this.plugin.settings.logDir = item.path;
        this.plugin.saveSettings();
        new Notice(`Log directory set to: ${item.path}`);
    }
}
