/**
 * Formularz: formId, entry.* — jak wcześniej.
 *
 * Ranking: gid musi wskazywać arkusz z odpowiedziami formularza (w edycji: #gid=… w URL).
 * Jeśli CSV jest pusty lub błąd — w Arkuszach: Udostępnij → Publikuj w internecie →
 * wybierz zakładkę „Відповіді форми” / Responses (albo cały plik), potem CSV.
 */
(function (w) {
    'use strict';
    w.GOOGLE_FORM_CONFIG = {
        formId: '1FAIpQLSfwQFuqlTYPwA2RU73Kv0l1ImjlepJIroXy_9X4gWGAzlg8Mw',
        entryNickname: 'entry.195353444',
        entryScore: 'entry.1830577080',

        /** CSV opublikowanego arkusza z odpowiedziami (nie pierwszy pusty arkusz). */
        sheetPublishedCsvUrl:
            'https://docs.google.com/spreadsheets/d/e/2PACX-1vT1Mms6EONOtmaRIx69Xjqw4Zk1Wn8bsY6t0iAq5YixJiWRwbTqk3UrRTSzaGgkVyYKdPYmViG_OF03/pub?gid=326377582&single=true&output=csv'
    };
})(typeof window !== 'undefined' ? window : this);
