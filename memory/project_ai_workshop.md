---
name: project-ai-workshop
description: Keshav is building a workshop registration landing page for "AI for EveryOne" — a live AI workshop with 3 tracks + combo offer, payments via PhonePe QR, and registrations logged to Google Sheets
metadata:
  type: project
---

"AI for EveryOne" live AI workshop landing page.

**Workshop tracks & prices (50% off during session):**
- Track A: AI Productivity Essentials · 5 Days · ₹999 (was ₹1,999)
- Track B: AI App Builder · 10 Days · ₹2,499 (was ₹4,999)
- Track C: Advanced AI Workflows · 5 Days · ₹1,499 (was ₹2,999)
- Combo (all 3): 24+ Days · ₹4,499 (was ₹9,999) · 55% off

**Payment recipient:** KESHAV KARN via PhonePe (QR code must be saved as `phonepe-qr.png`)

**Tech stack:** Single-file HTML (no build step), Google Apps Script as backend for Sheets logging.

**Files:**
- `index.html` — Complete 5-step flow (hero → plan select → register → payment QR → thank you)
- `apps-script.js` — Google Apps Script code to paste into Google Sheets > Extensions > Apps Script
- `phonepe-qr.png` — User needs to save this from the PhonePe QR screenshot they shared

**Remaining setup for user:**
1. Save PhonePe QR image as `phonepe-qr.png` in project root
2. Deploy `apps-script.js` as a Google Apps Script Web App
3. Paste the deployment URL into `GOOGLE_SHEET_URL` constant in `index.html`

**Why:** Workshop registrations need to be captured in Google Sheets with name, email, phone, plan, amount, and timestamp (IST).
**How to apply:** Any changes to tracks, pricing, or payment recipient should update both `index.html` (PLANS array) and the workshop details in memory.
