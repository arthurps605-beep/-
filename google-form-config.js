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
        formId: '',
        entryNickname: '',
        entryScore: ''
    };
})(typeof window !== 'undefined' ? window : this);
