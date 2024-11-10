![Static Badge](https://img.shields.io/badge/LICENSE%20-%20GNU%20General%20Public%20License%20v3.0%20-%20blue) ![Static Badge](https://img.shields.io/badge/Pull%20Requests%20-%20Welcome%20-%20green) ![Static Badge](https://img.shields.io/badge/Application%20-%20Obsidian%20Notes%20-%20purple) ![Static Badge](https://img.shields.io/badge/Language%20-%20JS%20-%20yellow)

# Obsidian Note Watch
Introducing the Note Watch Plugin: an intuitive tool designed to keep you informed of all file activities within your Obsidian vault. Whether files are created, deleted, or moved, the plugin instantly notifies you and logs the events for easy tracking. Stay on top of your notes and their movements without the need for constant manual checks.

![Obsidian Note Watch](https://github.com/user-attachments/assets/ed85555a-ba9a-4487-a9aa-958711cb24e3)
https://www.youtube.com/watch?v=HLxV4mcgkUA

# What This Plugin Does

- **Instant Notifications**: Get real-time notifications for file creation, deletion, and movement within your Obsidian vault.
- **Event Logging**: Logs all specified file events to a markdown file, providing a historical record.
- **Linking Created and Moved Files**: Adds links to the `note-watch.md` file for created and moved files, making it easy to navigate to them.
- **Customizable Settings**: Offers settings to enable/disable notifications and logging, and to choose the directory for the log file.
# Walkthrough

## Installation and Activation
### BRAT
![image](https://github.com/user-attachments/assets/100b8f6e-5d45-4be7-abf2-b80ec1cae4bb)

- Install BRAT from the Community Plugins in Obsidian
- Open the command palette and run the command `BRAT: Plugins: Add a beta plugin for testing` (If you want the plugin version to be frozen, use the command `BRAT: Plugins Add a beta plugin with frozen version based on a release tag`.)
- Using the link `https://github.com/MokeyII/obsidian-Note-Watch` paste it into the modal that shows.
- Click on Add Plugin -- wait a few seconds and BRAT will tell you what is going on
- After BRAT confirms the installation, in Settings go to the Community plugins tab.
- Refresh the list of plugins
- Find the beta plugin you just installed and Enable it.

## Configuring the Plugin
![image](https://github.com/user-attachments/assets/bea89b22-c124-4658-a550-ecea6b619306)

- After enabling the plugin, click on `Settings` > `Note Watch Plugin Settings`.
- You will see several options:
    - **Notify on File Create**: Enable notifications when a new file is created.
    - **Notify on File Delete**: Enable notifications when a file is deleted.
    - **Notify on File Move**: Enable notifications when a file is moved.
    - **Log Events**: **(DISABLED BY DEFAULT)** Enable logging of events to a markdown file.
    - **Log Directory**: Select the directory for the log file in Obsidian by clicking the `Select Directory` button. Choose your preferred folder from the modal that appears. 
- Adjust these settings according to your preferences.
        
## Using the Plugin
    
- Once configured, the plugin will automatically start notifying you of file activities based on your settings.
- Notifications will appear for the specified events, and if logging is enabled, entries will be added to the `note-watch.md` file in your chosen directory.
- The log file (if enabled) will include the date and time of each event, with links to the newly created or moved files.
        
# TO DOs
## Testing
- Need to test functionality with obsidian sync and other cloud sync services

# Issues
- Please use Github Issue tracking to report bugs https://github.com/MokeyII/obsidian-Note-Watch/issues

