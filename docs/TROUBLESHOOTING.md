# Troubleshooting Summairize Plugin

## Common Issue: "API is not available"

If you're seeing "API is not available" in the plugin settings or when trying to generate summaries, follow these steps:

### Step 1: Verify API Endpoint

1. **Check if your API endpoint is accessible**:
   ```bash
   curl http://127.0.0.1:9292/v1/models
   ```
   Replace the URL with your actual API endpoint.

2. **Verify the endpoint format**:
   - Should be a base URL like `http://127.0.0.1:9292` or `https://api.openai.com`
   - Do NOT include `/v1` or other path segments in the endpoint setting
   - The plugin will automatically append `/v1/chat/completions` and `/v1/models`

### Step 2: Check Authentication

1. **Verify your API key** (if required):
   - Make sure the API key is entered correctly in plugin settings
   - Check for extra spaces or characters
   - Some local servers don't require an API key

2. **Test authentication manually**:
   ```bash
   curl -H "Authorization: Bearer YOUR_API_KEY" http://your-endpoint/v1/models
   ```

### Step 3: Verify Model Availability

1. **Check if your model exists**:
   ```bash
   curl -H "Authorization: Bearer YOUR_API_KEY" http://your-endpoint/v1/models
   ```
   This should list available models.

2. **Update model name** in plugin settings if needed:
   - For OpenAI: `gpt-3.5-turbo`, `gpt-4`, etc.
   - For local servers: depends on your setup (e.g., `llama2`, `mistral`, etc.)

### Step 4: Check Network Connectivity

1. **Test basic connectivity**:
   ```bash
   curl http://127.0.0.1:9292
   ```

2. **Check if the port is open**:
   ```bash
   netstat -an | grep 9292
   ```
   Replace 9292 with your actual port.

3. **Verify firewall settings**:
   - Ensure your firewall isn't blocking the connection
   - For local servers, make sure they're bound to the correct interface

### Step 5: Check Plugin Settings

1. **Open Obsidian Settings → Summairize**
2. **Check API Status** - it should show "✅ Available"
3. **Click "Refresh Status"** to re-test connectivity
4. **Verify all settings**:
   - API Endpoint URL
   - API Key (if required)
   - Model Name

### Step 6: Debug with Browser Console

1. **Open Obsidian Developer Console**:
   - Press `Ctrl/Cmd + Shift + I` to open developer tools
   - Go to the Console tab
   - Try using the plugin and look for error messages

2. **Common error patterns**:
   - Network errors: Check endpoint URL and connectivity
   - 401/403 errors: Authentication issue with API key
   - 404 errors: Wrong endpoint URL or model not found
   - 500 errors: Server-side issue with your API endpoint

### Step 7: Reset Plugin

If all else fails:

1. **Disable the plugin** in Obsidian settings
2. **Restart Obsidian**
3. **Re-enable the plugin**
4. **Re-enter your settings**
5. **Test again**

## Error Messages and Solutions

### "API Unavailable"
- API endpoint is not running or not accessible
- Solution: Start your API server or verify the endpoint URL

### "HTTP 401: Unauthorized"
- API key is missing or incorrect
- Solution: Verify your API key in plugin settings

### "HTTP 404: Not Found"
- Wrong endpoint URL or model doesn't exist
- Solution: Check the endpoint URL and model name

### "Model not found" or "Invalid model"
- The specified model is not available on your API endpoint
- Solution: Check available models and update the model name in settings

### "Connection refused" or "Network error"
- Cannot connect to the API endpoint
- Solution: Verify the endpoint is running and accessible

### "Timeout"
- API is taking too long to respond
- Solution: Check server resources or try a smaller/faster model

## Provider-Specific Tips

### OpenAI Official API
- Endpoint: Use default or `https://api.openai.com`
- API Key: Get from [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)
- Models: `gpt-3.5-turbo`, `gpt-4`, `gpt-4-turbo`

### Local Servers (LM Studio, llama.cpp, etc.)
- Endpoint: Usually `http://127.0.0.1:PORT` (check your server config)
- API Key: Often not required (leave empty)
- Models: Depends on what you've loaded in the server

### Third-Party Providers
- Follow the provider's documentation for endpoint URL and authentication
- Model names vary by provider

## Getting More Help

If you're still having issues:

1. **Check API endpoint manually** with curl or Postman
2. **Review Obsidian console** for JavaScript errors
3. **Create an issue** on GitHub with:
   - Your operating system and version
   - Obsidian version
   - API provider you're using
   - Any error messages from console
   - Steps you've already tried

## Advanced Debugging

For developers or advanced users:

1. **Test the API endpoint directly**:
   ```bash
   curl -X POST http://your-endpoint/v1/chat/completions \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_API_KEY" \
     -d '{
       "model": "your-model-name",
       "messages": [{"role": "user", "content": "Hello"}]
     }'
   ```

2. **Check CORS settings** if using a remote API
3. **Verify SSL certificates** if using HTTPS
4. **Review server logs** for your API endpoint
