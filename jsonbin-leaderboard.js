/**
 * JSONBin leaderboard (https://jsonbin.io/api-reference)
 *
 * Rules: one slot per player (identity = trim + lowercase name).
 * New score updates only if strictly higher than stored best.
 * Records: { name, score, updatedAt }.
 */
(function (global) {
    'use strict';

    var BIN_ID = '69c6df5daa77b81da92848b0';

    var ACCESS_KEY_CLIENT =
        '$2a$10$g4x/TO9bj3mldTcGnHu44ubiEfRN7OOB5ZNgFkv.fBtjb8NZA/Nfm';

    var MASTER_KEY =
        '$2a$10$FjN7lXfLrZdPm0.X/Qx5UeHGeWDAjPQAGj2JH6cF5IuFcGW3D0k7C';

    var GET_URL = 'https://api.jsonbin.io/v3/b/' + BIN_ID + '/latest';
    var PUT_URL = 'https://api.jsonbin.io/v3/b/' + BIN_ID;

    /** Same player = same key; display name stays as submitted when beating a score. */
    function normalizePlayerKey(name) {
        return String(name || '').trim().toLowerCase();
    }

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

    function rowFromRecord(row) {
        if (!row || typeof row !== 'object') return null;
        var name = String(row.name != null ? row.name : '').trim();
        var key = normalizePlayerKey(name);
        if (!key) return null;
        var u = row.updatedAt != null ? row.updatedAt : row.time;
        return {
            name: name,
            score: Number(row.score) || 0,
            updatedAt: Number(u) || 0
        };
    }

    /** Dedupe by normalized name; keep best score only. Sorted by score DESC. */
    function mergeUniqueScores(rows) {
        if (!Array.isArray(rows)) return [];
        var map = Object.create(null);
        for (var i = 0; i < rows.length; i++) {
            var r = rowFromRecord(rows[i]);
            if (!r) continue;
            var key = normalizePlayerKey(r.name);
            var existing = map[key];
            if (!existing || r.score > existing.score) {
                map[key] = {
                    name: r.name,
                    score: r.score,
                    updatedAt: r.updatedAt
                };
            }
        }
        return Object.keys(map)
            .map(function (k) {
                return map[k];
            })
            .sort(function (a, b) {
                return b.score - a.score;
            });
    }

    async function saveScore(name, score) {
        try {
            var key = normalizePlayerKey(name);
            if (!key) {
                return { ok: false, reason: 'empty-name' };
            }

            var newScore = Math.max(0, Math.floor(Number(score)) || 0);

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
                return { ok: false, reason: 'get-failed' };
            }

            var raw = record.scores;
            if (!Array.isArray(raw)) raw = [];
            var merged = mergeUniqueScores(raw);

            var displayName = String(name).trim();
            var found = null;
            for (var j = 0; j < merged.length; j++) {
                if (normalizePlayerKey(merged[j].name) === key) {
                    found = merged[j];
                    break;
                }
            }

            if (found) {
                if (newScore <= found.score) {
                    return { ok: true, skipped: true };
                }
                found.name = displayName;
                found.score = newScore;
                found.updatedAt = Date.now();
            } else {
                merged.push({
                    name: displayName,
                    score: newScore,
                    updatedAt: Date.now()
                });
            }

            merged.sort(function (a, b) {
                return b.score - a.score;
            });

            var putRes = await fetchWithAuth(PUT_URL, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ scores: merged })
            });
            if (!putRes.ok) {
                var putErr = await putRes.text().catch(function () {
                    return '';
                });
                console.error('JSONBin PUT failed', putRes.status, putErr);
                return { ok: false, reason: 'put-failed' };
            }
            return { ok: true, updated: true };
        } catch (err) {
            console.error('saveScore failed', err);
            return { ok: false, reason: 'error' };
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
            var raw = record.scores;
            var merged = mergeUniqueScores(raw);
            return merged.slice(0, 10);
        } catch (err) {
            console.error('fetchLeaderboardScores failed', err);
            return [];
        }
    }

    global.saveScore = saveScore;
    global.fetchLeaderboardScores = fetchLeaderboardScores;
})(typeof window !== 'undefined' ? window : this);
