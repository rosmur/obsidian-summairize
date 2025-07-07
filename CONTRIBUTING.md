# Development

## Building the Plugin

```bash
npm install
npm run dev    # Development build with watch mode
npm run build  # Production build
```

## Project Structure

```
obsidian-summairize/
├── src/
│   ├── services/          # AI providers and core logic
│   ├── utils/             # Utility functions
│   ├── ui/                # User interface components
│   ├── settings/          # Plugin settings
│   └── types/             # TypeScript definitions
├── main.ts                # Plugin entry point
├── manifest.json          # Plugin metadata
└── styles.css             # Plugin styles
```

## Adding New AI Providers

The plugin is designed for easy extensibility. To add a new AI provider:

1. Create a new provider class implementing `AIProvider`:
   ```typescript
   export class NewProvider extends AIProvider {
     async generateSummary(content: string, options: SummaryOptions): Promise<string> {
       // Implementation
     }
     // ... other methods
   }
   ```

2. Register it in `AIService`:
   ```typescript
   this.providers.set('newprovider', new NewProvider());
   ```

3. Update settings interface and UI

# Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request