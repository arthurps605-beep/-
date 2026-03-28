/**
 * Wysyłka wyniku:
 * — Jeśli ustawisz sheetWebAppUrl (Apps Script, patrz google-apps-script/LeaderboardUpsert.gs),
 *   ten sam nick aktualizuje wiersz w arkuszu (zakładka „Leaderboard”), zamiast dublować wpisy.
 * — W przeciwnym razie używany jest Google Form (każda próba = nowy wiersz w odpowiedziach).
 *
 * Formularz: entry.* z prefill / źródła strony; formId z …/d/e/FORM_ID/viewform
 */
(function (w) {
    'use strict';
    w.GOOGLE_FORM_CONFIG = {
        /** URL z wdrożenia „Aplikacja internetowa” (pusty = tylko Form) */
        sheetWebAppUrl: '',
        /** Opcjonalnie: ustaw w Apps Script → Ustawienia projektu → Właściwości skryptu: SUBMIT_TOKEN */
        sheetWebAppToken: '',

        formId: '1FAIpQLSfwQFuqlTYPwA2RU73Kv0l1ImjlepJIroXy_9X4gWGAzlg8Mw',
        entryNickname: 'entry.195353444',
        entryScore: 'entry.1830577080',
        sheetViewUrl:
            'https://docs.google.com/spreadsheets/d/1ioNEyqRXZa_pwD9OOnF-FoqL0wxncsbXCJkbMKFz5tE/edit?usp=sharing'
    };
})(typeof window !== 'undefined' ? window : this);
