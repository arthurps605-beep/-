/**
 * JSONBin leaderboard (див. https://jsonbin.io/api-reference )
 *
 * Важливо з офіційної документації та FAQ:
 * - CORS увімкнено для ендпоінтів: https://jsonbin.io/api-reference
 * - Читання приватного біна: потрібен X-Master-Key АБО X-Access-Key (один з них):
 *   https://jsonbin.io/api-reference/bins/read
 * - Оновлення (PUT): Content-Type: application/json + X-Master-Key або X-Access-Key:
 *   https://jsonbin.io/api-reference/bins/update
 * - Для JS у браузері JSONBin рекомендує Access Key (обмежені права), а не Master Key:
 *   https://jsonbin.io/support/tags/access-keys-api
 * - Не передавати обидва заголовки в одному запиті — пріоритет у X-Master-Key.
 *
 * Рекомендовано: у JSONBin → API Keys → Access Keys створи ключ і дай йому для цього біна
 * дозволи Read + Update (щоб працювали і сторінка /leaderboard, і saveScore).
 * Встав ключ у ACCESS_KEY_CLIENT нижче. Якщо залишити порожнім — використовується MASTER_KEY.
 */
(function (global) {
    'use strict';

    const BIN_ID = '69c6df5daa77b81da92848b0';

    /** Master Key (тільки якщо ACCESS_KEY_CLIENT порожній). */
    const MASTER_KEY =
        '$2a$10$FjN7lXfLrZdPm0.X/Qx5UeHGeWDAjPQAGj2JH6cF5IuFcGW3D0k7C';

    /**
     * Access Key для браузера (Read + Update по біну). Порожній рядок = використати MASTER_KEY.
     */
    const ACCESS_KEY_CLIENT = '';

    const GET_URL = 'https://api.jsonbin.io/v3/b/' + BIN_ID + '/latest';
    const PUT_URL = 'https://api.jsonbin.io/v3/b/' + BIN_ID;

    function authHeaders() {
        var ak = ACCESS_KEY_CLIENT && String(ACCESS_KEY_CLIENT).trim();
        if (ak) {
            return { 'X-Access-Key': ak };
        }
        return { 'X-Master-Key': MASTER_KEY };
    }

    async function saveScore(name, score) {
        try {
            var getRes = await fetch(GET_URL, {
                method: 'GET',
                headers: authHeaders()
            });
            var record = {};
            if (getRes.ok) {
                var data = await getRes.json();
                record = data && data.record ? data.record : {};
            } else if (getRes.status === 404) {
                record = {};
            } else {
                var errText = await getRes.text().catch(function () {
                    return '';
                });
                console.error('JSONBin GET failed', getRes.status, errText);
                return;
            }
            var scores = record.scores;
            if (!Array.isArray(scores)) {
                scores = [];
            }
            scores.push({
                name: String(name || ''),
                score: Number(score) || 0,
                time: Date.now()
            });
            scores.sort(function (a, b) {
                return (b.score || 0) - (a.score || 0);
            });
            scores = scores.slice(0, 10);

            var headers = authHeaders();
            headers['Content-Type'] = 'application/json';

            var putRes = await fetch(PUT_URL, {
                method: 'PUT',
                headers: headers,
                body: JSON.stringify({ scores: scores })
            });
            if (!putRes.ok) {
                var putErr = await putRes.text().catch(function () {
                    return '';
                });
                console.error('JSONBin PUT failed', putRes.status, putErr);
            }
        } catch (err) {
            console.error('saveScore failed', err);
        }
    }

    async function fetchLeaderboardScores() {
        try {
            var res = await fetch(GET_URL, {
                method: 'GET',
                headers: authHeaders()
            });
            if (!res.ok) {
                var msg = await res.text().catch(function () {
                    return '';
                });
                console.error('JSONBin GET (leaderboard) failed', res.status, msg);
                if (res.status === 404) {
                    return [];
                }
                return [];
            }
            var data = await res.json();
            var record = data && data.record ? data.record : {};
            var scores = record.scores;
            if (!Array.isArray(scores)) {
                return [];
            }
            var copy = scores.slice();
            copy.sort(function (a, b) {
                return (b.score || 0) - (a.score || 0);
            });
            return copy;
        } catch (err) {
            console.error('fetchLeaderboardScores failed', err);
            return [];
        }
    }

    global.saveScore = saveScore;
    global.fetchLeaderboardScores = fetchLeaderboardScores;
})(typeof window !== 'undefined' ? window : this);
