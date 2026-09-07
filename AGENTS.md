# AGENTS.md

Guidance for AI agents working in this repository.

## Project Overview

**WooSeo** is a single-page application that generates AI-powered SEO content for WooCommerce products and lets users bulk-edit and audit product content. It is a Vite + React 18 + TypeScript SPA (named `vite_react_shadcn_ts` in `package.json`) with a Supabase backend (Postgres + Auth + Edge Functions). It talks to WooCommerce store REST APIs, OpenAI (via a Supabase Edge Function), and Stripe (via Edge Functions).

The app was originally scaffolded on Lovable and has been repurposed/extended. Some scaffolding leftovers remain (see Known Issues).

## Tech Stack

| Layer | Technology |
|---|---|
| UI | React 18, react-router-dom v6, Tailwind CSS v3, shadcn/ui (Radix primitives), lucide-react icons, recharts, sonner toasts |
| Forms | react-hook-form, zod, @hookform/resolvers |
| Data fetching | @tanstack/react-query (used in BulkEditor only); everything else uses `useEffect` + imperative Supabase/WooCommerce `fetch` calls |
| Backend | Supabase (Postgres, Row Level Security, Auth, Edge Functions in Deno) |
| Payments | Stripe (Checkout Sessions) via Edge Functions |
| Excel export | `xlsx` |
| Build tooling | Vite 5, @vitejs/plugin-react-swc, TypeScript 5.5, ESLint 9 |
| Deploy | Vercel (`vercel.json` rewrites all routes to `/`) |

## Getting Started

**Install dependencies:**
```bash
npm install
```

