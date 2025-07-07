# Troubleshooting Summairize Plugin

## Common Issue: "Ollama is not available"

If you're seeing "Ollama is not available" in the plugin settings or when trying to generate summaries, follow these steps:

### Step 1: Verify Ollama Installation

1. **Check if Ollama is installed**:

Run in the terminal: 

   ```bash
   which ollama
   # or
   ollama --version
   ```

2. **If Ollama is not found**, install it:
   - Visit [https://ollama.ai](https://ollama.ai)
   - Download and install for your platform
   - Restart your terminal/Obsidian after installation

### Step 2: Check Ollama Service

1. **Verify Ollama is running**:
   ```bash
   ollama list
   ```

2. **If you get connection errors**, start Ollama:
   ```bash
   ollama serve
   ```
   Keep this terminal open, or run Ollama as a background service.

3. **Test the API directly**:
   ```bash
   curl http://localhost:11434/api/tags
   ```
   This should return a JSON response with available models.

### Step 3: Check Model Availability

1. **List available models**:
   ```bash
   ollama list
   ```

2. **If `gemma3:4b` is not listed**, pull it:
   ```bash
   ollama pull gemma3:4b
   ```

3. **Test the model**:
   ```bash
   ollama run gemma3:4b "Hello, respond with just OK"
   ```

### Step 4: Debug Plugin Connectivity

1. **Run the debug script** (from the plugin directory):
   ```bash
   node debug-ollama.js
   ```
   This will test various connectivity methods and show detailed output.

2. **Check Obsidian Developer Console**:
   - Open Obsidian
   - Press `Ctrl/Cmd + Shift + I` to open developer tools
   - Go to the Console tab
   - Try using the plugin and look for error messages

### Step 5: PATH Issues (Common on macOS)

If Ollama works in terminal but not in Obsidian:

1. **Check where Ollama is installed**:
   ```bash
   which ollama
   ```

2. **Common locations**:
   - `/usr/local/bin/ollama` (Intel Mac)
   - `/opt/homebrew/bin/ollama` (Apple Silicon Mac)
   - `/usr/bin/ollama` (Linux)

3. **Create a symlink if needed**:
   ```bash
   # If ollama is in /opt/homebrew/bin but not found
   sudo ln -s /opt/homebrew/bin/ollama /usr/local/bin/ollama
   ```

4. **Restart Obsidian** after making PATH changes.

### Step 6: Alternative Solutions

If shell commands aren't working, the plugin will try to use Ollama's HTTP API:

1. **Ensure Ollama API is accessible**:
   ```bash
   curl -X GET http://localhost:11434/api/tags
   ```

2. **Check if port 11434 is blocked**:
   ```bash
   netstat -an | grep 11434
   ```

3. **Try starting Ollama with explicit host binding**:
   ```bash
   ollama serve --host 0.0.0.0
   ```

### Step 7: Plugin Settings

1. **Open Obsidian Settings → Summairize**
2. **Check Provider Status** - it should show "✅ Available" for Ollama
3. **Click "Refresh Status"** to re-test connectivity
4. **Verify model name** is correct (default: `gemma3:4b`)

### Step 8: Reset Plugin

If all else fails:

1. **Disable the plugin** in Obsidian settings
2. **Restart Obsidian**
3. **Re-enable the plugin**
4. **Test again**

## Error Messages and Solutions

### "Command not found"
- Ollama is not installed or not in PATH
- Solution: Install Ollama and ensure it's in your PATH

### "Connection refused"
- Ollama service is not running
- Solution: Run `ollama serve`

### "Model not found"
- The specified model hasn't been downloaded
- Solution: Run `ollama pull gemma3:4b`

### "Timeout"
- Ollama is taking too long to respond
- Solution: Check system resources, try a smaller model, or increase timeout

### "Permission denied"
- File permissions issue
- Solution: Check Ollama installation permissions

## Getting More Help

If you're still having issues:

1. **Run the debug script** and share the output:
   ```bash
   node debug-ollama.js > debug-output.txt
   ```

2. **Check Obsidian console** for JavaScript errors

3. **Create an issue** on GitHub with:
   - Your operating system and version
   - Obsidian version
   - Output from debug script
   - Any error messages from console
   - Steps you've already tried

## Advanced Debugging

For developers or advanced users:

1. **Enable verbose logging** in the plugin code
2. **Check network connectivity** to localhost:11434
3. **Verify environment variables** in Obsidian vs terminal
4. **Test with different models** to isolate model-specific issues

Remember: The plugin tries multiple methods to connect to Ollama, so if one method fails, it should fall back to others. The most reliable method is usually the HTTP API.
