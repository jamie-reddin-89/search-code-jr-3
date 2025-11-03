# AGENTS.md

This file provides debugging-specific guidance to agents when working with code in this repository.

## Debug Mode Rules (Non-Obvious Only)

### Error Handling and Logging
- App logs stored locally as "jr_app_logs" before syncing to Supabase table "app_logs"
- User events queued in localStorage under "jr_user_events" with geolocation and device info
- Offline data download triggered by "downloadOfflineData" custom event
- Version number updates required after every implementation in settings pop-up

### Supabase Integration Issues
- All database operations use (supabase as any) type casting due to type compatibility issues
- Contact form fails silently if SendGrid API key not configured in edge function
- Analytics tracking continues even when Supabase operations fail (graceful degradation)
- Service role key required for storing contact messages in contact-send edge function

### Custom Event System
- SyncBridge component triggers "downloadOfflineData" event for offline mode
- AnalyticsListener component tracks page views and search events
- Offline mode state managed through localStorage key "offlineMode"

### Build and Development Debugging
- Lovable tagger only active in development mode - check network tab for tagger requests
- Base path '/error-code-search-jr-11675/' affects all static asset URLs in production
- PWA manifest requires specific icon files in public directory for offline functionality
- Development server runs on port 8080, not standard React ports