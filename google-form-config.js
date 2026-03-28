/**
 * Formularz: formId, entry.* — jak wcześniej.
 *
 * Ranking na stronie /leaderboard: sheetPublishedCsvUrl (?output=csv).
 *
 * Pubhtml (docs.google.com/.../pubhtml) sam z siebie NIE sortuje po Score — to strona Google.
 * Żeby pubhtml też był po rankingu: druga zakładka + SORT() — patrz plik
 * google-sheets-posortowany-pubhtml.txt w tym repozytorium.
 */
(function (w) {
    'use strict';
    w.GOOGLE_FORM_CONFIG = {
        formId: '1FAIpQLSfwQFuqlTYPwA2RU73Kv0l1ImjlepJIroXy_9X4gWGAzlg8Mw',
        entryNickname: 'entry.195353444',
        entryScore: 'entry.1830577080',

        /** Ten sam dokument co pubhtml — wersja CSV do rankingu (?output=csv). */
        sheetPublishedCsvUrl:
            'https://docs.google.com/spreadsheets/d/e/2PACX-1vT1Mms6EONOtmaRIx69Xjqw4Zk1Wn8bsY6t0iAq5YixJiWRwbTqk3UrRTSzaGgkVyYKdPYmViG_OF03/pub?output=csv'
    };
})(typeof window !== 'undefined' ? window : this);