**Local development** (serves at http://localhost:8080):
```bash
npm run dev
```

**Production build** (outputs to `dist/`):
```bash
npm run build
```

**Preview the production build:**
```bash
npm run preview
```

**Lint:**
```bash
npm run lint
```

> The app builds and runs with zero config because the Supabase URL + anon key are hard-coded in `src/integrations/supabase/client.ts`. The Supabase **Edge Functions** additionally require secrets set in the Supabase dashboard (see Environment Variables). They will fail at runtime without them, but the frontend still boots.

## Project Structure

```
├── index.html                  # HTML entry, GA/GTM scripts hard-coded here
├── vite.config.ts              # Vite config, @ alias -> src, componentTagger plugin
├── tailwind.config.ts          # Tailwind theme incl. brand colors
├── tsconfig*.json              # TS configs (strict mode effectively OFF)
├── components.json             # shadcn/ui config
├── vercel.json                 # SPA rewrites, /affiliate -> /404 redirect
├── supabase/
│   ├── config.toml             # Supabase project id
│   ├── functions/
│   │   ├── generate-content/       # OpenAI chat completion + credit deduction
│   │   ├── create-checkout/        # Stripe checkout session creation
│   │   ├── check-payment/          # Stripe session verify + credit/sub grant
│   │   ├── start-bulk-generation/  # Bulk job orchestration
│   │   └── expire-subscriptions/   # Bulk-editor subscription expiry sweep
│   └── migrations/             # SQL migrations (affiliates, withdrawals, credits, subscriptions, processed_payments)
└── src/
    ├── main.tsx                # React entry
    ├── App.tsx                 # Route table + global providers
    ├── index.css / App.css     # Global styles, CSS vars for shadcn theme
    ├── pages/                  # One file per route
    ├── contexts/               # AuthContext, MultiStoreContext, SeoPluginContext
    ├── components/             # Feature + marketing + shadcn ui/ components
    ├── services/               # WooCommerce API, AI generation, Stripe, content-health analyzers
    ├── hooks/                  # useToast, use-mobile, useVirtualization, affiliate/referral hooks
    ├── integrations/supabase/  # Generated supabase client + DB types
    ├── types/                  # Product/Category/SeoContent/WooCommerceCredentials + content-health types
    ├── lib/utils.ts            # cn() and formatPrice() helpers
    └── ga.ts                   # Google Analytics init (currently unused)
```

## Architecture

### Frontend

The root component tree (in `App.tsx`) is:

```
QueryClientProvider > TooltipProvider > BrowserRouter
  > AuthProvider > MultiStoreProvider > SeoPluginProvider
    > ReferralTracker (renders null, captures ?ref= into localStorage)
    > Toaster
    > Routes
```

**Routes** (`src/App.tsx`):

| Path | Page |
|---|---|
| `/` | Index (marketing landing page) |
| `/login`, `/register`, `/reset-password` | Auth pages |
| `/dashboard` | Main dashboard (store setup, products, credits, generation) |
| `/content-generation` | ContentGeneration (SEO generator via ?products=ids) |
| `/products-extractor` | ProductsExtractor (Excel export + health dashboard) |
| `/content-health` | ContentHealth (product content audit) |
| `/bulk-editor` | BulkEditor (spreadsheet-style batch editor, gated by bulkEditorAccess) |
| `/settings` | Settings (manage WooCommerce store connections) |
| `/payment-success` | PaymentSuccess (Stripe return, verifies via check-payment) |
| `/docs`, `/docs/:slug` | Docs listing and post rendering |
| `/affiliate` | Redirected to `/404` (feature disabled) |
| `*` | NotFound |

**Global state (React Contexts):**
- `AuthContext` — user/session, `credits`, `bulkEditorAccess` (checks `bulk_editor_subscription`, `bulk_editor_subscription_end`, `bulk_editor_lifetime_access`), sign in/up/out, password reset, `refreshCredits()`, `checkSubscriptionStatus()` (invokes `expire-subscriptions` edge fn).
- `MultiStoreContext` — list of connected WooCommerce stores, `activeStore` (persisted in `localStorage.activeStoreId`), per-store credit usage.
- `SeoPluginContext` — selected SEO plugin (`rankmath` | `yoast` | `aioseo` | `none`), persisted in `localStorage.selectedSeoPlugin`.

**Key flows:**
1. User signs up → Supabase trigger creates a `users` row (10 free credits) → connects a WooCommerce store in Settings/Dashboard (credentials saved to `woocommerce_credentials`).
2. Product selection → `SeoContentGenerator` builds a template prompt (see `DEFAULT_PROMPT_TEMPLATE` in `aiGenerationService.ts`) → calls `generate-content` Edge Function (deducts credits, calls OpenAI) → parses response into `SeoContent` → optionally pushes to WooCommerce via `updateProductWithSeoContent` (writes plugin-specific `meta_data`, permalink, descriptions, image alt text).
3. Content Health → `contentHealthAnalyzer` checks fields against per-plugin thresholds and computes a 0-100 SEO score.
4. Payments → `CreditPurchase` → `stripeService.createSubscription` → `create-checkout` edge fn → Stripe Checkout → `PaymentSuccess` → `check-payment` edge fn grants credits/subscription.

### Backend (Supabase)

**Key tables** (from migrations): `users`, `woocommerce_credentials`, `prompt_templates`, `affiliates`, `referrals`, `commissions`, `withdrawal_requests`, `processed_payments`, `bulk_generation_jobs`, `bulk_generation_results`, `generation_queue`, `woo_stores`.

RLS is enabled on user scoped tables; payment processing uses the service-role key.

**Edge Functions** (Deno, in `supabase/functions/<name>/index.ts`):
- `generate-content` — calls OpenAI `chat/completions`, validates/deducts user credits, returns parsed SEO content. Requires `OPENAI_API_KEY`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`.
- `create-checkout` — creates Stripe Checkout sessions for credit packs and bulk-editor subscriptions. Requires `STRIPE_SECRET_KEY`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`.
- `check-payment` — verifies Stripe session, grants credits/subscription, records in `processed_payments` (idempotent).
- `start-bulk-generation` — orchestrates bulk jobs: creates results rows + queued batches, processes batches via the `generate-content` function.
- `expire-subscriptions` — flips expired `bulk_editor_subscription` users to inactive.

> Note: `DEFAULT_PROMPT_TEMPLATE` claims Gemini models, but `generate-content` always calls the OpenAI API. `gemini-2.0-flash` is mapped to 1 credit in the model table but is not actually an OpenAI model. All models route to OpenAI `chat/completions` (`gpt-4.1` is remapped to `gpt-4o`).

### External Integrations

| Integration | Where |
|---|---|
| Supabase | `src/integrations/supabase/client.ts` (hard-coded URL/anon key), Edge Functions |
| OpenAI | `generate-content` edge fn (never called directly from browser; `openaiService.ts` throws) |
| Stripe | `src/services/stripeService.ts` + `create-checkout`/`check-payment` edge fns |
| WooCommerce REST API | `src/services/wooCommerceApi.ts` — direct `fetch` + Basic auth (`wp-json/wc/v3`) for products, categories, plugin detection, updates. Validates JSON responses are arrays; unexpected/error payloads are logged and returned as empty results instead of crashing callers |
| Google Analytics / GTM | Hard-coded in `index.html` (G-9PY5TP0DB6, GTM-NFTG8FTZ). `src/ga.ts` is unused/unimported |
| Vercel | `@vercel/analytics` + `@vercel/speed-insights` in package.json but **not imported** (dead deps) |

## WooCommerce Store Connection & Troubleshooting

Connecting a store happens in `WooCommerceSetup` (`src/components/WooCommerceSetup.tsx`) → `testConnection()` in `src/services/wooCommerceApi.ts`.

- `normalizeUrl` keeps `http://`/`https://` as typed (no forced https), strips trailing `/`. Live stores must be HTTPS; local stores can be plain HTTP.
- `testConnection` tries 3 endpoints (products, categories, and a `wc/v3` fallback) with `Authorization: Basic base64(consumer_key:consumer_secret)` and **throws a detailed error** listing each endpoint's HTTP status/body so the UI shows the real cause instead of a generic message. The thrown message is rendered in `WooCommerceSetup`'s catch block.
- Error codes seen in practice:
  - **`woocommerce_rest_cannot_view` / HTTP 401** — the request reached WordPress but was treated as **anonymous**. Either PHP isn't receiving the `Authorization` header (see below) or the key is invalid/lacks Read/Write.
  - **`woocommerce_rest_cannot_view` on a real HTTPS store while signed into the WP admin** — [known WooCommerce quirk](https://woocommerce.com/document/woocommerce-rest-api/#permissions) when permission checks behave unexpectedly; using an API key instead usually resolves it.
  - `OK / 200` with a non-array JSON body (e.g. WP error object) — previously crashed `ProductSelector` (`categories.map is not a function`); now guarded.

### Local WordPress store (e.g. http://localhost:8881) fails to connect

Common local-dev causes and fixes, in order of likelihood:

1. **Wrong scheme.** Port 8881 (Laragon WordPress) is usually served over **plain HTTP**. Enter `http://localhost:8881`, not `https://`. If the WP site is HTTPS with a **self-signed cert**, open `https://localhost:8881` once in a browser tab and accept the security warning (Advanced → Proceed), otherwise browser `fetch()` rejects the certificate.
2. **CORS.** The WP REST API usually sends CORS headers (`Access-Control-Allow-Origin`, echoes `Access-Control-Allow-Headers` incl. `Authorization`), so cross-origin calls from `localhost:8080` normally work. If the console shows a CORS error, add to the theme's `functions.php`:
   ```php
   add_action( 'init', function () {
       header( 'Access-Control-Allow-Origin: ' . ( isset( $_SERVER['HTTP_ORIGIN'] ) ? $_SERVER['HTTP_ORIGIN'] : '*' ) );
       header( 'Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS' );
       header( 'Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept, Authorization' );
       if ( $_SERVER['REQUEST_METHOD'] === 'OPTIONS' ) { status_header( 200 ); exit; }
   } );
   ```
3. **`Authorization` header stripped by PHP** → WooCommerce sees every request as anonymous → `woocommerce_rest_cannot_view` 401. Very common with PHP-FPM/Nginx and some Apache CGI setups. `curl -u ck_X:cs_Y http://localhost:8881/wp-json/wc/v3/products?per_page=1` gives the same 401 because it goes through the same stack. Verify by testing a debug file that prints the incoming headers:
   ```php
   <?php header('Content-Type: text/plain');
   $hdrs = function_exists('getallheaders') ? getallheaders() : [];
   echo 'Authorization header: ' . ($hdrs['Authorization'] ?? 'MISSING') . "\n";
   echo '_SERVER HTTP_AUTHORIZATION: ' . ($_SERVER['HTTP_AUTHORIZATION'] ?? 'MISSING') . "\n";
   echo '_SERVER REDIRECT_HTTP_AUTHORIZATION: ' . ($_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? 'MISSING') . "\n";
   echo '_SERVER PHP_AUTH_USER: ' . ($_SERVER['PHP_AUTH_USER'] ?? 'MISSING') . "\n";
   ```
   ```bash
   curl -H "Authorization: Basic <base64(ck:cs)>" "http://localhost:8881/infos.php"
   ```
   All `MISSING` ⇒ strip the header. Fix:
   - Apache: add to `.htaccess` (or vhost): `SetEnvIf Authorization "(.*)" HTTP_AUTHORIZATION=$1`
   - Nginx: `fastcgi_param HTTP_AUTHORIZATION $http_authorization;` in the server/location block, then restart.
   - If the header reaches PHP but 401 persists, the key itself is bad → regenerate with **Read/Write** under WooCommerce → Settings → Advanced → REST API, or check the `woocommerce_api_keys` table (phpMyAdmin/Adminer) for a matching `consumer_key` and its permission/user.
4. **Key quality:** keys must be copied exactly (no hidden spaces), with Read/Write permission, and created by an existing admin user.

## Environment Variables

No `.env` file is present or required for the frontend (Supabase creds are hard-coded). The **Edge Functions** need these secrets set in the Supabase project dashboard (Settings → Edge Functions → Secrets):

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `OPENAI_API_KEY`
- `STRIPE_SECRET_KEY`

To deploy/debug locally:
- Edge functions: `supabase functions deploy <name> --project-ref <ref>` or `supabase start` (local dev).
- DB migrations: apply via `supabase db push` — **only if the project is re-created**; the Supabase project is already provisioned.

## Development Conventions

- **Code style:** shadcn/ui + Tailwind. Use `cn()` (`src/lib/utils.ts`) for conditional classes. Brand colors live in the `brand` key of `tailwind.config.ts` (e.g. `bg-brand-primary`, `text-brand-accent`).
- **Path alias:** `@/*` → `./src/*` (configured in `vite.config.ts` + `tsconfig*.json`). Always import UI components from `@/components/ui/*`.
- **TypeScript is lax by default:** `strict: false`, `noImplicitAny: false`, `noUnusedLocals/Parameters: false` in `tsconfig.app.json`. Existing code uses `any` liberally and verbose `console.log` debugging.
- **Supabase client** (`src/integrations/supabase/client.ts`): the file header says "automatically generated. Do not edit" — though the URL/anon key are inlined here, so it must be edited if the project changes.
- **State:** Prefer the existing patterns. React Query only for BulkEditor; contexts for global state; `localStorage` for persisted preferences (active store, SEO plugin, referral code).
- **No tests exist.** Verification is `npm run build` (must pass) and `npm run dev`.

## Known Issues

- **Lint fails (pre-existing):** 111 problems (88 errors), mostly `@typescript-eslint/no-explicit-any` in `supabase/functions/*` and `@typescript-eslint/no-require-imports` in `tailwind.config.ts`. These are legacy; do not be surprised by them.
- **Blog routing is broken:** `/blog/:slug` links exist but the route is not defined. `BlogPost.tsx` is wired to `/docs/:slug` instead. Blog post links fall through to the 404 page.
- **Dead dependencies:** `@vercel/analytics`, `@vercel/speed-insights`, and `src/ga.ts` are unused.
- **Leftover scaffolding files:** `New Text Document.txt`, `test.md`, `lovable_trigger.txt` in the repo root can be ignored.
- **Bundle size warning:** the main JS chunk is ~1 MB (unminified 1085 kB, gzip 327 kB) — Vite warns about >500 kB chunks.
- **Browserslist data is stale:** `npx update-browserslist-db@latest` is safe to run.
- **npm audit:** `25 vulnerabilities (3 low, 5 moderate, 17 high)` from transitive deps; some need manual review.
- **Credits model inconsistency:** `generate-content` maps `gemini-2.0-flash` but always calls OpenAI.
- **Referral/affiliate features** exist in code and DB but `/affiliate` is disabled (redirected to 404).

## Recent Fixes (2026-09)

Changes made on top of the original scaffold — keep these in mind so they aren't accidentally reverted:

- **Non-array WooCommerce responses are guarded.** `fetchCategories` and `fetchProducts` in `src/services/wooCommerceApi.ts` now validate that the JSON body is actually an array and log the unexpected payload; they return `[]` / `{ products: [], total: 0, totalPages: 0 }` instead of letting a WP error object flow into `ProductSelector`. `ProductSelector.tsx` also guards `categories` with `Array.isArray` before rendering. This fixes the old `categories.map is not a function` crash when a store returns an error object with a `200` status.
- **`testConnection` diagnostics.** `wooCommerceApi.ts` now throws an error listing each endpoint plus its HTTP status/body (or network error), and `WooCommerceSetup.tsx` renders that in the catch block. The connect form's info alert was rewritten to explain HTTPS vs HTTP local stores and self-signed certs.
- **Local-store troubleshooting flows** are documented in the "WooCommerce Store Connection & Troubleshooting" section above (scheme, CORS, `Authorization` header stripping, key quality).