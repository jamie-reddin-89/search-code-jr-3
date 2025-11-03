# AGENTS.md

This file provides ask-mode-specific guidance to agents when working with code in this repository.

## Ask Mode Rules (Non-Obvious Only)

### Data Architecture
- Error codes stored in two locations: static JSON files in src/data/error-codes/ and Supabase database
- Static JSON files contain manufacturer-specific error code data (Dedietrich, LG, Panasonic, etc.)
- Supabase database used for dynamic content and user-generated data
- Offline mode downloads database content to localStorage under "offline_error_codes" key

### Routing and Navigation
- HashRouter used specifically for GitHub Pages compatibility, not standard browser router
- Dynamic routes generated from manufacturer names in App.tsx using lowercase and hyphen formatting
- Admin routes protected by AdminRoute component with role-based access

### Contact and Communication
- Contact form hardcoded to send to 'jayreddin@hotmail.com' via SendGrid
- Edge function "contact-send" handles email delivery with optional database storage
- Service role key required for storing contact messages in Supabase table "contact_messages"

### Build and Deployment
- Lovable deployment uses base path '/error-code-search-jr-11675/' in vite.config.ts
- Development server configured for port 8080 instead of standard ports
- PWA manifest includes specific icon requirements and Google Fonts caching
- Lovable tagger component only active during development builds