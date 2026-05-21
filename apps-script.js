/**
 * AI for EveryOne Workshop — Google Apps Script Backend
 *
 * SETUP (do this once):
 *
 *  1. Go to sheets.google.com and create a new spreadsheet.
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
 *  6. Copy the "Web App URL" that appears (looks like
 *     https://script.google.com/macros/s/AKfy.../exec).
 *
 *  7. Open index.html in a text editor, find the line:
 *       const GOOGLE_SHEET_URL = 'YOUR_APPS_SCRIPT_DEPLOYMENT_URL_HERE';
 *     Replace the placeholder with your URL (keep the quotes).
 *
 *  Done! Every registration will now appear as a new row
 *  in the "Registrations" sheet, styled and ready.
 */

var SHEET_NAME = 'Registrations';

var HEADERS = [
    'Timestamp (IST)',
    'Name',
    'Email',
    'Phone',
    'Plan',
    'Amount (₹)',
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
        }

        var data = JSON.parse(e.postData.contents);

        var timestamp = Utilities.formatDate(
            new Date(),
            'Asia/Kolkata',
            'dd-MM-yyyy HH:mm:ss'
        );

        sheet.appendRow([
            timestamp,
            data.name   || '',
            data.email  || '',
            data.phone  || '',
            data.plan   || '',
            data.amount || '',
            'Payment Declared',
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

        return ContentService
            .createTextOutput(JSON.stringify({ success: true, row: lastRow }))
            .setMimeType(ContentService.MimeType.JSON);

    } catch (err) {
        return ContentService
            .createTextOutput(JSON.stringify({ success: false, error: err.toString() }))
            .setMimeType(ContentService.MimeType.JSON);
    }
}

/* Health-check — visit the URL in a browser to confirm the script is live */
function doGet(e) {
    return ContentService.createTextOutput(
        'AI Workshop registration endpoint is active. POST registrations here.'
    );
}
