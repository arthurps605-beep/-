/**
 * Skopiuj ten plik do: Arkusz Google → Rozszerzenia → Apps Script,
 * zapisz, Wdrożenie → Nowe wdrożenie → Aplikacja internetowa:
 *   Wykonaj jako: ja
 *   Dostęp: wszyscy
 * Skopiuj URL wdrożenia do google-form-config.js → sheetWebAppUrl
 *
 * Arkusz: zakładka "Leaderboard", nagłówek: Nickname | Score | Updated
 * (jeśli nie ma — skrypt utworzy).
 */
function doPost(e) {
  var nick = String(e.parameter.nickname || '').trim();
  var scoreRaw = e.parameter.score;
  var token = String(e.parameter.token || '');
  var expected = PropertiesService.getScriptProperties().getProperty('SUBMIT_TOKEN');
  if (expected && token !== expected) {
    return jsonOut({ ok: false, error: 'forbidden' });
  }
  var score = parseInt(scoreRaw, 10);
  if (!nick || isNaN(score) || score < 0) {
    return jsonOut({ ok: false, error: 'bad' });
  }

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Leaderboard');
  if (!sheet) {
    sheet = ss.insertSheet('Leaderboard');
    sheet.appendRow(['Nickname', 'Score', 'Updated']);
  }

  var range = sheet.getDataRange();
  var values = range.getValues();
  if (values.length === 0) {
    sheet.appendRow(['Nickname', 'Score', 'Updated']);
    values = sheet.getDataRange().getValues();
  }

  var rowToUpdate = -1;
  var i;
  for (i = 1; i < values.length; i++) {
    if (String(values[i][0]).trim().toLowerCase() === nick.toLowerCase()) {
      rowToUpdate = i + 1;
      break;
    }
  }

  var now = new Date();
  if (rowToUpdate > 0) {
    sheet.getRange(rowToUpdate, 2).setValue(score);
    sheet.getRange(rowToUpdate, 3).setValue(now);
  } else {
    sheet.appendRow([nick, score, now]);
  }

  return jsonOut({ ok: true });
}

function jsonOut(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON
  );
}
