# Privacy Policy for NodeFlip AI

**Last updated:** October 2024

## Overview

NodeFlip AI is a Chrome extension that helps you build n8n workflows using AI. We take your privacy seriously.

## Data Collection

**We do NOT collect:**
- ❌ Personal information
- ❌ Usage analytics
- ❌ Tracking data
- ❌ Workflow content
- ❌ API responses

## Data Storage

**Stored locally in your browser:**
- ✅ Backend API URL
- ✅ API Key (encrypted by Chrome)
- ✅ Chat history (local only)

All data is stored using Chrome's secure storage API and never leaves your device except for API requests to your configured backend.

## Third-Party Services

The extension communicates ONLY with:
1. **Your configured AI backend** - To process chat requests and generate workflows
2. **n8n instance** - To create and modify workflows (local operation)

## Data Transmission

When you use NodeFlip:
- Chat messages are sent to YOUR configured backend API
- Workflow data is processed locally in your browser
- No data is sent to NodeFlip or ai4less servers

## Permissions Explained

- **Storage**: Save your API configuration locally
- **Content Scripts**: Inject chat interface into n8n pages
- **All URLs**: Required because n8n can be self-hosted on any domain. The extension only activates on pages with `/workflow/` in the URL and the n8n interface.

## Your Rights

You can:
- Delete all stored data by uninstalling the extension
- Clear chat history anytime with the "New Chat" button
- Change or remove API credentials anytime

## Children's Privacy

This extension is not directed at children under 13.

## Changes to Privacy Policy

We will update this policy if practices change. Check the "Last updated" date.

## Contact

Questions? Contact: support@ai4less.io
