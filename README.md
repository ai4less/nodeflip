# NodeFlip AI

> AI-powered assistant for building n8n workflows through natural conversation

[![License: AGPL--3.0-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)
[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/ai4less/nodeflip)

## 🚀 Presentation

![video-intro-nodeflip](https://github.com/user-attachments/assets/4be7e1bb-b68c-46ee-bbf6-f20733254325)

- 🌐 **Universal Compatibility** - Works with n8n cloud and self-hosted instances
- 🤖 **Natural Language Workflow Creation** - Describe what you want, AI builds it
- 💬 **Conversational Interface** - Chat sidebar integrated directly into n8n
- 🔄 **Real-time Updates** - Watch nodes appear as you chat
- ☁️ **Your Backend** - **SOON** Use any AI backend (OpenAI, Anthropic, self-hosted)

## 📥 Installation

1. Install from [Chrome Web Store](https://chrome.google.com/webstore) *(link coming soon)*
2. Open any n8n workflow page
3. Click the NodeFlip icon in the n8n toolbar

## ⚙️ Configuration

1. Click the NodeFlip extension icon in your browser toolbar
2. Enter your API KEY (Get yours at : https://platform.ai4less.io/register)
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

## 🛠️ Requirements

- Chrome browser (v88+)
- n8n instance (cloud or self-hosted)
- Compatible AI backend API

## 🐛 Support

- Issues: [GitHub Issues](https://github.com/ai4less/nodeflip/issues)
- Email: remen@ik.me

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
