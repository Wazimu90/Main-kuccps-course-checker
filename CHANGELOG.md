# Changelog

All notable changes to the KUCCPS Course Checker project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added – 2026-01-11
- **Student Tools Page** - A dedicated page for essential government services and student resources
  - Mobile-first responsive design optimized for 99% mobile traffic
  - Fast loading with disabled animated background for better performance
  - 6 government service cards with official logos, descriptions, and links:
    - **KUCCPS** - Kenya Universities and Colleges Central Placement Service
    - **HELB** - Higher Education Loans Board
    - **KRA** - Kenya Revenue Authority
    - **KNEC** - Kenya National Examinations Council
    - **Ministry of Education** - Republic of Kenya
    - **Skylink Bundlesfasta** - Mobile data bundle services
  - Dynamic status badges:
    - "Applications Not Open Yet" for KUCCPS and HELB
    - "Applications Open" for KRA, KNEC, and Ministry of Education
    - "Online Now" with animated pulse indicator for Skylink Bundlesfasta
  - Beautiful card-based layout with hover effects and premium styling
  - External link indicators and category badges
  - Educational info section about official government services
  - Added "Student Tools" link to main navigation header
  - **Video Tutorial Section** - Interactive YouTube tutorial videos with modal overlay
    - 6 comprehensive video tutorials covering:
      - How to check qualified courses using our website
      - How to apply for KUCCPS university placement
      - How to apply for KRA PIN online
      - How to apply for HELB loan & scholarship
      - Understanding KUCCPS cluster points & cut-off marks
      - How to download KNEC results certificate
    - Beautiful video cards with YouTube thumbnails and play buttons
    - Duration badges on each video thumbnail
    - Modal overlay system that opens videos without leaving the page
    - Animated modal with smooth transitions and backdrop blur
    - Close button with rotation animation
    - Prevents body scroll when modal is open
    - Click outside to close functionality
    - Auto-play videos when modal opens
    - Video information display below embedded player
    - Fully mobile-responsive with touch-friendly controls
    - Hover effects with scale animations on thumbnails
  - References:
    - [student-tools/page.tsx](file:///c:/Users/ADMIN/OneDrive/Desktop/kuccps_course_checker_advanced/v0-kuccps-course-checker/app/student-tools/page.tsx)
    - [header.tsx](file:///c:/Users/ADMIN/OneDrive/Desktop/kuccps_course_checker_advanced/v0-kuccps-course-checker/components/header.tsx)
    - [background/BackgroundProvider.tsx](file:///c:/Users/ADMIN/OneDrive/Desktop/kuccps_course_checker_advanced/v0-kuccps-course-checker/components/background/BackgroundProvider.tsx)

### Performance – 2026-01-11
- Disabled animated floating lines background on Student Tools page for faster loading
- Optimized page rendering for mobile devices with reduced visual effects
- YouTube thumbnail images lazy-loaded for better initial page performance


### Changed – 2026-01-03
- Certificate results preview
  - Switched cache fetch to tolerant `.maybeSingle()` and ensured count-up animations trigger when falling back to in-memory results
  - Updated CTA label to “View All Qualified Courses”
  - References:
    - [certificate-results-preview.tsx](file:///c:/Users/ADMIN/OneDrive/Desktop/kuccps_course_checker_advanced/v0-kuccps-course-checker/components/certificate-results-preview.tsx)
- Certificate processing
  - Added caching of eligible courses to `results_cache` with generated `result_id` (parity with Diploma flow)
  - References:
    - [certificate-processing-animation.tsx](file:///c:/Users/ADMIN/OneDrive/Desktop/kuccps_course_checker_advanced/v0-kuccps-course-checker/components/certificate-processing-animation.tsx)
- KMTC results preview
  - Summary card now displays a visible “KMTC” category badge
  - Institution total shows the number of unique institutions across eligible courses
  - Removed “Top Institutions” card and centered “Top Counties” section
  - CTA updated to “View All Qualified Courses & PDF Download”
  - References:
    - [kmtc-results-preview.tsx](file:///c:/Users/ADMIN/OneDrive/Desktop/kuccps_course_checker_advanced/v0-kuccps-course-checker/components/kmtc-results-preview.tsx)

### Fixed – 2026-01-03
- Certificate: Eliminated PostgREST `PGRST116` error by inserting certificate results into `results_cache` and tolerating empty cache responses
  - References:
    - [certificate-processing-animation.tsx](file:///c:/Users/ADMIN/OneDrive/Desktop/kuccps_course_checker_advanced/v0-kuccps-course-checker/components/certificate-processing-animation.tsx)
    - [certificate-results-preview.tsx](file:///c:/Users/ADMIN/OneDrive/Desktop/kuccps_course_checker_advanced/v0-kuccps-course-checker/components/certificate-results-preview.tsx)
- Certificate: Summary cards previously displayed zero due to animations not starting on fallback; animations now start in all paths
  - References:
    - [certificate-results-preview.tsx](file:///c:/Users/ADMIN/OneDrive/Desktop/kuccps_course_checker_advanced/v0-kuccps-course-checker/components/certificate-results-preview.tsx)
- KMTC: CTA overlap on mobile resolved by enabling wrapping and tighter line spacing
  - References:
    - [kmtc-results-preview.tsx](file:///c:/Users/ADMIN/OneDrive/Desktop/kuccps_course_checker_advanced/v0-kuccps-course-checker/components/kmtc-results-preview.tsx)

### Removed – 2026-01-03
- Tests and test scaffolding:
  - [__tests__](file:///c:/Users/ADMIN/OneDrive/Desktop/kuccps_course_checker_advanced/v0-kuccps-course-checker/__tests__) (directory removed)
  - [tests](file:///c:/Users/ADMIN/OneDrive/Desktop/kuccps_course_checker_advanced/v0-kuccps-course-checker/tests) (directory removed)
- Dev-only tooling and configs:
  - [.trae](file:///c:/Users/ADMIN/OneDrive/Desktop/kuccps_course_checker_advanced/v0-kuccps-course-checker/.trae)
  - [CODEBASE_MANIFEST.json](file:///c:/Users/ADMIN/OneDrive/Desktop/kuccps_course_checker_advanced/v0-kuccps-course-checker/CODEBASE_MANIFEST.json)
  - [components.json](file:///c:/Users/ADMIN/OneDrive/Desktop/kuccps_course_checker_advanced/v0-kuccps-course-checker/components.json)
  - [scripts](file:///c:/Users/ADMIN/OneDrive/Desktop/kuccps_course_checker_advanced/v0-kuccps-course-checker/scripts)
- Sample/mock data removed from runtime:
  - [lib/mock-data.ts](file:///c:/Users/ADMIN/OneDrive/Desktop/kuccps_course_checker_advanced/v0-kuccps-course-checker/lib/mock-data.ts)
  - [lib/news-data.ts](file:///c:/Users/ADMIN/OneDrive/Desktop/kuccps_course_checker_advanced/v0-kuccps-course-checker/lib/news-data.ts)
- Redundant lockfile:
  - [pnpm-lock.yaml](file:///c:/Users/ADMIN/OneDrive/Desktop/kuccps_course_checker_advanced/v0-kuccps-course-checker/pnpm-lock.yaml) removed; [package-lock.json](file:///c:/Users/ADMIN/OneDrive/Desktop/kuccps_course_checker_advanced/v0-kuccps-course-checker/package-lock.json) retained

### Changed – 2026-01-03
- Deployment verification:
  - Successful production build using `next build`
  - Local server started via `next start` on port 3001 for validation
  - No SQL files present; production configs preserved

### Added – 2025-12-25
- Robust referral link system
  - Middleware/service persists referral code across navigation by injecting `?rc=<code>` when cookie exists
  - Accepts `rc`, `ref`, bare `?ref_XX`, and path-style `/rc=ref_XX` for compatibility
  - Session storage now maintains `referral_code` and clears it only after recorded payment
  - Admin referral creation generates shareable links as `/rc=ref_XX`
  - References:
    - [middleware.ts](file:///c:/Users/ADMIN/OneDrive/Desktop/kuccps_course_checker_advanced/v0-kuccps-course-checker/middleware.ts)
    - [admin referrals API](file:///c:/Users/ADMIN/OneDrive/Desktop/kuccps_course_checker_advanced/v0-kuccps-course-checker/app/api/admin/referrals/route.ts)
    - [admin referrals page](file:///c:/Users/ADMIN/OneDrive/Desktop/kuccps_course_checker_advanced/v0-kuccps-course-checker/app/admin/referrals/page.tsx)
    - [referrer-tracker.tsx](file:///c:/Users/ADMIN/OneDrive/Desktop/kuccps_course_checker_advanced/v0-kuccps-course-checker/components/referrer-tracker.tsx)

### Changed – 2025-12-25
- Referral parameter standardized to `rc` for navigation; legacy `ref` and bare `?ref_XX` still supported
- Payment recording includes `course_category` and attributes users to agents via Supabase RPC
  - References:
    - [payments route](file:///c:/Users/ADMIN/OneDrive/Desktop/kuccps_course_checker_advanced/v0-kuccps-course-checker/app/api/payments/route.ts)
    - [payment page](file:///c:/Users/ADMIN/OneDrive/Desktop/kuccps_course_checker_advanced/v0-kuccps-course-checker/app/payment/page.tsx)
    - [docs/referrals_rpc.sql](file:///c:/Users/ADMIN/OneDrive/Desktop/kuccps_course_checker_advanced/v0-kuccps-course-checker/docs/referrals_rpc.sql)

### Fixed – 2025-12-25
- Resolved issue where referral param disappeared on navigation; middleware enforces sticky `?rc=<code>`
- Avoided interference with admin/API routes and external links
- Improved validation and rate limiting on referral validation endpoint
  - References:
    - [middleware.ts](file:///c:/Users/ADMIN/OneDrive/Desktop/kuccps_course_checker_advanced/v0-kuccps-course-checker/middleware.ts)
    - [referral validate](file:///c:/Users/ADMIN/OneDrive/Desktop/kuccps_course_checker_advanced/v0-kuccps-course-checker/app/api/referral/validate/route.ts)
 - Invalid referral codes now trigger redirect to `/` and clear stale referral cookies to prevent unintended sticky behavior
 - Root page no longer auto-injects stale referral param; sticky injection tied to session cookie rather than persistent cookie
   - References:
     - [middleware.ts](file:///c:/Users/ADMIN/OneDrive/Desktop/kuccps_course_checker_advanced/v0-kuccps-course-checker/middleware.ts)
     - [referrer-tracker.tsx](file:///c:/Users/ADMIN/OneDrive/Desktop/kuccps_course_checker_advanced/v0-kuccps-course-checker/components/referrer-tracker.tsx)

### Tests – 2025-12-25
- Added referral parsing tests including `rc`, `ref`, bare `?ref_XX`, long codes, and invalid characters
  - References:
    - [tests/referral-parsing.test.ts](file:///c:/Users/ADMIN/OneDrive/Desktop/kuccps_course_checker_advanced/v0-kuccps-course-checker/tests/referral-parsing.test.ts)
- Added payment payload test documenting `course_category` inclusion
  - References:
    - [tests/payments-referral.spec.ts](file:///c:/Users/ADMIN/OneDrive/Desktop/kuccps_course_checker_advanced/v0-kuccps-course-checker/tests/payments-referral.spec.ts)

### Changed – 2025-12-25
- Admin login no longer prompts for 2FA access code. Successful Supabase password login for `wazimuautomate@gmail.com` now redirects directly to the dashboard.
- Middleware guard simplified to email-only Supabase Auth session validation and denied-attempt logging.
  - References: [middleware.ts](file:///c:/Users/ADMIN/OneDrive/Desktop/kuccps_course_checker_advanced/v0-kuccps-course-checker/middleware.ts), [admin login page](file:///c:/Users/ADMIN/OneDrive/Desktop/kuccps_course_checker_advanced/v0-kuccps-course-checker/app/admin/login/page.tsx)

### Fixed – 2025-12-25
- Resolved redirect loop after successful admin login by setting Supabase auth cookies server-side.
- Added API endpoint to persist session tokens in HttpOnly cookies for middleware compatibility.
  - References: [auth session API](file:///c:/Users/ADMIN/OneDrive/Desktop/kuccps_course_checker_advanced/v0-kuccps-course-checker/app/api/auth/session/route.ts), [admin login page](file:///c:/Users/ADMIN/OneDrive/Desktop/kuccps_course_checker_advanced/v0-kuccps-course-checker/app/admin/login/page.tsx)

### Fixed – 2025-12-25
- Admin access code verification now supports bcrypt-hashed codes stored in `access_code_hash` without requiring SQL changes.
- Added server-side fallback comparison using bcrypt when RPC verification fails.
  - References: [access-code verify API](file:///c:/Users/ADMIN/OneDrive/Desktop/kuccps_course_checker_advanced/v0-kuccps-course-checker/app/api/admin/access-code/verify/route.ts), [package.json](file:///c:/Users/ADMIN/OneDrive/Desktop/kuccps_course_checker_advanced/v0-kuccps-course-checker/package.json)

### Fixed – 2025-12-25
- Removed dependency on Postgres RPC for admin access-code verification to avoid schema cache/table mismatch errors.
- Verification now queries `public.admin_access_codes` directly and compares bcrypt hash server-side.
  - References: [access-code verify API](file:///c:/Users/ADMIN/OneDrive/Desktop/kuccps_course_checker_advanced/v0-kuccps-course-checker/app/api/admin/access-code/verify/route.ts)

### Fixed – 2025-12-25
- Prevented payments flow from querying problematic RPC by adding an admin bypass:
  - When `email` is the admin and a valid `admin_access_code` is provided, records payment directly without calling RPC.
  - Avoids environment functions that reference non-existent tables (e.g., YOU_WEAK).
  - References: [payments API](file:///c:/Users/ADMIN/OneDrive/Desktop/kuccps_course_checker_advanced/v0-kuccps-course-checker/app/api/payments/route.ts)

### Fixed – 2025-12-25
- Payment page no longer queries a non-existent `public.admin_access` table from the client.
- Admin verification is now performed via the server `/api/payments` endpoint using `admin_access_code`.
  - References: [payment page](file:///c:/Users/ADMIN/OneDrive/Desktop/kuccps_course_checker_advanced/v0-kuccps-course-checker/app/payment/page.tsx), [payments API](file:///c:/Users/ADMIN/OneDrive/Desktop/kuccps_course_checker_advanced/v0-kuccps-course-checker/app/api/payments/route.ts)

### Fixed – 2025-12-25
- Admin bypass now occurs before normal payment validation, allowing amount=0 and blank phone for admin flows.
- Activity is recorded and user records updated without invoking the RPC or client-side table queries.
  - References: [payments API](file:///c:/Users/ADMIN/OneDrive/Desktop/kuccps_course_checker_advanced/v0-kuccps-course-checker/app/api/payments/route.ts)

### Fixed – 2025-12-25
- Resolved runtime error from chaining `.catch()` on Supabase query builders by replacing with `try/catch` blocks around awaited inserts/updates.
  - References: [payments API](file:///c:/Users/ADMIN/OneDrive/Desktop/kuccps_course_checker_advanced/v0-kuccps-course-checker/app/api/payments/route.ts)

### Planned
- Real database integration for news engagement (likes/comments)
- Admin authentication with Supabase Auth
- M-Pesa payment processing integration
- PDF export functionality
- User account system
- Course database sync with official KUCCPS data

### Chat Logs Audit – 2025-12-25
- Detected: 2025-12-25 00:00 (Africa/Nairobi)
- Summary: Comprehensive scan of website chat logs and related files since last CHANGELOG update. Includes UI, APIs, admin dashboards, and schema where applicable.
  
- Modified: components/results/chatbot-assistant.tsx
  - Location: [chatbot-assistant.tsx](file:///c:/Users/ADMIN/OneDrive/Desktop/kuccps_course_checker_advanced/v0-kuccps-course-checker/components/results/chatbot-assistant.tsx)
  - Change: Major UI/UX upgrade for chat widget: animated header, online indicator, prompt suggestions, copy-to-clipboard for bot responses, clear conversation, minimized state, enhanced typing indicator, improved input form and accessibility labels.
  - Messages: Shape unchanged (id, content, sender, timestamp). Timestamp display unchanged (toLocaleTimeString). No message deletions detected beyond new clear action.
  - Author/Reason: Local working tree; UX improvements and assistant usability.
  - References: User settings fetched from [assistant settings API](file:///c:/Users/ADMIN/OneDrive/Desktop/kuccps_course_checker_advanced/v0-kuccps-course-checker/app/api/assistant/settings/route.ts)
  
- Modified: app/admin/chatbot/page.tsx
  - Location: [page.tsx](file:///c:/Users/ADMIN/OneDrive/Desktop/kuccps_course_checker_advanced/v0-kuccps-course-checker/app/admin/chatbot/page.tsx)
  - Change: Switched to live admin statistics (today/total) from API; conversation preview modal; delete conversation action; provider selection (OpenRouter/OpenAI/Gemini/Qwen); system prompt + welcome message management; training tab removed; file upload restricted to .md; improved timestamp rendering via toLocaleString.
  - Messages/Metadata: Conversation rows now display user_email/user_phone, provider and created_at. Adds CRUD on conversations.
  - Author/Reason: Local working tree; improve manageability and governance of assistant conversations.
  - References: [Conversations API](file:///c:/Users/ADMIN/OneDrive/Desktop/kuccps_course_checker_advanced/v0-kuccps-course-checker/app/api/admin/chatbot/conversations/route.ts), [Conversations delete](file:///c:/Users/ADMIN/OneDrive/Desktop/kuccps_course_checker_advanced/v0-kuccps-course-checker/app/api/admin/chatbot/conversations/%5Bid%5D/route.ts), [Settings API](file:///c:/Users/ADMIN/OneDrive/Desktop/kuccps_course_checker_advanced/v0-kuccps-course-checker/app/api/admin/chatbot/settings/route.ts)
  
- Modified: app/admin/news/page.tsx
  - Location: [page.tsx](file:///c:/Users/ADMIN/OneDrive/Desktop/kuccps_course_checker_advanced/v0-kuccps-course-checker/app/admin/news/page.tsx)
  - Change: Added searchable, filterable, sortable table for News Assistant chat logs; CSV and JSON export; pagination; delete row action and refresh; shows user_email/phone, user_ip, user_message, assistant_response, used_news_context, created_at.
  - Messages/Metadata: New filters for used_news_context and q; sorting by created_at; consistent timestamp rendering toLocaleString.
  - Author/Reason: Local working tree; auditability and export capability for support/oversight.
  - References: [Admin News Assistant chats list](file:///c:/Users/ADMIN/OneDrive/Desktop/kuccps_course_checker_advanced/v0-kuccps-course-checker/app/api/admin/news/assistant/chats/route.ts), [Admin News Assistant chats item](file:///c:/Users/ADMIN/OneDrive/Desktop/kuccps_course_checker_advanced/v0-kuccps-course-checker/app/api/admin/news/assistant/chats/%5Bid%5D/route.ts)
  
- Added: app/api/admin/news/assistant/chats/route.ts
  - Location: [route.ts](file:///c:/Users/ADMIN/OneDrive/Desktop/kuccps_course_checker_advanced/v0-kuccps-course-checker/app/api/admin/news/assistant/chats/route.ts)
  - Change: Paginated GET endpoint returning id,user_ip,user_email,user_phone,user_message,assistant_response,used_news_context,created_at with search, date range, used_news_context filter, and sort.
  - Author/Reason: Local working tree; backend support for admin chat logs.
  
- Added: app/api/admin/news/assistant/chats/[id]/route.ts
  - Location: [route.ts](file:///c:/Users/ADMIN/OneDrive/Desktop/kuccps_course_checker_advanced/v0-kuccps-course-checker/app/api/admin/news/assistant/chats/%5Bid%5D/route.ts)
  - Change: DELETE to remove a log row; PUT to update assistant_response and used_news_context.
  - Author/Reason: Local working tree; moderation and corrections capability.
  
- Modified: app/api/assistant/chat/route.ts
  - Location: [route.ts](file:///c:/Users/ADMIN/OneDrive/Desktop/kuccps_course_checker_advanced/v0-kuccps-course-checker/app/api/assistant/chat/route.ts)
  - Change: Integrated LLM provider via settings; contextual intent handling; user activity logging to activity_logs; robust message normalization for qualifiedCourses context.
  - Messages/Metadata: Captures ip, user email via cookies, logs chat_interaction events; content generated via provider or fallback heuristics.
  - Author/Reason: Local working tree; smarter assistant responses and audit trail.
  
- Added: app/api/news-assistant/chat/route.ts
  - Location: [route.ts](file:///c:/Users/ADMIN/OneDrive/Desktop/kuccps_course_checker_advanced/v0-kuccps-course-checker/app/api/news-assistant/chat/route.ts)
  - Change: Persists user_message, assistant_response, used_news_context with user_ip/email/phone and created_at; returns assistant_response + used flag.
  - Author/Reason: Local working tree; persistent logging of News Assistant chats.
  
- Added: lib/chatbot/providers.ts
  - Location: [providers.ts](file:///c:/Users/ADMIN/OneDrive/Desktop/kuccps_course_checker_advanced/v0-kuccps-course-checker/lib/chatbot/providers.ts)
  - Change: Multi-provider send abstraction (OpenRouter, OpenAI, Gemini, Qwen) with Supabase RPC decrypt fallback logic; typed ChatRequest payload.
  - Author/Reason: Local working tree; provider flexibility and secure key handling.
  
- Added: lib/chatbot/domain-guard.ts
  - Location: [domain-guard.ts](file:///c:/Users/ADMIN/OneDrive/Desktop/kuccps_course_checker_advanced/v0-kuccps-course-checker/lib/chatbot/domain-guard.ts)
  - Change: In-scope keyword check and refusal message for non-KUCCPS queries.
  - Author/Reason: Local working tree; enforce domain boundaries.
  
- Removed: lib/chatbot-service.ts
  - Location: lib/chatbot-service.ts (deleted)
  - Change: Deprecated monolithic chatbot service removed in favor of provider abstraction.
  - Author/Reason: Local working tree; codebase modularization.

### Chat Logs Audit – 2025-11-28
- Detected: 2025-11-28 20:38 UTC
- Commit: 132f4a4658c2190c624fff9fce740a1050cfee86 (Author: v0 <v0[bot]@users.noreply.github.com>)
- Change: SUPABASE_SCHEMA.sql updated (course/program tables refactor, new results_cache/subject_codes). No changes detected to chatbot tables in this commit hunk.
- Reference: [SUPABASE_SCHEMA.sql](file:///c:/Users/ADMIN/OneDrive/Desktop/kuccps_course_checker_advanced/v0-kuccps-course-checker/SUPABASE_SCHEMA.sql)

## [1.0.0] - 2024-12-XX

### Added
- Homepage with animated hero section and course categories
- Grade entry forms for 5 course categories (Degree, Diploma, Certificate, KMTC, Artisan)
- Course eligibility calculator using official KUCCPS formulas
- Results page with filtering, searching, and sorting
- Payment page for PDF export feature
- News section with articles, likes, and comments
- Admin dashboard with statistics and analytics
- Admin chatbot configuration page
- Admin news analytics with real-time engagement tracking
- Admin settings page with payment toggle
- Responsive design for mobile and desktop
- Dark mode support
- Animated gradient backgrounds
- TextType component with GSAP typing animations
- Testimonial carousel
- FAQ page
- Contact page
- About page
- Privacy policy and terms pages

### Technical
- Next.js 15.2.4 with App Router
- React 19
- TypeScript 5
- Tailwind CSS 4.1.9
- shadcn/ui component library
- Supabase for database and authentication
- OpenRouter API integration for chatbot
- Framer Motion animations
- GSAP for advanced animations
- localStorage for client-side data persistence

### Database
- Created chatbot tables (settings, api_key, contexts, history)
- Set up Row Level Security (RLS) policies
- Created storage bucket for training data

## Template for Future Releases

\`\`\`markdown
## [X.Y.Z] - YYYY-MM-DD

### Added
- New features and functionality

### Changed
- Changes to existing functionality

### Deprecated
- Features that will be removed in upcoming releases

### Removed
- Features that have been removed

### Fixed
- Bug fixes

### Security
- Security improvements and vulnerability patches

### Performance
- Performance improvements and optimizations

### Database
- Database schema changes and migrations

### API
- API changes and new endpoints

### Documentation
- Documentation updates and improvements
\`\`\`

## How to Use This Changelog

### For Developers
1. **Before starting work:** Check [Unreleased] section for planned features
2. **When making changes:** Add your changes under [Unreleased]
3. **When releasing:** Move [Unreleased] items to a new version section
4. **Use semantic versioning:**
   - MAJOR version (X.0.0) for incompatible API changes
   - MINOR version (0.X.0) for new functionality in a backwards compatible manner
   - PATCH version (0.0.X) for backwards compatible bug fixes

### Categories Guide
- **Added:** New features
- **Changed:** Changes in existing functionality
- **Deprecated:** Soon-to-be removed features
- **Removed:** Now removed features
- **Fixed:** Any bug fixes
- **Security:** Vulnerability fixes
- **Performance:** Performance improvements
- **Database:** Database schema changes
- **API:** API changes
- **Documentation:** Documentation changes

### Example Entry

\`\`\`markdown
## [1.1.0] - 2024-01-15

### Added
- User authentication with email/password
- Save search history feature
- Export results to PDF (implemented M-Pesa integration)
- Social sharing buttons for results

### Changed
- Updated course eligibility calculator to match KUCCPS 2024 formulas
- Improved mobile navigation UI

### Fixed
- Fixed bug where diploma courses were not filtering correctly
- Resolved admin sidebar collapse issue on mobile

### Database
- Added `users` table for authentication
- Added `search_history` table for storing user searches
- Migration: `20240115_add_user_tables.sql`

### Performance
- Reduced homepage load time by 40% with image optimization
- Implemented lazy loading for course category cards

### Security
- Enabled RLS on all user-related tables
- Added rate limiting to payment endpoints
\`\`\`

---

**Maintainers:** Please keep this file updated with every release.

**Contributors:** When submitting PRs, add your changes under [Unreleased].

---

Primary Base (UI Foundation):

#0F172A (Deep Academic Navy)
This is dark, premium, cool-toned, perfect with Floating Lines.

Surface (Cards + Sections):

#1A1F1D (Carbon Surface)
This mixes your slate blue + carbon black for a balanced, deep modern surface.

Brand Accent (Main Highlight):

#22D3EE (Electric Academic Cyan)
This is your hero button color, links, key highlights.

Secondary Accent (Subtle Glow):

#0EE2E0 (Soft Sky Blue)
Use this for gradients, subtle lines, small highlights.

Functional Accent (Success, Validations):

#10B981 (Emerald Education Green)
ONLY success, status, verification. Never UI decoration.

Functional Accent Deep:

#059669
For deeper success states.

Neutral Light (Text & Surfaces):

#F1F5F9 (Premium Light Text)

Neutral Dim (Borders and Lines):

#475569 (Slate Dim)

Neutral Dark:

#0A0F1F
Use this for deep shadows, overlays, modals, etc.

