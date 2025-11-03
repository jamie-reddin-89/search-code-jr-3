# AGENTS.md

This file provides guidance to agents when working with code in this repository.

## Project-Specific Non-Obvious Information

### Build and Development
- Base path is set to '/error-code-search-jr-11675/' for Lovable deployment in vite.config.ts
- Development server runs on port 8080 (not standard 3000)
- PWA configured with workbox runtime caching for Google Fonts
- Lovable tagger component enabled in development mode only

### Architecture Patterns
- Uses React Router with HashRouter for GitHub Pages compatibility
- Multiple data sources: static JSON files in src/data/error-codes/ and Supabase database
- Offline mode syncs error codes to localStorage under key "offline_error_codes"
- Sync operations use custom localStorage keys (jr_user_events, jr_fix_steps, jr_error_metadata)

### Critical Conventions
- Contact email hardcoded to 'jayreddin@hotmail.com' in src/lib/config.ts
- All Supabase operations use (supabase as any) type casting due to type issues
- Contact form sends emails via SendGrid through Supabase Edge Function "contact-send"
- Analytics tracking happens even when Supabase fails (graceful degradation)

### Error Handling and Debugging
- Offline data download triggers via "downloadOfflineData" custom event
- App logs stored locally as "jr_app_logs" and synced to Supabase table "app_logs"
- User events tracked with geolocation and device info via localStorage queue
- Version number must be updated after every implementation in settings pop-up

### Supabase Integration
- Edge functions: contact-send (email), ai-assistant, photo-diagnosis
- Database tables: error_codes_db, user_events, app_logs, fix_steps, error_metadata, contact_messages
- Service role key required for storing contact messages in database

### Custom Hooks
- useOfflineMode manages offline data with timestamp tracking
- useAnalytics wraps search tracking with user ID association
- useUserActivity creates sessions and tracks page views
- All hooks integrate with both localStorage and Supabase for resilience

### UI Framework
- Shadcn/ui components with custom sidebar theme extension
- Tailwind CSS with custom color variables and sidebar-specific variants
- Dark/light mode managed through next-themes
- Custom tooltip context separate from Radix tooltip provider