# NodeFlip AI

> AI-powered assistant for building n8n workflows through natural conversation

[![License: AGPL--3.0-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)
[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/ai4less/nodeflip)

## 🚀 Features

- 🤖 **Natural Language Workflow Creation** - Describe what you want, AI builds it
- 💬 **Conversational Interface** - Chat sidebar integrated directly into n8n
- 🔄 **Real-time Updates** - Watch nodes appear as you chat
- 📦 **Full n8n Support** - Works with all n8n nodes and operations
- ☁️ **Your Backend** - Use any AI backend (OpenAI, Anthropic, self-hosted)
- 🌐 **Universal Compatibility** - Works with n8n cloud and self-hosted instances

## 📥 Installation

1. Install from [Chrome Web Store](https://chrome.google.com/webstore) *(link coming soon)*
2. Open any n8n workflow page
3. Click the NodeFlip icon in the n8n toolbar
4. Configure your AI backend in settings

## ⚙️ Configuration

1. Click the NodeFlip extension icon in your browser toolbar
2. Enter your backend API URL (default: https://generator.ai4less.io)
3. Add your API key
4. Click "Test Connection" to verify
5. Click "Save Settings"
6. Start chatting!

## 🎯 How to Use

1. Open or create an n8n workflow
2. Click the NodeFlip icon in the n8n toolbar (top right)
3. Describe what you want to build in natural language
4. Watch as NodeFlip creates the workflow for you

**Example prompts:**
- "Create a workflow that sends me an email when a new row is added to Google Sheets"
- "Build an automation that posts to Slack when I get a new GitHub issue"
- "Make a workflow that backs up my Airtable data to Google Drive daily"

## 🔒 Privacy

NodeFlip stores API credentials locally in your browser. No data is collected or sent to third parties except your configured AI backend.

[Read full Privacy Policy](PRIVACY.md)

## 🛠️ Requirements

- Chrome browser (v88+)
- n8n instance (cloud or self-hosted)
- Compatible AI backend API

## 💡 About

NodeFlip AI brings the power of conversational AI to n8n workflow automation. Built by [ai4less](https://ai4less.io).

## 🐛 Support

- Issues: [GitHub Issues](https://github.com/ai4less/nodeflip/issues)
- Email: support@ai4less.io

## 📝 License

AGPL-3.0 © ai4less

---

## Development

### Setup
```bash
npm install
npm run dev
```

### Build
```bash
npm run build
```

### Package for Chrome Web Store
```bash
npm run zip
```

Built with [Preact](https://preactjs.com/) and [Vite](https://vitejs.dev/)
