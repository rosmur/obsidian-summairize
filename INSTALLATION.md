# Installation Guide for Summaraize Plugin

## Prerequisites

Before installing the Summaraize plugin, you need to have Ollama installed and running on your system.

### Install Ollama

1. **Download Ollama**: Visit [https://ollama.ai](https://ollama.ai) and download the installer for your operating system.

2. **Install Ollama**: Follow the installation instructions for your platform:
   - **macOS**: Open the downloaded `.dmg` file and drag Ollama to Applications
   - **Linux**: Run the installation script or use your package manager
   - **Windows**: Run the installer executable

3. **Start Ollama**: 
   - **macOS/Linux**: Open terminal and run `ollama serve`
   - **Windows**: Ollama should start automatically, or run it from the Start menu

4. **Pull the default model**:
   ```bash
   ollama pull gemma3:4b
   ```

5. **Verify installation**:
   ```bash
   ollama list
   ```
   You should see `gemma3:4b` in the list of available models.

## Plugin Installation

### Method 1: Manual Installation (Recommended)

1. **Download the plugin files**:
   - Download `main.js`, `manifest.json`, and `styles.css` from the releases page
   - Or clone this repository and build it yourself

2. **Create plugin directory**:
   ```bash
   mkdir -p /path/to/your/vault/.obsidian/plugins/obsidian-summaraize
   ```

3. **Copy files**:
   Copy the following files to the plugin directory:
   - `main.js`
   - `manifest.json` 
   - `styles.css`

4. **Enable the plugin**:
   - Open Obsidian
   - Go to Settings → Community Plugins
   - Find "Summaraize" in the list
   - Toggle it on

### Method 2: Development Installation

If you want to build from source:

1. **Clone the repository**:
   ```bash
   cd /path/to/your/vault/.obsidian/plugins/
   git clone https://github.com/yourusername/obsidian-summaraize.git
   cd obsidian-summaraize
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Build the plugin**:
   ```bash
   npm run build
   ```

4. **Enable in Obsidian** (same as Method 1, step 4)

## Configuration

1. **Open plugin settings**:
   - Go to Settings → Summaraize

2. **Configure AI provider**:
   - Ensure "Ollama" is selected as the AI provider
   - Set the model to `gemma3:4b` (or your preferred model)

3. **Adjust settings**:
   - Set summary length (default: 500 words)
   - Configure file exclusions as needed

4. **Test the installation**:
   - Open any note with substantial content
   - Click the brain icon in the ribbon or use Cmd/Ctrl+P → "Generate Summary"

## Troubleshooting

### Common Issues

**Plugin not appearing in Community Plugins list**
- Ensure all three files (`main.js`, `manifest.json`, `styles.css`) are in the correct directory
- Restart Obsidian
- Check that the plugin directory name is exactly `obsidian-summaraize`

**"Ollama is not installed" error**
- Verify Ollama is installed: `which ollama`
- Ensure Ollama is in your PATH
- Try restarting your terminal/Obsidian

**"Ollama service is not running" error**
- Start Ollama: `ollama serve`
- Check if Ollama is running: `ps aux | grep ollama`

**"Model not found" error**
- Pull the model: `ollama pull gemma3:4b`
- Check available models: `ollama list`
- Verify the model name in plugin settings

**Build errors during development**
- Ensure Node.js is installed (version 16+)
- Delete `node_modules` and run `npm install` again
- Check for TypeScript errors: `npm run build`

### Getting Help

If you encounter issues:

1. Check the plugin settings for provider status
2. Look at the browser console for error messages (Ctrl/Cmd+Shift+I)
3. Verify Ollama is working: `ollama run gemma3:4b "Hello"`
4. Create an issue on the GitHub repository with:
   - Your operating system
   - Obsidian version
   - Error messages
   - Steps to reproduce

## Next Steps

Once installed:

1. **Try generating your first summary** on a note with substantial content
2. **Explore the settings** to customize the plugin to your needs
3. **Set up hotkeys** for quick access (Settings → Hotkeys → Search "Generate Summary")
4. **Experiment with different models** by pulling them with Ollama and updating the settings

Enjoy using Summaraize to enhance your note-taking workflow!
