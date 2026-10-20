# AEVANOVO enquiry service

This service adds direct enquiry submission and an authenticated inbox to the existing GitHub Pages website. Customer records are stored in the private `aevanovo-enquiries` D1 database, never in this repository.

## Components

- `enquiry-service-intake.mjs`: public POST-only intake, strict origin checks, input validation, consent and retry deduplication.
- `enquiry-service-inbox.mjs`: private inbox, literal-text search, cursor pagination, complete enquiry details and follow-up status.
- `enquiry-service-inbox-assets.mjs`: self-contained inbox UI. No external script CDN.
- `enquiry-service-schema.sql`: empty database schema only; contains no customer data.
- `enquiry-intake.wrangler.jsonc` / `enquiry-inbox.wrangler.jsonc`: separate deployment configurations for the two Workers.

## Runtime setup

Both Workers use the same `DB` binding. The intake Worker uses `ENQUIRY_RATE_LIMITER` (8 requests per 60 seconds per hashed network key). Its allowed public origin is `https://aevanovo.eu.cc`.

The inbox uses GitHub OAuth Device Flow with **empty scope** for basic public-account identity only. It accepts only the configured stable numeric GitHub account ID. It does not request repository or private-email permissions. The GitHub token is used on the server to verify identity, and is never stored, sent to the browser or logged. Login applications do not require a client secret for this flow.

Login attempts use short-lived private D1 records and an opaque Secure/HttpOnly/SameSite=Strict cookie. Inbox sessions last at most eight hours; the database stores only a SHA-256 session hash. Logout invalidates the session. The inbox requires a valid unexpired session for every customer-data request, ignores client-supplied identity headers and checks same-origin/custom headers on all state changes. Unauthenticated visitors can only see the login screen.

No GitHub token, Cloudflare API token, database password or private administrator information belongs in public frontend configuration. `keep_vars` preserves runtime configuration managed in the dashboard. Preview URLs are disabled. Keep the database's existing contents during later website or service updates.

## Deployment

The existing Cloudflare/GitHub connection watches `enquiry-*` files. The deploy commands are:

```
npx wrangler deploy --config enquiry-intake.wrangler.jsonc
npx wrangler deploy --config enquiry-inbox.wrangler.jsonc
```

Only switch the website's form and enquiry-inbox entry after storage, unauthorized-access rejection and authorized inbox access have been verified. Frontend endpoint URLs are public configuration, not credentials.

## Verification before enabling

The service was tested with real local SQLite storage for successful creation, duplicate retries, invalid input, rate limiting, failed writes, denied accounts, session expiry, logout, spoofed headers, pagination, literal search, status changes and cross-origin write rejection. Local browser testing confirmed that a form submission appears in the inbox and that a changed follow-up status survives reload.

Local test servers and test databases are not production authentication mechanisms and are not published with these service files.
