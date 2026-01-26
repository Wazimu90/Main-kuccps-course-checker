# Plan: Remove News Feature & Replace with Video Tutorials in Admin

## Goal
Completely remove the news feature from the KUCCPS Course Checker website and replace the news tab in the admin panel with the video tutorial management page. Update all references, clean up unused code, and ensure no import errors or broken links. And also check if there is No sitemap file and create it for the website.

## Assumptions
1. The video tutorials feature already exists and works independently (`/app/admin/video-tutorials/page.tsx`)
2. The `VideoTutorialsTab` component exists and is functional (`/components/admin/video-tutorials-tab.tsx`)
3. Database tables for news (`news`, `news_comments`, `news_assistant_chats`, `news_assistant_settings`) will NOT be dropped (can be done separately if needed)
4. User wants news links replaced with relevant alternatives rather than just broken links

---

## Plan

### Step 1: Update Admin Navigation
**Files:** `components/admin/admin-nav-items.ts`
**Change:** Replace "News" tab with redirect to video tutorials page OR just point to `/admin/video-tutorials`
**Verify:** Check that admin tabs render correctly without errors

---

### Step 2: Remove Admin News Page
**Files:** 
- Delete `app/admin/news/page.tsx`
- Delete `app/admin/news/loading.tsx`
- Delete `app/admin/news/` directory
**Change:** Remove the entire admin news directory
**Verify:** Run `npm run build` to check for import errors

---

### Step 3: Remove Public News Pages
**Files:**
- Delete `app/news/page.tsx`
- Delete `app/news/layout.tsx`
- Delete `app/news/loading.tsx`
- Delete `app/news/[slug]/page.tsx`
- Delete `app/news/[slug]/loading.tsx`
- Delete `app/news/` directory
**Change:** Remove all public-facing news pages
**Verify:** Run `npm run build` to check for import errors

---

### Step 4: Remove News API Routes
**Files:**
- Delete `app/api/news/[id]/comments/route.ts`
- Delete `app/api/news/[id]/like/route.ts`
- Delete `app/api/news/[id]/` directory
- Delete `app/api/news/unread-count/route.ts`
- Delete `app/api/news/` directory
- Delete `app/api/news-assistant/chat/route.ts`
- Delete `app/api/news-assistant/route.ts`
- Delete `app/api/news-assistant/` directory
- Delete `app/api/admin/news/[id]/publish/route.ts`
- Delete `app/api/admin/news/[id]/route.ts`
- Delete `app/api/admin/news/[id]/` directory
- Delete `app/api/admin/news/assistant/chats/[id]/route.ts`
- Delete `app/api/admin/news/assistant/chats/route.ts`
- Delete `app/api/admin/news/assistant/settings/route.ts`
- Delete `app/api/admin/news/assistant/` directory
- Delete `app/api/admin/news/summary/route.ts` (if exists)
- Delete `app/api/admin/news/route.ts`
- Delete `app/api/admin/news/` directory
**Change:** Remove all news-related API routes
**Verify:** Run `npm run build` to check for import errors

---

### Step 5: Remove News Library Files
**Files:**
- Delete `lib/news-service.ts`
- Delete `lib/news-badge-indicator.ts`
**Change:** Remove news service utilities
**Verify:** Run `npm run build` to check for import errors

---

### Step 6: Remove News Component
**Files:** Delete `components/NewsChatModal.tsx`
**Change:** Remove the news chat modal component
**Verify:** Run `npm run build` to check for import errors

---

### Step 7: Update Header Navigation
**Files:** `components/header.tsx`
**Change:** 
- Remove "News" from `NAV_ITEMS` array
- Remove `newsBadgeCount` variable and related badge rendering logic
- Remove `isNews` checks in navigation rendering
**Verify:** Check header renders correctly in browser

---

### Step 8: Update Homepage Internal Links
**Files:** `app/page.tsx`
**Change:** 
- Remove or replace the "Latest KUCCPS News" resource card (lines 327-344)
- Replace with link to Student Tools or Video Tutorials section
**Verify:** Homepage renders correctly without broken links

---

### Step 9: Update Student Tools Page
**Files:** `app/student-tools/page.tsx`
**Change:**
- Remove the "Latest Updates" (news) resource card (lines 584-601)
- Replace with another helpful resource or remove entirely
**Verify:** Student tools page renders correctly

---

### Step 10: Update FAQ Page
**Files:** `app/faq/page.tsx`
**Change:**
- Remove the "Latest News & Updates" item from `relatedResources` array (lines 263-268)
- Remove `Newspaper` icon import if no longer used
**Verify:** FAQ page renders correctly

---

### Step 11: Remove News CSS Styles
**Files:** `styles/globals.css`
**Change:** Remove `.news-content` styles (lines 221-333)
**Verify:** Build still works, no visual regressions

---

### Step 12: Update README Documentation
**Files:** `README.md`
**Change:** Remove references to news feature in documentation
**Verify:** README accurately reflects current features

---

### Step 13: Update CHANGELOG
**Files:** `CHANGELOG.md`
**Change:** Add entry documenting the removal of news feature
**Verify:** Changelog is up to date

---

### Step 14: Final Build & Test
**Files:** N/A
**Change:** Run full build and dev server
**Verify:** 
- `npm run build` succeeds
- `npm run dev` runs without errors
- Navigate to all major pages to confirm no broken references
- Admin panel loads and shows Video Tutorials tab

---

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Import errors after file deletion | Delete files in order and run build after each major step |
| Broken links to `/news` from external sources | External links will 404; consider adding redirect if needed |
| Database tables orphaned | Tables remain; can be dropped in separate migration if desired |
| Admin users confused by missing news tab | Clear communication that feature was removed |

---

## Rollback Plan
1. Git revert all commits made for this plan
2. Run `npm install` to restore any dependencies
3. Run `npm run build` to confirm rollback works

---

## Files to Delete (Summary)
- `app/admin/news/` (entire directory)
- `app/news/` (entire directory)
- `app/api/news/` (entire directory)
- `app/api/news-assistant/` (entire directory)
- `app/api/admin/news/` (entire directory)
- `lib/news-service.ts`
- `lib/news-badge-indicator.ts`
- `components/NewsChatModal.tsx`

## Files to Modify (Summary)
- `components/admin/admin-nav-items.ts`
- `components/header.tsx`
- `app/page.tsx`
- `app/student-tools/page.tsx`
- `app/faq/page.tsx`
- `styles/globals.css`
- `README.md`
- `CHANGELOG.md`
