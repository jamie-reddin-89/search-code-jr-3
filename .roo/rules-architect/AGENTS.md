# AGENTS.md

This file provides architect-mode-specific guidance to agents when working with code in this repository.

## Architect Mode Rules (Non-Obvious Only)

### Architecture Constraints
- HashRouter chosen specifically for GitHub Pages compatibility over BrowserRouter
- Multiple data sources (static JSON + Supabase) due to offline-first requirements
- Custom localStorage sync system designed for resilience when Supabase unavailable
- PWA architecture requires specific workbox caching for Google Fonts

### System Integration Patterns
- Contact form bypasses standard email APIs using Supabase Edge Functions with SendGrid
- Analytics system designed with graceful degradation - continues tracking even when backend fails
- Offline mode uses event-driven architecture with "downloadOfflineData" custom events
- User activity tracking includes geolocation data for debugging purposes

### Data Flow Architecture
- Error codes flow from static JSON files to Supabase database to localStorage for offline access
- User events queued in localStorage with keys jr_user_events, jr_fix_steps, jr_error_metadata
- App logs follow same pattern: localStorage "jr_app_logs" synced to Supabase "app_logs"
- Service role key required for contact message storage due to RLS policies

### Deployment Architecture
- Base path '/error-code-search-jr-11675/' hardcoded for Lovable platform requirements
- Development port 8080 chosen to avoid conflicts with other services
- Lovable tagger integrated only in development for component tracking
- PWA manifest structure designed for offline functionality with specific icon requirements

### Security Architecture
- Supabase operations use type casting (supabase as any) due to SDK version incompatibilities
- Contact form validation happens on both client and edge function levels
- Admin routes protected by role-based access control with custom AdminRoute component
- Environment variables required for SendGrid integration and service role access