// Paste in each fee Google Sheet: Extensions > Apps Script. Gives INSTANT updates (no 5-minute "publish to web" delay).
const SITE = 'https://YOUR-SITE.vercel.app';   // your deployed site
const SECRET = 'SAME_AS_SYNC_SECRET';          // same value as the SYNC_SECRET env var

function toCsv_(rows) { return rows.map(r => r.map(c => '"' + String(c).replace(/"/g, '""') + '"').join(',')).join('\n'); }

// Step 1: Deploy > New deployment > Web app > Execute as: Me, Who has access: Anyone.
// Put  <web app url>?key=SECRET&gid=<sheet gid>  into Vercel env SHEET_NARIYAWAL_LIVE / SHEET_THIRIYA_LIVE.
function doGet(e) {
  if (e.parameter.key !== SECRET) return ContentService.createTextOutput('forbidden');
  const ss = SpreadsheetApp.getActive();
  const sh = ss.getSheets().find(s => String(s.getSheetId()) === e.parameter.gid) || ss.getSheets()[0];
  return ContentService.createTextOutput(toCsv_(sh.getDataRange().getDisplayValues())).setMimeType(ContentService.MimeType.TEXT_PLAIN);
}
// Step 2: Triggers > Add trigger > pingSite > From spreadsheet > On edit (add another for On change).
function pingSite() {
  UrlFetchApp.fetch(SITE + '/api/sync', { method: 'post', headers: { 'x-sync-secret': SECRET }, muteHttpExceptions: true });
}
