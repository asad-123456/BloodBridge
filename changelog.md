# BloodBridge Changelog

This changelog records the changes made after the MVP frontend version to improve professional quality, security posture, and production readiness.

## Status
- Project reviewed against professional web-app standards for frontend quality and security.
- Sensitive credentials and password material are no longer stored in client-accessible browser storage.
- Frontend is treated as a presentation layer only; all confidential data and real auth flows must be handled by a backend API.

## Security hardening
- Removed the practice of persisting raw user credentials in browser storage.
- Ensured authentication state is stored in session storage only instead of the broader local storage.
- Sanitized persisted app state so password fields are stripped before saving.
- Prevented the app from re-saving password values after login.
- Added environment-file protection to ensure future secrets cannot be accidentally committed.
- Documented that all API keys and sensitive config must live in server-side environment variables, never in the frontend bundle or public source files.

## Frontend quality improvements
- Reviewed routing structure and role-based portal separation for clarity and maintainability.
- Kept the interface aligned with a healthcare-focused trust and blood-donor workflow.
- Preserved a clean layout with strong visual hierarchy and user-facing trust messaging.
- Confirmed the app remains a single-page React/Vite frontend with practical role-driven navigation.

## Operational notes
- Build verification passed successfully.
- Lint verification passed successfully.
- The project is suitable as a front-end prototype and is aligned with secure frontend practices, but a backend integration layer remains required for real production authentication, data persistence, and secret management.

## Planned future work for production-grade release
- Replace mock auth with secure backend authentication using hashed credentials and token-based sessions.
- Move all secure configuration to a backend environment or secret manager.
- Add rate limiting, input validation, and CSRF or session safeguards at the API layer.
- Segregate demo/mock data from production data and add environment-specific builds.
- Implement real protected API calls using a backend gateway with no secret values exposed to the browser.
- Add automated tests for authentication, access control, and critical blood-demand workflows.
- Add monitoring, error reporting, and analytics for production operations.

## Verification record
- Build check: passed via `npm run build`
- Lint check: passed via `npm run lint`
- Security review: client-side sensitive data exposure reduced to the minimum feasible for a frontend-only demo, with clear restrictions for production API handling.

## Frontend consistency audit
- [High] Partner fulfillment was not enforcing the visible feed's status, distance, ownership, or approved-partner rules inside the state mutation; a direct fulfillment route could bypass those UI filters.
- [High] Fulfillment records defaulted to a fixed partner staff ID instead of consistently recording the signed-in staff member.
- [High] Partner-owned requests displayed a misleading "Can fulfill" action even though the fulfillment route rejected them.
- [Medium] Fulfillment history displayed every claim as "Fulfilled", including claims awaiting handover or staff confirmation.
- [Medium] Seeded request data showed an in-progress partner claim while the seeded fulfillment records were empty.
- [Medium] New partner requests used a hard-coded required-by date that had already passed.
- [Medium] Admin request filters omitted supported Draft, Closed, Cancelled, and Expired lifecycle statuses.
- [Medium] Admin request moderation described lifecycle controls but only allowed trust-label changes.
- [Medium] The notification button rendered as an interactive control without any behavior or destination.
- [Low] Hospital verification state changes were not defensively scoped inside the state mutation.
- [Reviewed] Admin-created institutions are immediately Approved because the admin registration form represents completed manual verification; the pending lifecycle remains for institution records awaiting review.
- [Low] The partner claims metric counted trust labels instead of fulfillment records or actual claim transitions.
- [Reviewed] `frontend/src/App.css` is unused leftover Vite starter CSS and does not affect the current application.
- [Reviewed] Editor diagnostics for `@tailwind` rules in `frontend/src/index.css` are tooling warnings; the configured build pipeline processes them successfully.

## Audit implementation progress
- Resolved: mock data persistence and the reset control are now restricted to the dedicated demo users.
- Resolved: seeded demo access now uses dedicated demo accounts, and persisted seed users migrate to the new demo credentials.
- Resolved: authenticated demo users can reset mock data and return to the seeded starting state from the sidebar.
- Resolved: partner fulfillment now validates approved partner access, request visibility boundaries, distance, ownership, and allowed request status in the state mutation.
- Resolved: partner fulfillment records now receive the signed-in staff user's ID.
- Resolved: partner-owned requests no longer expose a fulfillment action that cannot succeed.
- Resolved: partner history cards now show the actual claim or handover state instead of always displaying "Fulfilled".
- Resolved: seeded in-progress request data now includes its matching partner fulfillment record in history.
- Resolved: new partner requests default to today's date and cannot select a past required-by date.
- Resolved: admin request filters now include every supported request lifecycle status.
- Resolved: admin request moderation can now update lifecycle status as well as trust labels.
- Resolved: the notification control now opens role-relevant counts instead of being inert.
- Resolved: hospital verification mutations now enforce pending status and facility ownership in shared state.
- Resolved: the admin partner-claims metric now counts fulfillment records instead of trust-label text.
- Reviewed: admin-created institution approval is intentional for the manual registration workflow and is documented rather than changed.
