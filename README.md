# NodeFlip AI

> AI-powered assistant for building n8n workflows through natural conversation

[![License: AGPL-3.0](https://img.shields.io/badge/License-AGPL--3.0-blue.svg)](https://opensource.org/licenses/AGPL-3.0)
[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/ai4less/nodeflip)

## 🚀 Presentation

![video-intro-nodeflip](https://github.com/user-attachments/assets/4be7e1bb-b68c-46ee-bbf6-f20733254325)

- 🌐 **Universal Compatibility** - Works with n8n cloud and self-hosted instances
- 🤖 **Natural Language Workflow Creation** - Describe what you want, AI builds it
- 💬 **Conversational Interface** - Chat sidebar integrated directly into n8n
- 🔄 **Real-time Updates** - Watch nodes appear as you chat
- ☁️ **Your Backend** - **SOON** Use any AI backend (OpenAI, Anthropic, self-hosted)

## 📋 Project Status

NodeFlip was in development before the official n8n AI builder was released. To get the extension to users quickly, we accelerated the Chrome extension deployment. Here's the current status:

- ✅ **Chrome Extension Source Code** - Publicly available in this repository
- 📅 **Backend Source Code** - Coming before end of October 2025
- 🔑 **Current Usage** - For now, the extension requires the official **AI4Less provider** (get an API key at https://platform.ai4less.io/register)

## 🎁 Limited Time Offer (Until 25 Oct 2025)

Get a free 20 nodes API Key with GLM 4.6 as backend by filling this [form](https://form.ai4less.io/form/fuoSRVy9).

## ⚙️ Configuration

1. Click the NodeFlip extension icon in your browser toolbar
2. Enter your API KEY (Get yours at : https://platform.ai4less.io/register)
3. Add your API key
4. Click "Test Connection" to verify
5. Click "Save Settings"
6. Start chatting!

The AI4Less platform uses **GLM 4.6** internally to power NodeFlip's workflow generation capabilities.

## 📥 Installation

### Option 1: Chrome Web Store (Coming Soon)
The extension is currently in review by Google. Once approved, you'll be able to install it directly from the [Chrome Web Store](https://chrome.google.com/webstore).

### Option 2: Load Unpacked (Development/Temporary)
Until the extension is available on the Chrome Web Store, you can build and load it unpacked locally:

1. **Build the extension:**
   ```bash
   npm install
   npm run build
   ```
   This generates a `build/` directory with the compiled extension.

2. **Load in Chrome:**
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable **Developer mode** (toggle in the top right)
   - Click **Load unpacked**
   - Select the `build/` folder from your project directory
   - The NodeFlip extension will now appear in your Chrome toolbar

3. **Use the extension:**
   - Open any n8n workflow page
   - Click the NodeFlip icon in the n8n toolbar

## 🎯 How to Use

1. Open or create an n8n workflow
2. Click the NodeFlip icon in the n8n toolbar (top right)
3. Describe what you want to build in natural language
4. Watch as NodeFlip creates the workflow for you

**Example prompts:**
- "Create a workflow that sends me an email when a new row is added to Google Sheets"
- "Build an automation that posts to Slack when I get a new GitHub issue"
- "Make a workflow that backs up my Airtable data to Google Drive daily"

### Advanced: Node Synchronization Commands

NodeFlip includes special commands to build and maintain a knowledge base of n8n nodes in the AI backend. This enables smarter, more accurate workflow generation.

**Available Commands:**

Type `/` in the chat to access these commands:

- **`/sync-global-nodes`** 🌐 - Indexes all standard n8n nodes into the vector database (admin only). This extracts node definitions, parameters, and capabilities from your n8n instance and creates embeddings for intelligent node matching during workflow generation.

- **`/sync-custom-nodes`** 🔄 - Indexes your custom and community nodes into the vector database. Use this if you have custom nodes installed in your n8n instance that you want NodeFlip to understand and utilize when building workflows.

**How it works:**
1. The extension extracts node metadata directly from your n8n instance
2. Node information is vectorized using embeddings and stored in a RAG (Retrieval-Augmented Generation) database
3. When you describe a workflow, the AI backend retrieves relevant nodes from this database to build more accurate solutions
4. Updates your node knowledge base as new nodes are added to n8n

Once the backend source code is released, you'll be able to self-host or use alternative AI providers.

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
