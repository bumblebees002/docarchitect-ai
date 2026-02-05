<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# DocArchitect AI - Professional Document Suite

An AI-powered document architect for creating professional resumes, cover letters, letterheads, and experience letters. Now supports **any OpenAI-compatible API** (OpenAI, Azure OpenAI, Anthropic via proxy, local LLMs like Ollama, LM Studio, etc.).

## Features

- 📄 **Multi-Document Support**: Resume, Cover Letter, Letterhead, Experience Letter
- 🤖 **AI-Powered Generation**: Works with any OpenAI-compatible API
- ✏️ **Live Editing**: Inline contentEditable fields with real-time sync
- 📥 **Export Options**: PDF and DOCX export
- 📷 **Document Scanning**: Camera integration for OCR
- 🎨 **Theming**: 5 color themes (2 free, 3 premium)
- 📱 **Responsive Design**: Mobile-friendly with panel switching

## Run Locally

**Prerequisites:** Node.js 18+

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure your API in [.env.local](.env.local):
   ```env
   # OpenAI-compatible API configuration
   OPENAI_API_KEY=your-api-key-here
   OPENAI_BASE_URL=https://api.openai.com/v1
   OPENAI_MODEL=gpt-4o
   ```

3. Run the app:
   ```bash
   npm run dev
   ```

## API Configuration Examples

### OpenAI (Default)
```env
OPENAI_API_KEY=sk-...
OPENAI_BASE_URL=https://api.openai.com/v1
OPENAI_MODEL=gpt-4o
```

### Azure OpenAI
```env
OPENAI_API_KEY=your-azure-key
OPENAI_BASE_URL=https://your-resource.openai.azure.com/openai/deployments/your-deployment
OPENAI_MODEL=gpt-4o
```

### Ollama (Local)
```env
OPENAI_API_KEY=ollama
OPENAI_BASE_URL=http://localhost:11434/v1
OPENAI_MODEL=llama3.2
```

### LM Studio (Local)
```env
OPENAI_API_KEY=lm-studio
OPENAI_BASE_URL=http://localhost:1234/v1
OPENAI_MODEL=local-model
```

### OpenRouter
```env
OPENAI_API_KEY=sk-or-...
OPENAI_BASE_URL=https://openrouter.ai/api/v1
OPENAI_MODEL=anthropic/claude-3.5-sonnet
```

### Together AI
```env
OPENAI_API_KEY=your-together-key
OPENAI_BASE_URL=https://api.together.xyz/v1
OPENAI_MODEL=meta-llama/Llama-3.2-90B-Vision-Instruct-Turbo
```

### Groq
```env
OPENAI_API_KEY=gsk_...
OPENAI_BASE_URL=https://api.groq.com/openai/v1
OPENAI_MODEL=llama-3.3-70b-versatile
```

## Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS
- **AI**: OpenAI SDK (compatible with any OpenAI-compatible API)
- **Export**: docx library, html2pdf.js
- **Icons**: Lucide React
- **Build**: Vite

## Note on Google Pay

The monetization/payment feature uses Google Pay API which is included for demonstration purposes. For production use, you'll need to:
1. Set up a Google Pay merchant account
2. Configure proper payment gateway integration
3. Replace the TEST environment with PRODUCTION

## License

MIT
