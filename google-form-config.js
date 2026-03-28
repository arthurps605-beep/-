/**
 * Uzupełnij dane z Google Forms:
 * 1) Otwórz formularz → ⋮ → „Pobierz link do wstępnie wypełnionego formularza” (prefill) — w URL widać entry.xxx.
 * 2) Albo: podgląd formularza → PPM → Wyświetl źródło → szukaj name="entry.…"
 *
 * formId = fragment z adresu:
 *   https://docs.google.com/forms/d/e/FORM_ID/viewform
 */
(function (w) {
    'use strict';
    w.GOOGLE_FORM_CONFIG = {
        formId: '1FAIpQLSfwQFuqlTYPwA2RU73Kv0l1ImjlepJIroXy_9X4gWGAzlg8Mw',
        entryNickname: 'entry.195353444',
        entryScore: 'entry.1830577080',
        /**
         * Ten sam arkusz we wszystkich wariantach linku (?gid=, &range=…).
         * Kolumny w arkuszu: Nickname (B1), Score (C1) — wypełnia Google Forms po powiązaniu Odpowiedzi z tym plikiem.
         */
        sheetViewUrl:
            'https://docs.google.com/spreadsheets/d/1ioNEyqRXZa_pwD9OOnF-FoqL0wxncsbXCJkbMKFz5tE/edit?usp=sharing'
    };
})(typeof window !== 'undefined' ? window : this);
