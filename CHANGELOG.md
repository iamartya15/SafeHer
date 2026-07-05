# Changelog

All notable changes to the SafeHer AI project will be documented in this file.

## [1.0.0] - 2026-07-05
### Added
- **Global Notification Context**: Moved notifications state to a centralized context to support real-time cross-component updates and remove race conditions.
- **Unified Date Utility**: Created `dateFormatter.js` across frontend and backend to enforce standard `Asia/Kolkata` timezone displays.

### Fixed
- **Notification Stale State**: Resolved an issue where the unread badge failed to disappear or displayed incorrect counts due to aggressive browser caching and disjointed local state.
- **Timezone Inconsistencies**: Fixed incorrect UI display of SOS timestamps rendering in raw UTC instead of the user's localized zone.
- **Guardian Dashboard Connectivity**: Patched the accept/reject flow so notifications are immediately cleared upon action.

### Security & Performance
- **Cache-Busting Integration**: Prevented aggressive GET cache responses on `/notifications` via timestamped queries and explicit backend Headers.
- **Request Cancellation (AbortController)**: Aborted trailing duplicate HTTP requests to eliminate ghost UI flashes during optimistic state updates.
- **Bundle Optimization**: Reduced main bundle payload by implementing `React.lazy()` for heavy interactive pages like the Admin Dashboard and Map layers.
