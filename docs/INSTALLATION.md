# Installation Guide for Summairize Plugin

## Prerequisites

Before installing the Summairize plugin, you need to have an OpenAI-compatible API endpoint available. This can be:

- **OpenAI's official API**: Sign up at [https://platform.openai.com](https://platform.openai.com)
- **Local inference servers**: LM Studio, llama.cpp server, vLLM, LocalAI, etc.
- **Third-party providers**: Any service that implements the OpenAI API format

## Plugin Installation

### Method 1: Manual Installation (Recommended)

1. **Download the plugin files**:
   - Download `main.js`, `manifest.json`, and `styles.css` from the releases page
   - Or clone this repository and build it yourself

2. **Create plugin directory**:
   ```bash
   mkdir -p /path/to/your/vault/.obsidian/plugins/obsidian-summairize
   ```

3. **Copy files**:
   Copy the following files to the plugin directory:
   - `main.js`
   - `manifest.json`
   - `styles.css`

4. **Enable the plugin**:
   - Open Obsidian
   - Go to Settings → Community Plugins
   - Find "Summairize" in the list
   - Toggle it on

### Method 2: Development Installation

If you want to build from source:

1. **Clone the repository**:
   ```bash
   cd /path/to/your/vault/.obsidian/plugins/
   git clone https://github.com/yourusername/obsidian-summairize.git
   cd obsidian-summairize
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
   - Go to Settings → Summairize

2. **Configure API settings**:
   - **API Endpoint**: Enter your API endpoint URL (default: `http://127.0.0.1:9292`)
   - **API Key**: Enter your API key (leave empty if not required)
   - **Model Name**: Specify the model to use (e.g., `gpt-3.5-turbo`)

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
- Check that the plugin directory name is exactly `obsidian-summairize`

**"API Unavailable" error**
- Verify your API endpoint is running and accessible
- Test the endpoint manually: `curl http://your-endpoint/v1/models`
- Check the API endpoint URL in plugin settings

**Authentication errors**
- Verify your API key is correct
- Check if your API endpoint requires authentication
- Ensure the API key format is correct for your provider

**Build errors during development**
- Ensure Node.js is installed (version 16+)
- Delete `node_modules` and run `npm install` again
- Check for TypeScript errors: `npm run build`

### Getting Help

If you encounter issues:

1. Check the plugin settings for API status
2. Look at the browser console for error messages (Ctrl/Cmd+Shift+I)
3. Test your API endpoint manually with curl or Postman
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
4. **Experiment with different models** by updating the model name in settings

Enjoy using Summairize to enhance your note-taking workflow!
