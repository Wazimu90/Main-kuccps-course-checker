# Superpowers Plan: Embed ChatGPT Assistant & Update Student Guide

**Date:** 2026-02-03  
**Task:** Embed custom ChatGPT assistant on home page + update student guide documentation

---

## Goal
1. **Embed a custom ChatGPT assistant** as a floating help icon on the home page that opens in a mobile-sized popup window. The chatbot is powered by OpenAI GPT (user-provided Custom GPT at `https://chatgpt.com/g/g-697a18934aac8191a33c3c51e8a9b52b-kuccps-course-checker-assistant`) and costs nothing to the website owner.
2. **Update the student guide documentation** (`KUCCPS_COURSE_CHECKER_STUDENT_GUIDE.md`) with comprehensive help content including PDF troubleshooting, result ID recovery, agent support, and other common issues.

---

## Assumptions
1. The Custom GPT link is a fully functional public GPT.
2. Users will need a ChatGPT account to interact with the chatbot (Free or Plus).
3. The chatbot will open in a new popup window since iframes are blocked by ChatGPT.
4. The existing floating help button is on the results page - this new AI assistant icon will be on the home page (and potentially global).
5. The student guide markdown will be uploaded to the GPT's configuration to serve as its knowledge base.

---

## Plan

### Step 1: Create Floating AI Assistant Button Component
**Files:** `components/floating-ai-assistant.tsx` (new)  
**Change:** Create a new floating button component that:
- Displays a distinctive AI/chatbot icon (different from the WhatsApp help button)
- Shows an expandable tooltip/popover with instructions on how to use the assistant
- Opens ChatGPT in a new popup window
- Includes clear instructions about needing a ChatGPT account
- Has a pulsing/animated effect to attract attention

**Verify:** 
```bash
npm run lint
npm run build
```

---

### Step 2: Add Floating AI Assistant to Home Page
**Files:** `app/page.tsx`  
**Change:** Import and add the `FloatingAIAssistant` component to the home page, positioning it on the bottom-right corner (the existing help button is bottom-left on results page)

**Verify:**
```bash
npm run build
npm run dev
```
Then manually verify the button appears and opens the ChatGPT link.

---

### Step 3: Update Student Guide with Comprehensive Help Content
**Files:** `docs/KUCCPS_COURSE_CHECKER_STUDENT_GUIDE.md`  
**Change:** Add new sections:
- **14. Troubleshooting Common Issues** (PDF not downloading, result ID missing, etc.)
- **15. Payment Issues & Recovery** (what to do if payment failed but money was deducted)
- **16. Agent Support & Re-download Instructions**
- **17. AI Assistant Usage Guide** (how to use the ChatGPT assistant)
- Update existing sections with more comprehensive help content

**Verify:**
```bash
cat docs/KUCCPS_COURSE_CHECKER_STUDENT_GUIDE.md
```
Review the content manually.

---

### Step 4: Update CHANGELOG.md
**Files:** `CHANGELOG.md`  
**Change:** Document all changes made in this implementation

**Verify:**
```bash
cat CHANGELOG.md | head -50
```

---

## Risks & Mitigations
| Risk | Mitigation |
|------|------------|
| ChatGPT blocks iframe embedding | Open in popup window instead of iframe |
| Users may not have ChatGPT accounts | Add clear instructions about signup requirements |
| Popup blockers may prevent opening | Use user-initiated click event; add fallback link |
| Button may overlap with other UI elements | Position carefully and test on mobile |

---

## Rollback Plan
1. Remove the `FloatingAIAssistant` import and usage from `app/page.tsx`
2. Delete `components/floating-ai-assistant.tsx`
3. Revert changes to `KUCCPS_COURSE_CHECKER_STUDENT_GUIDE.md` using git
4. Revert CHANGELOG.md changes
5. Run `npm run build` to verify clean rollback
