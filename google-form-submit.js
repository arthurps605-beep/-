/**
 * Wysyłka: opcjonalnie Apps Script (aktualizacja po nicku) albo Google Form (nowy wiersz).
 */
(function (global) {
    'use strict';

    /**
     * @returns {{ ok: boolean, reason?: string }}
     */
    function submitScoreToGoogleForm(name, score) {
        var cfg = global.GOOGLE_FORM_CONFIG;
        if (!cfg || typeof cfg !== 'object') {
            if (typeof console !== 'undefined' && console.error) {
                console.error('Google Form: brak GOOGLE_FORM_CONFIG.');
            }
            return { ok: false, reason: 'config-missing' };
        }

        var webApp = String(cfg.sheetWebAppUrl || '').trim();
        if (webApp) {
            var fd = new FormData();
            fd.append('nickname', String(name));
            fd.append('score', String(score));
            var tok = String(cfg.sheetWebAppToken || '').trim();
            if (tok) {
                fd.append('token', tok);
            }
            fetch(webApp, {
                method: 'POST',
                mode: 'no-cors',
                body: fd
            }).catch(function (err) {
                if (typeof console !== 'undefined' && console.warn) {
                    console.warn('Sheet web app fetch:', err);
                }
            });
            return { ok: true };
        }

        var formId = String(cfg.formId || '').trim();
        var nickEntry = String(cfg.entryNickname || '').trim();
        var scoreEntry = String(cfg.entryScore || '').trim();
        if (!formId || !nickEntry || !scoreEntry) {
            if (typeof console !== 'undefined' && console.error) {
                console.error(
                    'Google Form: uzupełnij sheetWebAppUrl albo formId, entryNickname, entryScore w google-form-config.js'
                );
            }
            return { ok: false, reason: 'config-incomplete' };
        }
        var url =
            'https://docs.google.com/forms/d/e/' + formId + '/formResponse';
        var fdForm = new FormData();
        fdForm.append(nickEntry, String(name));
        fdForm.append(scoreEntry, String(score));
        fetch(url, {
            method: 'POST',
            mode: 'no-cors',
            body: fdForm
        }).catch(function (err) {
            if (typeof console !== 'undefined' && console.warn) {
                console.warn('Google Form fetch:', err);
            }
        });
        return { ok: true };
    }

    global.submitScoreToGoogleForm = submitScoreToGoogleForm;
})(typeof window !== 'undefined' ? window : this);
