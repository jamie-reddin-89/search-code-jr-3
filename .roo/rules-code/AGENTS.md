# AGENTS.md

This file provides coding-specific guidance to agents when working with code in this repository.

## Code Mode Rules (Non-Obvious Only)

### Supabase Operations
- All Supabase database operations require (supabase as any) type casting due to type compatibility issues
- Contact form integration uses Supabase Edge Function "contact-send" for email delivery via SendGrid
- Analytics tracking continues even when Supabase operations fail (graceful degradation pattern)
- Custom localStorage sync uses specific keys: jr_user_events, jr_fix_steps, jr_error_metadata

### Custom Hooks
- useOfflineMode manages error code caching with timestamp tracking under "offline_error_codes" key
- useAnalytics wraps search tracking with optional user ID association
- useUserActivity creates user sessions and tracks page views with geolocation data
- All custom hooks integrate both localStorage and Supabase for resilience

### Build Configuration
- Base path set to '/error-code-search-jr-11675/' for Lovable deployment compatibility
- Development server configured for port 8080 instead of standard ports
- PWA enabled with workbox runtime caching specifically for Google Fonts
- Lovable tagger component only enabled in development mode

### UI Framework Specifics
- Shadcn/ui theme includes custom sidebar color variables and variants
- Custom tooltip context (TooltipToggleProvider) separate from Radix tooltip provider
- Dark/light mode uses next-themes with custom theme extension