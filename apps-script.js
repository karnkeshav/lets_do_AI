/**
 * AI for EveryOne Workshop — Google Apps Script Backend
 *
 * ─── GOOGLE SHEETS SETUP (do this once) ───────────────────────────────────
 *
 *  1. Go to sheets.google.com → create a new spreadsheet.
 *     Name it "AI Workshop Registrations" (or anything you like).
 *
 *  2. In the spreadsheet, open Extensions > Apps Script.
 *
 *  3. Delete the default code and paste this entire file.
 *
 *  4. Click the floppy-disk icon to Save (Ctrl + S).
 *
 *  5. Click Deploy > New Deployment.
 *       · Type:              Web App
 *       · Execute as:        Me  (your Google account)
 *       · Who has access:    Anyone
 *     Click Deploy, then Authorize when Google asks.
 *
 *  6. Copy the "Web App URL" (looks like https://script.google.com/macros/s/…/exec).
 *
 *  7. Open index.html → find GOOGLE_SHEET_URL → paste the URL.
 *
 * ─── WHATSAPP SETUP (Meta Cloud API — free) ───────────────────────────────
 *
 *  Follow these steps to send automatic WhatsApp confirmations from
 *  your number 8520977573 ("AI Readiness"):
 *
 *  1. Go to https://developers.facebook.com/ → Log in with your Meta account.
 *
 *  2. Create a new App → choose "Business" type.
 *
 *  3. Add the "WhatsApp" product to your app.
 *
 *  4. Under WhatsApp > Getting Started:
 *       · Add your phone number 8520977573 as the "From" number.
 *       · Note down the Phone Number ID  → paste into WHATSAPP_PHONE_ID below.
 *       · Generate a temporary access token → paste into WHATSAPP_TOKEN below.
 *         (For a permanent token, create a System User in Business Settings.)
 *
 *  5. Re-deploy this script (Deploy > Manage Deployments > Edit > New Version).
 *
 *  That's it! Every registration will now trigger a WhatsApp message to the
 *  customer from your AI Readiness number.
 */

/* ── WHATSAPP CONFIG ────────────────────────────────────────────────────── */
var WHATSAPP_TOKEN    = 'YOUR_META_WHATSAPP_ACCESS_TOKEN';  // from Meta Developer Console
var WHATSAPP_PHONE_ID = 'YOUR_PHONE_NUMBER_ID';             // Phone Number ID from Meta

var SHEET_NAME = 'Registrations';

var HEADERS = [
    'Timestamp (IST)',
    'Name',
    'Email',
    'Phone',
    'Plan',
    'Batch',
    'Amount (₹)',
    'Razorpay Payment ID',
    'Status',
];

function doPost(e) {
    try {
        var ss    = SpreadsheetApp.getActiveSpreadsheet();
        var sheet = ss.getSheetByName(SHEET_NAME);

        /* Create the sheet + header row the first time */
        if (!sheet) {
            sheet = ss.insertSheet(SHEET_NAME);
            var headerRange = sheet.getRange(1, 1, 1, HEADERS.length);
            headerRange.setValues([HEADERS]);
            headerRange.setFontWeight('bold');
            headerRange.setBackground('#1a1a2e');
            headerRange.setFontColor('#ffffff');
            sheet.setFrozenRows(1);
            sheet.setColumnWidth(1, 160); /* Timestamp */
            sheet.setColumnWidth(3, 200); /* Email */
            sheet.setColumnWidth(5, 280); /* Plan */
            sheet.setColumnWidth(6, 220); /* Batch */
            sheet.setColumnWidth(8, 200); /* Payment ID */
        }

        // Data arrives as application/x-www-form-urlencoded (sent by URLSearchParams
        // on the frontend). Read individual fields from e.parameter — do NOT
        // try to JSON.parse e.postData.contents, that was the matching bug here.
        var data = {
            name:       e.parameter.name       || '',
            email:      e.parameter.email      || '',
            phone:      e.parameter.phone      || '',
            plan:       e.parameter.plan       || '',
            batch:      e.parameter.batch      || '',
            amount:     e.parameter.amount     || '',
            payment_id: e.parameter.payment_id || '',
            timestamp:  e.parameter.timestamp  || '',
        };

        var timestamp = Utilities.formatDate(
            new Date(),
            'Asia/Kolkata',
            'dd-MM-yyyy HH:mm:ss'
        );

        sheet.appendRow([
            timestamp,
            data.name       || '',
            data.email      || '',
            data.phone      || '',
            data.plan       || '',
            data.batch      || '',
            data.amount     || '',
            data.payment_id || '',
            'Payment Confirmed',
        ]);

        /* Alternate row shading for readability */
        var lastRow   = sheet.getLastRow();
        var rowRange  = sheet.getRange(lastRow, 1, 1, HEADERS.length);
        if (lastRow % 2 === 0) {
            rowRange.setBackground('#0f0f1e');
            rowRange.setFontColor('#e5e7eb');
        } else {
            rowRange.setBackground('#06060f');
            rowRange.setFontColor('#e5e7eb');
        }

        /* Send WhatsApp confirmation to the customer */
        sendWhatsAppMessage(data.phone, data);

        return ContentService
            .createTextOutput(JSON.stringify({ success: true, row: lastRow }))
            .setMimeType(ContentService.MimeType.JSON);

    } catch (err) {
        return ContentService
            .createTextOutput(JSON.stringify({ success: false, error: err.toString() }))
            .setMimeType(ContentService.MimeType.JSON);
    }
}


