/**
 * Wysyłka wyniku do Google Forms → odpowiedzi w jednym arkuszu (Responses).
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
        var formId = String(cfg.formId || '').trim();
        var nickEntry = String(cfg.entryNickname || '').trim();
        var scoreEntry = String(cfg.entryScore || '').trim();
        if (!formId || !nickEntry || !scoreEntry) {
            if (typeof console !== 'undefined' && console.error) {
                console.error(
                    'Google Form: uzupełnij formId, entryNickname, entryScore w google-form-config.js'
                );
            }
            return { ok: false, reason: 'config-incomplete' };
        }
        var url =
            'https://docs.google.com/forms/d/e/' + formId + '/formResponse';
        var fd = new FormData();
        fd.append(nickEntry, String(name));
        fd.append(scoreEntry, String(score));
        fetch(url, {
            method: 'POST',
            mode: 'no-cors',
            body: fd
        }).catch(function (err) {
            if (typeof console !== 'undefined' && console.warn) {
                console.warn('Google Form fetch:', err);
            }
        });
        return { ok: true };
    }

    global.submitScoreToGoogleForm = submitScoreToGoogleForm;
})(typeof window !== 'undefined' ? window : this);
