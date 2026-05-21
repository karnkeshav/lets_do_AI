/**
 * LOCAL DEVELOPMENT CONFIG
 * ─────────────────────────────────────────────────────────────
 * 1. Copy this file:   config.example.js  →  config.js
 * 2. Fill in your real values in config.js
 * 3. Never commit config.js  (it is in .gitignore)
 *
 * For production, these values are stored as GitHub repository
 * secrets (Settings → Secrets and variables → Actions) and
 * injected into config.js automatically by the deploy workflow.
 */

window.APP_CONFIG = {
    /* Google Apps Script Web App URL (from Deploy → Manage deployments) */
    GOOGLE_SHEET_URL: 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec',

    /* Razorpay publishable key — starts with rzp_live_ or rzp_test_ */
    RAZORPAY_KEY_ID: 'rzp_live_YOUR_KEY_ID',

    /* Fine-grained GitHub PAT with Contents: Read+Write on lets_do_AI repo */
    GITHUB_TOKEN: 'github_pat_YOUR_TOKEN_HERE',

    /* GitHub repo in owner/repo format — do not change unless you fork */
    GITHUB_REPO: 'karnkeshav/lets_do_AI',
};
