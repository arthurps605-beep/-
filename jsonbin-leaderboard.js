/**
 * JSONBin leaderboard (див. https://jsonbin.io/api-reference )
 *
 * Спочатку йде X-Access-Key; якщо 401 — повтор з X-Master-Key (Access має бути
 * прив’язаний до біна в JSONBin: Read + Update, інакше буде 401).
 */
(function (global) {
    'use strict';

    const BIN_ID = '69c6df5daa77b81da92848b0';

    const ACCESS_KEY_CLIENT =
        '$2a$10$g4x/TO9bj3mldTcGnHu44ubiEfRN7OOB5ZNgFkv.fBtjb8NZA/Nfm';

    /** Резерв лише при 401 від Access Key. */
    const MASTER_KEY =
        '$2a$10$FjN7lXfLrZdPm0.X/Qx5UeHGeWDAjPQAGj2JH6cF5IuFcGW3D0k7C';

    const GET_URL = 'https://api.jsonbin.io/v3/b/' + BIN_ID + '/latest';
    const PUT_URL = 'https://api.jsonbin.io/v3/b/' + BIN_ID;

    function mergeHeaders(base, auth) {
        var out = {};
        if (base) {
            for (var k in base) {
                if (Object.prototype.hasOwnProperty.call(base, k)) {
                    out[k] = base[k];
                }
            }
        }
        for (var a in auth) {
            if (Object.prototype.hasOwnProperty.call(auth, a)) {
                out[a] = auth[a];
            }
        }
        return out;
    }

    async function fetchWithAuth(url, init) {
        var base = init || {};
        var h1 = mergeHeaders(base.headers, {
            'X-Access-Key': String(ACCESS_KEY_CLIENT).trim()
        });
        var res = await fetch(url, Object.assign({}, base, { headers: h1 }));
        if (res.status === 401 && MASTER_KEY) {
            var h2 = mergeHeaders(base.headers, { 'X-Master-Key': MASTER_KEY });
            res = await fetch(url, Object.assign({}, base, { headers: h2 }));
        }
        return res;
    }

    async function saveScore(name, score) {
        try {
            var getRes = await fetchWithAuth(GET_URL, { method: 'GET' });
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

            var putRes = await fetchWithAuth(PUT_URL, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
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
            var res = await fetchWithAuth(GET_URL, { method: 'GET' });
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