/* ── WHATSAPP NOTIFICATION ──────────────────────────────────────────────── */
function sendWhatsAppMessage(toPhone, data) {
    if (!WHATSAPP_TOKEN || WHATSAPP_TOKEN === 'YOUR_META_WHATSAPP_ACCESS_TOKEN') {
        Logger.log('WhatsApp not configured — skipping notification.');
        return;
    }

    /* Normalise phone: strip spaces/dashes/brackets, add country code 91 */
    var phone = toPhone.replace(/[\s\-\(\)\+]/g, '');
    if (phone.charAt(0) === '0')  phone = phone.substring(1);
    if (phone.length === 10)      phone = '91' + phone;

    var message =
        '🎓 *AI for EveryOne Workshop*\n\n' +
        'Hi ' + (data.name || 'there') + '! 🙏\n\n' +
        'Your registration is *confirmed*!\n\n' +
        '📚 *Plan:* '    + (data.plan   || '') + '\n' +
        '📅 *Batch:* '   + (data.batch  || '') + '\n' +
        '💰 *Amount Paid:* ₹' + (data.amount || '') + '\n\n' +
        'We will share the upcoming batch schedule and joining link on this WhatsApp number.\n\n' +
        'Welcome to the AI revolution! 🚀\n\n' +
        '— *Team AI Readiness*';

    var url = 'https://graph.facebook.com/v18.0/' + WHATSAPP_PHONE_ID + '/messages';

    var payload = JSON.stringify({
        messaging_product: 'whatsapp',
        to:   phone,
        type: 'text',
        text: { body: message },
    });

    try {
        var response = UrlFetchApp.fetch(url, {
            method:             'post',
            contentType:        'application/json',
            headers:            { 'Authorization': 'Bearer ' + WHATSAPP_TOKEN },
            payload:            payload,
            muteHttpExceptions: true,
        });
        Logger.log('WhatsApp → ' + phone + ' | HTTP ' + response.getResponseCode());
    } catch (err) {
        Logger.log('WhatsApp error: ' + err.toString());
    }
}


/* ── GET handler ────────────────────────────────────────────────────────────
   With query params → save registration (called from the frontend via fetch
   in no-cors mode, which follows the POST→302→GET redirect transparently).
   Without params    → health-check response for browser verification.
────────────────────────────────────────────────────────────────────────── */
function doGet(e) {
    /* Health-check: no meaningful params present */
    if (!e || !e.parameter || !e.parameter.name) {
        return ContentService.createTextOutput(
            'AI Workshop registration endpoint is active. Registrations are saved here.'
        );
    }

    try {
        var ss    = SpreadsheetApp.getActiveSpreadsheet();
        var sheet = ss.getSheetByName(SHEET_NAME);

        /* Create the sheet + header row the first time */
        if (!sheet) {
            sheet = ss.insertSheet(SHEET_NAME);
            var headerRange = sheet.getRange(1, 1, 1, HEADERS.length);
            headerRange.setValues([HEADERS]);
            headerRange.setFontWeight('bold');
            headerRange.setBackground('#1a1a2e');
            headerRange.setFontColor('#ffffff');
            sheet.setFrozenRows(1);
            sheet.setColumnWidth(1, 160);
            sheet.setColumnWidth(3, 200);
            sheet.setColumnWidth(5, 280);
            sheet.setColumnWidth(6, 220);
            sheet.setColumnWidth(8, 200);
        }

        var data = {
            name:       e.parameter.name       || '',
            email:      e.parameter.email      || '',
            phone:      e.parameter.phone      || '',
            plan:       e.parameter.plan       || '',
            batch:      e.parameter.batch      || '',
            amount:     e.parameter.amount     || '',
            payment_id: e.parameter.payment_id || '',
            timestamp:  e.parameter.timestamp  || '',
        };

        var timestamp = Utilities.formatDate(
            new Date(),
            'Asia/Kolkata',
            'dd-MM-yyyy HH:mm:ss'
        );

        sheet.appendRow([
            timestamp,
            data.name,
            data.email,
            data.phone,
            data.plan,
            data.batch,
            data.amount,
            data.payment_id,
            'Payment Confirmed',
        ]);

        /* Alternate row shading */
        var lastRow  = sheet.getLastRow();
        var rowRange = sheet.getRange(lastRow, 1, 1, HEADERS.length);
        if (lastRow % 2 === 0) {
            rowRange.setBackground('#0f0f1e');
            rowRange.setFontColor('#e5e7eb');
        } else {
            rowRange.setBackground('#06060f');
            rowRange.setFontColor('#e5e7eb');
        }

        /* Send WhatsApp confirmation to the customer */
        sendWhatsAppMessage(data.phone, data);

        return ContentService
            .createTextOutput(JSON.stringify({ success: true, row: lastRow }))
            .setMimeType(ContentService.MimeType.JSON);

    } catch (err) {
        return ContentService
            .createTextOutput(JSON.stringify({ success: false, error: err.toString() }))
            .setMimeType(ContentService.MimeType.JSON);
    }
}
