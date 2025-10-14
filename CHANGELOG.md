# Changelog

All notable changes to NodeFlip AI will be documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2024-10-14

### Initial Release

#### Added
- AI-powered n8n workflow builder
- Conversational chat interface integrated into n8n
- Settings popup for backend configuration
- Smart error handling with "Open Settings" button
- Support for all n8n nodes
- Real-time workflow updates
- Default backend: https://generator.ai4less.io
- Reset URL button in settings
- "New Chat" button to start fresh conversations

#### Features
- Works with n8n cloud and self-hosted instances
- Minimalist, professional UI design
- Dark header with clean settings panel
- Automatic credential refresh on retry
- Toggle button integrated into n8n toolbar
- Status indicators for API connection

#### Security
- API credentials stored locally only using Chrome's secure storage
- No data collection or tracking
- Privacy-first approach
- Transparent PNG icons with proper sizing

#### Technical
- Built with Preact for lightweight performance
- Manifest V3 compliance
- Content script injection on n8n workflow pages only
- Background service worker for popup management
- Debug logging system for development
