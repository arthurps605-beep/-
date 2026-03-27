/**
 * Global leaderboard via JSONBin (no localStorage).
 *
 * Якщо в браузері GET до api.jsonbin.io дає 401:
 * 1) Зроби Redeploy на Vercel + жорстке оновлення (Ctrl+Shift+R).
 * 2) У JSONBin → API Keys → Access Keys створи ключ з дозволом "Read Bin" для цього біна
 *    і встав його в READ_ACCESS_KEY нижче (залиш порожнім, якщо не потрібно).
 * 3) X-Master-Key у браузері має збігатися з ключем з акаунта, якому належить бін.
 */
(function (global) {
    'use strict';

    const BIN_ID = '69c6df5daa77b81da92848b0';
    /** Master Key — для saveScore (GET+PUT). З Dashboard → API Keys. */
    const API_KEY =
        '$2a$10$FjN7lXfLrZdPm0.X/Qx5UeHGeWDAjPQAGj2JH6cF5IuFcGW3D0k7C';
    /**
     * Опційно: окремий Access Key лише на читання (рекомендовано для сторінки /leaderboard).
     * Якщо порожній — для читання використовується API_KEY.
     */
    const READ_ACCESS_KEY = '';

    const GET_URL = 'https://api.jsonbin.io/v3/b/' + BIN_ID + '/latest';
    const PUT_URL = 'https://api.jsonbin.io/v3/b/' + BIN_ID;

    function readHeaderAttempts() {
        var list = [];
        var ra = READ_ACCESS_KEY && String(READ_ACCESS_KEY).trim();
        if (ra) {
            list.push({ 'X-Access-Key': ra });
        }
        list.push({ 'X-Master-Key': API_KEY });
        return list;
    }

    async function saveScore(name, score) {
        try {
            var getRes = await fetch(GET_URL, {
                method: 'GET',
                headers: { 'X-Master-Key': API_KEY }
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

            var putRes = await fetch(PUT_URL, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Master-Key': API_KEY
                },
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
        var attempts = readHeaderAttempts();
        var lastStatus = 0;
        var lastBody = '';
        try {
            for (var i = 0; i < attempts.length; i++) {
                var res = await fetch(GET_URL, {
                    method: 'GET',
                    headers: attempts[i]
                });
                lastStatus = res.status;
                if (res.ok) {
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
                }
                lastBody = await res.text().catch(function () {
                    return '';
                });
                if (res.status === 404) {
                    return [];
                }
            }
            console.error(
                'JSONBin GET (leaderboard) failed after retries',
                lastStatus,
                lastBody
            );
            return [];
        } catch (err) {
            console.error('fetchLeaderboardScores failed', err);
            return [];
        }
    }

    global.saveScore = saveScore;
    global.fetchLeaderboardScores = fetchLeaderboardScores;
})(typeof window !== 'undefined' ? window : this);
